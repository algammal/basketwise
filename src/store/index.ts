import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import budgetReducer from './slices/budgetSlice';
import receiptReducer from './slices/receiptSlice';
import productReducer from './slices/productSlice';
import planningReducer from './slices/planningSlice';
import preferencesReducer from './slices/preferencesSlice';
import navigationReducer from './slices/navigationSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    budget: budgetReducer,
    receipts: receiptReducer,
    products: productReducer,
    planning: planningReducer,
    preferences: preferencesReducer,
    navigation: navigationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
