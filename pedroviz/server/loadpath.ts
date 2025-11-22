import { PathChainFile } from './types';
import { getProjectFilePath } from './utility';
import { MakePathChainFile } from './PathChainLoader';
import { isString } from '@freik/typechk';

export async function LoadPath(
  team: string,
  filename: string,
): Promise<Response> {
  const filePath = getProjectFilePath(team, filename);
  const paths = await loadPathChainsFromFile(filePath);
  if (isString(paths)) {
    return Response.json({ error: paths });
  }
  return Response.json(paths);
}

export async function loadPathChainsFromFile(
  filePath: string,
): Promise<PathChainFile | string> {
  return MakePathChainFile(filePath);
}
