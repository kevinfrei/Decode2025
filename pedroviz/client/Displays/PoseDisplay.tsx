import { Text } from '@fluentui/react-components';
import { useAtom, useAtomValue } from 'jotai';
import { CSSProperties, ReactElement } from 'react';
import {
  AnonymousPose,
  isPoseName,
  isRef,
  PoseName,
  ValueRef,
} from '../../server/types';
import { HeadingRefDisplay } from '../PathsDataDisplay';
import { getColorFor } from '../state/API';
import {
  ColorsAtom,
  MappedPosesAtom,
  MappedValuesAtom,
  PoseAtomFamily,
} from '../state/Atoms';
import { ItemWithStyle } from '../ui-tools/types';
import { EditableOnlyValueRef, NumberOrNamedValue } from './ValueDisplay';

export type AnonymousPoseDisplayProps = {
  pose: AnonymousPose;
  noHeading?: boolean;
  setPose: (p: AnonymousPose) => void;
};
export function AnonymousPoseDisplay({
  pose,
  noHeading,
  setPose,
}: AnonymousPoseDisplayProps): ReactElement {
  // const colors = useAtomValue(ColorsAtom);
  const style = {
    /* color: colors[getColorFor(pose)]*/
  };
  return (
    <>
      <EditableOnlyValueRef
        ref={pose.x}
        setRef={(px: ValueRef) => setPose({ ...pose, x: px })}
      />
      <EditableOnlyValueRef
        ref={pose.y}
        setRef={(py: ValueRef) => setPose({ ...pose, y: py })}
      />
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

export function NamedPoseItem({
  item,
  style,
}: ItemWithStyle<PoseName>): ReactElement {
  const [pose, setPose] = useAtom(PoseAtomFamily(item));
  const names = useAtomValue(MappedValuesAtom);
  if (isPoseName(pose)) {
    return <Text>{pose}</Text>;
  } else {
    /*<Text style={style}>{item}</Text> */
    return (
      <>
        <NumberOrNamedValue
          style={style}
          names={names}
          placeholder="NUMBER!"
          value={pose.x as string}
          setValue={(str) => {}}
        />
        <AnonymousPoseDisplay pose={pose} setPose={setPose} />
      </>
    );
  }
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
            return <NamedPoseItem style={style} key={name} item={name} />;
          }
        }),
      ]}
    </div>
  );
}
