import { hasField, isDefined } from '@freik/typechk';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { EmptyPathChainFile, GetPaths, LoadFile } from './API';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';

export const ThemeAtom = atom<'dark' | 'light'>('light');
export const ColorsAtom = atom((get)=>{
  const theme = get(ThemeAtom);
  return  (theme === 'dark') ? lightOnBlack : darkOnWhite;
});
export const ColorForNumber = atomFamily((index: number)=> atom((get)=>{
  const colors = get(ColorsAtom);
  return colors[index % colors.length];
}));

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
      return res;
    }
  }
  return EmptyPathChainFile;
});

export const ValuesAtom = atom(async (get) => {
  // Register the dependency...
  await get(SelectedFileAtom);
  // Everything after this is just the local API
});
