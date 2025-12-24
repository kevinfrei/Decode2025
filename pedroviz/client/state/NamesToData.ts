import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  PathChainFile,
} from '../../server/types';
import { AnonymousPathChain, MappedIndex } from './types';

export function MakeMappedIndex(pcf: PathChainFile): MappedIndex {
  const namedValues = new Map<string, AnonymousValue>(
    pcf.values.map((nv) => [nv.name, nv.value]),
  );
  const namedPoses = new Map<string, AnonymousPose>(
    pcf.poses.map((np) => [np.name, np.pose]),
  );
  const namedBeziers = new Map<string, AnonymousBezier>(
    pcf.beziers.map((nb) => [nb.name, nb.points]),
  );
  const namedPathChains = new Map<string, AnonymousPathChain>(
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
