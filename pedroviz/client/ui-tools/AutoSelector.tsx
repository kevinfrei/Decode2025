import {
  Menu,
  MenuButton,
  MenuItemRadio,
  MenuList,
  MenuPopover,
  MenuProps,
  MenuTrigger,
  useId,
} from '@fluentui/react-components';
import { isString } from '@freik/typechk';
import { ReactElement } from 'react';

// Show a selection, unless there are no items, then disable the selector entirely
export function AutoSelector({
  prompt,
  items,
  selected,
  setSelected,
  default: defItem,
}: {
  prompt: string;
  items: string[];
  selected: string;
  setSelected: (item: string) => void;
  default?: string;
}): ReactElement {
  const id = useId('ADS');
  const onChange: MenuProps['onCheckedValueChange'] = (_, { checkedItems }) => {
    setSelected(checkedItems[0]);
  };
  if (items.length === 1 && selected !== items[0]) {
    // If we only have 1 item go ahead & select it, but schedule it in the future
    // so we don't screw up the render cycle in an unpredictable manner.
    setTimeout(() => setSelected(items[0]), 0);
  } else if (selected === '' && isString(defItem) && defItem.length > 0) {
    // If we don't have a selection, pick the default one
    setTimeout(() => setSelected(defItem), 0);
  }
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
