import { hasField, isString } from '@freik/typechk';
import {
  chkPathChainFile,
  chkTeamPaths,
  NamedBezier,
  AnonymousPose,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PathChainFile,
  PoseRef,
  TeamPaths,
  ValueRef,
  AnonymousValue,
  BezierRef,
  AnonymousBezier,
  HeadingRef,
} from '../server/types';
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

export async function LoadFile(team: string, file: string): Promise<PathChainFile> {
  const pathChainFile: PathChainFile = await fetchApi(
    `loadpath/${encodeURIComponent(team)}/${encodeURIComponent(file)}`,
    chkPathChainFile,
    EmptyPathChainFile,
  );
  namedValues.clear();
  namedPoses.clear();
  namedBeziers.clear();
  namedPathChains.clear();
  pathChainFile.values.forEach((val) => namedValues.set(val.name, val));
  pathChainFile.poses.forEach((val) => namedPoses.set(val.name, val));
  pathChainFile.beziers.forEach((val) => namedBeziers.set(val.name, val));
  pathChainFile.pathChains.forEach((val) =>
    namedPathChains.set(val.name, val),
  );
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
  return numFromVal(isString(vr) ? namedValues.get(vr).value : vr);
}

export function pointFromPose(pr: AnonymousPose): Point {
  return { x: getValue(pr.x), y: getValue(pr.y) };
}

export function pointFromPoseRef(pr: PoseRef): Point {
  return pointFromPose(isString(pr) ? namedPoses.get(pr).pose : pr);
}

export function getBezier(br: BezierRef): AnonymousBezier {
  return isString(br) ? namedBeziers.get(br).points : br;
}

export function getBezierPoints(br: BezierRef): Point[] {
  const ab = getBezier(br);
  return ab.points.map(pointFromPoseRef);
}

export function getValueFromHeaderRef(hr: HeadingRef): number {
  if (isString(hr)) {
    return getValue(hr);
  } else if (hasField(hr, 'radians')) {
    return (Math.PI * getValue(hr.radians)) / 180.0;
  } else {
    return getValue(hr);
  }
}
