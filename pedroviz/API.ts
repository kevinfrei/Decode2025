import {
  hasField,
  isArrayOfString,
  isRecordOf,
  isString,
} from '@freik/typechk';
import { PathChainFile, TeamPaths } from './server/types';
import { fetchApi } from './state/Storage';
import { atom } from 'jotai';
import { atomFamily } from 'jotai/utils';

export function isTeamPaths(maybe: unknown): maybe is TeamPaths {
  return isRecordOf(maybe, isString, isArrayOfString);
}

export async function GetPaths(): Promise<TeamPaths> {
  return fetchApi('getpaths', isTeamPaths, {});
  // return { TestTeam: ['Path1.java', 'subdir/Path2.java'] };
}

export const PathsAtom = atom(async () => GetPaths());
export const TeamsAtom = atom(async (get) => {
  const paths = await get(PathsAtom);
  return Object.keys(paths);
});
export const SelectedTeamAtom = atom('');
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

export async function LoadPath(
  team: string,
  path: string,
): Promise<PathChainFile | string> {
  // fetch(/api/loadpath/{team}/{path-URI-Encoded})
  return 'NYI';
}

export async function SavePath(
  team: string,
  path: string,
  data: PathChainFile,
): Promise<undefined | string> {
  // NYI on the server, either :D
  return 'NYI';
}
