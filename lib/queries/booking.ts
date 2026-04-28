import { discounts } from "@/lib/mock";
import { Discount, Seat } from "@/types";

export function calculateSubtotal(selectedSeats: Seat[], seatPrice = 799) {
  return selectedSeats.length * seatPrice;
}

export function findDiscountByCode(code: string): Discount | null {
  return (
    discounts.find(
      (discount) =>
        discount.code.toLowerCase() === code.trim().toLowerCase() &&
        new Date(discount.expiry_date).getTime() >= Date.now(),
    ) ?? null
  );
}

export function calculateTotal(subtotal: number, discount: Discount | null) {
  if (!discount) {
    return subtotal;
  }

  const off = (subtotal * discount.percentage) / 100;
  return Math.max(0, subtotal - off);
}
