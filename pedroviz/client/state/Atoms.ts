import { hasField } from '@freik/typechk';
import { atom, WritableAtom } from 'jotai';
import { atomFamily } from 'jotai-family';
import { focusAtom } from 'jotai-optics';
import { atomWithStorage } from 'jotai/utils';
import { SetStateAction } from 'react';
import {
  BezierRef,
  ErrorOr,
  isError,
  PoseRef,
  ValueRef,
} from '../../server/types';
import { darkOnWhite, lightOnBlack } from '../ui-tools/Colors';
import { GetPaths, LoadAndIndexFile } from './API';
import { EmptyMappedFile } from './NamesToData';
import { AnonymousPathChain, MappedIndex } from './types';

export const ThemeAtom = atomWithStorage<'dark' | 'light'>(
  'theme',
  'light',
  undefined,
  { getOnInit: true },
);
export const ColorsAtom = atom((get) => {
  const theme = get(ThemeAtom);
  return theme === 'dark' ? lightOnBlack : darkOnWhite;
});
export const ColorForNumber = atomFamily((index: number) =>
  atom((get) => {
    const colors = get(ColorsAtom);
    return colors[index % colors.length];
  }),
);

export const PathsAtom = atom(async () => GetPaths());

export const TeamsAtom = atom(async (get) => {
  const paths = await get(PathsAtom);
  return Object.keys(paths).sort();
});

export const SelectedTeamBackingAtom = atomWithStorage<string>(
  'selectedTeam',
  '',
  undefined,
  { getOnInit: true },
);
export const SelectedTeamAtom = atom(
  async (get) => get(SelectedTeamBackingAtom),
  async (get, set, val: string) => {
    const cur = get(SelectedTeamBackingAtom);
    // Clear the selected file when the team is changed
    if (cur !== val) {
      const curPath = await get(SelectedFileBackingAtom);
      if (curPath !== '') {
        const paths = await get(PathsAtom);
        if (hasField(paths, val)) {
          const files = paths[val];
          if (!files.includes(curPath)) {
            set(SelectedFileBackingAtom, '');
          } else {
            set(SelectedFileAtom, curPath);
          }
        }
      }
    }
    set(SelectedTeamBackingAtom, val);
  },
);

export const FilesForSelectedTeam = atom(async (get) => {
  const selTeam = await get(SelectedTeamAtom);
  const thePaths = await get(PathsAtom);
  if (selTeam === '') {
    return [];
  }
  if (hasField(thePaths, selTeam)) {
    return thePaths[selTeam];
  }
  return [];
});

export const SelectedFileBackingAtom = atomWithStorage<string>(
  'selectedPath',
  '',
  undefined,
  { getOnInit: true },
);
export const SelectedFileAtom = atom(
  async (get) => {
    return get(SelectedFileBackingAtom);
  },
  // TODO: When you set the file, udpate the file contents
  // automagically. I should be able to actually keep the
  // dependencies "correct" (and potentially much more atomic,
  // resulting in fewer UI updates hopefully)
  async (get, set, val: string) => {
    const team = await get(SelectedTeamAtom);
    set(SelectedFileBackingAtom, val);
    const maybeIdx: ErrorOr<MappedIndex> = await LoadAndIndexFile(team, val);
    if (isError(maybeIdx)) {
      return;
    }
    set(MappedFileAtom, maybeIdx);
  },
);

type MyAtoms<T> = WritableAtom<
  Map<string, T>,
  [SetStateAction<Map<string, T>>],
  void
>;

function makeItemFromNameFamily<T>(theAtom: MyAtoms<T>) {
  return atomFamily((name: string) =>
    atom(
      (get) => get(theAtom).get(name),
      (get, set, val: T) => {
        const mappedItems = new Map(get(theAtom));
        mappedItems.set(name, val);
        set(theAtom, mappedItems);
      },
    ),
  );
}

export const MappedFileAtom = atom<MappedIndex>(EmptyMappedFile);
export const MappedValuesAtom: MyAtoms<ValueRef> = focusAtom(
  MappedFileAtom,
  (optic) => optic.prop('namedValues'),
);
export const MappedPosesAtom: MyAtoms<PoseRef> = focusAtom(
  MappedFileAtom,
  (optic) => optic.prop('namedPoses'),
);
export const MappedBeziersAtom: MyAtoms<BezierRef> = focusAtom(
  MappedFileAtom,
  (optic) => optic.prop('namedBeziers'),
);
export const MappedPathChainsAtom: MyAtoms<AnonymousPathChain> = focusAtom(
  MappedFileAtom,
  (optic) => optic.prop('namedPathChains'),
);
export const ValueAtomFamily = makeItemFromNameFamily(MappedValuesAtom);
export const PoseAtomFamily = makeItemFromNameFamily(MappedPosesAtom);
export const BezierAtomFamily = makeItemFromNameFamily(MappedBeziersAtom);
export const PathChainAtomFamily = makeItemFromNameFamily(MappedPathChainsAtom);
