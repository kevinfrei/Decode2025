import { RegisterPathChainIndex } from './full-database';
import { GetTeamPaths } from './getpaths';
import { GetPathChainIndex } from './loadpath';
import { OpenBrowser } from './open-browser';
import { isError, Team, TeamPaths } from './types';

// Scan the files
export async function main(url: URL) {
  const teamPaths: TeamPaths = await GetTeamPaths();
  for (const team of Object.keys(teamPaths) as Team[]) {
    for (const path of teamPaths[team]!) {
      const pci = await GetPathChainIndex(team, path);
      if (!isError(pci)) {
        RegisterPathChainIndex(team, path, pci[0], pci[1]);
      }
    }
  }

  console.log(`🚀 Server running at ${url}`);
  OpenBrowser(url.toString());
}
