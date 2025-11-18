import { BaseJavaCstVisitorWithDefaults } from 'java-parser';
import { PathChainFile } from './types';
import { getProjectFilePath, MakePathChainFile } from './utility';

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
  return MakePathChainFile(filePath);
}

class PathChainLoader extends BaseJavaCstVisitorWithDefaults {
  constructor() {
    super();
    this.validateVisitor();
  }
}
