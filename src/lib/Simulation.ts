import { Direction } from 'generate-maze-ts';

import { equal, Result } from './Assemblies';
import { Finder } from './Finder';
import { Room, tryMoveFinder } from './Room';

export type FinderProcessor = (
  finder: Finder,
  tickIndex: number,
  findersCount: number
) => Direction;

export type WholeTickCallback = (room: Room, tickIndex: number) => void;

export type FinderTickCallback = (
  tickIndex: number,
  finder: Finder,
  moveResult: Result
) => void;

export interface SimulationResult {
  ticksElapsed: number;
  exitFounded: boolean;
  finderWinnerId?: number;
}

interface RunSimulationArgs {
  room: Room;
  finderProcessor: FinderProcessor;
  wholeTickCallback?: WholeTickCallback;
  finderTickCallback?: FinderTickCallback;
  maxTicksCount?: number;
}

export function runSimulation(args: RunSimulationArgs): SimulationResult {
  const {
    room,
    finderProcessor,
    finderTickCallback,
    maxTicksCount,
    wholeTickCallback
  }: Required<RunSimulationArgs> = {
    finderTickCallback: () => null,
    maxTicksCount: 100,
    wholeTickCallback: () => null,
    ...args
  };

  /* tslint:disable:no-let no-expression-statement*/
  let tickIndex = 0;
  let currentRoom = room;
  let successfulFinder: Finder | undefined;

  while (!successfulFinder && tickIndex < maxTicksCount) {
    currentRoom = simulationTick(
      currentRoom,
      finderProcessor,
      finderTickCallback,
      tickIndex
    );

    successfulFinder = getSuccessfulFinder(currentRoom);
    tickIndex++;

    wholeTickCallback(currentRoom, tickIndex);
  }

  /* tslint:enable:no-let no-expression-statement*/

  return {
    exitFounded: !!successfulFinder,
    finderWinnerId: !!successfulFinder ? successfulFinder.id : undefined,
    ticksElapsed: tickIndex
  };
}

/* tslint:disable:no-let no-expression-statement*/
function simulationTick(
  room: Room,
  finderProcessor: FinderProcessor,
  finderTickCallback: FinderTickCallback,
  tickIndex: number
): Room {
  return Object.values(room.finders).reduce((previousRoom, finder, _, arr) => {
    const direction = finderProcessor(finder, tickIndex, arr.length);
    const [result, newRoom] = tryMoveFinder(previousRoom, finder, direction);

    finderTickCallback(tickIndex, finder, result);

    return newRoom;
  }, room);
}
/* tslint:enable:no-let no-expression-statement*/

function getSuccessfulFinder(room: Room): Finder | undefined {
  return Object.values(room.finders).find((finder: Finder) =>
    equal(room.positions[finder.id], room.finishPoint)
  );
}
