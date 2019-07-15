import { Direction } from 'generate-maze-ts';

export interface Point {
  x: number;
  y: number;
}

export interface RelativePoint {
  rx: number;
  ry: number;
}

export interface Delta {
  dx: number;
  dy: number;
}

export enum Result {
  Success = 'Success',
  Fault = 'Fault',
  Unknown = 'Unknown'
}

export interface Sizable {
  width: number;
  height: number;
}

export interface Borders {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export function directionToDelta(dir: Direction): Delta {
  const map: { [d in Direction]: Delta } = {
    [Direction.top]: { dx: 0, dy: -1 },
    [Direction.right]: { dx: 1, dy: 0 },
    [Direction.bottom]: { dx: 0, dy: 1 },
    [Direction.left]: { dx: -1, dy: 0 }
  };

  return map[dir];
}

export function pointWithDirection(p: Point, d: Direction): Point;
export function pointWithDirection(
  p: RelativePoint,
  d: Direction
): RelativePoint;

export function pointWithDirection(
  p: Point | RelativePoint,
  d: Direction
): Point | RelativePoint {
  const rel = isRelativePoint(p);
  const point = rel ? rp2p(p as RelativePoint) : p;
  const newPoint = pointWithDelta(point, directionToDelta(d));
  return rel ? p2rp(newPoint) : newPoint;
}

export function pointWithDelta(
  p: Point | RelativePoint,
  { dx, dy }: Delta,
  deltaMultiplier = 1
): Point {
  const point = isRelativePoint(p) ? rp2p(p) : p;
  return {
    x: point.x + dx * deltaMultiplier,
    y: point.y + dy * deltaMultiplier
  };
}

export function rp2p({ rx, ry }: RelativePoint): Point {
  return { x: rx, y: ry };
}

export function p2rp({ x, y }: Point): RelativePoint {
  return { rx: x, ry: y };
}

export function d2p({ dx, dy }: Delta): Point {
  return { x: dx, y: dy };
}

export function p2d({ x, y }: Point): Delta {
  return { dx: x, dy: y };
}

export function d2d({ dx, dy }: Delta, multiplier: number): Delta {
  return { dx: dx * multiplier, dy: dy * multiplier };
}

export function isRelativePoint(
  point: Point | RelativePoint
): point is RelativePoint {
  return (
    (point as RelativePoint).rx !== undefined &&
    (point as RelativePoint).ry !== undefined
  );
}

export function arr2dWidth(arr: any[][]): number {
  return arr[0].length;
}

export function arr2dHeight(arr: any[][]): number {
  return arr.length;
}

export function pointInBorders(
  point: Point | RelativePoint,
  borders: Borders,
  includeBorders = false
): boolean {
  const p = isRelativePoint(point) ? rp2p(point) : point;
  return includeBorders
    ? p.x <= borders.right &&
        p.x >= borders.left &&
        p.y >= borders.top &&
        p.y <= borders.bottom
    : p.x < borders.right &&
        p.x > borders.left &&
        p.y > borders.top &&
        p.y < borders.bottom;
}

export function sumDeltas(d1: Delta, d2: Delta): Delta {
  return {
    dx: d1.dx + d2.dx,
    dy: d1.dy + d2.dy
  };
}
