import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  chkConstantHeading,
  chkInterpolatedHeading,
  chkRadiansRef,
  HeadingRef,
  HeadingType,
  isRef,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PathChainFile,
  PoseRef,
  ValueRef,
} from '../../server/types';

export let namedValues: Map<string, NamedValue> = new Map();
export let namedPoses: Map<string, NamedPose> = new Map();
export let namedBeziers: Map<string, NamedBezier> = new Map();
export let namedPathChains: Map<string, NamedPathChain> = new Map();

function noDanglingRefsOnValue(av: AnonymousValue, id: string): boolean {
  return true;
}

function foundValueRef(vr: ValueRef, id: string): boolean {
  if (isRef(vr)) {
    if (!namedValues.has(vr) && !namedPoses.has(vr)) {
      console.error(id, `'s "${vr}" value reference appears to be undefined.`);
      return false;
    }
    return true;
  }
  return noDanglingRefsOnValue(vr, id);
}

function foundHeadingRef(hr: HeadingRef, id: string): boolean {
  if (chkRadiansRef(hr)) {
    return foundValueRef(hr.radians, `${id}'s Radians ref`);
  }
  return foundValueRef(hr, id);
}

function noDanglingRefsOnPose(pose: AnonymousPose, id: string): boolean {
  return (
    (pose.heading ? foundHeadingRef(pose.heading, `${id}'s heading`) : true) &&
    foundValueRef(pose.x, `${id}'s x coordinate`) &&
    foundValueRef(pose.y, `${id}'s y coordinate`)
  );
}

function noDanglingRefsOnPoseRef(pr: PoseRef, id: string): boolean {
  if (isRef(pr)) {
    if (!namedPoses.has(pr)) {
      console.error(id, `'s "${pr}" pose reference appears to be undefined`);
      return false;
    }
    return true;
  }
  return noDanglingRefsOnPose(pr, id);
}

function noDanglingRefsOnBezier(curve: AnonymousBezier, id: string): boolean {
  return curve.points.every((pr, index) =>
    noDanglingRefsOnPoseRef(pr, `${id}'s element ${index}`),
  );
}

function noDanglingRefsOnBezierRef(br, id: string): boolean {
  if (isRef(br)) {
    if (!namedBeziers.has(br)) {
      console.error(`${id}'s bezier reference appears to be undefined`);
      return false;
    }
    return true;
  }
  return noDanglingRefsOnBezier(br, id);
}

function noDanglingRefsOnChain(
  brs: BezierRef[],
  heading: HeadingType,
  id: string,
): boolean {
  if (chkConstantHeading(heading)) {
    if (!foundHeadingRef(heading.heading, `${id}'s constant heading ref`)) {
      return false;
    }
  } else if (chkInterpolatedHeading(heading)) {
    if (
      !foundHeadingRef(heading.headings[0], `${id}'s start heading ref`) ||
      !foundHeadingRef(heading.headings[1], `${id}'s end heading ref`)
    ) {
      return false;
    }
  }
  return brs.every((br, index) =>
    noDanglingRefsOnBezierRef(br, `${id}'s element ${index}`),
  );
}

export function RegisterFreshFile(pcf: PathChainFile): void {
  namedValues = new Map(pcf.values.map((nv) => [nv.name, nv]));
  namedPoses = new Map(pcf.poses.map((np) => [np.name, np]));
  namedBeziers = new Map(pcf.beziers.map((nb) => [nb.name, nb]));
  namedPathChains = new Map(pcf.pathChains.map((npc) => [npc.name, npc]));
}

export function validatePathChainFile(pcf: PathChainFile): boolean {
  // console.error('checking', pcf);
  const goodValues = pcf.values.every((nv) =>
    noDanglingRefsOnValue(nv.value, nv.name),
  );
  const goodPoses = pcf.poses.every((pr) =>
    noDanglingRefsOnPose(pr.pose, pr.name),
  );
  const goodBeziers = pcf.beziers.every((br, index) =>
    noDanglingRefsOnBezier(br.points, `${br.name}'s element ${index}`),
  );
  const goodPathChains = pcf.pathChains.every((npc) =>
    noDanglingRefsOnChain(npc.paths, npc.heading, npc.name),
  );
  if (!goodValues) {
    console.log('Bad value');
  }
  if (!goodPoses) {
    console.log('Bad Pose');
  }
  if (!goodBeziers) {
    console.log('Bad Bezier');
  }
  if (!goodPathChains) {
    console.log('Bad PathChain');
  }
  return goodBeziers && goodPathChains && goodPoses && goodValues;
}
