import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  isPro: false,
  availableCount: 0,
  subscription: null,
  loading: false,
  error: null,
};

export const checkSubscription = createAsyncThunk(
  'subscription/checkSubscription',
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/subscriptions/check?orgId=${orgId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to check subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscription',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(checkSubscription.pending, (state) => {
        state.loading = true;
      })
      .addCase(checkSubscription.fulfilled, (state, action) => {
        state.loading = false;
        state.isPro = action.payload.isPro;
        state.subscription = action.payload.subscription;
        state.availableCount = action.payload.availableCount;
      })
      .addCase(checkSubscription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isPro = false;
        state.subscription = null;
        state.availableCount = 0;
      });
  },
});

export default subscriptionSlice.reducer;
