// Copyright (c) FIRST and other WPILib contributors.
// Open Source Software; you can modify and/or share it under the terms of
// the WPILib BSD license file in the root directory of this project.

package com.technototes.library.math.controller.proto;

import com.technototes.library.math.controller.SimpleMotorFeedforward;
import com.technototes.library.math.proto.Controller.ProtobufSimpleMotorFeedforward;
import com.technototes.library.util.protobuf.Protobuf;
import us.hebi.quickbuf.Descriptors.Descriptor;

public final class SimpleMotorFeedforwardProto
    implements Protobuf<SimpleMotorFeedforward, ProtobufSimpleMotorFeedforward> {
  @Override
  public Class<SimpleMotorFeedforward> getTypeClass() {
    return SimpleMotorFeedforward.class;
  }

  @Override
  public Descriptor getDescriptor() {
    return ProtobufSimpleMotorFeedforward.getDescriptor();
  }

  @Override
  public ProtobufSimpleMotorFeedforward createMessage() {
    return ProtobufSimpleMotorFeedforward.newInstance();
  }

  @Override
  public SimpleMotorFeedforward unpack(ProtobufSimpleMotorFeedforward msg) {
    return new SimpleMotorFeedforward(msg.getKs(), msg.getKv(), msg.getKa(), msg.getDt());
  }

  @Override
  public void pack(ProtobufSimpleMotorFeedforward msg, SimpleMotorFeedforward value) {
    msg.setKs(value.getKs()).setKv(value.getKv()).setKa(value.getKa()).setDt(value.getDt());
  }
}
