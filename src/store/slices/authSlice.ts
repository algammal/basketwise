import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../../types/entities';

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: {
    id: 'user-1',
    name: 'Ahmed',
    currency: 'EGP',
    createdAt: new Date().toISOString(),
  },
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User | null>) {
      state.user = action.payload;
    },
  },
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
