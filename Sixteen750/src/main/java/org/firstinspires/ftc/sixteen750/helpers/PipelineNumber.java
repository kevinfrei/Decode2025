package org.firstinspires.ftc.sixteen750.helpers;

public enum PipelineNumber {
    GREEN(0),
    APRILTAG(1),
    PURPLE(2);

    PipelineNumber(int num) {
        this.num = num;
    }

    public int getPipeline() {
        return this.num;
    }

    private final int num;
}
