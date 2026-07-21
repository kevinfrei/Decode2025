import { Path, PathChainClass, Team } from './types';

const teampaths: Map<Team, Path[]> = new Map();
const database: Map<[Team, Path], [string[], PathChainClass]> = new Map();

export function RegisterPathChainIndex(
  team: Team,
  path: Path,
  classList: string[],
  pcc: PathChainClass,
): void {
  database.set([team, path], [classList, pcc]);
}
