package org.firstinspires.ftc.teama;

import com.bylazar.configurables.annotations.Configurable;
import com.pedropathing.follower.Follower;
import com.pedropathing.geometry.BezierLine;
import com.pedropathing.geometry.Pose;
import com.pedropathing.paths.PathChain;

@Configurable
public class TeamTestPaths {

    public static double org = 72.0;
    public static int step = 80;
    public static double one80 = 3.1416;

    public static Pose start = new Pose(org, org, 0);
    public static Pose step1 = new Pose(step, org, 1.5708);
    public static Pose step2 = new Pose(step, step, one80);
    public static Pose step3 = new Pose(org, step, -0.7854);
    public static Pose step4 = new Pose(72.0, 72, 0.5236);

    public PathChain Path1;
    public PathChain Path2;
    public PathChain Path3;
    public PathChain Path4;

    public TestPaths(Follower follower) {
        Path1 = follower
            .pathBuilder()
            .addPath(new BezierLine(start, step1))
            .setLinearHeadingInterpolation(start.getHeading(), step1.getHeading())
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
