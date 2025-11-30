import { Button, Text } from '@fluentui/react-components';
import { isDefined, isString } from '@freik/typechk';
import { useAtomValue } from 'jotai';
import { CSSProperties, ReactElement } from 'react';
import {
  AnonymousPose,
  AnonymousValue,
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

type RowData = { offset: number; size: number };

// Generate the grid row start/end for a span starting at a *zero* based row index
// "start" and a row count height of "count".
function rowSpan(offset: number, rd: RowData): CSSProperties {
  return {
    gridRowStart: rd.offset + offset,
    gridRowEnd: rd.offset + rd.size + offset,
    alignSelf: 'center',
  };
}

export function NamedBezierList({
  beziers,
}: {
  beziers: NamedBezier[];
}): ReactElement {
  const rowData: RowData[] = [];
  let count = 0;
  for (const b of beziers) {
    rowData.push({ offset: count, size: b.points.points.length });
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
            <Text key={`br-${nb.name}-1`} style={rowSpan(1, rowData[index])}>
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

function HeadingTypeDisplay({
  heading,
}: {
  heading: HeadingType;
}): ReactElement {
  switch (heading.type) {
    case 'constant':
      return (
        <>
          <Text>Constant heading</Text>
          <HeadingRefDisplay heading={heading.heading} />
        </>
      );
    case 'tangent':
      return (
        <>
          <Text>Tangent heading</Text>
          <span>&nbsp;</span>
        </>
      );
    case 'interpolated':
      return (
        <>
          <Text>Linear heading</Text>
          <span>
            <HeadingRefDisplay heading={heading.headings[0]} />
            <Text> to </Text>
            <HeadingRefDisplay heading={heading.headings[1]} />
          </span>
        </>
      );
  }
}

type NestedRowData = RowData & { children: RowData[] };

export function NamedPathChainDisplay({
  chain,
  rowdata,
}: {
  chain: NamedPathChain;
  rowdata: NestedRowData;
}): ReactElement {
  // This renders into a container grid that's 3 columns wide
  return (
    <>
      <Text style={rowSpan(1, rowdata)}>{chain.name}</Text>
      {chain.paths.map((br, index) => {
        if (isRef(br)) {
          // Span both columns for a named curve
          return (
            <Text
              style={{
                gridColumnStart: 2,
                gridColumnEnd: 4,
                justifySelf: 'center',
              }}
            >
              {br}
            </Text>
          );
        } else {
          return (
            <>
              <Text style={rowSpan(1, rowdata.children[index])}>{br.type}</Text>
              {br.points.map((pr) => (
                <InlinePoseRefDisplay pose={pr} />
              ))}
            </>
          );
        }
      })}
      <HeadingTypeDisplay heading={chain.heading} />
    </>
  );
}

export function PathChainList({
  pathChains,
}: {
  pathChains: NamedPathChain[];
}): ReactElement {
  // I need to collect row spans for:
  // 1- The name, a running total of all prior path chains, plus a total count
  //    of this path's chains.
  // 2- The type/name of each bezier of the chain, which is a running count of
  //    the prior rows, plus the count of the current curve's control points
  let count = 1;
  let nestedRowData: NestedRowData[] = [];
  for (const pc of pathChains) {
    const children: RowData[] = [];
    const offset = count;
    for (const b of pc.paths) {
      const size = isRef(b) ? 1 : b.points.length;
      children.push({ offset: count, size });
      count += size;
    }
    count++; // Heading row
    nestedRowData.push({ offset, size: count - offset, children });
  }
  const gridStyle: CSSProperties = {
    display: 'grid',
    columnGap: '10pt',
    gridTemplateColumns: '1fr auto auto',
    justifyItems: 'end',
    justifySelf: 'start',
  };
  return (
    <>
      <div style={gridStyle}>
        <Text size={400}>Name</Text>
        <Text
          size={400}
          style={{
            gridColumnStart: 2,
            gridColumnEnd: 4,
            justifySelf: 'center',
          }}
        >
          Paths
        </Text>
        {pathChains.map((npc, index) => (
          <NamedPathChainDisplay
            key={npc.name}
            chain={npc}
            rowdata={nestedRowData[index]}
          />
        ))}
      </div>
      <Button style={{ margin: 10 }}>New PathChain</Button>
    </>
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
    <Expando label="Bezier Lines/Curves" indent={20} size={500}>
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
