import {
  Menu,
  MenuButton,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuProps,
  MenuTrigger,
} from '@fluentui/react-components';
import { useAtom, useAtomValue } from 'jotai';
import { ReactElement } from 'react';
import {
  FilesForSelectedTeam,
  SelectedFileAtom,
  SelectedTeamAtom,
  TeamsAtom,
} from './state/Atoms';

function AutoDefaultingSelector({
  prompt,
  items,
  selected,
  setSelected,
}: {
  prompt: string;
  items: string[];
  selected: string;
  setSelected: (item: string) => void;
}): ReactElement {
  const onChange: MenuProps['onCheckedValueChange'] = (
    e,
    { name, checkedItems },
  ) => {
    setSelected(checkedItems[0]);
  };
  return (
    <Menu>
      <MenuTrigger>
        <MenuButton disabled={items.length === 0}>
          {selected.length > 0 ? selected : prompt}
        </MenuButton>
      </MenuTrigger>
      <MenuPopover>
        <MenuList onCheckedValueChange={onChange}>
          {items.map((val) => (
            <MenuItemRadio
              key={`ts${val}`}
              name="team-select"
              onSelect={() => setSelected(val)}
              value={val}
            >
              {val}
            </MenuItemRadio>
          ))}
        </MenuList>
      </MenuPopover>
    </Menu>
  );
}

export function TeamSelector(): ReactElement {
  const teams = useAtomValue(TeamsAtom); //['TeamCode', 'LearnBot'];
  const [team, setTeam] = useAtom(SelectedTeamAtom);
  return (
    <AutoDefaultingSelector
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
    <AutoDefaultingSelector
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
