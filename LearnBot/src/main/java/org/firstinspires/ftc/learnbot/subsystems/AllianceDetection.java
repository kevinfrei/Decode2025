package org.firstinspires.ftc.learnbot.subsystems;

import com.qualcomm.robotcore.hardware.DigitalChannel;
import com.technototes.library.util.Alliance;
import java.util.function.Supplier;

public class AllianceDetection implements Supplier<Alliance> {

  // Normal constructor
  public AllianceDetection(DigitalChannel red, DigitalChannel blue) {
    _redSwitch = red;
    _blueSwitch = blue;
  }

  // No Hardware constructor
  public AllianceDetection() {
    _redSwitch = null;
    _blueSwitch = null;
  }

  /* Public Interface */

  public boolean isRed() {
    return getRed();
  }

  public boolean isBlue() {
    return getBlue();
  }

  public boolean isNeutral() {
    return !isRed() && !isBlue();
  }

  public boolean isError() {
    return isRed() && isBlue();
  }

  @Override
  public Alliance get() {
    boolean r = isRed();
    boolean b = isBlue();
    if (r == b) {
      return Alliance.NONE;
    } else if (r) {
      return Alliance.RED;
    } else /* if (b) */ {
      return Alliance.BLUE;
    }
  }

  /* Private interface */

  // All my hardware stuff is down here!

  private final DigitalChannel _redSwitch, _blueSwitch;

  private boolean hasHardware() {
    return _redSwitch != null && _blueSwitch != null;
  }

  private boolean getRed() {
    if (hasHardware()) {
      return !_redSwitch.getState();
    } else {
      // What do we want to return if we don't have hardware?
      return false;
    }
  }

  private boolean getBlue() {
    if (hasHardware()) {
      return !_blueSwitch.getState();
    } else {
      return false;
    }
  }
}
