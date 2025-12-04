/// <reference lib="dom" />

import {
  FluentProvider,
  webDarkTheme,
  webLightTheme,
} from '@fluentui/react-components';
import '@testing-library/jest-dom';
import { render, waitFor } from '@testing-library/react';
import { describe, test } from 'bun:test';
import { Provider, useAtom } from 'jotai';
import { getStore } from '../state/Storage';

import { expect } from 'bun:test';
import { ReactElement } from 'react';
import { ColorForNumber, ColorsAtom, ThemeAtom } from '../state/Atoms';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';
import './jest-dom-types-fix';

function FluentFixture({ change }: { change: boolean }): ReactElement {
  const [theTheme, setTheme] = useAtom(ThemeAtom);
  const theme = theTheme === 'dark' ? webDarkTheme : webLightTheme;
  if (change && theTheme === 'light') {
    setTimeout(() => setTheme('dark'), 0);
  }
  return (
    <FluentProvider theme={theme}>
      <div />
    </FluentProvider>
  );
}

describe('simple atom validation', () => {
  test('Themes & colors', async () => {
    const store = getStore();
    render(
      <Provider store={store}>
        <FluentFixture change={false} />
      </Provider>,
    );
    expect(store.get(ThemeAtom)).toEqual('light');
    waitFor(() => {});
    expect(store.get(ThemeAtom)).toEqual('light');
    render(
      <Provider store={store}>
        <FluentFixture change={true} />
      </Provider>,
    );
    const beforeColors = store.get(ColorsAtom);
    expect(beforeColors).toBe(darkOnWhite);
    expect(store.get(ThemeAtom)).toEqual('light');
    await waitFor(() => {
      expect(store.get(ThemeAtom)).toEqual('dark');
    });
    expect(store.get(ColorsAtom)).toBe(lightOnBlack);
    for (let i = 0; i < lightOnBlack.length * 2; i++) {
      const color = store.get(ColorForNumber(i));
      expect(color).toBe(lightOnBlack[i % lightOnBlack.length]);
    }
  });
});
