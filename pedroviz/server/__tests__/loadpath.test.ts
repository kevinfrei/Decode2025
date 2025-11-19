import { test, expect /* beforeAll, afterAll */ } from 'bun:test';
import path from 'path';

// import fs, {promises as fsp} from 'fs';
// import { $ } from 'bun';

import { LoadPath, loadPathChainsFromFile } from '../loadpath';
import { firstFtcSrc, getProjectFilePath } from '../utility';
import { isString } from '@freik/typechk';

function getTestRepoPath(): string {
  return path.resolve(__dirname, 'test-repo-root');
}

test('raw endpoint invocation', async () => {
  const res: Response = await LoadPath('TeamCode', 'TeamTestPaths.java');
  expect(res).toHaveProperty('ok', true);
  expect(res).toHaveProperty('status', 200);
  expect(res).toHaveProperty('headers');
});

test('loadPathChainsFromFile loads paths correctly', async () => {
  const testPath = getProjectFilePath('TeamA', 'TeamTestPaths.java');
  expect(testPath).toBe(
    path.join('TeamA', firstFtcSrc, 'teama', 'TeamTestPaths.java'),
  );
  const repoPathToFile = path.join(getTestRepoPath(), testPath);
  const paths = await loadPathChainsFromFile(repoPathToFile);
  expect(paths).toBeDefined();
  expect(isString(paths)).toBeFalse();
  if (isString(paths)) return;
  // This currently failing, as I haven't implemented the parsing yet.
  expect(paths.values.length).toBe(3);
  expect(paths.values[0].name).toBe('org');
  expect(paths.values[1].name).toBe('dist');
  expect(paths.values[2].name).toBe('one80');
});
