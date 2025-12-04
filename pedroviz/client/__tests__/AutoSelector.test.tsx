/// <reference lib="dom" />

import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, mock, test } from 'bun:test';
import { AutoSelector } from '../ui-tools/AutoSelector';
import './jest-dom-types-fix';

test('AutoDisablingSelector tests: one item', async () => {
  const setSel = mock((val: string) => {});
  render(
    <FluentProvider theme={webLightTheme}>
      <AutoSelector
        prompt="Test"
        items={['1']}
        selected=""
        setSelected={setSel}
      />
    </FluentProvider>,
  );
  const item = screen.getByRole('button');
  expect(item).toBeEnabled();
  await waitFor(() => expect(setSel).toBeCalledWith('1'));
});

test('AutoDisablingSelector tests: two items', async () => {
  const setSel = mock((val: string) => {});
  render(
    <FluentProvider theme={webLightTheme}>
      <AutoSelector
        prompt="Test"
        items={['1', '2']}
        selected=""
        setSelected={setSel}
      />
    </FluentProvider>,
  );
  const item = screen.getByRole('button');
  expect(item).toBeEnabled();
  await waitFor(() => expect(setSel).toBeCalledTimes(0));
});

test('AutoDisablingSelector tests: two items, default', async () => {
  let selItem = '';
  const setSel = mock((val: string) => {
    selItem = val;
  });
  render(
    <FluentProvider theme={webLightTheme}>
      <AutoSelector
        prompt="Test"
        items={['1', '2']}
        selected=""
        setSelected={setSel}
        default="2"
      />
    </FluentProvider>,
  );
  const item = screen.getByRole('button');
  expect(item).toBeEnabled();
  expect(selItem).toEqual('');
  await waitFor(() => expect(setSel).toBeCalledTimes(0));
  expect(selItem).toEqual('2');
  await waitFor(() => expect(setSel).toBeCalledTimes(1));
});

test('AutoDisablingSelector tests: no items', async () => {
  const setSel = mock((val: string) => {});
  render(
    <FluentProvider theme={webLightTheme}>
      <AutoSelector prompt="Test" items={[]} selected="" setSelected={setSel} />
    </FluentProvider>,
  );
  const item = screen.getByRole('button');
  expect(item).toBeDisabled();
  await waitFor(() => expect(setSel).toBeCalledTimes(0));
});
