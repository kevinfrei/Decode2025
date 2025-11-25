import { Provider } from 'jotai';
import { ReactElement, useState } from 'react';
import { getStore } from './state/Storage';
import { PathSelector } from './PathSelector';
import {
  DrawerBody,
  FluentProvider,
  InlineDrawer,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { PathsDataDisplay } from './PathsDataDisplay';
import { PathsGraphicDisplay } from './PathsGraphicDisplay';

import './index.css';
import { ScaledCanvas } from './ui-tools/ScaledCanvas';

export function App(): ReactElement {
  const store = getStore();
  const [theTheme, setTheme] = useState<'dark' | 'light'>('light');
  const theme = theTheme === 'dark' ? webDarkTheme : webLightTheme;
  return (
    <Provider store={store}>
      <FluentProvider theme={theme}>
        <div className="app">
          <div className="header">
            <div className="header-left">
              <PathSelector />
            </div>
            <div className="header-right">
              <p>settings?</p>
            </div>
          </div>
          <div className="main">
            <div className="sidebar">
              <PathsDataDisplay />
            </div>
            <div className="content">
              <div className="square-wrapper">
                <ScaledCanvas
                  points={[
                    { x: 10, y: 10 },
                    { x: 72, y: 72 },
                    { x: 130, y: 20 },
                  ]}
                />
              </div>
            </div>
          </div>
        </div>
      </FluentProvider>
    </Provider>
  );
}
