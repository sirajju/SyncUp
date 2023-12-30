import { createSlice, configureStore, combineReducers } from '@reduxjs/toolkit';

const userSlice = createSlice({
  name: "userContext",
  initialState: { value: {} },
  reducers: {
    setUserData: (state, action) => {
      state.value = action.payload;
    },
  },
});
const progressContext = createSlice({
  name: "progressContext",
  initialState: { value: false },
  reducers: {
    showLoading: (state) => {
      state.value = true;
    },
    hideLoading: (state) => {
      state.value = false;
    },
  },
});
const adminContext = createSlice({
  name: "adminContext",
  initialState: {  },
  reducers: {
    setAuthConfig: (state, action) => {
      return state = action.payload
    }
  }
})
export const { showLoading, hideLoading } = progressContext.actions;
export const { setUserData } = userSlice.actions;
export const { setAuthConfig } = adminContext.actions
const rootReducer = combineReducers({
  progress: progressContext.reducer,
  user: userSlice.reducer,
  admin: adminContext.reducer
});
export const store = configureStore({
  reducer: rootReducer,
});

