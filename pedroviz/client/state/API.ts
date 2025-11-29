import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  chkConstantHeading,
  chkInterpolatedHeading,
  chkPathChainFile,
  chkRadiansRef,
  chkTeamPaths,
  HeadingRef,
  HeadingType,
  isRef,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PathChainFile,
  PoseRef,
  TeamPaths,
  ValueRef,
} from '../../server/types';
import { fetchApi } from './Storage';

const namedValues: Map<string, NamedValue> = new Map();
const namedPoses: Map<string, NamedPose> = new Map();
const namedBeziers: Map<string, NamedBezier> = new Map();
const namedPathChains: Map<string, NamedPathChain> = new Map();

export type Point = { x: number; y: number };

export async function GetPaths(): Promise<TeamPaths> {
  const teamFileList = await fetchApi('getpaths', chkTeamPaths, {});
  for (const i of Object.keys(teamFileList)) {
    teamFileList[i].sort();
  }
  return teamFileList;
}

export const EmptyPathChainFile: PathChainFile = {
  name: 'empty',
  values: [],
  poses: [],
  beziers: [],
  pathChains: [],
};

export async function LoadFile(
  team: string,
  file: string,
): Promise<PathChainFile> {
  const pathChainFile: PathChainFile = await fetchApi(
    `loadpath/${encodeURIComponent(team)}/${encodeURIComponent(file)}`,
    chkPathChainFile,
    EmptyPathChainFile,
  );
  if (!validatePathChainFile(pathChainFile)) {
    return EmptyPathChainFile;
  }
  return pathChainFile;
}

export async function SavePath(
  team: string,
  path: string,
  data: PathChainFile,
): Promise<undefined | string> {
  // NYI on the server, either :D
  return 'NYI';
}

// Evaluation from the parsed code representation:
export function numFromVal(av: AnonymousValue): number {
  switch (av.type) {
    case 'double':
    case 'int':
      return av.value;
    case 'radians':
      return (Math.PI * av.value) / 180.0;
  }
}

export function getValue(vr: ValueRef): number {
  return numFromVal(isRef(vr) ? namedValues.get(vr).value : vr);
}

export function pointFromPose(pr: AnonymousPose): Point {
  return { x: getValue(pr.x), y: getValue(pr.y) };
}

export function pointFromPoseRef(pr: PoseRef): Point {
  try {
    return pointFromPose(isRef(pr) ? namedPoses.get(pr).pose : pr);
  } catch (e) {
    console.error(`invalid PoseRef ${pr}`);
    throw e;
  }
}

export function getBezier(br: BezierRef): AnonymousBezier {
  return isRef(br) ? namedBeziers.get(br).points : br;
}

export function getBezierPoints(br: BezierRef): Point[] {
  const ab = getBezier(br);
  return ab.points.map(pointFromPoseRef);
}

export function getValueFromHeaderRef(hr: HeadingRef): number {
  if (isRef(hr)) {
    return getValue(hr);
  } else if (chkRadiansRef(hr)) {
    return (Math.PI * getValue(hr.radians)) / 180.0;
  } else {
    return getValue(hr);
  }
}

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

export function validatePathChainFile(pcf: PathChainFile): boolean {
  namedValues.clear();
  namedPoses.clear();
  namedBeziers.clear();
  namedPathChains.clear();
  pcf.values.forEach((val) => namedValues.set(val.name, val));
  pcf.poses.forEach((val) => namedPoses.set(val.name, val));
  pcf.beziers.forEach((val) => namedBeziers.set(val.name, val));
  pcf.pathChains.forEach((val) => namedPathChains.set(val.name, val));
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
