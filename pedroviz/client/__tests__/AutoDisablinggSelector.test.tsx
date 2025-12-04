import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import '@testing-library/jest-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { expect, mock, test } from 'bun:test';
import { AutoDisablingSelector } from '../ui-tools/AutoDisablingSelector';

test('AutoDisablingSelector tests: one item', async () => {
  const setSel = mock((val: string) => {});
  render(
    <FluentProvider theme={webLightTheme}>
      <AutoDisablingSelector
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
      <AutoDisablingSelector
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

test('AutoDisablingSelector tests: no items', async () => {
  const setSel = mock((val: string) => {});
  render(
    <FluentProvider theme={webLightTheme}>
      <AutoDisablingSelector
        prompt="Test"
        items={[]}
        selected=""
        setSelected={setSel}
      />
    </FluentProvider>,
  );
  const item = screen.getByRole('button');
  expect(item).toBeDisabled();
  await waitFor(() => expect(setSel).toBeCalledTimes(0));
});
