import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CurrencyCode } from '../../types/entities';

export type ThemePreference = 'dark' | 'system';

interface PreferencesState {
  currency: CurrencyCode;
  theme: ThemePreference;
  reduceMotion: boolean;
  notificationsEnabled: boolean;
}

const initialState: PreferencesState = {
  currency: 'EGP',
  theme: 'dark',
  reduceMotion: false,
  notificationsEnabled: true,
};

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState,
  reducers: {
    setCurrency(state, action: PayloadAction<CurrencyCode>) {
      state.currency = action.payload;
    },
    setTheme(state, action: PayloadAction<ThemePreference>) {
      state.theme = action.payload;
    },
    setReduceMotion(state, action: PayloadAction<boolean>) {
      state.reduceMotion = action.payload;
    },
    setNotificationsEnabled(state, action: PayloadAction<boolean>) {
      state.notificationsEnabled = action.payload;
    },
  },
});

export const { setCurrency, setTheme, setReduceMotion, setNotificationsEnabled } = preferencesSlice.actions;
export default preferencesSlice.reducer;
