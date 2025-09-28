import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  chkObjectOfType,
  chkRecordOf,
  isNumber,
  isRecordOf,
  isString,
} from '@freik/typechk';

// install-maven.js
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration:
const repoPath = './local-maven-repo'; // ← customize this

// Type of a gradle .module file
type GradleComponent = {
  group: string;
  module: string;
  version: string;
  attributes: { [key: string]: string };
};
const chkGradleComponent = chkObjectOfType<GradleComponent>({
  group: isString,
  module: isString,
  version: isString,
  attributes: chkRecordOf(isString, isString),
});

type DepRequires = { requires: string };
const chkDepRequires = chkObjectOfExactType<DepRequires>({
  requires: isString,
});

type GradleVariantDepVersion = string | { requires: string };
const chkGradleVariantDepVersion = chkAnyOf(isString, chkDepRequires);

type GradleVariantDependency = {
  group: string;
  module: string;
  version: GradleVariantDepVersion;
};
const chkGradleVariantDependency = chkObjectOfType<GradleVariantDependency>({
  group: isString,
  module: isString,
  version: chkGradleVariantDepVersion,
});

type GradleVariantFile = {
  name: string;
  url: string;
  size: number;
  sha1: string;
  sha256: string;
  sha512: string;
  md5: string;
};
const chkGradleVariantFile = chkObjectOfType<GradleVariantFile>({
  name: isString,
  url: isString,
  size: isNumber,
  sha1: isString,
  sha256: isString,
  sha512: isString,
  md5: isString,
});

type GradleVariant = {
  name: string;
  attributes: Record<string, string>;
  dependencies: GradleVariantDependency[];
  files: GradleVariantFile[];
};
const chkGradleVariant = chkObjectOfType<GradleVariant>({
  name: isString,
  attributes: chkRecordOf(isString, isString),
  dependencies: chkArrayOf(chkGradleVariantDependency),
  files: chkArrayOf(chkGradleVariantFile),
});

type GradleModule = {
  formatVersion: string;
  component: GradleComponent;
  createdBy: Record<string, string>;
  variants: GradleVariant[];
};
const chkGradleModule = chkObjectOfType<GradleModule>({
  formatVersion: isString,
  component: chkGradleComponent,
  createdBy: chkRecordOf(isString, isString),
  variants: chkArrayOf(chkGradleVariant),
});

function installArtifact(file: string) {
  const info = parseArtifactInfo(file);
  if (!info) {
    console.warn(`Skipping unrecognized file: ${file}`);
    return;
  }

  const packaging = getPackaging(file);
  if (!packaging) {
    console.warn(`Unknown packaging for: ${file}`);
    return;
  }

  const filePath = path.resolve(libsDir, file);

  let cmd = [
    'mvn',
    'install:install-file',
    `-Dfile=${filePath}`,
    `-Dpom=${pomFile}`,
    `-Dsources=${sourcesFile}`,
    `-Djavadoc=${javadocFile}`,
    `-DlocalRepositoryPath=${repoPath}`,
  ];

  console.log(`Installing: ${file}`);
  try {
    execSync(cmd.join(' '), { stdio: 'inherit' });
  } catch (err) {
    console.error(`Failed to install ${file}:`, err.message);
  }
}

fs.readdirSync(libsDir)
  .filter((f) => f.endsWith('.jar') || f.endsWith('.aar'))
  .forEach(installArtifact);
