import { useAtomValue } from 'jotai';
import { CurPathAtom } from './API';
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  HeadingType,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PoseRef,
  ValueRef,
} from './server/types';
import { isString } from '@freik/typechk';

function showVal(v: AnonymousValue): string {
  return `${v.value}${v.type[0]}`;
}
function showValR(v: ValueRef): string {
  return isString(v) ? v : showVal(v);
}

function showPose(p: AnonymousPose): string {
  return `(${showValR(p.x)}, ${showValR(p.y)}${p.heading ? ' @' + showValR(p.heading) : ''})`;
}
function showPoseR(p: PoseRef): string {
  return isString(p) ? p : showPose(p);
}

function showBezier(b: AnonymousBezier): string {
  return `${b.type[0]}:[${b.points.map(showPoseR).join(', ')}]`;
}
function showBezierR(b: BezierRef): string {
  return isString(b) ? b : showBezier(b);
}

function showHeading(ht: HeadingType): string {
  let res = ht.type[0];
  switch (ht.type) {
    case 'constant':
      res += showValR(ht.heading);
      break;
    case 'interpolated':
      res += showValR(ht.headings[0]) + ' => ' + showValR(ht.headings[1]);
      break;
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
