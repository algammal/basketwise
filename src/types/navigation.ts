export interface Point {
  x: number;
  y: number;
}

/**
 * Converts a touch point to a clockwise angle in degrees [0, 360), measured
 * from the top of the wheel (12 o'clock = 0deg), given the wheel's center.
 *
 * Screen coordinates have y increasing downward, so Math.atan2(dy, dx)
 * already increases clockwise as the point sweeps from 3 o'clock (0deg)
 * through 6 o'clock (90deg) to 9 o'clock (180deg). Rotating by +90deg moves
 * the reference from 3 o'clock to 12 o'clock without changing direction.
 *
 * Marked as a worklet so it can run on the UI thread inside gesture
 * callbacks without crossing the JS bridge on every touch move.
 */
export function angleFromCenter(point: Point, center: Point): number {
  'worklet';
  const dx = point.x - center.x;
  const dy = point.y - center.y;
  const atan2Degrees = (Math.atan2(dy, dx) * 180) / Math.PI;
  return normalizeAngle(atan2Degrees + 90);
}

/** Normalizes any angle in degrees into the [0, 360) range. Worklet-safe. */
export function normalizeAngle(degrees: number): number {
  'worklet';
  return ((degrees % 360) + 360) % 360;
}

/**
 * Signed shortest angular distance from `from` to `to`, in (-180, 180].
 * Positive = clockwise, negative = counterclockwise. Handles the 0/360
 * wraparound correctly (e.g. from 350 to 10 is +20, not -340).
 */
export function angleDelta(from: number, to: number): number {
  'worklet';
  const diff = normalizeAngle(to - from);
  return diff > 180 ? diff - 360 : diff;
}

export function distanceBetween(a: Point, b: Point): number {
  'worklet';
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** Nearest segment index for a clockwise-from-top angle, given N evenly-spaced segments. */
export function segmentIndexForAngle(angleDegrees: number, segmentCount: number): number {
  'worklet';
  const segmentAngle = 360 / segmentCount;
  return Math.round(normalizeAngle(angleDegrees) / segmentAngle) % segmentCount;
}
