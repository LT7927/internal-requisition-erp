import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AuthState {
  isAuthenticated: boolean;
  accessToken: string | null;
  user: any | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Lưu Access Token (chỉ sống 5 phút trên RAM) và thông tin User
    setCredentials: (state, action: PayloadAction<{ accessToken: string; user?: any }>) => {
      state.isAuthenticated = true;
      state.accessToken = action.payload.accessToken;
      if (action.payload.user) {
        state.user = action.payload.user;
      }
    },
    // Xóa sạch bộ nhớ khi Logout
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem('refreshToken');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;