import {
  Dropdown,
  DropdownProps,
  Field,
  makeStyles,
  Option,
  useId,
} from '@fluentui/react-components';
import { useAtom, useAtomValue } from 'jotai';
import { ReactElement, useState } from 'react';
import {
  FilesForSelectedTeam,
  SelectedFileAtom,
  SelectedTeamAtom,
  TeamsAtom,
} from './API';

const useStyles = makeStyles({
  root: {
    // Stack the label above the field with a gap
    display: 'grid',
    gridTemplateRows: 'repeat(1fr)',
    justifyItems: 'start',
    gap: '2px',
    maxWidth: '250px',
  },
});

export function FileSelector(props: Partial<DropdownProps>): ReactElement {
  // TODO: get the atom from Jotai for the files
  const options = useAtomValue(FilesForSelectedTeam); // ['Path1.java', 'MyPaths.java'];
  const styles = useStyles();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [value, setValue] = useAtom(SelectedFileAtom);

  const onOptionSelect: (typeof props)['onOptionSelect'] = (ev, data) => {
    setSelectedOptions(data.selectedOptions);
    setValue(data.optionText ?? '');
  };
  return (
    <Field className={styles.root} label="Pick a file">
      <Dropdown
        placeholder="Select a file"
        selectedOptions={selectedOptions}
        onOptionSelect={onOptionSelect}
        value={value}
      >
        {options.map((option) => (
          <Option key={option}>{option}</Option>
        ))}
      </Dropdown>
    </Field>
  );
}

export function TeamSelector(props: Partial<DropdownProps>): ReactElement {
  const options = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const styles = useStyles();
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [value, setValue] = useAtom(SelectedTeamAtom);

  const onOptionSelect: (typeof props)['onOptionSelect'] = (ev, data) => {
    setSelectedOptions(data.selectedOptions);
    setValue(data.optionText ?? '');
  };
  return (
    <Field className={styles.root} label="Pick a team">
      <Dropdown
        placeholder="Select a team"
        selectedOptions={selectedOptions}
        onOptionSelect={onOptionSelect}
        value={value}
      >
        {options.map((option) => (
          <Option key={option}>{option}</Option>
        ))}
      </Dropdown>
    </Field>
  );
}

export function PathSelector(): ReactElement {
  return (
    <div>
      <TeamSelector />
      <FileSelector />
    </div>
  );
}
