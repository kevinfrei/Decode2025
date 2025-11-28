package org.firstinspires.ftc.learnbot;

import com.bylazar.configurables.annotations.Configurable;
import com.pedropathing.follower.Follower;
import com.pedropathing.geometry.BezierLine;
import com.pedropathing.geometry.Pose;
import com.pedropathing.paths.PathChain;

@Configurable
public class TestPaths {

    public static double org = 15.0;
    public static double edge = 50.0;
    public static double one80 = Math.toRadians(180);
    public static double ninety = Math.toRadians(90);
    public static int sixty = 60;

    public static Pose start = new Pose(org, org, Math.toRadians(0));
    public static Pose step1 = new Pose(edge, org, ninety);
    public static Pose step2 = new Pose(edge, edge, Math.toRadians(0));
    public static Pose step3 = new Pose(org, edge, Math.toRadians(sixty));
    public static Pose step4 = new Pose(org, org, Math.toRadians(one80));

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
            .addPath(new BezierLine(start, step1))
            .setLinearHeadingInterpolation(start.getHeading(), step1.getHeading())
            .setLinearHeadingInterpolation(0, ninety)
            .build();

        Path2 = follower
            .pathBuilder()
            .addPath(new BezierLine(step1, step2))
            .setLinearHeadingInterpolation(step1.getHeading(), step2.getHeading())
            .build();

        Path3 = follower
            .pathBuilder()
            .addPath(new BezierLine(step2, step3))
            .setLinearHeadingInterpolation(step2.getHeading(), step3.getHeading())
            .build();

        Path4 = follower
            .pathBuilder()
            .addPath(new BezierLine(step3, step4))
            .setLinearHeadingInterpolation(step3.getHeading(), step4.getHeading())
            .build();
    }
}
