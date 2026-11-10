import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { NavDestinationId } from '../../navigation/destinations';

interface NavigationState {
  /** Last confirmed circular-nav destination, kept for highlighting the right segment when the wheel reopens. */
  lastDestination: NavDestinationId;
}

const initialState: NavigationState = {
  lastDestination: 'overview',
};

const navigationSlice = createSlice({
  name: 'navigation',
  initialState,
  reducers: {
    setLastDestination(state, action: PayloadAction<NavDestinationId>) {
      state.lastDestination = action.payload;
    },
  },
});

export const { setLastDestination } = navigationSlice.actions;
export default navigationSlice.reducer;
