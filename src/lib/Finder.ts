import { Delta, RelativePoint } from './Assemblies';
import { ExploredMap } from './ExploredMap';

export interface Finder {
  id: number;
  relativePosition: RelativePoint;
  exploredMap: ExploredMap;
  exploredMapOffset: Delta;
}

export function createFinder({ id }: { id: number }): Finder {
  return {
    exploredMap: generateExploredMap(),
    exploredMapOffset: {
      dx: -1,
      dy: -1
    },
    id,
    relativePosition: {
      rx: 0,
      ry: 0
    }
  };
}

function generateExploredMap(): ExploredMap {
  return [[false, false, false], [false, true, false], [false, false, false]];
}
