import { useAtomValue } from 'jotai';
import { CurPathAtom } from './API';
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  chkRadianRef,
  HeadingRef,
  HeadingType,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PoseRef,
  RadiansRef,
  ValueRef,
} from './server/types';
import { isString } from '@freik/typechk';

function toRad(v: ValueRef): string {
  return `Math.toRadians(${showValR(v)})`;
}

function showVal(v: AnonymousValue): string {
  switch (v.type) {
    case 'radians':
      return toRad({ type: 'double', value: v.value });
    case 'double':
      return v.value.toFixed(3);
    case 'int':
      return v.value.toFixed(0);
  }
}
function showValR(v: ValueRef): string {
  return isString(v) ? v : showVal(v);
}

function showRadians(r: RadiansRef): string {
  return toRad(r.radians);
}

function showHeadingR(h: HeadingRef): string {
  if (chkRadianRef(h)) {
    return showRadians(h);
  }
  return showValR(h);
}

function showPose(p: AnonymousPose): string {
  return `(${showValR(p.x)}, ${showValR(p.y)}${p.heading ? ' @' + showHeadingR(p.heading) : ''})`;
}
function showPoseR(p: PoseRef): string {
  return isString(p) ? p : showPose(p);
}

function showBezier(b: AnonymousBezier): string {
  return `${b.type}:[${b.points.map(showPoseR).join(', ')}]`;
}
function showBezierR(b: BezierRef): string {
  return isString(b) ? b : showBezier(b);
}

function showHeading(ht: HeadingType): string {
  let res = ht.type[0].toLocaleUpperCase();
  if (ht.type === 'constant') {
    res += showHeadingR(ht.heading);
  } else if (ht.type == 'interpolated') {
    res += ` ${showHeadingR(ht.headings[0])} => ${showHeadingR(ht.headings[1])}`;
  }
  return res;
}

export function PathChainDisplay() {
  const curPathChain = useAtomValue(CurPathAtom);
  return (
    <div>
      <div>Name: {curPathChain.name}</div>
      <div>
        Values:
        {curPathChain.values.map((val: NamedValue) => (
          <div>
            {val.name}: {showValR(val.value)}
          </div>
        ))}
      </div>
      <div>
        Poses:
        {curPathChain.poses.map((val: NamedPose) => (
          <div>
            {val.name}: {showPoseR(val.pose)}
          </div>
        ))}
      </div>
      <div>
        Beziers:
        {curPathChain.beziers.map((b: NamedBezier) => (
          <div>
            {b.name}: {showBezierR(b.points)}
          </div>
        ))}
      </div>
      <div>
        PathChains:
        {curPathChain.pathChains.map((npc: NamedPathChain) => (
          <div>
            {npc.name} @ {showHeading(npc.heading)}
            {npc.paths.map((br: BezierRef) => (
              <div>{showBezierR(br)}</div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
