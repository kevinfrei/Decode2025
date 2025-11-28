import { useAtomValue } from 'jotai';
import { CurPathChainAtom } from './state/Atoms';
import {
  AnonymousBezier,
  AnonymousPose,
  AnonymousValue,
  BezierRef,
  chkRadiansRef,
  HeadingRef,
  HeadingType,
  NamedBezier,
  NamedPathChain,
  NamedPose,
  NamedValue,
  PoseRef,
  RadiansRef,
  ValueRef,
} from '../server/types';
import { isDefined, isString, isUndefined } from '@freik/typechk';
import { ReactElement, useId } from 'react';
import { Expandable } from '@freik/fluentui-tools';
import { Button } from '@fluentui/react-components';

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
  return chkRadiansRef(heading) ? (
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
  const id = useId();
  return (
    <span>
      {b.type}:
      {b.points.map((p, index) => (
        <PoseRefDisplay
          key={`${id}-bdpr-${index}`}
          pose={p}
          first={index === 0}
        />
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
  const values = (
    <Expandable label="Values" indent={10}>
      {[...curPathChain.values, true].map((val: NamedValue | true) =>
        val === true ? (
          <Button key="--new-vr">New Value</Button>
        ) : (
          <div key={`vr-${val.name}`}>
            {val.name}
            <ValueRefDisplay val={val.value} />
          </div>
        ),
      )}
    </Expandable>
  );
  const poses = (
    <Expandable label="Poses" indent={10}>
      {[...curPathChain.poses, true].map((val: NamedPose | true) =>
        val === true ? (
          <Button key="--new-pr">New Pose</Button>
        ) : (
          <div key={`pr-${val.name}`}>
            {val.name}: <PoseRefDisplay pose={val.pose} />
          </div>
        ),
      )}
    </Expandable>
  );
  const beziers = (
    <Expandable label="Beziers" indent={10}>
      {[...curPathChain.beziers, true].map((b: NamedBezier | true) =>
        b === true ? (
          <Button key="--new-br">New Curve</Button>
        ) : (
          <div key={`br-${b.name}`}>
            {b.name}: <BezierDisplay b={b.points} />
          </div>
        ),
      )}
    </Expandable>
  );
  const chains = (
    <Expandable label="PathChains" indent={10}>
      {[...curPathChain.pathChains, true].map((npc: NamedPathChain | true) =>
        npc === true ? (
          <Button key="--new-pc">New PathChain</Button>
        ) : (
          <div key={`pc-${npc.name}`}>
            <div>
              {npc.name} @ <PathHeadingTypeDisplay ht={npc.heading} />
            </div>
            {npc.paths.map((br: BezierRef) => (
              <BezierRefDisplay
                key={`pc-${npc.name}-br-${br.toString()}`}
                b={br}
              />
            ))}
          </div>
        ),
      )}
    </Expandable>
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
