import api from './api';

export const createListApi = async (listData) => {
  const response = await api.post('/api/lists', listData);
  return response.data;
};

export const updateListApi = async (listId, listData) => {
  const response = await api.patch(`/api/lists/${listId}`, listData);
  return response.data;
};

export const deleteListApi = async (listId) => {
  const response = await api.delete(`/api/lists/${listId}`);
  return response.data;
};

export const copyListApi = async (listId) => {
  const response = await api.post(`/api/lists/${listId}/copy`);
  return response.data;
};

export const reorderListsApi = async (reorderData) => {
  const response = await api.put('/api/lists/reorder', reorderData);
  return response.data;
};
