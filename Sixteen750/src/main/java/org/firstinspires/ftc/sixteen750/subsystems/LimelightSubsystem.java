package org.firstinspires.ftc.sixteen750.subsystems;

import com.bylazar.configurables.annotations.Configurable;
import com.qualcomm.hardware.limelightvision.LLResult;
import com.qualcomm.hardware.limelightvision.LLResultTypes;
import com.qualcomm.hardware.limelightvision.Limelight3A;
import com.technototes.library.command.CommandScheduler;
import com.technototes.library.logger.Log;
import com.technototes.library.logger.Loggable;
import com.technototes.library.subsystem.Subsystem;
import java.util.List;
import org.firstinspires.ftc.sixteen750.Hardware;
import org.firstinspires.ftc.sixteen750.Setup;
import org.firstinspires.ftc.sixteen750.helpers.PipelineNumber;

@Configurable
public class LimelightSubsystem implements Loggable, Subsystem {

    // BOT CONFIGURATION STUFF:
    public static double LIMELIGHT_ANGLE = 11;
    public static double DISTANCE_FROM_LIMELIGHT_TO_APRILTAG_VERTICALLY = 17.2;
    public static double CAMERA_TO_CENTER_OF_ROBOT = 7.2;
    public static double EXTRA_OFFSET = -3;

    // These things allow you to make the output of the camera correct for your orientation
    // I think it's this, but we should test it:
    // * Normal:     +1, +1, false (Connector on right when looking from above, facing forward)
    // * Rotate CW:  -1, +1, true  (Connector facing up)
    // * Rotate CCW: +1, -1, true  (Connector facing down)
    // * 180 deg:    -1, -1, false (Connector on left when looking from above, facing forward)
    public static double X_SIGN = 1.0;
    public static double Y_SIGN = -1.0;
    public static boolean SWAP_AXES = true;

    boolean hasHardware;

    @Log.Number(name = "LLX angle")
    public static double Xangle = 0.0;

    @Log.Number(name = "LLY angle")
    public static double Yangle = 0.0;

    @Log.Number(name = "LL Area")
    public static double Area = 0.0;

    @Log.Number(name = "distance")
    public static double distance;

    @Log(name = "new data")
    public static boolean new_result;

    public static Limelight3A limelight;

    public LimelightSubsystem(Hardware h) {
        hasHardware = Setup.Connected.LIMELIGHTSUBSYSTEM;
        // Do stuff in here
        if (hasHardware) {
            limelight = h.limelight;
            limelight.setPollRateHz(100);
            limelight.start();
            setPipeline(PipelineNumber.APRILTAG);
        } else {
            limelight = null;
        }
        CommandScheduler.register(this);
    }

    public void setPipeline(PipelineNumber targetPipeline) {
        limelight.pipelineSwitch(targetPipeline.getPipeline());
    }

    public boolean getLatestResult() {
        LLResult result = limelight.getLatestResult();
        if (isCorrectTag(result)) {
            // getLatestResult returns the x-angle, the y-angle,
            // and the area of the apriltag on the camera

            // Not sure this is the right angle, because the camera is mounted sideways
            // IIRC, you should be using getTy() instead.
            Xangle = X_SIGN * (SWAP_AXES ? result.getTy() : result.getTx());
            Yangle = Y_SIGN * (SWAP_AXES ? result.getTx() : result.getTy()) + LIMELIGHT_ANGLE;
            Area = result.getTa();
            return true;
        } else {
            return false;
        }
    }

    public double getLimelightRotation() {
        if (getLatestResult()) {
            return Xangle;
        } else {
            return 0;
        }
    }

    public boolean isCorrectTag(LLResult result) {
        if (result == null || !result.isValid()) {
            return false;
        }
        // This is potentially wrong: If we see more than one AprilTag, we only want to make sure
        // we're looking at the right one. Need to look at the API to see if they're ordered.
        List<LLResultTypes.FiducialResult> fiducialResults = result.getFiducialResults();
        for (LLResultTypes.FiducialResult fr : fiducialResults) {
            switch (fr.getFiducialId()) {
                // These are the 3 motif tags:
                case 21:
                case 22:
                case 23:
                    return false;
                // TODO: Add the red & blue tags, and check against current alliance
            }
        }
        return true;
    }

    public double getDistance() {
        if (!getLatestResult()) {
            return -1;
        }
        distance =
            (DISTANCE_FROM_LIMELIGHT_TO_APRILTAG_VERTICALLY / Math.tan(Math.toRadians(Yangle))) +
            CAMERA_TO_CENTER_OF_ROBOT +
            EXTRA_OFFSET;
        return distance;

        // measurements:
        // center of camera lens to floor - 12.3 inches
        // camera to center of robot(front-back) - 7.2 inches
        // apriltag height from floor- 29.5 inches
    }

    public void stop() {
        if (hasHardware) {
            limelight.stop();
        }
    }

    @Override
    public void periodic() {
        new_result = getLatestResult();
        distance = getDistance();
    }
}
