import fs from 'node:fs';

import {
  chkAnyOf,
  chkArrayOf,
  chkObjectOfExactType,
  chkObjectOfType,
  chkRecordOf,
  hasFieldType,
  isArray,
  isNumber,
  isNumberOrString,
  isString,
} from '@freik/typechk';

// Types for gradle .module files

export type GradleComponent = {
  group: string;
  module: string;
  version: string;
  attributes: Record<string, string | number>;
};
export const chkGradleComponent = chkObjectOfType<GradleComponent>({
  group: isString,
  module: isString,
  version: isString,
  attributes: chkRecordOf(isString, isNumberOrString),
});

export type DepRequires = { requires: string };
export const chkDepRequires = chkObjectOfExactType<DepRequires>({
  requires: isString,
});

export type GradleVariantDepVersion = string | DepRequires;
export const chkGradleVariantDepVersion = chkAnyOf(isString, chkDepRequires);

export type GradleVariantDependency = {
  group: string;
  module: string;
  version: GradleVariantDepVersion;
};
export const chkGradleVariantDependency =
  chkObjectOfType<GradleVariantDependency>({
    group: isString,
    module: isString,
    version: chkGradleVariantDepVersion,
  });

export type GradleVariantFile = {
  name: string;
  url: string;
  size: number;
  sha1: string;
  sha256: string;
  sha512: string;
  md5: string;
};
export const chkGradleVariantFile = chkObjectOfExactType<GradleVariantFile>({
  name: isString,
  url: isString,
  size: isNumber,
  sha1: isString,
  sha256: isString,
  sha512: isString,
  md5: isString,
});

export type ElsewhereLocation = {
  url: string;
  group: string;
  module: string;
  version: string;
};
export const chkElsewhereLocation = chkObjectOfExactType<ElsewhereLocation>({
  url: isString,
  group: isString,
  module: isString,
  version: isString,
});

export type LocalGradleVariant = {
  name: string;
  attributes: Record<string, string | number>;
  dependencies?: GradleVariantDependency[];
  files?: GradleVariantFile[];
};
export const chkLocalGradleVariant = chkObjectOfType<LocalGradleVariant>(
  {
    name: isString,
    attributes: chkRecordOf(isString, isNumberOrString),
  },
  {
    files: chkArrayOf(chkGradleVariantFile),
    dependencies: chkArrayOf(chkGradleVariantDependency),
  },
);

export type ElsewhereGradleVariant = {
  name: string;
  attributes: Record<string, string | number>;
  dependencies?: GradleVariantDependency[];
  'available-at': ElsewhereLocation;
};
export const chkElsewhereGradleVariant =
  chkObjectOfType<ElsewhereGradleVariant>({
    name: isString,
    attributes: chkRecordOf(isString, isNumberOrString),
    'available-at': chkElsewhereLocation,
  });

export type GradleVariant = LocalGradleVariant | ElsewhereGradleVariant;
export const chkGradleVariant = chkAnyOf(
  chkLocalGradleVariant,
  chkElsewhereGradleVariant,
);

export type GradleModule = {
  formatVersion: string;
  component: GradleComponent;
  createdBy: Record<string, string | { version: string }>;
  variants: GradleVariant[];
};
export const chkGradleModule = chkObjectOfType<GradleModule>({
  formatVersion: isString,
  component: chkGradleComponent,
  variants: chkArrayOf(chkGradleVariant),
  createdBy: chkRecordOf(
    isString,
    chkAnyOf(
      chkObjectOfType<{ version: string }>({ version: isString }),
      isString,
    ),
  ),
});

export function ReadGradleModule(filePath: string): GradleModule | null {
  const content = fs.readFileSync(filePath, 'utf-8');
  const data = JSON.parse(content);
  if (chkGradleModule(data)) {
    return data;
  } else {
    if (!hasFieldType(data, 'formatVersion', isString)) {
      console.error(
        `Invalid or missing formatVersion in .module file: ${filePath}`,
      );
      return null;
    }
    if (!hasFieldType(data, 'component', chkGradleComponent)) {
      console.error(
        `Invalid or missing component in .module file: ${filePath}`,
      );
      return null;
    }
    if (!hasFieldType(data, 'variants', chkArrayOf(chkGradleVariant))) {
      if (!hasFieldType(data, 'variants', isArray)) {
        console.error(
          `Invalid or missing variants in .module file: ${filePath}`,
        );
        return null;
      }
      const variants = data.variants;
      for (let i = 0; i < variants.length; i++) {
        const v = variants[i];
        if (!chkGradleVariant(v)) {
          if (!hasFieldType(v, 'name', isString)) {
            console.error(
              `Invalid or missing variant name at index ${i} in .module file: ${filePath}`,
            );
            return null;
          }
          if (
            !hasFieldType(
              v,
              'attributes',
              chkRecordOf(isString, isNumberOrString),
            )
          ) {
            console.error(
              `Invalid or missing variant attributes at index ${i} in .module file: ${filePath}`,
            );
            console.error(JSON.stringify(v['attributes'], null, 2));
            return null;
          }
          if (
            !hasFieldType(
              v,
              'dependencies',
              chkArrayOf(chkGradleVariantDependency),
            )
          ) {
            if (!hasFieldType(v, 'dependencies', isArray)) {
              console.error(
                `Invalid or missing variant dependencies at index ${i} in .module file: ${filePath}`,
              );
              return null;
            }
            const deps = v.dependencies;
            for (let j = 0; j < deps.length; j++) {
              const d = deps[j];
              if (!chkGradleVariantDependency(d)) {
                console.error(
                  `Invalid dependency at index ${j} of variant ${i} in .module file: ${filePath}`,
                );
                return null;
              }
            }
          }
          if (!hasFieldType(v, 'files', chkArrayOf(chkGradleVariantFile))) {
            if (!hasFieldType(v, 'files', isArray)) {
              console.error(
                `Invalid or missing variant files at index ${i} in .module file: ${filePath}`,
              );
              return null;
            }
            const files = v.files;
            for (let j = 0; j < files.length; j++) {
              const f = files[j];
              if (!chkGradleVariantFile(f)) {
                console.error(
                  `Invalid file at index ${j} of variant ${i} in .module file: ${filePath}`,
                );
                return null;
              }
            }
          }
          console.error(
            `Invalid variant at index ${i} in .module file: ${filePath}`,
          );
          return null;
        }
      }
    }
    if (!hasFieldType(data, 'createdBy', chkRecordOf(isString, isString))) {
      console.error(
        `Invalid or missing createdBy in .module file: ${filePath}`,
      );
      return null;
    }
    // TODO: Do gradual type checking to give a more useful error message
    console.error(`Invalid .module file format: ${filePath}`);
    return null;
  }
}
