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
          <span>
            <InlineDrawer as="aside" separator={true} open={true} size="small">
              <DrawerBody>
                <PathsDataDisplay />
              </DrawerBody>
            </InlineDrawer>
            <PathsGraphicDisplay />
          </span>
        </div>
      </FluentProvider>
    </Provider>
  );
}
