import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { ShoppingPlan, ShoppingPlanItem } from '../../types/entities';

interface PlanningState {
  plans: ShoppingPlan[];
  activePlanId: string | null;
}

const DEFAULT_PLAN: ShoppingPlan = {
  id: 'plan-default',
  userId: 'user-1',
  name: 'This Month',
  createdAt: new Date().toISOString(),
  items: [],
};

const initialState: PlanningState = {
  plans: [DEFAULT_PLAN],
  activePlanId: DEFAULT_PLAN.id,
};

const planningSlice = createSlice({
  name: 'planning',
  initialState,
  reducers: {
    addPlanItem(state, action: PayloadAction<{ planId: string; item: ShoppingPlanItem }>) {
      const plan = state.plans.find((p) => p.id === action.payload.planId);
      if (plan) plan.items.push(action.payload.item);
    },
    updatePlanItem(
      state,
      action: PayloadAction<{ planId: string; itemId: string; changes: Partial<ShoppingPlanItem> }>,
    ) {
      const plan = state.plans.find((p) => p.id === action.payload.planId);
      const item = plan?.items.find((i) => i.id === action.payload.itemId);
      if (item) Object.assign(item, action.payload.changes);
    },
    removePlanItem(state, action: PayloadAction<{ planId: string; itemId: string }>) {
      const plan = state.plans.find((p) => p.id === action.payload.planId);
      if (plan) plan.items = plan.items.filter((i) => i.id !== action.payload.itemId);
    },
    setActivePlan(state, action: PayloadAction<string>) {
      state.activePlanId = action.payload;
    },
  },
});

export const { addPlanItem, updatePlanItem, removePlanItem, setActivePlan } = planningSlice.actions;
export default planningSlice.reducer;
