import {
  Combobox,
  ComboboxProps,
  Field,
  Input,
  InputProps,
  Option,
  Text,
} from '@fluentui/react-components';
import { useAtom, useAtomValue } from 'jotai';
import { CSSProperties, ReactElement, useState } from 'react';
import {
  AnonymousValue,
  isDoubleValue,
  isIntValue,
  isRadiansRef,
  isRef,
  isValueName,
  ValueName,
  ValueRef,
} from '../../server/types';
import { MappedValuesAtom, ValueAtomFamily } from '../state/Atoms';
import { ItemWithStyle } from '../ui-tools/types';
import { CheckValidName } from './Validation';

export function AnonymousValueDisplay({
  item,
  ...props
}: ItemWithStyle<AnonymousValue>): ReactElement {
  if (isDoubleValue(item)) {
    return <Text {...props}>{item.double.toFixed(2)}</Text>;
  } else {
    return <Text {...props}>{item.int.toFixed(0)}</Text>;
  }
}

export function EditableValueRef({
  initial,
  setRef,
  style,
}: {
  initial: ValueName;
  setRef: (val: ValueName) => void;
  style?: CSSProperties;
}): ReactElement {
  const validRefs = useAtomValue(MappedValuesAtom);
  const [curVal, setCurVal] = useState(initial);
  let [validNameMessage, nameValidationState] = CheckValidName(
    validRefs,
    curVal,
    true,
  );
  const onChange: InputProps['onChange'] = (_, data) => {
    [validNameMessage, nameValidationState] = CheckValidName(
      validRefs,
      data.value.trim() as ValueName,
      true,
    );
    if (nameValidationState == 'none') {
      setRef(data.value.trim() as ValueName);
    }
    setCurVal(data.value as ValueName);
  };
  return (
    <Field
      style={style}
      validationMessage={validNameMessage}
      validationState={nameValidationState}
    >
      <Input
        type="text"
        value={curVal}
        onChange={onChange}
        input={{ style: { textAlign: 'right' } }}
      />
    </Field>
  );
}

/*
import {
  Combobox,
  makeStyles,
  Option,
  useId,
} from "@fluentui/react-components";
import type { ComboboxProps } from "@fluentui/react-components";

const useStyles = makeStyles({
  root: {
    // Stack the label above the field with a gap
    display: "grid",
    gridTemplateRows: "repeat(1fr)",
    justifyItems: "start",
    gap: "2px",
    maxWidth: "400px",
  },
});
*/
export const Freeform = (props: Partial<ComboboxProps>): ReactElement => {
  // const comboId = useId("combo-default");
  const options = [
    'Cat',
    'Caterpillar',
    'Catfish',
    'Cheetah',
    'Chicken',
    'Cockatiel',
    'Cow',
    'Dog',
    'Dolphin',
    'Ferret',
    'Firefly',
    'Fish',
    'Fox',
    'Fox Terrier',
    'Frog',
    'Hamster',
    'Snake',
  ];

  const [matchingOptions, setMatchingOptions] = useState([...options]);
  const [customSearch, setCustomSearch] = useState<string | undefined>();

  const onChange: ComboboxProps['onChange'] = (event) => {
    const value = event.target.value.trim();
    const matches = options.filter(
      (option) => option.toLowerCase().indexOf(value.toLowerCase()) === 0,
    );
    setMatchingOptions(matches);
    if (value.length && matches.length < 1) {
      setCustomSearch(value);
    } else {
      setCustomSearch(undefined);
    }
  };

  const onOptionSelect: ComboboxProps['onOptionSelect'] = (event, data) => {
    const matchingOption = data.optionText && options.includes(data.optionText);
    if (matchingOption) {
      setCustomSearch(undefined);
    } else {
      setCustomSearch(data.optionText);
    }
  };

  return (
    <Field style={props.style}>
      <Combobox
        freeform
        placeholder="Select an animal"
        onChange={onChange}
        onOptionSelect={onOptionSelect}
        {...props}
      >
        {customSearch ? (
          <Option key="freeform" text={customSearch}>
            Search for "{customSearch}"
          </Option>
        ) : null}
        {matchingOptions.map((option) => (
          <Option key={option}>{option}</Option>
        ))}
      </Combobox>
    </Field>
  );
};

export function EditableValueExpr({
  initial,
  setVal,
  precision,
}: {
  initial: number;
  setVal: (v: AnonymousValue) => void;
  precision: number;
}): ReactElement {
  const onChangeVal: InputProps['onChange'] = (_, data) => {
    const newVal = Number.parseFloat(data.value);
    if (!isNaN(newVal)) {
      if (precision === 0) {
        setVal({ int: Math.round(newVal) });
      } else {
        setVal({ double: newVal });
      }
    }
  };
  return (
    <Input
      type="number"
      value={initial.toFixed(precision)}
      onChange={onChangeVal}
      input={{ style: { textAlign: 'right' } }}
    />
  );
}

function getNumber(val: AnonymousValue): number {
  return isDoubleValue(val) ? val.double : val.int;
}

export function NamedValueElem({ name }: { name: ValueName }): ReactElement {
  const [item, setItem] = useAtom(ValueAtomFamily(name));
  const type = isRadiansRef(item)
    ? 'degrees'
    : isIntValue(item)
      ? 'int'
      : 'double';
  let editable: ReactElement;
  if (isRadiansRef(item)) {
    if (isRef(item.radians)) {
      editable = (
        <EditableValueRef
          initial={item.radians}
          setRef={(nm) => setItem({ radians: nm })}
        />
      );
    } else {
      editable = (
        <EditableValueExpr
          initial={getNumber(item.radians)}
          setVal={(av) => setItem({ radians: av })}
          precision={1}
        />
      );
    }
  } else {
    editable = <EditableOnlyValueRef ref={item} setRef={setItem} />;
  }
  return (
    <>
      <Text>{name}</Text>
      {editable}
      <Text>{type}</Text>
    </>
  );
}

export function EditableOnlyValueRef({
  ref,
  setRef,
}: {
  ref: ValueRef;
  setRef: (v: ValueRef) => void;
}): ReactElement {
  let editable: ReactElement;
  if (isValueName(ref)) {
    editable = <EditableValueRef initial={ref} setRef={setRef} />;
  } else {
    editable = (
      <EditableValueExpr
        initial={getNumber(ref)}
        setVal={setRef}
        precision={isIntValue(ref) ? 0 : 2}
      />
    );
  }
  return editable;
}

export function NamedValueList(): ReactElement {
  const items = useAtomValue(MappedValuesAtom);
  const names = [...items.keys()];
  const gridStyle: CSSProperties = {
    display: 'grid',
    columnGap: '10pt',
    gridTemplateColumns: '1fr auto auto',
    justifyItems: 'end',
    justifySelf: 'start',
    alignItems: 'center',
  };

  return (
    <div style={gridStyle}>
      <Text size={400}>Name {names.length}</Text>
      <Text size={400}>Value</Text>
      <Text size={400}>Units</Text>
      {names.map((val) => (
        <NamedValueElem key={val} name={val} />
      ))}
    </div>
  );
}
