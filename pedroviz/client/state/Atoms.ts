import { hasField, isDefined } from '@freik/typechk';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  chkAnonymousBezier,
  chkAnonymousPose,
  chkAnonymousValue,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
} from '../../server/types';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';
import { EmptyPathChainFile, GetPaths, LoadFile } from './API';
import {
  namedBeziers,
  namedPathChains,
  namedPoses,
  namedValues,
} from './validation';

export const ThemeAtom = atom<'dark' | 'light'>('light');
export const ColorsAtom = atom((get) => {
  const theme = get(ThemeAtom);
  return theme === 'dark' ? lightOnBlack : darkOnWhite;
});
export const ColorForNumber = atomFamily((index: number) =>
  atom((get) => {
    const colors = get(ColorsAtom);
    return colors[index % colors.length];
  }),
);

export const PathsAtom = atom(async () => GetPaths());

export const TeamsAtom = atom(async (get) => {
  const paths = await get(PathsAtom);
  return Object.keys(paths).sort();
});
export const SelectedTeamBackingAtom = atom('');
export const SelectedTeamAtom = atom(
  async (get) => {
    const allTeams = await get(TeamsAtom);
    if (allTeams.length === 1) {
      return allTeams[0];
    }
    return get(SelectedTeamBackingAtom);
  },
  (_, set, val) => {
    // Clear the selected file when the team is changed
    set(SelectedFileBackingAtom, '');
    set(SelectedTeamBackingAtom, val);
  },
);
export const SelectedFileBackingAtom = atom('');
export const SelectedFileAtom = atom(
  async (get) => {
    return get(SelectedFileBackingAtom);
  },
  // TODO: When you set the file, udpate the file contents
  // automagically. I should be able to actually keep the
  // dependencies "correct" (and potentially much more atomic,
  // resulting in fewer UI updates hopefully)
  async (get, set, val) => {
    const file = get(SelectedFileBackingAtom);
    const team = await get(SelectedTeamAtom);
    set(SelectedFileBackingAtom, val);
    if (val !== file) {
      // TODO: clear any AtomFamiliy cache
      const pcf = await LoadFile(team, file);
      // Set all teh names
      set(NamedValuesAtom, pcf.values);
      set(NamedPosesAtom, pcf.poses);
      set(NamedBeziersAtom, pcf.beziers);
      set(NamedPathChainsAtom, pcf.pathChains);
    }
  },
);

export const FilesForTeamFamily = atomFamily((team: string) =>
  atom(async (get) => {
    const paths = await get(PathsAtom);
    if (hasField(paths, team)) {
      return paths[team].sort();
    }
    return [];
  }),
);

export const FilesForSelectedTeam = atom(async (get) => {
  const selTeam = await get(SelectedTeamAtom);
  if (selTeam === '') {
    return [];
  }
  const thePaths = await get(PathsAtom);
  if (hasField(thePaths, selTeam)) {
    return thePaths[selTeam];
  }
  return [];
});

export const NamedValuesAtom = atom(
  (get) => {
    return namedValues;
  },
  (get, set, val: Iterable<NamedValue>) => {
    namedValues.clear();
    for (const nv of val) {
      namedValues.set(nv.name, nv);
    }
  },
);

export const NamedPosesAtom = atom(
  (get) => {
    return namedPoses;
  },
  (get, set, val: Iterable<NamedPose>) => {
    namedPoses.clear();
    for (const np of val) {
      namedPoses.set(np.name, np);
    }
  },
);

export const NamedBeziersAtom = atom(
  (get) => {
    return namedBeziers;
  },
  (get, set, val: Iterable<NamedBezier>) => {
    namedBeziers.clear();
    for (const nb of val) {
      namedBeziers.set(nb.name, nb);
    }
  },
);

export const NamedPathChainsAtom = atom(
  (get) => {
    return namedPathChains;
  },
  (get, set, val: Iterable<NamedPathChain>) => {
    namedPathChains.clear();
    for (const np of val) {
      namedPathChains.set(np.name, np);
    }
  },
);

export const PathChainNamesAtom = atom((get) =>
  get(NamedPathChainsAtom).keys(),
);

export const PathChainFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedPathChainsAtom).get(name),
    (get, set, args: NamedPathChain) => {
      const theMap = new Map(get(NamedPathChainsAtom));
      theMap.set(name, args);
      set(NamedPathChainsAtom, theMap.values());
    },
  ),
);

export const BezierFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedBeziersAtom).get(name),
    (get, set, args: NamedBezier | AnonymousBezier) => {
      const theMap = new Map(get(NamedBeziersAtom));
      theMap.set(
        name,
        chkAnonymousBezier(args) ? { name, points: args } : args,
      );
      set(NamedBeziersAtom, theMap.values());
    },
  ),
);

export const PoseFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedPosesAtom).get(name),
    (get, set, args: NamedPose | AnonymousPose) => {
      const theMap = new Map(get(NamedPosesAtom));
      theMap.set(name, chkAnonymousPose(args) ? { name, pose: args } : args);
      set(NamedPosesAtom, theMap.values());
    },
  ),
);

export const ValueFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedValuesAtom).get(name),
    (get, set, args: NamedValue | AnonymousValue) => {
      const theMap = new Map(get(NamedValuesAtom));
      theMap.set(name, chkAnonymousValue(args) ? { name, value: args } : args);
      set(NamedValuesAtom, theMap.values());
    },
  ),
);

export const CurPathChainAtom = atom(async (get) => {
  const paths = await get(PathsAtom);
  const selTeam = await get(SelectedTeamAtom);
  const selFile = await get(SelectedFileAtom);
  // console.log('Checking field', selTeam);
  if (hasField(paths, selTeam)) {
    // console.log('Checking file', selFile);
    const files = paths[selTeam];
    if (isDefined(files) && files.indexOf(selFile) >= 0) {
      // console.log('Has team & file', selTeam, selFile);
      const res = await LoadFile(selTeam, selFile);
      // console.log("here's the result:");
      // console.log(res);
      // This logs dependencies, so it will reload if I set them.
      // TODO: Make this entire thing go away, using the
      // selected file generate this stuff
      const values = get(NamedValuesAtom);
      const poses = get(NamedPosesAtom);
      const curves = get(NamedBeziersAtom);
      const paths = get(NamedPathChainsAtom);
      return res;
    }
  }
  return EmptyPathChainFile;
});
