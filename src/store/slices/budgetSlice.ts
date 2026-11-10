import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { HouseholdBudget } from '../../types/entities';
import { SAMPLE_BUDGET } from '../../constants/sampleData';

interface BudgetState {
  currentBudget: HouseholdBudget | null;
  history: HouseholdBudget[];
}

const initialState: BudgetState = {
  currentBudget: SAMPLE_BUDGET,
  history: [],
};

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {
    setBudget(state, action: PayloadAction<HouseholdBudget>) {
      if (state.currentBudget && state.currentBudget.month !== action.payload.month) {
        state.history.push(state.currentBudget);
      }
      state.currentBudget = action.payload;
    },
    updateMonthlyAmount(state, action: PayloadAction<number>) {
      if (state.currentBudget) {
        state.currentBudget.monthlyAmount = action.payload;
      }
    },
    updateCategoryAllocation(
      state,
      action: PayloadAction<{ categoryId: string; allocatedAmount: number }>,
    ) {
      if (!state.currentBudget) return;
      const existing = state.currentBudget.categoryAllocations.find(
        (c) => c.categoryId === action.payload.categoryId,
      );
      if (existing) {
        existing.allocatedAmount = action.payload.allocatedAmount;
      } else {
        state.currentBudget.categoryAllocations.push({
          categoryId: action.payload.categoryId as HouseholdBudget['categoryAllocations'][number]['categoryId'],
          allocatedAmount: action.payload.allocatedAmount,
        });
      }
    },
  },
});

export const { setBudget, updateMonthlyAmount, updateCategoryAllocation } = budgetSlice.actions;
export default budgetSlice.reducer;
