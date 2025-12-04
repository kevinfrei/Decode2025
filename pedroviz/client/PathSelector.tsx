import { useAtom, useAtomValue } from 'jotai';
import { ReactElement } from 'react';
import {
  FilesForSelectedTeam,
  SelectedFileAtom,
  SelectedTeamAtom,
  TeamsAtom,
} from './state/Atoms';
import { AutoSelector } from './ui-tools/AutoSelector';

export function TeamSelector(): ReactElement {
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const [team, setTeam] = useAtom(SelectedTeamAtom);
  return (
    <AutoSelector
      prompt="Select a team/bot"
      items={teams}
      selected={team}
      setSelected={setTeam}
      /* This is just while testing */
      default="LearnBot"
    />
  );
}

export function FileSelector(): ReactElement {
  // TODO: get the atom from Jotai for the files
  const files = useAtomValue(FilesForSelectedTeam); // ['Path1.java', 'MyPaths.java'];
  const [file, setFile] = useAtom(SelectedFileAtom);
  return (
    <AutoSelector
      prompt="Select a file"
      items={files}
      selected={file}
      setSelected={setFile}
    />
  );
}

export function PathSelector(): ReactElement {
  return (
    <>
      <TeamSelector />
      &nbsp;
      <FileSelector />
    </>
  );
}
