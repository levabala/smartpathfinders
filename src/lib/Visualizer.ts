import { Box, Maze, Row } from 'generate-maze-ts';

export function printMaze(maze: Maze): string[] {
  interface BoxString {
    top: string;
    middle: string;
    bottom: string;
  }
  type BoxStringRow = BoxString[];

  function stringifyBox(
    box: Box
  ): { top: string; middle: string; bottom: string } {
    return {
      bottom: `+${box.bottom ? '---' : '   '}+`,
      middle: `${box.left ? '|' : ' '}   ${box.right ? '|' : ' '}`,
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

  return str;
}
