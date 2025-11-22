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
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  ConstantHeading,
  InterpolatedHeading,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PathChainFile,
  TangentHeading,
  TeamPaths,
} from './server/types';

export function chkTeamPaths(t: unknown): t is TeamPaths {
  return isRecordOf(t, isString, isArrayOfString);
}

function isValueTypeName(t: unknown): t is 'int' | 'string' {
  return t === 'int' || t === 'string';
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

export const chkAnonymousPose = chkObjectOfExactType<AnonymousPose>(
  {
    x: chkValueRef,
    y: chkValueRef,
  },
  { heading: chkValueRef },
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
  heading: chkValueRef,
});
export const chkInterpolatedHeading = chkObjectOfExactType<InterpolatedHeading>(
  {
    type: isInterpolatedHeadingType,
    headings: chkTupleOf(chkValueRef, chkValueRef),
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
