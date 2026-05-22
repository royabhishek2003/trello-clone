import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isSidebarOpen: true,
  isCardModalOpen: false,
  isProModalOpen: false,
  cardData: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    openCardModal: (state, action) => {
      state.isCardModalOpen = true;
      state.cardData = action.payload;
    },
    closeCardModal: (state) => {
      state.isCardModalOpen = false;
      state.cardData = null;
    },
    openProModal: (state) => {
      state.isProModalOpen = true;
    },
    closeProModal: (state) => {
      state.isProModalOpen = false;
    }
  },
  extraReducers: (builder) => {
    // Listen to card updates to sync the modal UI
    builder.addMatcher(
      (action) => action.type === 'cards/updateCard/fulfilled' || action.type === 'cards/updateCardLabels/fulfilled',
      (state, action) => {
        if (state.cardData && state.cardData._id === action.payload._id) {
          state.cardData = action.payload;
        }
      }
    );
  }
});

export const {
  toggleSidebar,
  openCardModal,
  closeCardModal,
  openProModal,
  closeProModal
} = uiSlice.actions;

export default uiSlice.reducer;
