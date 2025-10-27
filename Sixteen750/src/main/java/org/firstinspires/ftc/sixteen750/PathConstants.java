package org.firstinspires.ftc.sixteen750;

import static java.lang.Math.toRadians;

import com.acmerobotics.roadrunner.geometry.Pose2d;
import com.acmerobotics.roadrunner.trajectory.Trajectory;
import com.acmerobotics.roadrunner.trajectory.TrajectoryBuilder;
import com.technototes.path.geometry.ConfigurablePoseD;
import com.technototes.path.trajectorysequence.TrajectorySequence;
import com.technototes.path.trajectorysequence.TrajectorySequenceBuilder;
import java.util.function.Function;
import java.util.function.Supplier;

public class PathConstants {

    public static ConfigurablePoseD STARTNEAR = new ConfigurablePoseD(-66, 35, 0);
    public static ConfigurablePoseD STARTFAR = new ConfigurablePoseD(66, 17, 0);
    public static ConfigurablePoseD SCORENEAR = new ConfigurablePoseD(-24, 24, 45);
    public static ConfigurablePoseD SCOREFAR = new ConfigurablePoseD(55, 17, 63.6);
    public static ConfigurablePoseD INTAKESTART1 = new ConfigurablePoseD(-12, 30, 0);
    public static ConfigurablePoseD INTAKEDONE1 = new ConfigurablePoseD(-12, 48, 0);
    public static ConfigurablePoseD INTAKESTART2 = new ConfigurablePoseD(12, 30, 0);
    public static ConfigurablePoseD INTAKEDONE2 = new ConfigurablePoseD(12, 56, 0);
    public static ConfigurablePoseD INTAKESTART3 = new ConfigurablePoseD(36, 30, 0);
    public static ConfigurablePoseD INTAKEDONE3 = new ConfigurablePoseD(36, 56, 0);
    public static ConfigurablePoseD PARKNEAR = new ConfigurablePoseD(-11, 22, 45);
    public static ConfigurablePoseD PARKFAR = new ConfigurablePoseD(24, 12, 0);
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > STARTNEAR_TO_SCORENEAR = b ->
        b.apply(STARTNEAR.toPose()).lineToLinearHeading(SCORENEAR.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SCORENEAR_TO_INTAKESTART1 = b ->
        b.apply(SCORENEAR.toPose()).lineToLinearHeading(INTAKESTART1.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > INTAKESTART1_TO_INTAKEDONE1 = b ->
        b.apply(INTAKESTART1.toPose()).lineToLinearHeading(INTAKEDONE1.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > INTAKEDONE1_TO_SCORENEAR = b ->
        b.apply(INTAKEDONE1.toPose()).lineToLinearHeading(SCORENEAR.toPose()).build();

    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SCORENEAR_TO_INTAKESTART2 = b ->
        b.apply(SCORENEAR.toPose()).lineToLinearHeading(INTAKESTART2.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > INTAKESTART2_TO_INTAKEDONE2 = b ->
        b.apply(INTAKESTART2.toPose()).lineToLinearHeading(INTAKEDONE2.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > INTAKEDONE2_TO_SCORENEAR = b ->
        b.apply(INTAKEDONE2.toPose()).lineToLinearHeading(SCORENEAR.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SCORENEAR_TO_PARKNEAR = b ->
        b.apply(SCORENEAR.toPose()).lineToLinearHeading(PARKNEAR.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > STARTFAR_TO_SCOREFAR = b ->
        b.apply(STARTFAR.toPose()).lineToLinearHeading(SCOREFAR.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SCOREFAR_TO_INTAKESTART3 = b ->
        b.apply(SCOREFAR.toPose()).lineToLinearHeading(INTAKESTART3.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > INTAKESTART3_TO_INTAKEDONE3 = b ->
        b.apply(INTAKESTART3.toPose()).lineToLinearHeading(INTAKEDONE3.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > INTAKEDONE3_TO_SCOREFAR = b ->
        b.apply(INTAKEDONE3.toPose()).lineToLinearHeading(SCOREFAR.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SCOREFAR_TO_PARKFAR = b ->
        b.apply(SCOREFAR.toPose()).lineToLinearHeading(PARKFAR.toPose()).build();

    public static ConfigurablePoseD SPLINETEST1 = new ConfigurablePoseD(0, -55, 0);
    public static ConfigurablePoseD SPLINETEST2 = new ConfigurablePoseD(55, 0, 0);
    public static ConfigurablePoseD START_LAUNCHZONE = new ConfigurablePoseD(21.613, 121.866, 140);
    public static ConfigurablePoseD LAUNCHING = new ConfigurablePoseD(57.743, 86.258, 140);
    public static ConfigurablePoseD PICKUP1_START = new ConfigurablePoseD(57.964, 72.541, 180);
    public static ConfigurablePoseD PICKUP1_END = new ConfigurablePoseD(22.346, 72.763, 180);
    public static ConfigurablePoseD PICKUP2_START = new ConfigurablePoseD(56.637, 44.887, 180);
    public static ConfigurablePoseD PICKUP2_END = new ConfigurablePoseD(19.912, 44.223, 180);
    public static ConfigurablePoseD PICKUP3_START = new ConfigurablePoseD(56.195, 15.463, 180);
    public static ConfigurablePoseD PICKUP3_END = new ConfigurablePoseD(18.585, 15.020, 180);

    public static ConfigurablePoseD TELESTART = new ConfigurablePoseD(0, 0, 90);
    public static ConfigurablePoseD FORWARD = new ConfigurablePoseD(48, 0, 0);
    public static ConfigurablePoseD BACKWARD = new ConfigurablePoseD(0, 0, 0);
    public static ConfigurablePoseD SIDE_RIGHT = new ConfigurablePoseD(0, -48, 0);
    public static ConfigurablePoseD SIDE_LEFT = new ConfigurablePoseD(0, 0, 0);
    public static ConfigurablePoseD BLUE_LAUNCH_ZONE = new ConfigurablePoseD(0, 0, 0);

    // These are 'trajectory pieces' which should be named like this:
    // {STARTING_POSITION}_TO_{ENDING_POSITION}

    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > START_TO_LAUNCH = b ->
        b.apply(START_LAUNCHZONE.toPose()).lineToLinearHeading(LAUNCHING.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > LAUNCH_TO_PICKUP1 = b ->
        b.apply(LAUNCHING.toPose()).lineToLinearHeading(PICKUP1_START.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > PICKUP1_TO_PICKUP1END = b ->
        b.apply(PICKUP1_START.toPose()).lineToLinearHeading(PICKUP1_END.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > PICKUP1END_TO_LAUNCH = b ->
        b.apply(PICKUP1_END.toPose()).lineToLinearHeading(LAUNCHING.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > LAUNCH_TO_PICKUP2 = b ->
        b.apply(LAUNCHING.toPose()).lineToLinearHeading(PICKUP2_START.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > PICKUP2_TO_PICKUP2END = b ->
        b.apply(PICKUP2_START.toPose()).lineToLinearHeading(PICKUP2_END.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > PICKUP2END_TO_LAUNCH = b ->
        b.apply(PICKUP2_END.toPose()).lineToLinearHeading(LAUNCHING.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > LAUNCH_TO_PICKUP3 = b ->
        b.apply(LAUNCHING.toPose()).lineToLinearHeading(PICKUP3_START.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > PICKUP3_TO_PICKUP3END = b ->
        b.apply(PICKUP3_START.toPose()).lineToLinearHeading(PICKUP3_END.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > PICKUP3END_TO_LAUNCH = b ->
        b.apply(PICKUP3_END.toPose()).lineToLinearHeading(LAUNCHING.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SPLINETEST1_TO_SPLINETEST2 = b ->
        b
            .apply(SPLINETEST1.toPose())
            .splineToConstantHeading(SPLINETEST2.toPose().vec(), SPLINETEST2.getHeading())
            .build();

    //testing trajectories from last year

    // testing trajectories
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > BACKWARD_TO_FORWARD = b ->
        b.apply(BACKWARD.toPose()).lineToLinearHeading(FORWARD.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > FORWARD_TO_BACKWARD = b ->
        b.apply(FORWARD.toPose()).lineToLinearHeading(BACKWARD.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SIDE_LEFT_TO_SIDE_RIGHT = b ->
        b.apply(SIDE_LEFT.toPose()).lineToLinearHeading(SIDE_RIGHT.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > SIDE_RIGHT_TO_SIDE_LEFT = b ->
        b.apply(SIDE_RIGHT.toPose()).lineToLinearHeading(SIDE_LEFT.toPose()).build();
    public static final Function<
        Function<Pose2d, TrajectorySequenceBuilder>,
        TrajectorySequence
    > BLUE_SCORING = b ->
        b.apply(BLUE_LAUNCH_ZONE.toPose()).lineToLinearHeading(BLUE_LAUNCH_ZONE.toPose()).build();
}
