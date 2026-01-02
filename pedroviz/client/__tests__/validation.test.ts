import { expect, test } from 'bun:test';
import { CheckValidName } from '../Displays/Validation';

test("CheckValidName stuff", () => {
  const values = new Map<string, number>([['a',1], ['b',2]]);
  expect(CheckValidName(values, 'a', true)).toEqual(['', 'none']);
  expect(CheckValidName(values, 'a', false)).toEqual(['Please enter a unique name.', 'error']);
  expect(CheckValidName(values, 'c', true)).toEqual(['Please enter an existing variable.', 'error']);
  expect(CheckValidName(values, 'c', false)).toEqual(['', 'none']);
  expect(CheckValidName(values, 'bad Name', false)).toEqual(['Please enter a valid Java variable name.','error'])
});
