const validName: RegExp = /^[A-Za-z_][a-zA-Z0-9_]*$/;

export function CheckValidName<T extends string, U>(
  allNames: Map<T, U>,
  nm: T,
  exists: boolean,
): [string, 'error' | 'none'] {
  if (exists !== allNames.has(nm)) {
    return [
      exists
        ? 'Please enter an existing variable.'
        : 'Please enter a unique name.',
      'error',
    ];
  } else if (!validName.test(nm)) {
    return ['Please enter a valid Java variable name.', 'error'];
  }
  return ['', 'none'];
}
