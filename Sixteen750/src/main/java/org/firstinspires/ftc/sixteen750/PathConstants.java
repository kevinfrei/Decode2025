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
    public static Function<Pose2d, TrajectoryBuilder> func;
    public static Pose2d STARTNEAR = new Pose2d(-66, 35, toRadians(0));
    public static Pose2d STARTFAR = new Pose2d(66, 17, toRadians(0));
    public static Pose2d SCORENEAR = new Pose2d(-24, 24, toRadians(45));
    public static Pose2d SCOREFAR = new Pose2d(55, 17, toRadians(63.6));
    public static Pose2d INTAKESTART1 = new Pose2d(-12, 30, toRadians(0));
    public static Pose2d INTAKEDONE1 = new Pose2d(-12, 48, toRadians(0));
    public static Pose2d INTAKESTART2 = new Pose2d(12, 30, toRadians(0));
    public static Pose2d INTAKEDONE2 = new Pose2d(12, 56, toRadians(0));
    public static Pose2d INTAKESTART3 = new Pose2d(36, 30, toRadians(0));
    public static Pose2d INTAKEDONE3 = new Pose2d(36, 56, toRadians(0));
    public static Pose2d PARKNEAR = new Pose2d(-11, 22, toRadians(45));
    public static Pose2d PARKFAR = new Pose2d(24, 12, toRadians(0));
    public static final Supplier<Trajectory> STARTNEAR_TO_SCORENEAR = () ->
            func.apply(STARTNEAR).lineToLinearHeading(SCORENEAR).build();
    public static final Supplier<Trajectory> SCORENEAR_TO_INTAKESTART1 = () ->
            func.apply(SCORENEAR).lineToLinearHeading(INTAKESTART1).build();
    public static final Supplier<Trajectory> INTAKESTART1_TO_INTAKEDONE1 = () ->
            func.apply(INTAKESTART1).lineToLinearHeading(INTAKEDONE1).build();
    public static final Supplier<Trajectory> INTAKEDONE1_TO_SCORENEAR = () ->
            func.apply(INTAKEDONE1).lineToLinearHeading(SCORENEAR).build();

    public static final Supplier<Trajectory> SCORENEAR_TO_INTAKESTART2 = () ->
            func.apply(SCORENEAR).lineToLinearHeading(INTAKESTART2).build();
    public static final Supplier<Trajectory> INTAKESTART2_TO_INTAKEDONE2 = () ->
            func.apply(INTAKESTART2).lineToLinearHeading(INTAKEDONE2).build();
    public static final Supplier<Trajectory> INTAKEDONE2_TO_SCORENEAR = () ->
            func.apply(INTAKEDONE2).lineToLinearHeading(SCORENEAR).build();
    public static final Supplier<Trajectory> SCORENEAR_TO_PARKNEAR = () ->
            func.apply(SCORENEAR).lineToLinearHeading(PARKNEAR).build();
    public static final Supplier<Trajectory> STARTFAR_TO_SCOREFAR = () ->
            func.apply(STARTFAR).lineToLinearHeading(SCOREFAR).build();
    public static final Supplier<Trajectory> SCOREFAR_TO_INTAKESTART3 = () ->
            func.apply(SCOREFAR).lineToLinearHeading(INTAKESTART3).build();
    public static final Supplier<Trajectory> INTAKESTART3_TO_INTAKEDONE3 = () ->
            func.apply(INTAKESTART3).lineToLinearHeading(INTAKEDONE3).build();
    public static final Supplier<Trajectory> INTAKEDONE3_TO_SCOREFAR = () ->
            func.apply(INTAKEDONE3).lineToLinearHeading(SCOREFAR).build();
    public static final Supplier<Trajectory> SCOREFAR_TO_PARKFAR = () ->
            func.apply(SCOREFAR).lineToLinearHeading(PARKFAR).build();

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
