// This is not a test, but is the preload for the testing for UI world...
import { expect } from 'bun:test';

import { GlobalRegistrator } from '@happy-dom/global-registrator';
import * as matchers from '@testing-library/jest-dom/matchers';

const oldConsole = console;

// Register window, document, navigator globally
GlobalRegistrator.register();

// Extend Bun's expect with jest-dom matchers
expect.extend(matchers);

window.console = oldConsole;
