import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // defaults to localStorage for web

// Import slices (we'll create these next)
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';
import listReducer from './slices/listSlice';
import cardReducer from './slices/cardSlice';
import orgReducer from './slices/organizationSlice';
import uiReducer from './slices/uiSlice';
import subscriptionReducer from './slices/subscriptionSlice';

const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['auth'], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  boards: boardReducer,
  lists: listReducer,
  cards: cardReducer,
  organizations: orgReducer,
  subscription: subscriptionReducer,
  ui: uiReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE', 'persist/REGISTER'],
      },
    }),
});

export const persistor = persistStore(store);
