import { configureStore } from '@reduxjs/toolkit';

// Import slices
import authReducer from './slices/authSlice';
import boardReducer from './slices/boardSlice';
import listReducer from './slices/listSlice';
import cardReducer from './slices/cardSlice';
import orgReducer from './slices/organizationSlice';
import uiReducer from './slices/uiSlice';
import subscriptionReducer from './slices/subscriptionSlice';
import labelReducer from './slices/labelSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    boards: boardReducer,
    lists: listReducer,
    cards: cardReducer,
    organizations: orgReducer,
    subscription: subscriptionReducer,
    ui: uiReducer,
    labels: labelReducer,
  },
});
