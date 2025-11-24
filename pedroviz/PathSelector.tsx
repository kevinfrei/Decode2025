import { useAtom, useAtomValue } from 'jotai';
import { ReactElement } from 'react';
import {
  FilesForSelectedTeam,
  SelectedFileAtom,
  SelectedTeamAtom,
  TeamsAtom,
} from './state/Atoms';
import { AutoDisablingSelector } from './ui-tools/AutoDisablingSelector';

export function TeamSelector(): ReactElement {
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const [team, setTeam] = useAtom(SelectedTeamAtom);
  return (
    <AutoDisablingSelector
      prompt="Select a team"
      items={teams}
      selected={team}
      setSelected={setTeam}
    />
  );
}

export function FileSelector(): ReactElement {
  // TODO: get the atom from Jotai for the files
  const files = useAtomValue(FilesForSelectedTeam); // ['Path1.java', 'MyPaths.java'];
  const [file, setFile] = useAtom(SelectedFileAtom);
  return (
    <AutoDisablingSelector
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
