import { Provider } from 'jotai';
import { useRef, useEffect, ReactElement, useState } from 'react';
import { getStore } from './state/Storage';
import { PathSelector } from './PathSelector';
import {
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
              <p>settings?</p>
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
