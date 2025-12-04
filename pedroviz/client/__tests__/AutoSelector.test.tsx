/// <reference lib="dom" />

import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, mock, test } from 'bun:test';
import { AutoSelector } from '../ui-tools/AutoSelector';
import './jest-dom-types-fix';

// I'm *really* new to all this UI testing. These are all *terrible* tests,
// but they're a start.

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
  const item = screen.getAllByRole('button');
  expect(item[0]).toBeEnabled();
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
  const item = screen.getAllByRole('button');
  expect(item[0]).toBeEnabled();
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
  const item = screen.getAllByRole('button');
  expect(item.length).toBe(3);
  expect(item[0]).toBeEnabled();
  expect(item[1]).toBeEnabled();
  expect(item[2]).toBeEnabled();
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
  const items = screen.getAllByRole('button');
  expect(items.length).toBe(4);
  expect(items[0]).toBeEnabled();
  expect(items[1]).toBeEnabled();
  expect(items[2]).toBeEnabled();
  expect(items[3]).toBeDisabled();
  await waitFor(() => expect(setSel).toBeCalledTimes(0));
});
