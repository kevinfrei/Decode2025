import { Checkbox } from '@fluentui/react-components';
import { ReactElement } from 'react';
import { ThemeAtom } from './state/Atoms';
import { useAtom } from 'jotai';

export function Settings(): ReactElement {
  const [theTheme, setTheme] = useAtom(ThemeAtom);
  return (
    <Checkbox
      checked={theTheme === 'dark'}
      onChange={(_, data) => setTheme(data.checked ? 'dark' : 'light')}
      label="Dark Mode"
    />
  );
}
