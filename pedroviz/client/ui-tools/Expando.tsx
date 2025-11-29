// A little control that expands or collapses the children

import { Button, Text } from '@fluentui/react-components';
import { ChevronDownRegular, ChevronRightRegular } from '@fluentui/react-icons';
import { isString } from '@freik/typechk';
import { ReactElement, useState } from 'react';

// with the header provided
export function Expando({
  children,
  label,
  defaultShow,
  separator,
  size,
  indent,
}: {
  children: ReactElement | ReactElement[];
  label: string | React.JSX.Element;
  defaultShow?: boolean;
  separator?: boolean;
  size?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000;
  indent?: number;
}): React.JSX.Element {
  const indentSize = indent || 0;
  const [hidden, setHidden] = useState(!defaultShow);
  const button = (
    <Button
      appearance="transparent"
      icon={hidden ? <ChevronRightRegular /> : <ChevronDownRegular />}
      onClick={() => setHidden(!hidden)}
    />
  );
  const theHeader = (
    <span style={{ marginTop: 10 }}>
      {button}
      {isString(label) ? <Text size={size || 300}>{label}</Text> : label}
    </span>
  );
  const padding = indentSize ? { paddingLeft: indentSize } : {};
  const display = hidden ? { display: 'none' } : {};
  return (
    <div>
      {theHeader}
      <div style={{ ...padding, ...display }}>{children}</div>
    </div>
  );
}
