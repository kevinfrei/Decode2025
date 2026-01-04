import { Text } from '@fluentui/react-components';
import { useAtomValue } from 'jotai';
import { CSSProperties, Fragment, ReactElement } from 'react';
import { AnonymousPose, isRef } from '../../server/types';
import { HeadingRefDisplay, ValueRefDisplay } from '../PathsDataDisplay';
import { getColorFor } from '../state/API';
import { ColorsAtom, MappedPosesAtom } from '../state/Atoms';

export type AnonymousPoseDisplayProps = {
  pose: AnonymousPose;
  noHeading?: boolean;
};
export function AnonymousPoseDisplay({
  pose,
  noHeading,
}: AnonymousPoseDisplayProps): ReactElement {
  // const colors = useAtomValue(ColorsAtom);
  const style = {
    /* color: colors[getColorFor(pose)]*/
  };
  return (
    <>
      <ValueRefDisplay style={style} item={pose.x} />
      <ValueRefDisplay style={style} item={pose.y} />
      {!noHeading && <HeadingRefDisplay style={style} item={pose.heading} />}
    </>
  );
}

export function AnonymousPoseHeader({
  noHeading,
}: {
  noHeading?: boolean;
}): ReactElement {
  return (
    <>
      <Text size={400}>X</Text>
      <Text size={400}>Y</Text>
      {!noHeading && <Text size={400}>Heading</Text>}
    </>
  );
}

export function NamedPoseList(): ReactElement {
  const items = useAtomValue(MappedPosesAtom);
  const colors = useAtomValue(ColorsAtom);
  const gridStyle: CSSProperties = {
    display: 'grid',
    columnGap: '10pt',
    gridTemplateColumns: '1fr auto auto auto',
    justifyItems: 'end',
    justifySelf: 'start',
  };
  return (
    <div style={gridStyle}>
      <Text size={400}>Name {items.size}</Text>
      <AnonymousPoseHeader />
      {[
        ...items.entries().map(([name, pose]) => {
          if (!isRef(pose)) {
            const color = getColorFor(pose);
            const style = { color: colors[color % colors.length] };
            return (
              <Fragment key={`pr-${name}-1`}>
                <Text style={style}>{name}</Text>
                <AnonymousPoseDisplay pose={pose} />
              </Fragment>
            );
          }
        }),
      ]}
    </div>
  );
}
