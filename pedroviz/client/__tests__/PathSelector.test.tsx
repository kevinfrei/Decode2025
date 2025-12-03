import {
  Button,
  FluentProvider,
  webLightTheme,
} from '@fluentui/react-components';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { expect, test } from 'bun:test';

test('FluentUI Button renders and responds to click', () => {
  const handleClick = () => {};
  render(
    <FluentProvider theme={webLightTheme}>
      <Button onClick={handleClick}>Click Me</Button>
    </FluentProvider>,
  );

  const btn = screen.getByRole('button', { name: /click me/i });
  expect(btn).toBeDefined();
});
