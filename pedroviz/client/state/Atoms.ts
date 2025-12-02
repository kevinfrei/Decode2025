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
  chkNamedBezier,
  chkNamedPathChain,
  chkNamedPose,
  chkNamedValue,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
} from '../../server/types';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';
import { EmptyPathChainFile, GetPaths, LoadFile } from './API';

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
  async (get, set, val: string) => {
    const prev = get(SelectedFileBackingAtom);
    const team = await get(SelectedTeamAtom);
    set(SelectedFileBackingAtom, val);
    if (val !== prev && val !== '') {
      // TODO: clear any AtomFamiliy cache
      const pcf = await LoadFile(team, val);
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

const NamedValuesBackerAtom = atom<Map<string, NamedValue>>(new Map());
export const NamedValuesAtom = atom(
  (get) => get(NamedValuesBackerAtom),
  (get, set, val: Iterable<NamedValue> | NamedValue) => {
    if (chkNamedValue(val)) {
      const nvba = new Map(get(NamedValuesBackerAtom));
      nvba.set(val.name, val);
      set(NamedValuesBackerAtom, nvba);
    } else {
      console.log("List of NV's", val);
      const nv = new Map([...val].map((val) => [val.name, val]));
      console.log('Map:', nv);
      set(NamedValuesBackerAtom, nv);
    }
  },
);
export const ValueNamesAtom = atom((get) => [
  ...get(NamedValuesBackerAtom).keys(),
]);
export const ValueAtomFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedValuesBackerAtom).get(name),
    (_, set, args: NamedValue | AnonymousValue) =>
      set(
        NamedValuesAtom,
        chkAnonymousValue(args) ? { name, value: args } : args,
      ),
  ),
);

const NamedPosesBackerAtom = atom<Map<String, NamedPose>>(new Map());
export const NamedPosesAtom = atom(
  (get) => get(NamedPosesBackerAtom),
  (get, set, val: Iterable<NamedPose> | NamedPose) => {
    if (chkNamedPose(val)) {
      const npba = new Map(get(NamedPosesBackerAtom));
      npba.set(val.name, val);
      set(NamedPosesBackerAtom, npba);
    } else {
      const np = new Map([...val].map((val) => [val.name, val]));
      set(NamedPosesBackerAtom, np);
    }
  },
);
export const PoseNamesAtom = atom((get) => [
  ...get(NamedPosesBackerAtom).keys(),
]);
export const PoseAtomFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedPosesAtom).get(name),
    (_, set, args: NamedPose | AnonymousPose) =>
      set(NamedPosesAtom, chkAnonymousPose(args) ? { name, pose: args } : args),
  ),
);

export const NamedBeziersBackerAtom = atom<Map<string, NamedBezier>>(new Map());
export const NamedBeziersAtom = atom(
  (get) => get(NamedBeziersBackerAtom),
  (get, set, val: Iterable<NamedBezier> | NamedBezier) => {
    if (chkNamedBezier(val)) {
      const nbba = new Map(get(NamedBeziersBackerAtom));
      nbba.set(val.name, val);
      set(NamedBeziersBackerAtom, nbba);
    } else {
      const nb = new Map([...val].map((val) => [val.name, val]));
      set(NamedBeziersBackerAtom, nb);
    }
  },
);
export const BezierNamesAtom = atom((get) => [
  ...get(NamedBeziersBackerAtom).keys(),
]);
export const BezierAtomFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedBeziersAtom).get(name),
    (_, set, args: NamedBezier | AnonymousBezier) =>
      set(
        NamedBeziersAtom,
        chkAnonymousBezier(args) ? { name, points: args } : args,
      ),
  ),
);

export const NamedPathChainsBackerAtom = atom<Map<string, NamedPathChain>>(
  new Map(),
);
export const NamedPathChainsAtom = atom(
  (get) => get(NamedPathChainsBackerAtom),
  (get, set, val: Iterable<NamedPathChain> | NamedPathChain) => {
    if (chkNamedPathChain(val)) {
      const npcba = new Map(get(NamedPathChainsBackerAtom));
      npcba.set(val.name, val);
      set(NamedPathChainsBackerAtom, npcba);
    } else {
      const npc = new Map([...val].map((val) => [val.name, val]));
      set(NamedPathChainsBackerAtom, npc);
    }
  },
);
export const PathChainNamesAtom = atom((get) =>
  get(NamedPathChainsAtom).keys(),
);
export const PathChainAtomFor = atomFamily((name: string) =>
  atom(
    (get) => get(NamedPathChainsAtom).get(name),
    (_, set, args: NamedPathChain) => set(NamedPathChainsAtom, args),
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
      return res;
    }
  }
  return EmptyPathChainFile;
});
