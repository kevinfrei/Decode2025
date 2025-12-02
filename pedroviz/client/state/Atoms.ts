import { hasField, isDefined } from '@freik/typechk';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import {
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
    const selTeam = await get(SelectedTeamAtom);
    const paths = await get(PathsAtom);
    const files = paths[selTeam];
    if (files && files.length === 1) {
      return files[0];
    }
    return get(SelectedFileBackingAtom);
  },
  // TODO: When you set the file, udpate the file contents
  // automagically? That wouldn't work with the automatic
  // selection thing happening in here, but if I moved that
  // into the UI, I could actually keep the dependencies
  // "correct" (and potentially much more atomic, resulting
  // in fewer UI updates hopefully)
  (_, set, val) => {
    set(SelectedFileBackingAtom, val);
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
