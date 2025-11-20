export type AnonymousValue = { type: 'int' | 'double'; value: number };
export type NamedValue = { name: string; value: AnonymousValue };
export type ValueRef = AnonymousValue | string;

export type AnonymousPose = { x: ValueRef; y: ValueRef; heading?: ValueRef };
export type NamedPose = { name: string; pose: AnonymousPose };
export type PoseRef = AnonymousPose | string;

export type AnonymousBezier = { type: 'line' | 'curve'; points: PoseRef[] };
export type NamedBezier = { name: string; points: AnonymousBezier };
export type BezierRef = AnonymousBezier | string;

export type TangentHeading = { type: 'tangent' };
export type ConstandHeading = { type: 'constant'; heading: ValueRef };
export type InterpolatedHeading = {
  type: 'interpolated';
  headings: [ValueRef, ValueRef];
};
export type HeadingType =
  | TangentHeading
  | ConstandHeading
  | InterpolatedHeading;

export type AnonymousPathChain = { paths: BezierRef[]; heading: HeadingType };
export type NamedPathChain = { name: string; chain: AnonymousPathChain };

export type PathChainFile = {
  name: string;
  values: NamedValue[];
  poses: NamedPose[];
  beziers: NamedBezier[];
  pathChains: NamedPathChain[];
};
