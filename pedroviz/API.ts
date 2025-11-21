import { isArrayOfString, isRecordOf, isString } from '@freik/typechk';
import { PathChainFile, TeamPaths } from './server/types';

export function isTeamPaths(maybe: unknown): maybe is TeamPaths {
  return isRecordOf(maybe, isString, isArrayOfString);
}

export async function GetPaths(): Promise<TeamPaths | string> {
  // fetch(/api/getpaths)
  return { TestTeam: ['Path1.java', 'subdir/Path2.java'] };
}

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
