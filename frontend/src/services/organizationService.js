import api from './api';

export const getOrganizationsApi = async () => {
  const response = await api.get('/api/orgs');
  return response.data;
};

export const createOrganizationApi = async (orgData) => {
  const response = await api.post('/api/orgs', orgData);
  return response.data;
};

export const getOrganizationApi = async (orgId) => {
  const response = await api.get(`/api/orgs/${orgId}`);
  return response.data;
};

export const updateOrganizationApi = async (orgId, orgData) => {
  const response = await api.patch(`/api/orgs/${orgId}`, orgData);
  return response.data;
};

export const getOrgActivityLogsApi = async (orgId) => {
  const response = await api.get(`/api/orgs/${orgId}/activity`);
  return response.data;
};
