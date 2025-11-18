import { PathChainFile } from './types';
import { getProjectFilePath } from './utility';
import { MakePathChainFile } from './PathChainLoader';

export async function LoadPath(
  team: string,
  filename: string,
): Promise<Response> {
  const filePath = getProjectFilePath(team, filename);
  const paths: PathChainFile = await loadPathChainsFromFile(filePath);
  return Response.json({ team, paths });
}

export async function loadPathChainsFromFile(
  filePath: string,
): Promise<PathChainFile> {
  return await MakePathChainFile(filePath);
}
