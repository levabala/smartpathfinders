import { Box, Direction, generateMaze, Maze } from 'generate-maze-ts';

import { Point, pointInBorders, pointWithDelta, pointWithDirection, Result, sumDeltas } from './Assemblies';
import { appendLine, getRelativeBorders, setBoxValue } from './ExploredMap';
import { Finder } from './Finder';

export interface Room {
  maze: Maze;
  finders: { [id: number]: Finder };
  positions: { [id: number]: Point };
}

export function createRoom(
  mazeSize: number,
  finders: Array<{ finder: Finder; position: Point }>,
  seed?: string
): Room {
  return {
    finders: finders.reduce(
      (acc, val) => ({ ...acc, [val.finder.id]: val.finder }),
      {}
    ),
    maze: generateMaze(mazeSize, mazeSize, undefined, seed),
    positions: finders.reduce(
      (acc, val) => ({ ...acc, [val.finder.id]: val.position }),
      {}
    )
  };
}

export function tryMoveFinder(
  room: Room,
  finder: Finder,
  direction: Direction
): [Result, Room] {
  const { finders, maze, positions } = room;
  const { id } = finder;
  const currentPosition = room.positions[id];
  const { x, y } = currentPosition;
  const currentBox = room.maze[y][x];
  const walkable = isWalkable(currentBox, direction);

  const newRoom: Room = {
    maze,
    ...(walkable
      ? {
          finders: { ...room.finders, [id]: moveFinder(finder, direction) },
          positions: {
            ...room.positions,
            [id]: pointWithDirection(currentPosition, direction)
          }
        }
      : {
          finders,
          positions
        })
  };

  return [walkable ? Result.Success : Result.Fault, newRoom];
}

function moveFinder(finder: Finder, direction: Direction): Finder {
  const { id, exploredMap, relativePosition, exploredMapOffset } = finder;
  const newRelativePosition = pointWithDirection(relativePosition, direction);
  const borders = getRelativeBorders(exploredMap, exploredMapOffset);
  const needAppendLine = !pointInBorders(newRelativePosition, borders, false);

  const { map, offset } = needAppendLine
    ? appendLine(finder.exploredMap, direction)
    : { map: exploredMap, offset: { dx: 0, dy: 0 } };

  console.log({ needAppendLine });

  const newOffset = sumDeltas(exploredMapOffset, offset);
  const pointsToMark = [
    newRelativePosition
    // pointWithDelta(newRelativePosition, { dx: 1, dy: 0 }),
    // pointWithDelta(newRelativePosition, { dx: -1, dy: 0 }),
    // pointWithDelta(newRelativePosition, { dx: 0, dy: 1 }),
    // pointWithDelta(newRelativePosition, { dx: 0, dy: -1 })
  ].map(p => pointWithDelta(p, newOffset, -1));

  console.log('new offset:');
  return {
    exploredMap: pointsToMark.reduce(
      (newMap, point) => setBoxValue(newMap, point, true),
      map
    ),
    exploredMapOffset: newOffset,
    id,
    relativePosition: newRelativePosition
  };
}

function isWalkable(box: Box, direction: Direction): boolean {
  return !box[direction];
}
