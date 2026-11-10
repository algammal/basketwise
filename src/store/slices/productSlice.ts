import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Product, ProductPriceObservation, ProductPreference } from '../../types/entities';
import { SAMPLE_PRODUCTS, SAMPLE_PRICE_OBSERVATIONS } from '../../constants/sampleData';

interface ProductState {
  products: Product[];
  priceObservations: ProductPriceObservation[];
  preferences: Record<string, ProductPreference>;
}

const initialState: ProductState = {
  products: SAMPLE_PRODUCTS,
  priceObservations: SAMPLE_PRICE_OBSERVATIONS,
  preferences: {},
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    addPriceObservation(state, action: PayloadAction<ProductPriceObservation>) {
      state.priceObservations.push(action.payload);
    },
    setFavorite(state, action: PayloadAction<{ productId: string; isFavorite: boolean }>) {
      const pref = state.preferences[action.payload.productId] ?? {
        productId: action.payload.productId,
        isFavorite: false,
        isMustBuy: false,
      };
      pref.isFavorite = action.payload.isFavorite;
      state.preferences[action.payload.productId] = pref;
    },
    setMustBuy(state, action: PayloadAction<{ productId: string; isMustBuy: boolean }>) {
      const pref = state.preferences[action.payload.productId] ?? {
        productId: action.payload.productId,
        isFavorite: false,
        isMustBuy: false,
      };
      pref.isMustBuy = action.payload.isMustBuy;
      state.preferences[action.payload.productId] = pref;
    },
  },
});

export const { addPriceObservation, setFavorite, setMustBuy } = productSlice.actions;
export default productSlice.reducer;
