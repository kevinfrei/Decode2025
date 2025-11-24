import {
  MenuProps,
  Menu,
  MenuTrigger,
  MenuButton,
  MenuPopover,
  MenuList,
  MenuItemRadio,
} from '@fluentui/react-components';
import { ReactElement } from 'react';

export function AutoDisablingSelector({
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
