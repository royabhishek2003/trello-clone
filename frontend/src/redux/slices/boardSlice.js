import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  boards: [],
  currentBoard: null,
  loading: false,
  error: null,
};

export const fetchBoards = createAsyncThunk(
  'boards/fetchBoards',
  async (orgId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/boards?orgId=${orgId}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch boards');
    }
  }
);

export const fetchBoardById = createAsyncThunk(
  'boards/fetchBoardById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/api/boards/${id}`);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch board');
    }
  }
);

export const createBoard = createAsyncThunk(
  'boards/createBoard',
  async (boardData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/boards', boardData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create board');
    }
  }
);

export const deleteBoard = createAsyncThunk(
  'boards/deleteBoard',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/api/boards/${id}`);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to delete board');
    }
  }
);

export const updateBoard = createAsyncThunk(
  'boards/updateBoard',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/boards/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update board');
    }
  }
);

export const reorderBoards = createAsyncThunk(
  'boards/reorderBoards',
  async ({ items, orgId }, { rejectWithValue }) => {
    try {
      const response = await api.put('/api/boards/reorder', { items, orgId });
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to reorder boards');
    }
  }
);

const boardSlice = createSlice({
  name: 'boards',
  initialState,
  reducers: {
    clearBoardError: (state) => {
      state.error = null;
    },
    setCurrentBoard: (state, action) => {
      state.currentBoard = action.payload;
    },
    setBoardsLocally: (state, action) => {
      state.boards = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoards.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoards.fulfilled, (state, action) => {
        state.loading = false;
        state.boards = action.payload;
      })
      .addCase(fetchBoards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchBoardById.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchBoardById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBoard = action.payload;
      })
      .addCase(fetchBoardById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createBoard.fulfilled, (state, action) => {
        state.boards.push(action.payload);
      })
      .addCase(deleteBoard.fulfilled, (state, action) => {
        state.boards = state.boards.filter(b => b._id !== action.payload);
        if (state.currentBoard?._id === action.payload) {
          state.currentBoard = null;
        }
      })
      .addCase(updateBoard.fulfilled, (state, action) => {
        const index = state.boards.findIndex(b => b._id === action.payload._id);
        if (index !== -1) {
          state.boards[index] = action.payload;
        }
        if (state.currentBoard?._id === action.payload._id) {
          state.currentBoard = { ...state.currentBoard, ...action.payload };
        }
      })
      .addCase(reorderBoards.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});

export const { clearBoardError, setCurrentBoard, setBoardsLocally } = boardSlice.actions;
export default boardSlice.reducer;
