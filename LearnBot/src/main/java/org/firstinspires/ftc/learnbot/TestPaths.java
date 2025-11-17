package org.firstinspires.ftc.learnbot;

import com.bylazar.configurables.annotations.Configurable;
import com.pedropathing.follower.Follower;
import com.pedropathing.geometry.BezierLine;
import com.pedropathing.geometry.Pose;
import com.pedropathing.paths.PathChain;

@Configurable
public class TestPaths {

    public static double org = 72.0;
    public static double dist = 8.0;

    public static Pose start = new Pose(org, org, Math.toRadians(0));
    public static Pose step1 = new Pose(org + dist, org, Math.toRadians(90));
    public static Pose step2 = new Pose(org + dist, org + dist, Math.toRadians(0));
    public static Pose step3 = new Pose(org, org + dist, Math.toRadians(-45));
    public static Pose step4 = new Pose(org, org, Math.toRadians(30));

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
            .setLinearHeadingInterpolation(start.heading, step1.heading)
            .build();

        Path2 = follower
            .pathBuilder()
            .addPath(new BezierLine(step1, step2))
            .setLinearHeadingInterpolation(step1.heading, step2.heading)
            .build();

        Path3 = follower
            .pathBuilder()
            .addPath(new BezierLine(step2, step3))
            .setLinearHeadingInterpolation(step2.heading, step3.heading)
            .build();

        Path4 = follower
            .pathBuilder()
            .addPath(new BezierLine(step3, step4))
            .setLinearHeadingInterpolation(step3.heading, step4.heading)
            .build();
    }
}
