import { hasField, isDefined } from '@freik/typechk';
import { chkPathChainFile, chkTeamPaths } from './checkers';
import { PathChainFile, TeamPaths } from './server/types';
import { fetchApi } from './state/Storage';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export async function GetPaths(): Promise<TeamPaths> {
  return fetchApi('getpaths', chkTeamPaths, {});
}
const EmptyPathChainFile: PathChainFile = {
  name: 'empty',
  values: [],
  poses: [],
  beziers: [],
  pathChains: [],
};
export async function LoadFile(team: string, file: string) {
  return await fetchApi(
    `loadpath/${encodeURIComponent(team)}/${encodeURIComponent(file)}`,
    chkPathChainFile,
    EmptyPathChainFile,
  );
}

export async function SavePath(
  team: string,
  path: string,
  data: PathChainFile,
): Promise<undefined | string> {
  // NYI on the server, either :D
  return 'NYI';
}

export const PathsAtom = atom(async () => GetPaths());
export const TeamsAtom = atom(async (get) => {
  const paths = await get(PathsAtom);
  return Object.keys(paths);
});
export const SelectedTeamAtom = atom('');
export const SelectedFileAtom = atom('');
export const FilesForTeamFamily = atomFamily((team: string) =>
  atom(async (get) => {
    const paths = await get(PathsAtom);
    if (hasField(paths, team)) {
      return paths[team];
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

export const CurPathAtom = atom(async (get) => {
  const paths = await get(PathsAtom);
  const selTeam = await get(SelectedTeamAtom);
  const selFile = await get(SelectedFileAtom);
  console.log('Checking field', selTeam);
  if (hasField(paths, selTeam)) {
    console.log('Checking file', selFile);
    const files = paths[selTeam];
    if (isDefined(files) && files.indexOf(selFile) >= 0) {
      console.log('Has team & file', selTeam, selFile);
      return await LoadFile(selTeam, selFile);
    }
  }
  return EmptyPathChainFile;
});
