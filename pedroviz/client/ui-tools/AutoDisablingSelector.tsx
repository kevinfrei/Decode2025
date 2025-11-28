import {
  MenuProps,
  Menu,
  MenuTrigger,
  MenuButton,
  MenuPopover,
  MenuList,
  MenuItemRadio,
  useId,
} from '@fluentui/react-components';
import { ReactElement } from 'react';

// Show a selection, unless there are no items, then disable the selector entirely
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
  const id = useId('ADS');
  const onChange: MenuProps['onCheckedValueChange'] = (_, { checkedItems }) => {
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
              key={`${id}:${val}`}
              name={`${id}`}
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
