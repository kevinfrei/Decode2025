import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  chkTupleOf,
  isArrayOfString,
  isNumber,
  isRecordOf,
  isString,
} from '@freik/typechk';

export type TeamPaths = Record<string, string[]>;

export type AnonymousValue = {
  type: 'int' | 'double' | 'radians';
  value: number;
};
export type NamedValue = { name: string; value: AnonymousValue };
export type ValueRef = AnonymousValue | string;
export type RadiansRef = { radians: ValueRef };
export type HeadingRef = RadiansRef | ValueRef;

export type AnonymousPose = { x: ValueRef; y: ValueRef; heading?: HeadingRef };
export type NamedPose = { name: string; pose: AnonymousPose };
export type PoseRef = AnonymousPose | string;

export type AnonymousBezier = { type: 'line' | 'curve'; points: PoseRef[] };
export type NamedBezier = { name: string; points: AnonymousBezier };
export type BezierRef = AnonymousBezier | string;

export type TangentHeading = { type: 'tangent' };
export type ConstantHeading = { type: 'constant'; heading: HeadingRef };
export type InterpolatedHeading = {
  type: 'interpolated';
  headings: [HeadingRef, HeadingRef];
};
export type HeadingType =
  | TangentHeading
  | ConstantHeading
  | InterpolatedHeading;

// No such thing as an anonymous PathChain
export type NamedPathChain = {
  name: string;
  paths: BezierRef[];
  heading: HeadingType;
};

export type PathChainFile = {
  name: string;
  values: NamedValue[];
  poses: NamedPose[];
  beziers: NamedBezier[];
  pathChains: NamedPathChain[];
};

export function chkTeamPaths(t: unknown): t is TeamPaths {
  return isRecordOf(t, isString, isArrayOfString);
}

function isValueTypeName(t: unknown): t is 'int' | 'double' | 'radians' {
  return t === 'int' || t === 'double' || t === 'radians';
}

export const chkAnonymousValue = chkObjectOfExactType<AnonymousValue>({
  type: isValueTypeName,
  value: isNumber,
});
export const chkNamedValue = chkObjectOfExactType<NamedValue>({
  name: isString,
  value: chkAnonymousValue,
});
export const chkValueRef = chkAnyOf(isString, chkAnonymousValue);
export const chkRadianRef = chkObjectOfExactType<RadiansRef>({
  radians: chkValueRef,
});

export const chkHeadingRef = chkAnyOf(chkValueRef, chkRadianRef);

export const chkAnonymousPose = chkObjectOfExactType<AnonymousPose>(
  {
    x: chkValueRef,
    y: chkValueRef,
  },
  { heading: chkHeadingRef },
);
export const chkNamedPose = chkObjectOfExactType<NamedPose>({
  name: isString,
  pose: chkAnonymousPose,
});
export const chkPoseRef = chkAnyOf(isString, chkAnonymousPose);

function isBezierTypeName(t: unknown): t is 'line' | 'curve' {
  return t === 'line' || t === 'curve';
}
export const chkAnonymousBezier = chkObjectOfExactType<AnonymousBezier>({
  type: isBezierTypeName,
  points: chkArrayOf(chkPoseRef),
});
export const chkNamedBezier = chkObjectOfExactType<NamedBezier>({
  name: isString,
  points: chkAnonymousBezier,
});
export const chkBezierRef = chkAnyOf(isString, chkAnonymousBezier);

function isTangentHeadingType(type: unknown): type is 'tangent' {
  return type === 'tangent';
}
function isConstantHeadingType(type: unknown): type is 'constant' {
  return type === 'constant';
}
function isInterpolatedHeadingType(type: unknown): type is 'interpolated' {
  return type === 'interpolated';
}
export const chkTangentHeading = chkObjectOfExactType<TangentHeading>({
  type: isTangentHeadingType,
});
export const chkConstantHeading = chkObjectOfExactType<ConstantHeading>({
  type: isConstantHeadingType,
  heading: chkHeadingRef,
});
export const chkInterpolatedHeading = chkObjectOfExactType<InterpolatedHeading>(
  {
    type: isInterpolatedHeadingType,
    headings: chkTupleOf(chkHeadingRef, chkHeadingRef),
  },
);
export const chkHeadingType = chkAnyOf(
  chkTangentHeading,
  chkConstantHeading,
  chkInterpolatedHeading,
);

export const chkNamedPathChain = chkObjectOfExactType<NamedPathChain>({
  name: isString,
  paths: chkArrayOf(chkBezierRef),
  heading: chkHeadingType,
});
export const chkPathChainFile = chkObjectOfExactType<PathChainFile>({
  name: isString,
  values: chkArrayOf(chkNamedValue),
  poses: chkArrayOf(chkNamedPose),
  beziers: chkArrayOf(chkNamedBezier),
  pathChains: chkArrayOf(chkNamedPathChain),
});
