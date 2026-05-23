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

export const deleteOrganization = createAsyncThunk(
  'organizations/deleteOrganization',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/api/orgs/${id}`);
      return { id, message: response.data.message };
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to delete organization');
    }
  }
);

export const updateOrganization = createAsyncThunk(
  'organizations/updateOrganization',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/api/orgs/${id}`, data);
      return response.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.error || 'Failed to update organization');
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
        } else if (state.currentOrg) {
          // Update currentOrg with fresh data if it exists in the fetched list
          const updatedCurrent = action.payload.find(org => org._id === state.currentOrg._id);
          if (updatedCurrent) {
            state.currentOrg = updatedCurrent;
          }
        }
      })
      .addCase(fetchOrganizations.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createOrganization.fulfilled, (state, action) => {
        state.organizations.push(action.payload);
        state.currentOrg = action.payload;
      })
      .addCase(deleteOrganization.fulfilled, (state, action) => {
        state.organizations = state.organizations.filter(org => org._id !== action.payload.id);
        if (state.currentOrg && state.currentOrg._id === action.payload.id) {
          state.currentOrg = state.organizations.length > 0 ? state.organizations[0] : null;
        }
      })
      .addCase(updateOrganization.fulfilled, (state, action) => {
        const index = state.organizations.findIndex(org => org._id === action.payload._id);
        if (index !== -1) {
          state.organizations[index] = action.payload;
        }
        if (state.currentOrg && state.currentOrg._id === action.payload._id) {
          state.currentOrg = action.payload;
        }
      });
  },
});

export const { setCurrentOrg } = orgSlice.actions;
export default orgSlice.reducer;
