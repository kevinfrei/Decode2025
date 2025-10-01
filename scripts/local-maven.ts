import { ForFilesSync } from '@freik/files';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { ReadGradleModule } from './helpers/GradleModule';
import { hasFieldOf, hasFieldType, isArray, isString } from '@freik/typechk';

// install-maven.js

// Configuration:
const repoPath = './local-maven-repo'; // ← customize this

type LibraryEntry = {
  primary: string;
  sources?: string;
  javadoc?: string;
};

type PomEntry = {
  pom: string;
} & LibraryEntry;

type ModuleEntry = {
  groupId: string;
  artifactId: string;
  version: string;
} & LibraryEntry;

function removeLeadingZeroes(str: string): string {
  let i = 0;
  while (i < str.length && str[i] === '0') {
    i += 1;
  }
  return str.slice(i);
}

function readModuleArtifact(modulePath: string): ModuleEntry | undefined {
  const moduleData = ReadGradleModule(modulePath);
  if (!moduleData) {
    console.error(`Failed to read module data from ${modulePath}`);
    return;
  }
  const moduleParent = path.resolve(path.join(path.dirname(modulePath), '..'));
  // TODO: We should also look for a .pom file in a sibling directory

  // Okay, look for the library, sources, and javadoc files
  // They should be in the sha1 directories
  const libEntry: ModuleEntry = {
    primary: '',
    groupId: moduleData.component.group,
    artifactId: moduleData.component.module,
    version: moduleData.component.version,
  };
  for (const variant of moduleData.variants) {
    if (!hasFieldType(variant, 'files', isArray)) {
      // This is an 'elsewhere' variant; skip it
      continue;
    }
    if (variant.files.length !== 1) {
      console.error('I only know how to handle variants with one file.');
      return;
    }
    const file = variant.files[0];
    if (
      !hasFieldType(file, 'name', isString) ||
      !hasFieldType(file, 'sha1', isString)
    ) {
      console.error(
        `Invalid file entry in variant ${variant.name} in module ${modulePath}`,
      );
      return;
    }
    const sha1Trimmed = removeLeadingZeroes(file.sha1);
    const sha1Dir = path.join(moduleParent, sha1Trimmed);
    const filePath = path.join(sha1Dir, file.name);
    if (fs.existsSync(filePath)) {
      // Which file is this one: source, docs, or library?
      // Check the attributes first:
      if (variant.attributes['org.gradle.docstype'] === 'javadoc') {
        libEntry.javadoc = filePath;
      } else if (variant.attributes['org.gradle.docstype'] === 'sources') {
        libEntry.sources = filePath;
      } else if (variant.attributes['org.gradle.libraryelements'] === 'aar') {
        libEntry.primary = filePath;
      } else if (variant.attributes['org.gradle.libraryelements'] === 'jar') {
        libEntry.primary = filePath;
      } else {
        console.error(`Unknown library type for ${file.name}: ${filePath}`);
        return;
      }
    }
  }
  return libEntry;
}

function readPomArtifact(pomPath: string): PomEntry | undefined {
  if (!fs.existsSync(pomPath)) {
    console.error(`POM file does not exist: ${pomPath}`);
    return;
  }
  // I don't need to parse the POM, just find the files around it.
  // Go up one directory and find all the .{jar,aar} files
  let primary: string = '';
  let sources: string | undefined;
  let javadoc: string | undefined;
  const pomParent = path.join(path.dirname(pomPath), '..');
  ForFilesSync(
    pomParent,
    (filePath: string) => {
      if (filePath.endsWith('-sources.jar')) {
        sources = filePath;
      } else if (filePath.endsWith('-javadoc.jar')) {
        javadoc = filePath;
      } else if (filePath.endsWith('.jar') || filePath.endsWith('.aar')) {
        // This is the primary file
        primary = filePath;
      }
      return true;
    },
    { fileTypes: ['.jar', '.aar'] },
  );
  if (primary === '') {
    console.error(`No primary library found for POM ${pomPath}`);
    return;
  }
  const pomEntry: PomEntry = {
    pom: pomPath,
    primary,
    sources,
    javadoc,
  };
  return pomEntry;
}

function getGradleCacheDir(): string | { failure: string } {
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  const gradleCacheDir = path.join(
    homeDir,
    '.gradle',
    'caches',
    'modules-2',
    'files-2.1',
  );
  return fs.existsSync(gradleCacheDir)
    ? gradleCacheDir
    : { failure: gradleCacheDir };
}
function getModulesFromGradleCache(): ModuleEntry[] {
  // Get the gradle cache directory:
  const gradleCacheDir = getGradleCacheDir();
  if (hasFieldOf(gradleCacheDir, 'failure', isString)) {
    console.error(
      `Gradle cache directory does not exist (expected at ${gradleCacheDir.failure})`,
    );
    return [];
  }
  const artifacts: ModuleEntry[] = [];
  // Walk the gradle cache directory to find all .module files
  ForFilesSync(
    gradleCacheDir,
    (modulePath: string) => {
      const artifact = readModuleArtifact(modulePath);
      if (artifact) {
        artifacts.push(artifact);
      }
      return true;
    },
    { fileTypes: '.module' },
  );

  return artifacts;
}

function getPomsFromGradleCache(): PomEntry[] {
  // Get the gradle cache directory:
  const gradleCacheDir = getGradleCacheDir();
  if (hasFieldOf(gradleCacheDir, 'failure', isString)) {
    console.error(
      `Gradle cache directory does not exist (expected at ${gradleCacheDir.failure})`,
    );
    return [];
  }
  const poms: PomEntry[] = [];
  // Walk the gradle cache directory to find all .pom files
  ForFilesSync(
    gradleCacheDir,
    (pomPath: string) => {
      const artifact = readPomArtifact(pomPath);
      if (artifact) {
        poms.push(artifact);
      }
      return true;
    },
    { fileTypes: '.pom' },
  );
  return poms;
}

function installModule(lib: ModuleEntry) {
  let args = [
    'install:install-file',
    `-Dfile=${lib.primary}`,
    //    `-Dpom=${pomFile}`,
    `-DgroupId=${lib.groupId}`,
    `-DartifactId=${lib.artifactId}`,
    `-Dversion=${lib.version}`,
    `-Dpackaging=${lib.primary.endsWith('.aar') ? 'aar' : 'jar'}`,
  ];
  if (lib.javadoc) {
    args.push(`-Djavadoc=${lib.javadoc}`);
  }
  if (lib.sources) {
    args.push(`-Dsources=${lib.sources}`);
  }
  args.push(`-DlocalRepositoryPath=${repoPath}`);

  if (lib.primary.trim() === '') {
    console.error(
      `No primary file for ${lib.groupId}:${lib.artifactId}:${lib.version}`,
    );
    return;
  }
  // console.log(`Installing: ${lib.primary}`);
  try {
    const res = spawnSync('mvn', args);
    if (res.error) {
      console.error(`Failed to install ${lib.primary} ${res.status}:`, res);
    } else {
      // console.log(`Installed ${lib.primary}`);
    }
  } catch (err) {
    console.error(`Crashed installing ${lib.primary}:`, err.message);
  }
}

function installPom(pom: PomEntry) {
  let args = [
    'install:install-file',
    `-Dfile=${pom.primary}`,
    `-DpomFile=${pom.pom}`,
    `-Dpackaging=${pom.primary.endsWith('.aar') ? 'aar' : 'jar'}`,
  ];
  if (pom.javadoc) {
    args.push(`-Djavadoc=${pom.javadoc}`);
  }
  if (pom.sources) {
    args.push(`-Dsources=${pom.sources}`);
  }
  args.push(`-DlocalRepositoryPath=${repoPath}`);

  if (pom.primary.trim() === '') {
    console.error(`No primary file for POM ${pom.pom}`);
    return;
  }
  // console.log(`Installing: ${pom.primary}`);
  try {
    const res = spawnSync('mvn', args);
    if (res.error) {
      console.error(`Failed to install ${pom.primary} ${res.status}:`, res);
    } else {
      // console.log(`Installed ${pom.primary}`);
    }
  } catch (err) {
    console.error(`Crashed installing ${pom.primary}:`, err.message);
  }
}

// Now we have a list of artifacts to install
function installFromModules() {
  // TODO: Clear the gradle cache directory, clean the build, then
  // do a build to populate the cache.
  const libs = getModulesFromGradleCache();
  console.log(`Found ${libs.length} modules to install.`);
  for (const lib of libs) {
    installModule(lib);
  }
}

function installFromPoms() {
  const poms = getPomsFromGradleCache();
  console.log(`Found ${poms.length} POMs to install.`);
  for (const pom of poms) {
    installPom(pom);
  }
}

// For now, just use the cache as it exists.
// This means that prior to running this script, you should do a
// 'gradle build' or similar to populate the cache.
// Later, we can make this script do that itself.
// Also, this script only installs what it finds in the cache;
// it does not (yet) try to build any dependencies itself.
installFromModules();
installFromPoms();
