import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  lists: [],
  loading: false,
  error: null,
};

export const fetchLists = createAsyncThunk(
  'lists/fetchLists',
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/lists?boardId=${boardId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch lists');
    }
  }
);

export const createList = createAsyncThunk(
  'lists/createList',
  async (listData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/lists', listData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create list');
    }
  }
);

export const updateList = createAsyncThunk(
  'lists/updateList',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/lists/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update list');
    }
  }
);

export const deleteList = createAsyncThunk(
  'lists/deleteList',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/lists/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete list');
    }
  }
);

export const copyList = createAsyncThunk(
  'lists/copyList',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.post(`/api/lists/${id}/copy`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to copy list');
    }
  }
);

export const reorderLists = createAsyncThunk(
  'lists/reorderLists',
  async ({ items, boardId }, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/lists/reorder', { items, boardId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reorder lists');
    }
  }
);

const listSlice = createSlice({
  name: 'lists',
  initialState,
  reducers: {
    setListsLocally: (state, action) => {
      state.lists = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLists.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchLists.fulfilled, (state, action) => {
        state.loading = false;
        state.lists = action.payload;
      })
      .addCase(fetchLists.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createList.fulfilled, (state, action) => {
        state.lists.push(action.payload);
      })
      .addCase(updateList.fulfilled, (state, action) => {
        const index = state.lists.findIndex(l => l._id === action.payload._id);
        if (index !== -1) {
          state.lists[index] = { ...state.lists[index], ...action.payload };
        }
      })
      .addCase(deleteList.fulfilled, (state, action) => {
        state.lists = state.lists.filter(l => l._id !== action.payload);
      })
      .addMatcher(
        (action) => action.type === 'cards/updateCard/fulfilled',
        (state, action) => {
          const updatedCard = action.payload;
          for (const list of state.lists) {
            const cardIndex = list.cards?.findIndex(c => c._id === updatedCard._id);
            if (cardIndex !== undefined && cardIndex !== -1) {
              list.cards[cardIndex] = { ...list.cards[cardIndex], ...updatedCard };
              break;
            }
          }
        }
      );
  },
});

export const { setListsLocally } = listSlice.actions;
export default listSlice.reducer;
