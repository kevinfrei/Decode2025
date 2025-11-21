import { Provider } from 'jotai';
import { ReactElement, useState } from 'react';
import { getStore } from './state/Storage';
import { PathSelector } from './PathSelector';
import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';

// import './index.css';

export function App(): ReactElement {
  const store = getStore();
  const [theTheme, setTheme] = useState<'dark' | 'light'>('light');
  const theme = theTheme === 'dark' ? webDarkTheme : webLightTheme;
  return (
    <Provider store={store}>
      <FluentProvider theme={theme}>
        <div className="app">
          <PathSelector />
          <div className="path-display" />
          <div className="path-editor" />
        </div>
      </FluentProvider>
    </Provider>
  );
}
