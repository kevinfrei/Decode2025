import { Provider } from 'jotai';
import { useRef, useEffect, ReactElement, useState } from 'react';
import { getStore } from './state/Storage';
import { PathSelector } from './PathSelector';
import {
  Checkbox,
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import { PathsDataDisplay } from './PathsDataDisplay';
import { PathsGraphicDisplay } from './PathsGraphicDisplay';
import { ScaledCanvas } from './ui-tools/ScaledCanvas';

import './index.css';

export function App(): ReactElement {
  const store = getStore();
  /*
    For reference: To invert the brightness, but not the hue, of an image:
    R = 1 - (G + B) / 2
    G = 1 - (R + B) / 2
    B = 1 - (R + G) / 2

    And here's a gist that shows how to manually render an image:
    https://gist.github.com/paulirish/373253
  */
  const [theTheme, setTheme] = useState<'dark' | 'light'>('light');
  const theme = theTheme === 'dark' ? webDarkTheme : webLightTheme;

  /*
  const sidebarRef = useRef(null);
  const dragHandleRef = useRef(null);

  // Sidebar width state
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isDragging, setIsDragging] = useState(false);

  // Start drag
  const startDrag = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  // Dragging
  useEffect(() => {
    const handleMove = (e) => {
      if (!isDragging) return;

      const newWidth = e.clientX;

      // Clamp to min/max
      const min = 150;
      const max = 500;
      if (newWidth >= min && newWidth <= max) {
        setSidebarWidth(newWidth);
      }
    };

    const stopDrag = () => setIsDragging(false);

    if (isDragging) {
      window.addEventListener('mousemove', handleMove);
      window.addEventListener('mouseup', stopDrag);
    }

    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('mouseup', stopDrag);
    };
  }, [isDragging]);
  */
  return (
    <Provider store={store}>
      <FluentProvider theme={theme}>
        <div className="app">
          <div className="header">
            <div className="header-left">
              <PathSelector />
            </div>
            <div className="header-center">Vote4Pedro</div>
            <div className="header-right">
              <Checkbox
                checked={theTheme === 'dark'}
                onChange={(_, data) =>
                  setTheme(data.checked ? 'dark' : 'light')
                }
                label="Dark Mode"
              />
            </div>
          </div>
          <div
            className="sidebar"
            /*ref={sidebarRef}
            style={{ width: sidebarWidth }}*/
          >
            <PathsDataDisplay />
          </div>

          {/* Canvas area */}
          <div className="display">
            <ScaledCanvas />
          </div>
        </div>
      </FluentProvider>
    </Provider>
  );
}
