import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Receipt, ReceiptItem } from '../../types/entities';
import { SAMPLE_RECEIPTS, SAMPLE_RECEIPT_ITEMS } from '../../constants/sampleData';

interface ReceiptState {
  receipts: Receipt[];
  itemsByReceiptId: Record<string, ReceiptItem[]>;
}

function groupItemsByReceipt(items: ReceiptItem[]): Record<string, ReceiptItem[]> {
  return items.reduce<Record<string, ReceiptItem[]>>((acc, item) => {
    (acc[item.receiptId] ??= []).push(item);
    return acc;
  }, {});
}

const initialState: ReceiptState = {
  receipts: SAMPLE_RECEIPTS,
  itemsByReceiptId: groupItemsByReceipt(SAMPLE_RECEIPT_ITEMS),
};

const receiptSlice = createSlice({
  name: 'receipts',
  initialState,
  reducers: {
    addReceipt(state, action: PayloadAction<{ receipt: Receipt; items: ReceiptItem[] }>) {
      state.receipts.unshift(action.payload.receipt);
      state.itemsByReceiptId[action.payload.receipt.id] = action.payload.items;
    },
    deleteReceipt(state, action: PayloadAction<string>) {
      state.receipts = state.receipts.filter((r) => r.id !== action.payload);
      delete state.itemsByReceiptId[action.payload];
    },
    updateReceiptItems(state, action: PayloadAction<{ receiptId: string; items: ReceiptItem[] }>) {
      state.itemsByReceiptId[action.payload.receiptId] = action.payload.items;
    },
  },
});

export const { addReceipt, deleteReceipt, updateReceiptItems } = receiptSlice.actions;
export default receiptSlice.reducer;
