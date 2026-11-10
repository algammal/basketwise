import type { ProductUnit } from '../../types/entities';

/**
 * Normalizes any product unit to a base unit (grams or milliliters, or
 * pieces as-is) so prices can be compared per-kg / per-liter instead of
 * across mismatched pack sizes.
 */

const MASS_UNITS: ProductUnit[] = ['kg', 'g'];
const VOLUME_UNITS: ProductUnit[] = ['l', 'ml'];

export function toBaseQuantity(unit: ProductUnit, unitSize: number): number {
  switch (unit) {
    case 'kg':
      return unitSize * 1000; // -> grams
    case 'g':
      return unitSize;
    case 'l':
      return unitSize * 1000; // -> milliliters
    case 'ml':
      return unitSize;
    case 'pcs':
      return unitSize;
  }
}

export function getBaseUnitLabel(unit: ProductUnit): string {
  if (MASS_UNITS.includes(unit)) return 'g';
  if (VOLUME_UNITS.includes(unit)) return 'ml';
  return 'pcs';
}

/** Returns price per base unit (e.g. price per gram or per ml). */
export function getPricePerBaseUnit(price: number, unit: ProductUnit, unitSize: number): number {
  const baseQty = toBaseQuantity(unit, unitSize);
  if (baseQty <= 0) return 0;
  return price / baseQty;
}

/**
 * Only comparable when both products share the same unit family
 * (mass vs. volume vs. count). Comparing a kg price to an ml price is
 * meaningless, so callers must check this before normalizing.
 */
export function areUnitsComparable(unitA: ProductUnit, unitB: ProductUnit): boolean {
  const familyOf = (u: ProductUnit) => (MASS_UNITS.includes(u) ? 'mass' : VOLUME_UNITS.includes(u) ? 'volume' : 'count');
  return familyOf(unitA) === familyOf(unitB);
}
