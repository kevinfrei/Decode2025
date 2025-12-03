package org.firstinspires.ftc.learnbot;

import com.bylazar.configurables.annotations.Configurable;
import com.pedropathing.follower.Follower;
import com.pedropathing.geometry.BezierCurve;
import com.pedropathing.geometry.BezierLine;
import com.pedropathing.geometry.Pose;
import com.pedropathing.paths.PathChain;

/**** DO NOT EDIT ****
 These paths are specifically for testing the visualizer. If you want to make some
 changes to the 'real" paths, just create a different file...
 **** DO NOT EDIT ****/

@Configurable
public class TestPaths {

    public static double org = 15.0;
    public static double edge = 50.0;
    public static double extra = 25.0;
    public static double one80 = Math.toRadians(180);
    public static double ninety = Math.toRadians(90);
    public static int sixty = 60;

    public static Pose start = new Pose(org, org, Math.toRadians(0));
    public static Pose step1 = new Pose(edge, org, ninety);
    public static Pose step2 = new Pose(edge, edge, 35);
    public static Pose step3 = new Pose(org, edge, Math.toRadians(sixty));
    public static Pose step4 = new Pose(org, org, one80);
    public static Pose stepb = new Pose(extra, extra, Math.toRadians(sixty));

    public static BezierLine start_to_step1 = new BezierLine(start, step1);
    public static BezierCurve unused1 = new BezierCurve(step1, step2, step4, step1);
    public static BezierCurve unused2 = new BezierLine(new Pose(org, edge), start);
    public static BezierCurve unused3 = new BezierCurve(
        new Pose(edge, 0, 15),
        start,
        new Pose(0, 0)
    );
    public static BezierCurve unused4 = new BezierCurve(
        start,
        new Pose(15, 25),
        new Pose(55, 44),
        new Pose(10, org),
        new Pose(edge, 10, Math.toRadians(sixty)),
        step1
    );

    public Pose getStart() {
        return start;
    }

    public PathChain Path1;
    public PathChain Path2;
    public PathChain Path3;
    public PathChain Path4;

    public TestPaths(Follower follower) {
        Path1 = follower
            .pathBuilder()
            .addPath(start_to_step1)
            .addPath(unused1)
            .addPath(new BezierCurve(step1, new Pose(10, extra), step4, new Pose(edge, 10), step1))
            .setLinearHeadingInterpolation(0, ninety)
            .build();

        Path2 = follower
            .pathBuilder()
            .addPath(new BezierCurve(step1, stepb, step2))
            .setConstantHeadingInterpolation(ninety)
            .build();

        Path3 = follower
            .pathBuilder()
            .addPath(new BezierLine(step2, step3))
            .setLinearHeadingInterpolation(ninety, step3.getHeading())
            .build();

        Path4 = follower
            .pathBuilder()
            .addPath(new BezierLine(step3, step4))
            .setTangentHeadingInterpolation()
            .build();
    }
}
