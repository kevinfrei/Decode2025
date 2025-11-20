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
  expect(paths.values[0]).toEqual({
    name: 'org',
    value: { type: 'double', value: 72.0 },
  });
  expect(paths.values[1]).toEqual({
    name: 'step',
    value: { type: 'int', value: 80 },
  });
  expect(paths.values[2]).toEqual({
    name: 'one80',
    value: { type: 'double', value: 3.1416 },
  });

  expect(paths.poses.length).toBe(5);
  expect(paths.poses[0]).toEqual({
    name: 'start',
    pose: { x: 'org', y: 'org', heading: { type: 'int', value: 0 } },
  });
  expect(paths.poses[1]).toEqual({
    name: 'step1',
    pose: { x: 'step', y: 'org', heading: { type: 'double', value: 1.5708 } },
  });
  expect(paths.poses[2]).toEqual({
    name: 'step2',
    pose: { x: 'step', y: 'step', heading: 'one80' },
  });
  expect(paths.poses[3]).toEqual({
    name: 'step3',
    pose: { x: 'org', y: 'step', heading: { type: 'double', value: -0.7854 } },
  });
  expect(paths.poses[4]).toEqual({
    name: 'step4',
    pose: {
      x: { type: 'double', value: 72.0 },
      y: { type: 'int', value: 72 },
      heading: { type: 'double', value: 0.5236 },
    },
  });
});
