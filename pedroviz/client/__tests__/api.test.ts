import { describe, expect, test } from 'bun:test';
import { AnonymousBezier, AnonymousPose, AnonymousValue, BezierName, BezierRef, EmptyPathChainFile, HeadingRef, isError, NamedBezier, NamedPathChain, NamedPose, NamedValue, Path, PathChainFile, PathChainName, PoseName, PoseRef, Team, TeamPaths, ValueName, ValueRef } from '../../server/types';
import {
  GetPaths,
  LoadAndIndexFile,
  SavePath,
} from '../state/API';
import { IndexedPCF } from '../state/types';
import { isNumber, isString } from '@freik/typechk';

function mkValNm(name: string): ValueName {
  return name as ValueName;
}
function mkVal(type: 'int' | 'double', value: number): AnonymousValue;
function mkVal(type: 'radians', value: number | string): HeadingRef; 
function mkVal(type: 'radians' | 'int' | 'double', value: number | string): AnonymousValue | HeadingRef {
  return isNumber(value) ?  { type, value}
  : {radians: mkValNm(value) };
}
function mkNmVal(name: string, value: AnonymousValue | string | HeadingRef): NamedValue {
  return { name: mkValNm(name), value: isString(value) ? value as ValueRef : value };
}
function mkPoseNm(name: string): PoseName {
  return name as PoseName;
}
function mkPose(x: AnonymousValue | string, y: AnonymousValue | string, heading?: HeadingRef): AnonymousPose {
  return { x: x as ValueRef, y: y as ValueRef, heading: heading as HeadingRef };
}
function mkNmPose(name: string, pose: AnonymousPose | string): NamedPose {
  return { name: name as PoseName, pose: pose as PoseRef };
}
function mkBezNm(name: string): BezierName {
  return name as BezierName;
}
function mkBez(type: 'line' | 'curve', ...points: PoseRef[]): AnonymousBezier {
  return {type, points};
}
function mkNmBez(name: string, bez: AnonymousBezier | string): NamedBezier {
  return {name: mkBezNm(name), points: bez as BezierRef}
}
function mkPCNm(name:string): PathChainName {
  return name as PathChainName;
}

// Mocks & phony data for my tests:
const teamPaths: TeamPaths = {
  ['team1' as Team]: ['path1.java' as Path, 'path2.java' as Path],
  ['team2' as Team]: ['path3.java' as Path, 'path4.java' as Path],
};

const badTeamPaths: unknown = {
  team1: ['path1.java', 'path2.java'],
  team2: { path3: 'path3.java' },
};

const testPathChainFile = {
  ...EmptyPathChainFile,
};

const simpleBez: AnonymousBezier = {
  type: 'curve',
  points: [{ x: 'val1' as ValueName, y: 'val1' as ValueName }, 'pose1' as PoseName, 'pose2' as PoseName],
};

const fullPathChainFile: PathChainFile = {
  name: 'path3.java',
  values: [mkNmVal('va1', mkVal('int', 1)), mkNmVal('val2', mkVal('double', 2.5)), mkNmVal('val3', mkVal('radians', 90))],
  poses: [
    mkNmPose('pose1', mkPose(mkVal('double', 2.5), mkValNm('val1'))),
    mkNmPose('pose2', mkPose(mkValNm('val2'), mkValNm('val1'), mkVal('radians', 60))),
    mkNmPose('pose3', mkPose(mkValNm('val1'), mkValNm('val2'), mkValNm('val3'))),
  ],
  beziers: [
    mkNmBez('bez1', mkBez('line', mkPoseNm('pose1'), mkPoseNm('pose2'))),
    mkNmBez('bez2', simpleBez)
  ],
  pathChains: [
    {
      name: 'pc1' as PathChainName,
      paths: ['bez1' as BezierName, 'bez2' as BezierName],
      heading: { type: 'tangent' },
    },
    {
      name: 'pc2' as PathChainName,
      paths: ['bez2' as BezierName, { type: 'line', points: ['pose1' as PoseName, 'pose3' as PoseName] }],
      heading: { type: 'constant', heading: 'pose3' as PoseName },
    },
    {
      name: 'pc3' as PathChainName,
      paths: ['bez1' as BezierName, { type: 'curve', points: ['pose1' as PoseName, 'pose3' as PoseName, 'pose2' as PoseName] }],
      heading: {
        type: 'interpolated',
        headings: ['pose2' as PoseName, { radians: { type: 'int', value: 135 } }],
      },
    },
  ],
};

const danglingPCF: PathChainFile = {
  name: 'dangling.java',
  values: [...fullPathChainFile.values],
  poses: [
    ...fullPathChainFile.poses,
    mkNmPose('danglingHeader',mkPose('nope', 'val1')),
  ],
  beziers: [
    ...fullPathChainFile.beziers,
    mkNmBez('danglingPoseRef',
      mkBez('line',
          mkPoseNm('noPose'),
          mkPose('val1', 'not_here', mkVal('radians', 'nuthing')))),
    mkNmBez('danglingPoseRef2',
      mkBez('curve',
        mkPose('val1', 'val2', mkValNm('zip') ))),
    mkNmBez('danglingPoseRef3',
      mkBez('line', mkPose('val1',  'val2', mkValNm('zip') )))],
  pathChains: [
    ...fullPathChainFile.pathChains,
    {
      name: 'danglingBezRef',
      paths: ['noBez'],
      heading: { type: 'constant', heading: 'noHeading' },
    },
    {
      name: 'danglingBezRef2',
      paths: ['bez1', 'bez2'],
      heading: { type: 'constant', heading: { radians: 'nospot' } },
    },
  ],
};

let bad = false;

const status = {
  status: 200,
  headers: { 'Content-Type': 'application/json' },
};
async function MyFetchFunc(
  key: string | URL | Request,
  init?: RequestInit,
): Promise<Response> {
  switch (key) {
    case '/api/getpaths': {
      const body = JSON.stringify(bad ? badTeamPaths : teamPaths);
      return new Response(body, status);
    }
    case '/api/loadpath/team1/path1.java': {
      const body = JSON.stringify({ a: 'b' });
      return new Response(body, status);
    }
    case '/api/loadpath/team1/path2.java': {
      const body = JSON.stringify(testPathChainFile);
      return new Response(body, status);
    }
    case '/api/loadpath/team2/path3.java': {
      const body = JSON.stringify(fullPathChainFile);
      return new Response(body, status);
    }
    case '/api/loadpath/team2/path4.java': {
      const body = JSON.stringify(danglingPCF);
      return new Response(body, status);
    }
  }
  return new Response('ERROR', { status: 404 });
}
MyFetchFunc.preconnect = () => { };

describe('API validation', () => {
  test('GetPaths', async () => {
    globalThis.fetch = MyFetchFunc;
    bad = true;
    const res2 = await GetPaths();
    expect(res2).toEqual({});
    bad = false;
    const res = await GetPaths();
    expect(res).toEqual(teamPaths);
  });
  test('LoadPaths', async () => {
    globalThis.fetch = MyFetchFunc;
    const res2 = await LoadFile('team1', 'path1.java');
    expect(isError(res2)).toBeTrue();
    if (isError(res2)) {
      expect(res2.errors()).toEqual(
        ['Invalid PathChainFile loaded from server'],
      );
    }
    const res = await LoadFile('team1', 'path2.java');
    expect(isError(res)).toBeTrue();
    if (isError(res)) {
      expect(res.errors()).toEqual(
        ['Invalid PathChainFile loaded from server'],
      );
    }
  });
  test('Undefined references in PathChainFile validation', async () => {
    globalThis.fetch = MyFetchFunc;
    const res = await LoadFile('team2', 'path4.java');
    expect(isError(res)).toBeTrue();
    if (isError(res)) {
      expect(res.errors()).toEqual(['Loaded file team2/path4.java has dangling references.']);
    }
  });
  test('Full PathChainFile validation, color hashing, and evaluation', async () => {
    globalThis.fetch = MyFetchFunc;
    const res = await LoadFile('team2', 'path3.java');
    if (isError(res)) {
      console.log('Errors:', res.errors());
      expect(isError(res)).toBeFalse();
      return;
    }
    expect(res.dump()).toEqual('3 values, 3 poses, 2 beziers, 3 pathChains.');
    expect(res.getValueRefValue({ type: 'int', value: 1 })).toEqual(1);
    expect(res.getValueRefValue({ type: 'double', value: 2.5 })).toEqual(2.5);
    expect(res.getValueRefValue({ type: 'radians', value: 180 })).toEqual(Math.PI);
    expect(res.getValueRefValue('val2')).toEqual(2.5);
    expect(res.getPoseRefPoint({ x: 'val1', y: 'val2' })).toEqual({ x: 1, y: 2.5 });
    const pose3 = res.getPoseRefPoint('pose3');
    expect(pose3).toEqual({ x: 1, y: 2.5 });
    expect(() => res.getPoseRefPoint('noPose')).toThrow();
    expect(res.getBezierRefPoints('bez2')).toEqual([
      { x: 1, y: 1 },
      { x: 2.5, y: 1 },
      { x: 2.5, y: 1 },
    ]);
    expect(res.getValueRefValue('val1')).toEqual(1);
    expect(res.getHeadingRefValue({ radians: 'val2' })).toEqual(
      (2.5 * Math.PI) / 180,
    );
    expect(res.getValueRefValue({ type: 'int', value: 15 })).toEqual(15);
    const res2 = await LoadFile('team2', 'path3.java');
    expect(!isError(res2)).toBeTrue();
  });
  test('Need to implement a real "save" feature', async () => {
    // Probably add a test for this, yeah?
    const res = await SavePath('teamX', 'pathY.java', fullPathChainFile);
    expect(res).toEqual('NYI');
  });
});
