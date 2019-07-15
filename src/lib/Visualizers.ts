import { Box, Maze, Row } from 'generate-maze-ts';

import { Point } from './Assemblies';
import { ExploredMap } from './ExploredMap';

export function exploredMapToStrings(exploredMap: ExploredMap): string[] {
  return exploredMap.reduce((arr: string[], row) => {
    return [
      ...arr,
      row.reduce(
        (newRow: string, val) => newRow.concat(val ? ' 0 ' : ' 1 '),
        ''
      )
    ];
  }, []);
}

export function mazeToStrings(
  maze: Maze,
  positions: { [id: number]: Point } = {}
): string[] {
  interface BoxString {
    top: string;
    middle: string;
    bottom: string;
  }
  type BoxStringRow = BoxString[];

  const positionEntries = Object.entries(positions);

  function stringifyBox(
    box: Box
  ): { top: string; middle: string; bottom: string } {
    const finderIsHere = !!positionEntries.find(
      ([_, { x, y }]) => x === box.x && y === box.y
    );

    return {
      bottom: `+${box.bottom ? '---' : '   '}+`,
      middle: `${box.left ? '|' : ' '} ${finderIsHere ? '●' : ' '} ${
        box.right ? '|' : ' '
      }`,
      top: `+${box.top ? '---' : '   '}+`
    };
  }

  function concatRow(row: BoxStringRow): BoxString {
    return row.reduce(
      (acc: BoxString, val, i, arr) =>
        i === arr.length - 1
          ? {
              bottom: acc.bottom + val.bottom,
              middle: acc.middle + val.middle,
              top: acc.top + val.top
            }
          : {
              bottom: acc.bottom + val.bottom.slice(0, -1),
              middle: acc.middle + val.middle.slice(0, -1),
              top: acc.top + val.top.slice(0, -1)
            },
      { bottom: '', middle: '', top: '' }
    );
  }

  const str = maze
    .reduce((acc: BoxStringRow[], val: Row) => {
      const newAcc = [...acc, val.map(b => stringifyBox(b))];
      return newAcc;
    }, [])
    .reduce((acc: BoxString[], row: BoxStringRow) => {
      const concatedRow = concatRow(row);

      return [...acc, concatedRow];
    }, [])
    .reduce((acc: string[], val: BoxString, i, arr) => {
      const last = i === arr.length - 1;
      const { bottom, middle, top } = val;
      return last ? [...acc, top, middle, bottom] : [...acc, top, middle];
    }, []);

  return [...str];
}
