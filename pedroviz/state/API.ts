import {
  chkPathChainFile,
  chkTeamPaths,
  PathChainFile,
  TeamPaths,
} from '../server/types';
import { fetchApi } from './Storage';

export async function GetPaths(): Promise<TeamPaths> {
  return fetchApi('getpaths', chkTeamPaths, {});
}

export const EmptyPathChainFile: PathChainFile = {
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
