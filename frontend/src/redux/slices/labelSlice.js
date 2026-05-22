import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  labels: [],
  loading: false,
  error: null,
};

export const fetchLabels = createAsyncThunk(
  'labels/fetchLabels',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/boards/${boardId}/labels`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to fetch labels');
    }
  }
);

export const createLabel = createAsyncThunk(
  'labels/createLabel',
  async ({ boardId, data }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/boards/${boardId}/labels`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to create label');
    }
  }
);

export const updateLabel = createAsyncThunk(
  'labels/updateLabel',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/labels/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update label');
    }
  }
);

export const deleteLabel = createAsyncThunk(
  'labels/deleteLabel',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/labels/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete label');
    }
  }
);

const labelSlice = createSlice({
  name: 'labels',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLabels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLabels.fulfilled, (state, action) => {
        state.loading = false;
        state.labels = action.payload;
      })
      .addCase(fetchLabels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createLabel.fulfilled, (state, action) => {
        state.labels.push(action.payload);
      })
      .addCase(updateLabel.fulfilled, (state, action) => {
        const index = state.labels.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.labels[index] = action.payload;
        }
      })
      .addCase(deleteLabel.fulfilled, (state, action) => {
        state.labels = state.labels.filter(l => l._id !== action.payload);
      });
  },
});

export default labelSlice.reducer;
