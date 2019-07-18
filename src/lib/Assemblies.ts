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

export type TwoD = Point | RelativePoint | Delta;

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

export interface Range {
  from: number;
  to: number;
  step?: number;
}

export function dd2p(dd: TwoD): Point {
  return isPoint(dd) ? dd : isRelativePoint(dd) ? rp2p(dd) : d2p(dd);
}

export function dd2rp(dd: TwoD): RelativePoint {
  return isPoint(dd) ? p2rp(dd) : isDelta(dd) ? d2rp(dd) : dd;
}

export function dd2d(dd: TwoD): Delta {
  return isPoint(dd) ? p2d(dd) : isRelativePoint(dd) ? rp2d(dd) : dd;
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

export function rp2d({ rx, ry }: RelativePoint): Delta {
  return { dx: rx, dy: ry };
}

export function p2rp({ x, y }: Point): RelativePoint {
  return { rx: x, ry: y };
}

export function d2p({ dx, dy }: Delta): Point {
  return { x: dx, y: dy };
}

export function d2rp({ dx, dy }: Delta): RelativePoint {
  return { rx: dx, ry: dy };
}

export function p2d({ x, y }: Point): Delta {
  return { dx: x, dy: y };
}

export function d2d({ dx, dy }: Delta, multiplier: number): Delta {
  return { dx: dx * multiplier, dy: dy * multiplier };
}

export function isPoint(dd: TwoD): dd is Point {
  return (dd as Point).x !== undefined && (dd as Point).y !== undefined;
}

export function isRelativePoint(dd: TwoD): dd is RelativePoint {
  return (
    (dd as RelativePoint).rx !== undefined &&
    (dd as RelativePoint).ry !== undefined
  );
}

export function isDelta(dd: TwoD): dd is Delta {
  return (dd as Delta).dx !== undefined && (dd as Delta).dy !== undefined;
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

export function sumPoints(p1: Point | RelativePoint, p2: Point): Point;
export function sumPoints(p1: Point, p2: Point | RelativePoint): Point;
export function sumPoints(p1: RelativePoint, p2: RelativePoint): RelativePoint;

export function sumPoints(
  p1: Point | RelativePoint,
  p2: Point | RelativePoint
): Point | RelativePoint {
  const r1 = isRelativePoint(p1);
  const r2 = isRelativePoint(p2);

  const point1 = r1 ? rp2p(p1 as RelativePoint) : (p1 as Point);
  const point2 = r2 ? rp2p(p1 as RelativePoint) : (p2 as Point);

  const res = {
    x: point1.x + point2.x,
    y: point1.y + point2.y
  };

  return r1 && r2 ? p2rp(res) : res;
}

export function randomPoint(
  xRange: Range | Required<Range>,
  yRange: Range | Required<Range>
): Point {
  const xr = detRange(xRange);
  const yr = detRange(yRange);

  return {
    x: randomInRange(xr),
    y: randomInRange(yr)
  };
}

export function random(min: number, max: number, inc: number = 1): number {
  return Math.floor((Math.random() * (max - min)) / inc) * inc + min;
}

export function randomInRange(range: Required<Range>): number {
  return random(range.from, range.to, range.step);
}

export function simpleRange(to: number): Required<Range> {
  return {
    from: 0,
    step: 1,
    to
  };
}

export function detRange({
  from,
  step,
  to
}: Range | Required<Range>): Required<Range> {
  return {
    from,
    step: step === undefined ? 1 : step,
    to
  };
}

export function equal(
  point1: Point | RelativePoint,
  point2: Point | RelativePoint
): boolean {
  const p1 = isRelativePoint(point1) ? rp2p(point1) : point1;
  const p2 = isRelativePoint(point2) ? rp2p(point2) : point2;

  return p1.x === p2.x && p1.y === p2.y;
}
