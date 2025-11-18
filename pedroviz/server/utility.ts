import path from 'path';
import { PathChainFile } from './types';

export const firstFtcSrc = path.join(
  'src',
  'main',
  'java',
  'org',
  'firstinspires',
  'ftc',
);

export function getProjectFilePath(team: string, filename: string): string {
  return path.join(team, firstFtcSrc, team.toLocaleLowerCase(), filename);
}

export function MakePathChainFile(filename: string): PathChainFile {
  return {
    name: filename,
    values: [], // NamedValue[];
    poses: [], // NamedPose[];
    beziers: [], // Bezier[];
    pathChains: [], // PathChain[];
    // heading?: HeadingType;
  };
}
