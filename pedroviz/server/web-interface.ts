import { isString } from '@freik/typechk';

import { GetTeamPaths } from './getpaths';
import { GetPathChainIndex } from './loadpath';
import { MakePathChainFile } from './PathChainLoader';
import { isError, PathChainClass } from './types';
import { getProjectFilePath } from './utility';

// Send the list of TeamPaths to the client

export async function GetPathFileNames(): Promise<Response> {
  // First, get the path to the root of the repository:
  // console.log('Found the following paths:', filePaths);
  return Response.json(await GetTeamPaths());
}
export async function LoadClassList(
  team: string,
  path: string,
): Promise<Response> {
  const res = await GetPathChainIndex(team, path);
  if (isError(res)) {
    return Response.json({ error: res.errors().join('\n') });
  }
  return Response.json(res[0]);
}
export async function LoadPath(
  team: string,
  filename: string,
): Promise<Response> {
  const filePath = getProjectFilePath(team, filename);
  const paths = await MakePathChainFile(filePath);
  if (isString(paths)) {
    return Response.json({ error: paths });
  }
  return Response.json(paths);
}
