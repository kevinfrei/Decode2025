package org.firstinspires.ftc.learnbot.subsystems;

import com.bylazar.configurables.annotations.Configurable;
import com.qualcomm.robotcore.hardware.DcMotor;
import com.qualcomm.robotcore.hardware.DcMotorEx;
import com.qualcomm.robotcore.hardware.DcMotorSimple;
import com.qualcomm.robotcore.hardware.Gamepad;
import com.qualcomm.robotcore.hardware.HardwareMap;
import com.qualcomm.robotcore.hardware.PIDFCoefficients;
import com.technototes.library.subsystem.Subsystem;
import com.technototes.library.subsystem.TargetAcquisition;
import com.technototes.library.util.PIDFController;
import java.util.function.DoubleSupplier;
import org.firstinspires.ftc.robotcore.external.Telemetry;
import org.firstinspires.ftc.robotcore.external.navigation.CurrentUnit;

public class LauncherSubsystem implements Subsystem {

  /* Configuration 'stuff' */
  @Configurable
  public static class Config {

    public static String MOTOR_NAME = "launcher";
    public static boolean ENCODER_REVERSE = true;
    public static boolean MOTOR_REVERSE = true;
    // Amount of change for manual override
    public static double MANUAL_POWER_DELTA = 0.05;
    // Defaults used for testing/fallback
    public static double DEFAULT_VOLTAGE = 12.2; //<==MUST be non-zero!
    public static double DEFAULT_DISTANCE = 67; // I'm old
    // This gets tuned *later*
    public static PIDFCoefficients LAUNCH_PID_VALUES = new PIDFCoefficients(
      0.003,
      0.0,
      0.0,
      0
    );
    // Turn logging on or off from the dashboard/panel
    public static boolean LOG_LAUNCHER = true;

    // GoBilda says stall current of 9.2A at 12V, so V = I * R, R = 12 / 9.2
    // (about 1.3 ohms) As the motor heats up, resistance also increase, so we
    // could increase this a little bit or maybe increase it over time to
    // counteract that, but this is probably good enough.
    public static double MotorResistance = 12 / 9.2;

    // These values can be calculated automatically, use an opmode that measure
    // velocity This one is highly variable, based on the amount of friction in
    // the system
    public static double kStaticFriction = 0.183;
    public static double kDynamicFriction = 0.168;
    public static double kVelocityConstant = 0.0043;

    public static double getFrictionConstant(double curVelocity) {
      if (Math.abs(curVelocity) > 1e-5) {
        return kDynamicFriction;
      } else {
        return kStaticFriction;
      }
    }
  }

  /* Subsystem information */
  double targetVelocity = 0.0;
  double motorVelocity = 0.0;
  double targetPower = 0.0;
  double autoVelocity = 0.0;
  double additionalAmount = 0.0;

  // This the PIDF controller that's used manage the power power.
  // The PIDF values are set in the Config class above.
  private PIDFController pidfController;

  /* Hardware dependencies */

  private final DcMotorEx _launchMotor;
  TargetAcquisition _camera;
  // Gets the current voltage, needed for a good FeedFwd function
  DoubleSupplier _voltage;

  Telemetry dbg;

  // Normal constructor
  public LauncherSubsystem(
    HardwareMap map,
    TargetAcquisition camera,
    DoubleSupplier voltageSup,
    Telemetry tel
  ) {
    _launchMotor =
      map != null ? map.get(DcMotorEx.class, Config.MOTOR_NAME) : null;
    _voltage = voltageSup;
    _camera = camera;
    dbg = tel;
    configMotor();
    configPIDF();
  }

  // No hardware:
  public LauncherSubsystem(Telemetry tel) {
    this(null, null, null, tel);
  }

  // Hardware, but really only a Control Hub and a game pad to fake the camera
  public LauncherSubsystem(
    Gamepad g,
    DoubleSupplier voltageSup,
    Telemetry tel
  ) {
    this(null, null, voltageSup, tel);
  }

  // Explicitly set the target velocity for the motors
  public void setVelocityTarget(double speed) {
    pidfController.setTarget(speed);
  }

  // Returns the current target velocity (which may be set explicity, or
  // automatically)
  public double getVelocityTarget() {
    return pidfController.getTarget();
  }

  // Set the velocity target based on the TargetAcquisition interface
  public void autoSetVelocityTarget() {
    // Spin the motors pid goes here
    setVelocityTarget(calculateVelocityTarget()); // change to auto aim velocity
  }

  public double getActualVelocity() {
    return readVelocity();
  }

  public void stop() {
    setVelocityTarget(0);
  }

  public void increasePower() {
    // Spin the motors pid goes here
    additionalAmount += Config.MANUAL_POWER_DELTA;
  }

  public void decreasePower() {
    // Spin the motors pid goes here
    additionalAmount -= Config.MANUAL_POWER_DELTA;
  }

  // This reads the distance from the TargetAcquisition interface, then
  // uses the M/B values from Config to return the goal velocity.
  // We could add stuff to compensate for the robot velocity to better aim while
  // in motion.
  public double calculateVelocityTarget() {
    // x = distance in inches
    double x = readDistance();
    // Do some physics here, if you want.
    // Or just use a silly heuristic that works well enough
    return 50 + x * 150;
  }

  @Override
  public void periodic() {
    // Update some values for logging:
    autoVelocity = calculateVelocityTarget();
    targetVelocity = getVelocityTarget();
    double power = pidfController.update(targetVelocity) + additionalAmount;
    setPower(power);
    if (Config.LOG_LAUNCHER) {
      dbg.addData("Launcher Auto Vel", autoVelocity);
      dbg.addData("Launcher Target Vel", targetVelocity);
      dbg.addData("Launcher Motor Vel", motorVelocity);
      dbg.addData("Launcher Power", power);
    }
  }

  // A quick wander around google & wikipedia comes up with something like this
  // for motor feedfwd:

  // (kStaticFriction + kVelocityConstant * target) / voltage;

  // The point is that motor RPM scales linearly with voltage, so to
  // compensate, you should divide by voltage: Don't try to scale something by
  // a delta from peak. Just divide.

  // To solve that formula, get a fresh battery, run it at full power and
  // measure the RPM. (Well, and figure out kStaticFriction, too: The lowest
  // value that will still get the launcher barely moving)

  // NOTE:
  // The FeedFwdHelper opmode calculates these numbers for you automatically!

  private void configPIDF() {
    pidfController = new PIDFController(
      Config.LAUNCH_PID_VALUES,
      target ->
        (Math.signum(target) * // sgnm(<0)=-1, sgnm(>0)=1, sgnm(0)=*0*
          (Config.getFrictionConstant(getActualVelocity()) +
            readMotorCurrent() * Config.MotorResistance) +
          Config.kVelocityConstant * target) /
        readVoltage()
    );
    setVelocityTarget(0);
  }

  /* Hardware interface */

  private boolean hasHardware() {
    return hasMotor() && hasVoltage() && hasCamera();
  }

  private boolean hasMotor() {
    return _launchMotor != null;
  }

  private boolean hasVoltage() {
    return _voltage != null;
  }

  private boolean hasCamera() {
    return _camera != null;
  }

  private void configMotor() {
    if (hasMotor()) {
      _launchMotor.setDirection(
        Config.MOTOR_REVERSE
          ? DcMotorSimple.Direction.REVERSE
          : DcMotorSimple.Direction.FORWARD
      );
      _launchMotor.setZeroPowerBehavior(DcMotor.ZeroPowerBehavior.FLOAT);
    }
  }

  private void setPower(double pow) {
    if (hasMotor()) {
      double power = Math.clamp(pow, -1, 1);
      // Helpful for logging :)
      targetPower = power;
      _launchMotor.setPower(power);
    }
  }

  private double readVelocity() {
    if (hasMotor()) {
      return _launchMotor.getVelocity() * (Config.ENCODER_REVERSE ? -1 : 1);
    } else {
      return 0; // Other options: Return the 'set' velocity? Double.NaN?
    }
  }

  private double readMotorCurrent() {
    if (hasMotor()) {
      return _launchMotor.getCurrent(CurrentUnit.AMPS);
    } else {
      return 0;
    }
  }

  private double readVoltage() {
    double v = 0;
    if (hasVoltage()) {
      v = _voltage.getAsDouble();
    }

    // We're dividing by this, so make sure it's >0
    if (v <= 0) {
      return Config.DEFAULT_VOLTAGE;
    } else {
      return v;
    }
  }

  private double readDistance() {
    if (hasCamera()) {
      return _camera.getDistance();
    } else {
      return Config.DEFAULT_DISTANCE;
    }
  }
}
