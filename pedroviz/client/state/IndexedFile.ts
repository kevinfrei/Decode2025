import { isUndefined } from '@freik/typechk';
import {
  accError,
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierName,
  BezierRef,
  chkConstantHeading,
  chkInterpolatedHeading,
  chkRadiansRef,
  ErrorOr,
  HeadingRef,
  isError,
  isRef,
  makeError,
  PathChainFile,
  PathChainName,
  PoseName,
  PoseRef,
  ValueName,
  ValueRef,
} from '../../server/types';
import { ValidRes } from './API';
import { AnonymousPathChain, MappedIndex, Point } from './types';

export function MakeMappedIndexedFile(
  pcf: PathChainFile,
): ErrorOr<MappedIndex> {
  const namedValues = new Map<ValueName, ValueRef>(
    pcf.values.map((nv) => [nv.name, nv.value]),
  );
  const namedPoses = new Map<PoseName, PoseRef>(
    pcf.poses.map((np) => [np.name, np.pose]),
  );
  const namedBeziers = new Map<BezierName, BezierRef>(
    pcf.beziers.map((nb) => [nb.name, nb.points]),
  );
  const namedPathChains = new Map<PathChainName, AnonymousPathChain>(
    pcf.pathChains.map((npc) => [
      npc.name,
      { paths: npc.paths, heading: npc.heading },
    ]),
  );

  function checkValueRef(vr: ValueRef, id: string): ValidRes {
    if (isRef(vr)) {
      if (!namedValues.has(vr)) {
        return makeError(
          `${id}'s "${vr}" value reference appears to be undefined.`,
        );
      }
    }
    return true;
  }

  function checkHeadingRef(hr: HeadingRef, id: string): ValidRes {
    if (chkRadiansRef(hr)) {
      return checkValueRef(hr.radians, `${id}'s Radians ref`);
    }
    return checkValueRef(hr, id);
  }

  function checkAnonymousPose(pose: AnonymousPose, id: string): ValidRes {
    let res: ValidRes = true;
    if (pose.heading) {
      res = checkHeadingRef(pose.heading, `${id}'s heading`);
    }
    res = accError(checkValueRef(pose.x, `${id}'s x coordinate`), res);
    return accError(checkValueRef(pose.y, `${id}'s y coordinate`), res);
  }

  function checkPoseRef(pr: PoseRef, id: string): ValidRes {
    if (isRef(pr)) {
      return namedPoses.has(pr)
        ? true
        : makeError(`${id}'s "${pr}" pose reference appears to be undefined`);
    }
    return checkAnonymousPose(pr, id);
  }

  function checkAnonymousBezier(curve: AnonymousBezier, id: string): ValidRes {
    let res: ValidRes = true;
    curve.points.forEach((pr, index) => {
      res = accError(checkPoseRef(pr, `${id}'s element ${index}`), res);
    });
    if (curve.type === 'line' && curve.points.length !== 2) {
      return accError(res, makeError(`${id}'s line doesn't have 2 points`));
    } else if (curve.type === 'curve' && curve.points.length < 2) {
      return accError(
        res,
        makeError(`${id}'s line doesn't have enough points`),
      );
    }
    return res;
  }

  function checkBezierRef(br: BezierRef, id: string): ValidRes {
    if (isRef(br)) {
      return namedBeziers.has(br)
        ? true
        : makeError(`${id}'s bezier reference appears to be undefined`);
    }
    return checkAnonymousBezier(br, id);
  }

  function checkAnonymousPathChain(
    apc: AnonymousPathChain,
    id: string,
  ): ValidRes {
    let res: ValidRes = true;
    if (chkConstantHeading(apc.heading)) {
      res = checkHeadingRef(
        apc.heading.heading,
        `${id}'s constant heading ref`,
      );
    } else if (chkInterpolatedHeading(apc.heading)) {
      res = checkHeadingRef(
        apc.heading.headings[0],
        `${id}'s start heading ref`,
      );
      res = accError(
        checkHeadingRef(apc.heading.headings[1], `${id}'s end heading ref`),
        res,
      );
    }
    apc.paths.forEach((br, index) => {
      res = accError(checkBezierRef(br, `${id}'s path element ${index}`), res);
    });
    return res;
  }

  function validateUniqueNames(): ValidRes {
    const allNames = new Set<string>([
      ...namedValues.keys(),
      ...namedPoses.keys(),
      ...namedBeziers.keys(),
      ...namedPathChains.keys(),
    ]);
    if (
      allNames.size !==
      namedValues.size +
        namedPoses.size +
        namedBeziers.size +
        namedPathChains.size
    ) {
      // TODO: Provide a detailed diagnostic of which names are duplicated
      return makeError(
        'Duplicate names found between values, points, beziers, and path chains.',
      );
    }
    return true;
  }

  function validatePathChainIndex(): ErrorOr<true> {
    let good: ValidRes = true;
    namedPoses.forEach((pr, name) => {
      good = accError(checkPoseRef(pr, name), good);
    });
    namedBeziers.forEach((br, name) => {
      good = accError(checkBezierRef(br, name), good);
    });
    namedPathChains.forEach((apc, name) => {
      good = accError(checkAnonymousPathChain(apc, name), good);
    });
    good = accError(validateUniqueNames(), good);
    return isError(good) ? good : true;
  }

  const res = validatePathChainIndex();
  if (isError(res)) {
    return res;
  }

  return { namedValues, namedBeziers, namedPoses, namedPathChains };
}

export function getValueRefValue(idx: MappedIndex, vr: ValueRef): number {
  let av = vr;
  const seen = new Set<string>();
  while (isRef(av)) {
    if (seen.has(av)) {
      throw new Error(
        `Circular reference for ${vr} (${av} triggered the cycle)`,
      );
    }
    seen.add(av);
    av = idx.namedValues.get(av);
  }
  if (isUndefined(av)) {
    throw new Error(`Invalid ValueRef ${vr}`);
  }
  return numFromVal(av);
}

export function getPoseRefPoint(idx: MappedIndex, pr: PoseRef): Point {
  let ap = pr;
  const seen = new Set<string>();
  while (isRef(ap)) {
    if (seen.has(ap)) {
      throw new Error(
        `Circular reference for ${pr} (${ap} triggered the cycle)`,
      );
    }
    seen.add(ap);
    ap = idx.namedPoses.get(ap);
  }
  if (isUndefined(ap)) {
    throw new Error(`Invalid PoseRef ${pr}`);
  }
  return { x: getValueRefValue(idx, ap.x), y: getValueRefValue(idx, ap.y) };
}

export function getBezierRefPoints(idx: MappedIndex, br: BezierRef): Point[] {
  let ab = br;
  const seen = new Set<string>();
  while (isRef(ab)) {
    if (seen.has(ab)) {
      throw new Error(
        `Circular reference for ${br} (${ab} triggered the cycle)`,
      );
    }
    seen.add(ab);
    ab = idx.namedBeziers.get(ab);
  }
  if (isUndefined(ab)) {
    throw new Error(`Invalid BezierRef ${br}`);
  }
  return ab.points.map((p) => getPoseRefPoint(idx, p));
}

export function getHeadingRefValue(idx: MappedIndex, hr: HeadingRef): number {
  if (isRef(hr)) {
    return getValueRefValue(idx, hr);
  } else if (chkRadiansRef(hr)) {
    return (Math.PI * getValueRefValue(idx, hr.radians)) / 180.0;
  } else {
    return getValueRefValue(idx, hr);
  }
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
