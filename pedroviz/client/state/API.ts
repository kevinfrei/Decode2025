import { isString, isUndefined } from '@freik/typechk';
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  chkNamedPathChain,
  chkPathChainFile,
  chkRadiansRef,
  chkTeamPaths,
  HeadingRef,
  isRef,
  NamedPathChain,
  PathChainFile,
  PoseRef,
  TeamPaths,
  ValueRef,
} from '../../server/types';
import { fetchApi } from './Storage';
import {
  namedBeziers,
  namedPoses,
  namedValues,
  RegisterFreshFile,
  validatePathChainFile,
} from './validation';

const colorLookup: Map<string, number> = new Map();
let colorCount = 0;

export type Point = { x: number; y: number };

export function getColorFor(
  item: string | NamedPathChain | AnonymousBezier | AnonymousPose,
): number {
  if (isString(item)) {
    if (!colorLookup.has(item)) {
      colorLookup.set(item, colorCount++);
    }
    return colorLookup.get(item);
  }
  if (chkNamedPathChain(item)) {
    return getColorFor(item.name);
  }
  return getColorFor(JSON.stringify(item));
}

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
  const pcf = await fetchApi(
    `loadpath/${encodeURIComponent(team)}/${encodeURIComponent(file)}`,
    chkPathChainFile,
    EmptyPathChainFile,
  );
  if (isUndefined(pcf)) {
    return EmptyPathChainFile;
  }
  RegisterFreshFile(pcf);
  return validatePathChainFile(pcf) ? pcf : EmptyPathChainFile;
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

export function getPose(pr: PoseRef): AnonymousPose {
  try {
    return isRef(pr) ? namedPoses.get(pr).pose : pr;
  } catch (e) {
    console.error(`Invalid PoseRef ${pr}`);
    throw e;
  }
}

export function pointFromPoseRef(pr: PoseRef): [number, Point] {
  return [getColorFor(getPose(pr)), pointFromPose(getPose(pr))];
}

export function getBezier(br: BezierRef): AnonymousBezier {
  return isRef(br) ? namedBeziers.get(br).points : br;
}

export function getBezierPoints(br: BezierRef): [number, [number, Point][]] {
  const ab = getBezier(br);
  return [getColorFor(ab), ab.points.map(pointFromPoseRef)];
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
