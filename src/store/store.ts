import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Sẽ thêm các reducer (như auth, ui) vào đây sau
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;