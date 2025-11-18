import path from 'path';

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
