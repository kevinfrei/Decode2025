package org.firstinspires.ftc.sixteen750.helpers;

import com.technototes.library.hardware.sensor.encoder.Encoder;

// A simple interface to wrap up an Encoder interface
public interface IEncoder extends Encoder {
    void setDirection(boolean reversed);
    double getPosition();
    double getVelocity();
}
