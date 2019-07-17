import { Direction, generateMaze, Maze } from 'generate-maze-ts';

import {
  Point,
  pointInBorders,
  pointWithDelta,
  pointWithDirection,
  randomPoint,
  Result,
  simpleRange,
  sumDeltas,
} from './Assemblies';
import { appendLine, BoxG, getRelativeBorders, setBoxValue } from './ExploredMap';
import { Finder } from './Finder';

export interface Room {
  maze: Maze;
  finders: { [id: number]: Finder };
  positions: { [id: number]: Point };
  finishPoint: Point;
}

export function createRoom(
  mazeWidth: number,
  mazeHeight: number,
  finders: Array<{ finder: Finder; position: Point }>,
  finishPoint: Point = randomPoint(
    simpleRange(mazeWidth),
    simpleRange(mazeHeight)
  ),
  seed?: string
): Room {
  return {
    finders: finders.reduce(
      (acc, val) => ({ ...acc, [val.finder.id]: val.finder }),
      {}
    ),
    finishPoint,
    maze: generateMaze(mazeWidth, mazeHeight, undefined, seed),
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
  const { finders, maze, positions, finishPoint } = room;
  const { id } = finder;
  const currentPosition = room.positions[id];
  const { x, y } = currentPosition;
  const currentBox = room.maze[y][x];
  const walkable = isWalkable(currentBox, direction);

  const newRoom: Room = {
    finishPoint,
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

  const newOffset = sumDeltas(exploredMapOffset, offset);
  const pointsToMark = [
    newRelativePosition
    // pointWithDelta(newRelativePosition, { dx: 1, dy: 0 }),
    // pointWithDelta(newRelativePosition, { dx: -1, dy: 0 }),
    // pointWithDelta(newRelativePosition, { dx: 0, dy: 1 }),
    // pointWithDelta(newRelativePosition, { dx: 0, dy: -1 })
  ].map(p => pointWithDelta(p, newOffset, -1));

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

function isWalkable(box: BoxG, direction: Direction): boolean {
  return !box[direction];
}
