import { Button, Text } from '@fluentui/react-components';
import { isDefined, isString } from '@freik/typechk';
import { useAtomValue } from 'jotai';
import { CSSProperties, ReactElement, useId } from 'react';
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  chkRadiansRef,
  HeadingRef,
  HeadingType,
  isRef,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PoseRef,
  RadiansRef,
  ValueRef,
} from '../server/types';
import { CurPathChainAtom, SelectedFileAtom } from './state/Atoms';
import { Expando } from './ui-tools/Expando';

function MathToRadianDisplay({ value }: { value: ValueRef }): ReactElement {
  return (
    <span>
      <ValueRefDisplay value={value} />
      <Text> degrees</Text>
    </span>
  );
}

function AnonymouseValueDisplay({
  value,
}: {
  value: AnonymousValue;
}): ReactElement {
  switch (value.type) {
    case 'radians':
      return (
        <MathToRadianDisplay value={{ type: 'double', value: value.value }} />
      );
    case 'double':
      return <Text>{value.value.toFixed(3)}</Text>;
    case 'int':
      return <Text>{value.value.toFixed(0)}</Text>;
  }
}

export function ValueRefDisplay({ value }: { value: ValueRef }): ReactElement {
  return isString(value) ? (
    <Text>{value}</Text>
  ) : (
    <AnonymouseValueDisplay value={value} />
  );
}

function RadiansRefDisplay({ value }: { value: RadiansRef }): ReactElement {
  return <MathToRadianDisplay value={value.radians} />;
}

function HeadingRefDisplay({
  heading,
}: {
  heading?: HeadingRef;
}): ReactElement {
  if (isDefined(heading)) {
    return chkRadiansRef(heading) ? (
      <RadiansRefDisplay value={heading} />
    ) : (
      <ValueRefDisplay value={heading} />
    );
  }
  return <>&nbsp;</>;
}

function AnonymousPose({ pose }: { pose: AnonymousPose }): ReactElement {
  return (
    <div>
      Pose: (<ValueRefDisplay value={pose.x} />,{' '}
      <ValueRefDisplay value={pose.y} />
      <HeadingRefDisplay heading={pose.heading} />)
    </div>
  );
}

function BezierDisplay({ b }: { b: AnonymousBezier }): ReactElement {
  const id = useId();
  return (
    <span>
      {b.type}:
      {b.points.map((p, index) => (
        <PoseRefDisplay key={`${id}-bdpr-${index}`} pose={p} />
      ))}
    </span>
  );
}

function BezierRefDisplay({ b }: { b: BezierRef }): ReactElement {
  return isString(b) ? (
    <span style={{ backgroundColor: '#eeffdd' }}>{b}</span>
  ) : (
    <BezierDisplay b={b} />
  );
}

function PathHeadingTypeDisplay({ ht }: { ht: HeadingType }): ReactElement {
  let res = ht.type[0].toLocaleUpperCase() + ht.type.substring(1);
  let node: ReactElement;
  switch (ht.type) {
    case 'constant':
      node = <HeadingRefDisplay heading={ht.heading} />;
      break;
    case 'interpolated':
      node = (
        <span>
          <HeadingRefDisplay heading={ht.headings[0]} />
          <HeadingRefDisplay heading={ht.headings[1]} />
        </span>
      );
      break;
    case 'tangent':
      node = <></>;
      break;
  }
  return (
    <>
      {res}
      {node}
    </>
  );
}

export function NamedValueList({
  values,
}: {
  values: NamedValue[];
}): ReactElement {
  const gridStyle: CSSProperties = {
    display: 'grid',
    columnGap: '10pt',
    gridTemplateColumns: '1fr auto auto',
    justifyItems: 'end',
    justifySelf: 'start',
  };
  // TODO: Make this editable, right?
  return (
    <>
      <div style={gridStyle}>
        <Text size={400}>Name</Text>
        <Text size={400}>Value</Text>
        <Text size={400}>Units</Text>
        {values.map((val) => (
          <>
            <Text key={`vr-${val.name}-1`}>{val.name}</Text>
            <Text key={`vr-${val.name}-2`}>{val.value.value}</Text>
            <Text key={`vr-${val.name}-3`}>
              {` ${val.value.type === 'radians' ? 'degrees' : val.value.type}`}
            </Text>
          </>
        ))}
      </div>
      <Button style={{ margin: 10 }}> New Value </Button>
    </>
  );
}

export function AnonymousPoseDisplay({
  pose,
  noHeading,
}: {
  pose: AnonymousPose;
  noHeading?: boolean;
}): ReactElement {
  return noHeading ? (
    <>
      <ValueRefDisplay value={pose.x} />
      <ValueRefDisplay value={pose.y} />
    </>
  ) : (
    <>
      <ValueRefDisplay value={pose.x} />
      <ValueRefDisplay value={pose.y} />
      <HeadingRefDisplay heading={pose.heading} />
    </>
  );
}

export function AnonymousPoseHeader({
  noHeading,
}: {
  noHeading?: boolean;
}): ReactElement {
  return noHeading ? (
    <>
      <Text size={400}>X</Text>
      <Text size={400}>Y</Text>
    </>
  ) : (
    <>
      <Text size={400}>X</Text>
      <Text size={400}>Y</Text>
      <Text size={400}>Heading</Text>
    </>
  );
}

export function NamedPoseList({ poses }: { poses: NamedPose[] }): ReactElement {
  const gridStyle: CSSProperties = {
    display: 'grid',
    columnGap: '10pt',
    gridTemplateColumns: '1fr auto auto auto',
    justifyItems: 'end',
    justifySelf: 'start',
  };
  return (
    <>
      <div style={gridStyle}>
        <Text size={400}>Name</Text>
        <AnonymousPoseHeader />
        {poses.map((pose) => (
          <>
            <Text key={`pr-${pose.name}-1`}>{pose.name}</Text>
            <AnonymousPoseDisplay key={`pr-${pose.name}-2`} pose={pose.pose} />
          </>
        ))}
      </div>
      <Button style={{ margin: 10 }}>New Pose</Button>
    </>
  );
}

function PoseRefDisplay({
  pose,
  noHeading,
}: {
  pose: PoseRef;
  noHeading?: boolean;
}): ReactElement {
  return isRef(pose) ? (
    <Text
      style={{
        gridColumnStart: 2,
        gridColumnEnd: 4 + (noHeading ? 0 : 1),
        justifySelf: 'center',
      }}
    >
      {pose}
    </Text>
  ) : (
    <AnonymousPoseDisplay noHeading={!!noHeading} pose={pose} />
  );
}

function InlinePoseRefDisplay({ pose }: { pose: PoseRef }): ReactElement {
  return isRef(pose) ? (
    <Text>{pose}</Text>
  ) : (
    <Text>
      (<ValueRefDisplay value={pose.x} />, <ValueRefDisplay value={pose.y} />)
    </Text>
  );
}

// Generate the grid row start/end for a span starting at a *zero* based row index
// "start" and a row count height of "count".
function rowSpan(offset: number, start: number, count: number): CSSProperties {
  return {
    gridRowStart: start + offset,
    gridRowEnd: start + count + offset,
    alignSelf: 'center',
  };
}

export function NamedBezierList({
  beziers,
}: {
  beziers: NamedBezier[];
}): ReactElement {
  const rowspans: CSSProperties[] = [];
  let count = 0;
  for (const b of beziers) {
    rowspans.push(rowSpan(1, count, b.points.points.length));
    count += b.points.points.length;
  }
  const gridStyle: CSSProperties = {
    display: 'grid',
    columnGap: '10pt',
    gridTemplateColumns: '1fr auto',
    justifyItems: 'end',
    justifySelf: 'start',
  };
  return (
    <>
      <div style={gridStyle}>
        <Text size={400}>Name</Text>
        <Text size={400}>Poses</Text>
        {beziers.map((nb, index) => (
          <>
            <Text key={`br-${nb.name}-1`} style={rowspans[index]}>
              {nb.name}
            </Text>
            {nb.points.points.map((pr, index) => (
              <InlinePoseRefDisplay
                key={`br-${nb.name}-${index}-2`}
                pose={pr}
              />
            ))}
          </>
        ))}
      </div>
      <Button style={{ margin: 10 }}>New Bezier</Button>
    </>
  );
}

export function NamedPathChainDisplay({
  chain,
}: {
  chain: NamedPathChain;
}): ReactElement {
  // Okay, this fits in a container grid that's 3 columns wide
  return <></>;
}

export function PathChainList({
  pathChains,
}: {
  pathChains: NamedPathChain[];
}): ReactElement {
  const rowspans: [number,number] = [];
  let count = 0;
  for (const pc of pathChains) {
    rowspans.push(rowSpan(1, count, pc.paths.length + 1));
    count += pc.paths.length + 1;
  }
  const gridStyle: CSSProperties = {
    display: 'grid',
    columnGap: '10pt',
    gridTemplateColumns: '1fr auto auto',
    justifyItems: 'end',
    justifySelf: 'start',
  };
  return (
    <div style={gridStyle}>
      <Text size={400}>Name</Text>
      <Text size={400}>Field</Text>
      <Text size={400}>Value(s)</Text>
      {pathChains.map((npc) => (
        <NamedPathChainDisplay key={npc.name} chain={npc} />
      ))}
    </div>
  );
}

export function PathsDataDisplay() {
  const curPathChain = useAtomValue(CurPathChainAtom);
  const selFile = useAtomValue(SelectedFileAtom);
  if (!curPathChain || selFile.length === 0) {
    return <div>Please select a file to view.</div>;
  }
  const values = (
    <Expando label="Values" indent={20} size={500}>
      <NamedValueList values={curPathChain.values} />
    </Expando>
  );
  const poses = (
    <Expando label="Poses" indent={20} size={500}>
      <NamedPoseList poses={curPathChain.poses} />
    </Expando>
  );
  const beziers = (
    <Expando label="Beziers" indent={20} size={500}>
      <NamedBezierList beziers={curPathChain.beziers} />
    </Expando>
  );
  const chains = (
    <Expando label="PathChains" indent={20} size={500} defaultShow={true}>
      <PathChainList pathChains={curPathChain.pathChains} />
    </Expando>
  );
  return (
    <div>
      {values}
      {poses}
      {beziers}
      {chains}
    </div>
  );
}
