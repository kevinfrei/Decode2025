import {
  AnonymousBezier,
  AnonymousPose,
  BezierName,
  BezierRef,
  PathChainFile,
  PathChainName,
  PoseName,
  PoseRef,
  RadiansRef,
  ValueName,
  ValueRef,
} from '../../server/types';
import { AnonymousPathChain, MappedIndex } from './types';

export function MakeMappedIndex(pcf: PathChainFile): MappedIndex {
  const namedValues = new Map<ValueName, ValueRef | RadiansRef>(
    pcf.values.map((nv) => [nv.name, nv.value]),
  );
  const namedPoses = new Map<PoseName, PoseRef>(
    pcf.poses.map((np) => [np.name, np.pose]),
  );
  const namedBeziers = new Map<BezierName, BezierRef>(
    pcf.beziers.map((nb) => [nb.name, nb.points]),
  );
  const namedPathChains = new Map<PathChainName, AnonymousPathChain>(
    pcf.pathChains.map((pc) => [
      pc.name,
      { paths: pc.paths, heading: pc.heading },
    ]),
  );
  return { namedValues, namedPoses, namedBeziers, namedPathChains };
}

export const EmptyMappedFile: MappedIndex = {
  namedValues: new Map(),
  namedPoses: new Map(),
  namedBeziers: new Map(),
  namedPathChains: new Map(),
};
