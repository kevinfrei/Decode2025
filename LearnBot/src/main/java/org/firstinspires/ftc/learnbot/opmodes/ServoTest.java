package org.firstinspires.ftc.learnbot.opmodes;

import com.bylazar.configurables.annotations.Configurable;
import com.bylazar.gamepad.GamepadManager;
import com.bylazar.gamepad.PanelsGamepad;
import com.bylazar.telemetry.PanelsTelemetry;
import com.bylazar.telemetry.TelemetryManager;
import com.qualcomm.robotcore.eventloop.opmode.Disabled;
import com.qualcomm.robotcore.eventloop.opmode.TeleOp;
import com.qualcomm.robotcore.hardware.Servo;
import com.qualcomm.robotcore.util.ElapsedTime;
import com.technototes.library.logger.Loggable;
import com.technototes.library.structure.CommandOpMode;
import com.technototes.library.util.Alliance;
import org.firstinspires.ftc.learnbot.Hardware;
import org.firstinspires.ftc.learnbot.SpinningBot;
import org.firstinspires.ftc.learnbot.controls.SpinController;
import org.firstinspires.ftc.learnbot.helpers.StartingPosition;

@Configurable
@SuppressWarnings("unused")
@TeleOp(name = "Servo Hub")
public class ServoTest extends CommandOpMode implements Loggable {

  public static String SERVO_NAME = "srv";
  Servo srv;
  double val = 1.0;
  double cur = 0;
  ElapsedTime timer = new ElapsedTime();

  @Override
  public void uponInit() {
    srv = hardwareMap.get(Servo.class, SERVO_NAME);
  }

  @Override
  public void uponStart() {
    timer.reset();
  }

  @Override
  public void runLoop() {
    double pos = 1000 - Math.abs(1000 - (timer.milliseconds() % 2000));
    srv.setPosition(pos / 1000);
  }
}
