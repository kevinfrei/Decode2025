import { useAtomValue } from 'jotai';
import { CurPathChainAtom } from './state/Atoms';
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  chkRadianRef,
  HeadingRef,
  HeadingType,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PoseRef,
  RadiansRef,
  ValueRef,
} from './server/types';
import { isDefined, isString, isUndefined } from '@freik/typechk';
import { ReactElement } from 'react';

function MathToRadianDisplay({ val }: { val: ValueRef }): ReactElement {
  return (
    <span style={{ backgroundColor: '#eeddff' }}>
      Math.toRadians(
      <ValueRefDisplay val={val} />)
    </span>
  );
}

function AnonymouseValueDisplay({
  val,
}: {
  val: AnonymousValue;
}): ReactElement {
  switch (val.type) {
    case 'radians':
      return <MathToRadianDisplay val={{ type: 'double', value: val.value }} />;
    case 'double':
      return (
        <span style={{ backgroundColor: '#ddffee' }}>
          {val.value.toFixed(3)}
        </span>
      );
    case 'int':
      return (
        <span style={{ backgroundColor: '#ddffee' }}>
          {val.value.toFixed(0)}
        </span>
      );
  }
}

export function ValueRefDisplay({ val }: { val: ValueRef }): ReactElement {
  const contents = isString(val) ? val : <AnonymouseValueDisplay val={val} />;
  return (
    <span
      style={{
        backgroundColor: '#ddeeff',
        margin: '5pt',
        padding: '5pt',
        border: '5pt',
      }}
    >
      {contents}
    </span>
  );
}

function RadiansRefDisplay({ val }: { val: RadiansRef }): ReactElement {
  return <MathToRadianDisplay val={val.radians} />;
}

function HeadingRef({ heading }: { heading: HeadingRef }): ReactElement {
  return chkRadianRef(heading) ? (
    <RadiansRefDisplay val={heading} />
  ) : (
    <ValueRefDisplay val={heading} />
  );
}

function AnonymousPose({ pose }: { pose: AnonymousPose }): ReactElement {
  return (
    <div>
      Pose: (<ValueRefDisplay val={pose.x} />, <ValueRefDisplay val={pose.y} />
      {pose.heading ? <HeadingRef heading={pose.heading} /> : <></>})
    </div>
  );
}

function PoseRefDisplay({
  pose,
  first,
}: {
  pose: PoseRef;
  first?: boolean;
}): ReactElement {
  const showDivider = isDefined(first) ? !first : false;
  const prefix = showDivider ? <>,&nbsp;</> : <></>;
  return isString(pose) ? (
    <>
      {prefix}
      <span style={{ backgroundColor: '#eeddff' }}>{pose}</span>
    </>
  ) : (
    <>
      {prefix}
      <AnonymousPose pose={pose} />
    </>
  );
}

function BezierDisplay({ b }: { b: AnonymousBezier }): ReactElement {
  return (
    <span>
      {b.type}:
      {b.points.map((p, index) => (
        <PoseRefDisplay key={p.toString()} pose={p} first={index === 0} />
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
      node = <HeadingRef heading={ht.heading} />;
      break;
    case 'interpolated':
      node = (
        <span>
          <HeadingRef heading={ht.headings[0]} />
          <HeadingRef heading={ht.headings[1]} />
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

export function PathsDataDisplay() {
  const curPathChain = useAtomValue(CurPathChainAtom);
  if (!curPathChain) { 
    return <></>;
  }
  return (
    <div>
      <div>Name: {curPathChain.name}</div>
      <div>
        Values:
        {curPathChain.values.map((val: NamedValue) => (
          <div key={val.name}>
            {val.name}
            <ValueRefDisplay key={val.name} val={val.value} />
          </div>
        ))}
      </div>
      <div>
        Poses:
        {curPathChain.poses.map((val: NamedPose) => (
          <div key={val.name}>
            {val.name}: <PoseRefDisplay pose={val.pose} />
          </div>
        ))}
      </div>
      <div>
        Beziers:
        {curPathChain.beziers.map((b: NamedBezier) => (
          <div key={b.name}>
            {b.name}: <BezierDisplay b={b.points} />
          </div>
        ))}
      </div>
      <div>
        PathChains:
        {curPathChain.pathChains.map((npc: NamedPathChain) => (
          <div key={npc.name}>
            <div>
              {npc.name} @ <PathHeadingTypeDisplay ht={npc.heading} />
            </div>
            {npc.paths.map((br: BezierRef) => (
              <BezierRefDisplay key={br.toString()} b={br} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
