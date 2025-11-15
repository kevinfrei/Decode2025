// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package com.technototes.library.math.geometry.proto;

import com.technototes.library.math.geometry.Pose2d;
import com.technototes.library.math.geometry.Rectangle2d;
import com.technototes.library.math.proto.Geometry2D.ProtobufRectangle2d;
import com.technototes.library.util.protobuf.Protobuf;
import us.hebi.quickbuf.Descriptors.Descriptor;

public class Rectangle2dProto implements Protobuf<Rectangle2d, ProtobufRectangle2d> {
  @Override
  public Class<Rectangle2d> getTypeClass() {
    return Rectangle2d.class;
  }

  @Override
  public Descriptor getDescriptor() {
    return ProtobufRectangle2d.getDescriptor();
  }

  @Override
  public ProtobufRectangle2d createMessage() {
    return ProtobufRectangle2d.newInstance();
  }

  @Override
  public Rectangle2d unpack(ProtobufRectangle2d msg) {
    return new Rectangle2d(Pose2d.proto.unpack(msg.getCenter()), msg.getXWidth(), msg.getYWidth());
  }

  @Override
  public void pack(ProtobufRectangle2d msg, Rectangle2d value) {
    Pose2d.proto.pack(msg.getMutableCenter(), value.getCenter());
    msg.setXWidth(value.getXWidth());
    msg.setYWidth(value.getYWidth());
  }
}
