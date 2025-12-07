/**
 * @see https://prettier.io/docs/configuration#typescript-configuration-files
 */
import { type Config } from 'prettier';
const config: Config = {
  printWidth: 80,
  endOfLine: 'lf',
  trailingComma: 'all',
  singleQuote: true,
  proseWrap: 'always',
  tabWidth: 2,
  useTabs: false,
  arrowParens: 'always',
  plugins: ['prettier-plugin-java', 'prettier-plugin-organize-imports'],
  overrides: [
    {
      files: '*.json',
      options: { parser: 'json' },
    },
    {
      files: '*.java',
      options: { tabWidth: 4, printWidth: 100, arrowParens: 'avoid' },
    },
  ],
};

export default config;
