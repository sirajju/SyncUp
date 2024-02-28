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
      if (state.value?.length) {
        state.value = [...state.value.filter(el => el.sentTime != action.payload.sentTime), action.payload];
      } else {
        state.value = [action.payload];

      }
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
      if (state.value?.length) {
        state.value = state.value.map(el => {
          if (el.senderId == action.payload) {
            return { ...el, isDelivered: true }
          } else {
            return el
          }
        })
      }
    },
    deleteMessage: (state, action) => {
      if (state.value?.length) {
        state.value = state.value.map(el => {
          if (el._id == action.payload) {
            return { ...el, isDeleted: true }
          } else {
            return el
          }
        })
      }
    },
    markEdited: (state, action) => {
      if (state.value?.length) {
        state.value = state.value.map(el => {
          if (el._id == action.payload.msgId) {
            return { ...el, isEdited: true, editedContent: el.content, content: action.payload.content }
          } else {
            return el
          }
        })
      }
    },
    markSent: (state, action) => {
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
  initialState: { value: {} },
  reducers: {
    setCallData: (state, action) => {
      state.value = { ...state.value, ...action.payload }
    },
  },
});
const chatState = createSlice({
  name: "chatState",
  initialState: { type: null, data: null },
  reducers: {
    setChat: (state, action) => {
      state = action.payload
    }
  }
})

const adsData = createSlice({
  name: 'ads',
  initialState: { value: {} },
  reducers: {
    setAds: (state, action) => {
      state.value = action.payload
    }
  }
})

const notesData = createSlice({
  name: "notes",
  initialState: { value: {} },
  reducers: {
    setNotes: (state, action) => {
      state.value = action.payload
    },
    addNote: (state, action) => {
      state.value = [...state.value, action.payload]
    },
    setExpired: (state) => {
      state.value = state.value.map(el => el.notes.isExpired = true)
    },
  }
})

const myNotes = createSlice({
  name: "myNotes",
  initialState: { value: [] },
  reducers: {
    setMyNotes: (state, action) => {
      state.value = action.payload
    },
    addMyNote: (state, action) => {
      state.value.push(action.payload)
    },
    setArchived: (state) => {
      state.value = state.value.map(el => ({ ...el, isExpired: true }));
    },
    clearNotes: (state) => {
      state.value = state.value.map(el => {
        if (!el.isExpired) {
          return el
        } else {
          return
        }
      });
    }
  }
})

const callLogs = createSlice({
  name: "callLogs",
  initialState: { value: [] },
  reducers: {
    setLogs: (state, action) => {
      state.value = action.payload
    },
    resetLogs: (state) => {
      state.value = []
    }
  }
})

const scheduledMessages = createSlice({
  name: "scheduledMessages",
  initialState: { value: [] },
  reducers: {
    setScheduledMsgs: (state, action) => {
      state.value = action.payload
    },
    markScheduledSent: (state, action) => {
      state.value = state.value.map(el=>{
        if(el._id.toString()==action.payload){
          return {...el,isScheduleCompleted:true}
        }
        return el
      })
    },
    removeScheduledMsg: (state, action) => {
      state.value = state.value.filter(el => el._id != action.payload)
    },
    resetScheduledMsgs: (state) => {
      state.value = []
    }
  }
})

export const { setConversations, resetConversation } = totalConversations.actions;
export const { setCurrentChat, markDelivered, addNewMessage, deleteMessage, markSeen, markEdited } = currentchat.actions;
export const { showLoading, hideLoading } = progressContext.actions;
export const { setAds } = adsData.actions
export const { setNotes, addNote, setExpired } = notesData.actions
export const { setMyNotes, addMyNote, setArchived, clearNotes } = myNotes.actions
export const { setUserData } = userSlice.actions;
export const { setChat } = chatState.actions;
export const { setCallData } = callState.actions;
export const { setAuthConfig } = adminContext.actions
export const { setLogs, resetLogs } = callLogs.actions
export const { setScheduledMsgs, markScheduledSent, removeScheduledMsg, resetScheduledMsgs } = scheduledMessages.actions

const rootReducer = combineReducers({
  progress: progressContext.reducer,
  user: userSlice.reducer,
  admin: adminContext.reducer,
  currentChat: currentchat.reducer,
  conversations: totalConversations.reducer,
  call: callState.reducer,
  chat: chatState.reducer,
  ads: adsData.reducer,
  notes: notesData.reducer,
  myNotes: myNotes.reducer,
  callLogs: callLogs.reducer,
  scheduledMsg:scheduledMessages.reducer
});

export const store = configureStore({
  reducer: rootReducer,
});

