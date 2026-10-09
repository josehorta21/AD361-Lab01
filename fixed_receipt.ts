// Corrected implementation of the starter's grocery receipt requirements.
// The public function names are preserved. total() is the subtotal;
// tax(rate) is the grand total, including tax, as used by the original caller.

export interface GroceryItem {
  name: string;
  price: number;
}

const ITEMS: GroceryItem[] = [
  { name: "paper towels", price: 21.99 },
  { name: "sandwich", price: 8.75 },
  { name: "eggs", price: 6.75 },
  { name: "avocado oil", price: 10.0 },
];

function cleanName(name: string): string {
  if (typeof name !== "string" || name.trim().length === 0) {
    throw new TypeError("Item name must be a non-empty string.");
  }
  return name.trim();
}

function toCents(amount: number): number {
  const cents = Math.round((amount + Number.EPSILON) * 100);
  if (!Number.isSafeInteger(cents)) {
    throw new RangeError("Amount is too large to represent safely in cents.");
  }
  return cents;
}

function subtotalCents(): number {
  return ITEMS.reduce((sum, item) => sum + toCents(item.price), 0);
}

function validateTaxRate(taxRate: number): void {
  // The lab's chosen input policy uses decimal rates: 0.10 means 10%.
  if (!Number.isFinite(taxRate) || taxRate < 0 || taxRate > 1) {
    throw new RangeError("Tax rate must be a finite number between 0 and 1.");
  }
}

/** Add one item. Prices are rounded to the nearest cent before storage. */
export function addItem(name: string, price: number): void {
  const itemName = cleanName(name);
  if (!Number.isFinite(price) || price < 0) {
    throw new RangeError("Price must be a finite, non-negative number.");
  }

  const cents = toCents(price);
  if (!Number.isSafeInteger(subtotalCents() + cents)) {
    throw new RangeError("Subtotal is too large to represent safely in cents.");
  }
  ITEMS.push({ name: itemName, price: cents / 100 });
}

/** Delete the first exact name match. An unknown name leaves the list intact. */
export function deleteItem(name: string): GroceryItem[] {
  const itemName = cleanName(name);
  const index = ITEMS.findIndex((item) => item.name === itemName);
  if (index !== -1) {
    ITEMS.splice(index, 1);
  }
  // Return a snapshot so callers cannot alter the internal list accidentally.
  return ITEMS.map((item) => ({ ...item }));
}

/** Return the subtotal without tax. An empty list has a subtotal of zero. */
export function total(): number {
  return subtotalCents() / 100;
}

/** Return the grand total, including tax, rounded to cents. */
export function tax(taxRate: number): number {
  validateTaxRate(taxRate);
  const subtotal = subtotalCents();
  const taxAmount = Math.round(subtotal * taxRate);
  const grandTotal = subtotal + taxAmount;
  if (!Number.isSafeInteger(grandTotal)) {
    throw new RangeError("Total is too large to represent safely in cents.");
  }
  return grandTotal / 100;
}

/** Print all items, the subtotal, the tax amount, and the grand total. */
export function printReceipt(taxRate: number): void {
  // Validate and calculate before printing anything.
  const grandTotal = tax(taxRate);
  const subtotal = total();
  const taxAmount = (toCents(grandTotal) - toCents(subtotal)) / 100;

  console.log("************************");
  for (const item of ITEMS) {
    console.log(`${item.name} : $${item.price.toFixed(2)}`);
  }
  console.log("************************");
  console.log(`Subtotal: $${subtotal.toFixed(2)}`);
  console.log(`Tax: $${taxAmount.toFixed(2)}`);
  console.log(`Total: $${grandTotal.toFixed(2)}`);
}
