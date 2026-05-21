import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  loading: false,
  error: null,
};

export const createCard = createAsyncThunk(
  'cards/createCard',
  async (cardData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/cards', cardData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create card');
    }
  }
);

export const updateCard = createAsyncThunk(
  'cards/updateCard',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/cards/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update card');
    }
  }
);

export const deleteCard = createAsyncThunk(
  'cards/deleteCard',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/cards/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete card');
    }
  }
);

export const reorderCards = createAsyncThunk(
  'cards/reorderCards',
  async (reorderData, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/cards/reorder', reorderData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reorder cards');
    }
  }
);

const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(createCard.pending, (state) => {
        state.loading = true;
      })
      .addCase(createCard.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(createCard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default cardSlice.reducer;
