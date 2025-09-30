import { ForFilesSync } from '@freik/files';
import fs from 'node:fs';
import path from 'node:path';
import { execSync, spawnSync } from 'node:child_process';
import { ReadGradleModule } from './helpers/GradleModule';
import { hasFieldType, isArray, isString } from '@freik/typechk';

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

function readLocalArtifact(modulePath: string): LibraryEntry | undefined {
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

function getModulesFromGradleCache(): ModuleEntry[] {
  // Get the gradle cache directory:
  const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
  const gradleCacheDir = path.join(
    homeDir,
    '.gradle',
    'caches',
    'modules-2',
    'files-2.1',
  );
  if (!fs.existsSync(gradleCacheDir)) {
    console.error(`Gradle cache directory does not exist: ${gradleCacheDir}`);
    return [];
  }
  const artifacts: ModuleEntry[] = [];
  // Walk the gradle cache directory to find all .module files
  ForFilesSync(
    gradleCacheDir,
    (modulePath: string) => {
      const artifact = readLocalArtifact(modulePath);
      if (artifact) {
        artifacts.push(artifact);
      }
      return true;
    },
    { fileTypes: '.module' },
  );

  return artifacts;
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

// Now we have a list of artifacts to install
function installFromModules() {
  // TODO: Clear the gradle cache directory, clean the build, then
  // do a build to populate the cache.
  const libs = getModulesFromGradleCache();
  console.log(`Found ${libs.length} libraries to install.`);
  for (const lib of libs) {
    installModule(lib);
  }
}

function installFromPom() {
  const poms = getPomsFromGradleCache();
  for (const pom of poms) {
    installLibrary(pom);
  }
}

main();
