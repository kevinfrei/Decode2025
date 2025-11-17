import { readdir } from 'node:fs/promises';
import fs from 'node:fs';
import path from 'node:path';
import { Dirent } from 'node:fs';

export async function Roots(): Promise<Response> {
  // Get the list of all team code roots
  // First, get the path to the root of the repository:
  const repoRoot = await getRelativeRepoRoot();
  console.log('Repository root:', repoRoot);
  const teamDirs = await getTeamDirectories(repoRoot);
  console.log('Team directories found:', teamDirs);
  return Response.json(teamDirs);
}

async function getRelativeRepoRoot(): Promise<string> {
  // Get the path to the root of the repository
  // Assume that this file is located at <repo-root>/pedroviz/server/roots.ts
  const currentPath = new URL('.', import.meta.url).pathname.substring(1);
  // TODO: Poke around a bit more: There should at least be a 'settings.gradle' file here.
  return path.join(currentPath, '../..');
}

async function getTeamDirectories(repoRoot: string): Promise<string[]> {
  const entries = await readdir(`${repoRoot}`, { withFileTypes: true });
  console.log(entries);
  const teamDirs = entries
    .filter((dir) => isTeamDirectory(repoRoot, dir))
    .map((dir) => dir.name);
  return teamDirs;
}

// A directory is a team directory if:
// - It is a directory
// - Its name does not start with a .
// - Its name is not "FtcRobotController"
// - It contains a 'build.gradle' file
// - It has a 'src/main/java/org/firstinspires/ftc/<team-name>' subdirectory
// - It is referred to in the settings.gradle file at the repo root (NYI)
// - It has a PedroPath constants file? (NYI)
function isTeamDirectory(repoRoot: string, dir: Dirent): boolean {
  if (!dir.isDirectory()) {
    return false;
  }
  const name = dir.name;
  if (name[0] === '.') {
    return false;
  }
  if (name === 'FtcRobotController') {
    return false;
  }
  // Check for the presence of a 'build.gradle' file
  const buildGradlePath = path.join(repoRoot, dir.name, 'build.gradle');
  if (!fs.existsSync(buildGradlePath)) {
    return false;
  }
  // Check for the presence of the 'src/main/java/org/firstinspires/ftc/<team-name>' subdirectory
  const teamSrcPath = path.join(
    repoRoot,
    dir.name,
    'src/main/java/org/firstinspires/ftc',
    dir.name.toLocaleLowerCase(),
  );
  if (!fs.existsSync(teamSrcPath)) {
    return false;
  }
  // TODO: Check if the directory is included in the settings.gradle file
  /*
  const settingsGradlePath = path.join(repoRoot, 'settings.gradle');
  if (!fs.existsSync(settingsGradlePath)) {
    return false;
  }
  const settingsGradleContent = fs.readFileSync(settingsGradlePath, 'utf-8');
  if (!settingsGradleContent.includes(dir.name)) {
    return false;
  }
  */
  return true;
}
