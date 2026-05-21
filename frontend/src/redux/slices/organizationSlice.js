import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

const initialState = {
  organizations: [],
  currentOrg: null,
  loading: false,
  error: null,
};

export const fetchOrganizations = createAsyncThunk(
  'organizations/fetchOrganizations',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/orgs');
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch organizations');
    }
  }
);

export const createOrganization = createAsyncThunk(
  'organizations/createOrganization',
  async (orgData, { rejectWithValue }) => {
    try {
      const response = await api.post('/api/orgs', orgData);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to create organization');
    }
  }
);

const orgSlice = createSlice({
  name: 'organizations',
  initialState,
  reducers: {
    setCurrentOrg: (state, action) => {
      state.currentOrg = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrganizations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchOrganizations.fulfilled, (state, action) => {
        state.loading = false;
        state.organizations = action.payload;
        if (!state.currentOrg && action.payload.length > 0) {
          state.currentOrg = action.payload[0];
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organizations.push(action.payload);
        state.currentOrg = action.payload;
      });
  },
});

export const { setCurrentOrg } = orgSlice.actions;
export default orgSlice.reducer;
