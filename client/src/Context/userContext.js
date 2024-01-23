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
  initialState: {},
  reducers: {
    setAuthConfig: (state, action) => {
      return state = action.payload
    }
  }
})

const currentchat = createSlice({
  name: "currentChat",
  initialState: { value: [] },
  reducers: {
    setCurrentChat: (state, action) => {
      state.value = action.payload;
    },
    addNewMessage: (state, action) => {
      state.value = [...state.value, action.payload];
    },
    markSeen: (state, action) => {
      state.value = state.value.map(el => {
        if (el.senderId == action.payload) {
          return { ...el, isReaded: true }
        } else {
          return el
        }
      })
    },
    markDelivered: (state, action) => {
      state.value = state.value.map(el => {
        if (el.senderId == action.payload) {
          return { ...el, isDelivered: true }
        } else {
          return el
        }
      })
    },
    markSent:(state, action) => {
      state.value = state.value.map(el => {
        if (el.senderId == action.payload) {
          return { ...el, isSent: true }
        } else {
          return el
        }
      })
    },
  },
});
const totalConversations = createSlice({
  name: "conversations",
  initialState: { value: [] },
  reducers: {
    setConversations: (state, action) => {
      state.value = action.payload;
    },
    resetConversation: (state) => {
      state.value = []
    }
  },
});
const callState = createSlice({
  name: "callState",
  initialState:  {value:{}} ,
  reducers: {
    setCallData: (state, action) => {
      state.value = {...state.value,...action.payload}
    },
  },
});

export const { setConversations, resetConversation } = totalConversations.actions;
export const { setCurrentChat, markDelivered, markSeen, addNewMessage,markSent } = currentchat.actions;
export const { showLoading, hideLoading } = progressContext.actions;
export const { setUserData } = userSlice.actions;
export const { setCallData } = callState.actions;
export const { setAuthConfig } = adminContext.actions
const rootReducer = combineReducers({
  progress: progressContext.reducer,
  user: userSlice.reducer,
  admin: adminContext.reducer,
  currentChat: currentchat.reducer,
  conversations: totalConversations.reducer,
  call:callState.reducer
});
export const store = configureStore({
  reducer: rootReducer,
});

