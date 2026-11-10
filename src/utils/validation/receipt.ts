export interface ReceiptDraftItem {
  rawName: string;
  quantity: number;
  unitPrice: number;
  discountAmount: number;
}

export interface ReceiptDraftValidationError {
  field: string;
  message: string;
}

/** Validates a receipt draft before it can be confirmed and saved. */
export function validateReceiptDraft(draft: {
  supermarketId?: string;
  purchaseDate?: string;
  items: ReceiptDraftItem[];
}): ReceiptDraftValidationError[] {
  const errors: ReceiptDraftValidationError[] = [];

  if (!draft.supermarketId) {
    errors.push({ field: 'supermarketId', message: 'Select the supermarket for this receipt.' });
  }
  if (!draft.purchaseDate || Number.isNaN(new Date(draft.purchaseDate).getTime())) {
    errors.push({ field: 'purchaseDate', message: 'Enter a valid purchase date.' });
  }
  if (draft.items.length === 0) {
    errors.push({ field: 'items', message: 'Add at least one product.' });
  }

  draft.items.forEach((item, index) => {
    if (!item.rawName.trim()) {
      errors.push({ field: `items.${index}.rawName`, message: 'Product name is required.' });
    }
    if (item.quantity <= 0) {
      errors.push({ field: `items.${index}.quantity`, message: 'Quantity must be greater than zero.' });
    }
    if (item.unitPrice < 0) {
      errors.push({ field: `items.${index}.unitPrice`, message: 'Unit price cannot be negative.' });
    }
    if (item.discountAmount < 0) {
      errors.push({ field: `items.${index}.discountAmount`, message: 'Discount cannot be negative.' });
    }
  });

  return errors;
}

export function calculateReceiptTotal(items: ReceiptDraftItem[]): number {
  return items.reduce((sum, item) => sum + item.unitPrice * item.quantity - item.discountAmount, 0);
}
