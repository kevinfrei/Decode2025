// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package com.technototes.library.math.controller.proto;

import com.technototes.library.math.controller.DifferentialDriveWheelVoltages;
import com.technototes.library.math.proto.Controller.ProtobufDifferentialDriveWheelVoltages;
import com.technototes.library.util.protobuf.Protobuf;
import us.hebi.quickbuf.Descriptors.Descriptor;

public class DifferentialDriveWheelVoltagesProto
    implements Protobuf<DifferentialDriveWheelVoltages, ProtobufDifferentialDriveWheelVoltages> {
  @Override
  public Class<DifferentialDriveWheelVoltages> getTypeClass() {
    return DifferentialDriveWheelVoltages.class;
  }

  @Override
  public Descriptor getDescriptor() {
    return ProtobufDifferentialDriveWheelVoltages.getDescriptor();
  }

  @Override
  public ProtobufDifferentialDriveWheelVoltages createMessage() {
    return ProtobufDifferentialDriveWheelVoltages.newInstance();
  }

  @Override
  public DifferentialDriveWheelVoltages unpack(ProtobufDifferentialDriveWheelVoltages msg) {
    return new DifferentialDriveWheelVoltages(msg.getLeft(), msg.getRight());
  }

  @Override
  public void pack(
      ProtobufDifferentialDriveWheelVoltages msg, DifferentialDriveWheelVoltages value) {
    msg.setLeft(value.left);
    msg.setRight(value.right);
  }
}
