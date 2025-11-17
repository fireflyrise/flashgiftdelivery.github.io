import { PACKAGES, CHOCOLATES_PRICE } from './constants';

export type PackageType = '1_dozen' | '2_dozen' | '3_dozen';

export function calculateOrderTotal(packageType: PackageType, hasChocolates: boolean): {
  packagePrice: number;
  chocolatesPrice: number;
  subtotal: number;
  total: number;
} {
  const pkg = PACKAGES.find(p => p.id === packageType);
  const packagePrice = pkg?.price ?? 0;
  const chocolatesPrice = hasChocolates ? CHOCOLATES_PRICE : 0;
  const subtotal = packagePrice + chocolatesPrice;
  const total = subtotal; // No tax for now, but can add here

  return {
    packagePrice,
    chocolatesPrice,
    subtotal,
    total,
  };
}

export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

export function formatPriceShort(amount: number): string {
  return `$${Math.round(amount)}`;
}
