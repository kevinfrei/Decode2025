import { ReactElement } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { Text } from '@fluentui/react-components';

import { select_a_bot, select_a_class, select_a_file } from './constants';
import {
  BlurAtom,
  ClassesForSelectedFile,
  FilesForSelectedTeam,
  SelectedClassAtom,
  SelectedFileAtom,
  SelectedTeamAtom,
  TeamsAtom,
} from './state/Atoms';
import { AutoSelector } from './ui-tools/AutoSelector';
import { ErrorBoundary } from './ui-tools/ErrorBoundary';

export function TeamSelector(): ReactElement {
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const [team, setTeam] = useAtom(SelectedTeamAtom);
  return (
    <ErrorBoundary>
      <AutoSelector
        prompt={select_a_bot}
        items={teams}
        selected={team}
        setSelected={setTeam}
        /* This is just while testing */
        // default="LearnBot"
      />
    </ErrorBoundary>
  );
}

export function FileSelector(): ReactElement {
  // TODO: get the atom from Jotai for the files
  const files = useAtomValue(FilesForSelectedTeam); // ['Path1.java', 'MyPaths.java'];
  const [file, setFile] = useAtom(SelectedFileAtom);
  return (
    <AutoSelector
      prompt={select_a_file}
      items={files}
      selected={file}
      setSelected={setFile}
    />
  );
}

export function ClassSelector(): ReactElement {
  const classes = useAtomValue(ClassesForSelectedFile);
  const [classSel, setClass] = useAtom(SelectedClassAtom);
  return (
    <AutoSelector
      prompt={select_a_class}
      items={classes}
      selected={classSel}
      setSelected={setClass}
    />
  );
}

export function PathSelector(): ReactElement {
  const blur = useAtomValue(BlurAtom);
  return (
    <>
      <TeamSelector />
      &nbsp;
      <FileSelector />
      &nbsp;
      <ClassSelector />
      &nbsp;
      <Text>{blur}</Text>
    </>
  );
}
