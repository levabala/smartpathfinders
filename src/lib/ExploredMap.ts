import { Box, Direction, Maze, Row } from 'generate-maze-ts';

import {
  arr2dHeight,
  arr2dWidth,
  Borders,
  Delta,
  isRelativePoint,
  Point,
  pointInBorders,
  RelativePoint,
  rp2p,
  Sizable,
  sumPoints,
} from './Assemblies';
import { Finder } from './Finder';
import { Room } from './Room';

export interface BoxG extends Box {
  explored?: boolean;
}

export function setBoxValue(
  exploredMap: ExploredMap,
  point: Point | RelativePoint,
  value: boolean
): ExploredMap {
  const p = isRelativePoint(point) ? rp2p(point) : point;
  return exploredMap.reduce(
    (newMap: ExploredMap, row, y) => [
      ...newMap,
      row.reduce(
        (newRow: boolean[], currentValue, x) => [
          ...newRow,
          x === p.x && y === p.y ? value : currentValue
        ],
        []
      )
    ],
    []
  );
}

export function appendLine(
  exploredMap: ExploredMap,
  direction: Direction
): { map: ExploredMap; offset: Delta } {
  const map =
    direction === Direction.top || direction === Direction.bottom
      ? appendRow(exploredMap, direction)
      : appendColumn(exploredMap, direction);

  const offset: Delta =
    direction === Direction.top
      ? { dx: 0, dy: -1 }
      : direction === Direction.left
      ? { dx: -1, dy: 0 }
      : { dx: 0, dy: 0 };
  return { map, offset };
}

export function appendRow(
  exploredMap: ExploredMap,
  direction: Direction.top | Direction.bottom
): ExploredMap {
  const width = arr2dWidth(exploredMap);
  return direction === Direction.bottom
    ? [...exploredMap, new Array(width).fill(false)]
    : direction === Direction.top
    ? [new Array(width).fill(false), ...exploredMap]
    : exploredMap;
}

export function appendColumn(
  exploredMap: ExploredMap,
  direction: Direction.left | Direction.right
): ExploredMap {
  return direction === Direction.right
    ? exploredMap.map(row => [...row, false])
    : direction === Direction.left
    ? exploredMap.map(row => [false, ...row])
    : exploredMap;
}

export function getRelativeBorders(
  exploredMap: ExploredMap,
  offset: Delta
): Borders {
  return {
    bottom: arr2dHeight(exploredMap) + offset.dy,
    left: offset.dx,
    right: arr2dWidth(exploredMap) + offset.dx,
    top: offset.dy
  };
}

export function toRelative(
  exploredMap: ExploredMap,
  anchor: RelativePoint
): ExploredMapRelative {
  const size: Sizable = {
    height: arr2dHeight(exploredMap),
    width: arr2dWidth(exploredMap)
  };
  return exploredMap.reduce(
    (relativeMap, row, y) => ({
      ...relativeMap,
      [y - anchor.ry]: row.reduce(
        (relativeRow, val, x) => ({
          ...relativeRow,
          [x - anchor.rx]: val
        }),
        {}
      )
    }),
    size
  ) as ExploredMapRelative;
}

export function getMazeBoxByFinder(
  finder: Finder,
  relativePoint: RelativePoint,
  room: Room
): Box {
  const absPosition = relativePointToAbsoluteByFinder(
    finder,
    room,
    relativePoint
  );
  return room.maze[absPosition.y][absPosition.x];
}

export function relativePointToAbsoluteByFinder(
  finder: Finder,
  room: Room,
  relativePoint: RelativePoint = { rx: 0, ry: 0 }
): Point {
  const { id } = finder;
  const absFinderPosition = room.positions[id];

  return sumPoints(absFinderPosition, relativePoint);
}

export function exploredMapToMaze(
  exploredMap: ExploredMap,
  offset: Delta,
  originalMaze: Maze
): Maze {
  const borders: Borders = {
    bottom: arr2dHeight(originalMaze) - 1,
    left: 0,
    right: arr2dWidth(originalMaze) - 1,
    top: 0
  };

  return exploredMap.reduce((arr: Row[], row, y) => {
    return [
      ...arr,
      row.reduce((newRow: Row, val, x) => {
        const ax = x + offset.dx - 1;
        const ay = y + offset.dy - 1;

        const box: BoxG = !pointInBorders({ x: ax, y: ay }, borders, true)
          ? {
              bottom: false,
              left: false,
              right: false,
              set: 0,
              top: false,
              x: ax,
              y: ay
            }
          : val
          ? { ...originalMaze[ay][ax], explored: true }
          : { ...originalMaze[ay][ax], explored: false };
        return [...newRow, box];
      }, [])
    ];
  }, []);
}

export type ExploredMap = boolean[][];

export interface ExploredMapRelative extends Sizable {
  [y: number]: { [x: number]: boolean };
}
