import { isDefined, isUndefined } from '@freik/typechk';

import { GetTeamPaths } from './getpaths';
import { GetPathChainIndex } from './loadpath';
import {
  isError,
  Path,
  PathChainClass,
  PathDatabase,
  Team,
  TeamPaths,
} from './types';

const teampaths: Map<Team, Path[]> = new Map();
const database: PathDatabase = new Map();

// Returns true if that file has *any* items we care about in it.
// This does wind up triggering for something that just has a static int/double,
// but that's okay (better than missing one...)
function anyItems(pcc: PathChainClass): boolean {
  const work = [pcc];
  while (work.length > 0) {
    const item = work.pop();
    if (isUndefined(item)) {
      break;
    }
    if (
      item.beziers.length ||
      item.poses.length ||
      item.pathChains.length ||
      item.values.length
    ) {
      return true;
    }
    work.push(...Object.values(item.children));
  }
  return false;
}

function RegisterPathChainIndex(
  team: Team,
  path: Path,
  classList: string[],
  pcc: PathChainClass,
): void {
  if (!anyItems(pcc)) {
    return;
  }
  console.log('Registering', team, path, classList);
  const paths = teampaths.get(team);
  if (isDefined(paths)) {
    paths.push(path);
  } else {
    teampaths.set(team, [path]);
  }
  database.set([team, path], [classList, pcc]);
}

export async function PopulateDatabase() {
  const teamPaths: TeamPaths = await GetTeamPaths();
  for (const team of Object.keys(teamPaths) as Team[]) {
    for (const path of teamPaths[team]!) {
      const pci = await GetPathChainIndex(team, path);
      if (!isError(pci)) {
        RegisterPathChainIndex(team, path, pci[0], pci[1]);
      }
    }
  }
}

export function GetAllIndexContent(): [Team, Path, string[]][] {
  const entries: [[Team, Path], [string[], PathChainClass]][] = [
    ...database.entries(),
  ];
  return entries.map(([[team, path], [classes, pcc]]) => [team, path, classes]);
}

export function GetFullPathChain(
  team: Team,
  path: Path,
): PathChainClass | undefined {
  const entry = database.get([team, path]);
  return entry && entry[1];
}

export function GetDatabase(): PathDatabase {
  return database;
}

if (import.meta.main) {
  PopulateDatabase()
    .then(() => console.log('done'))
    .catch(console.error);
}
