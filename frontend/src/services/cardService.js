import api from './api';

export const getCardApi = async (cardId) => {
  const response = await api.get(`/api/cards/${cardId}`);
  return response.data;
};

export const getCardLogsApi = async (cardId) => {
  const response = await api.get(`/api/cards/${cardId}/activity`);
  return response.data;
};

export const createCardApi = async (cardData) => {
  const response = await api.post('/api/cards', cardData);
  return response.data;
};

export const updateCardApi = async (cardId, cardData) => {
  const response = await api.patch(`/api/cards/${cardId}`, cardData);
  return response.data;
};

export const deleteCardApi = async (cardId) => {
  const response = await api.delete(`/api/cards/${cardId}`);
  return response.data;
};

export const copyCardApi = async (cardId) => {
  const response = await api.post(`/api/cards/${cardId}/copy`);
  return response.data;
};

export const reorderCardsApi = async (reorderData) => {
  const response = await api.put('/api/cards/reorder', reorderData);
  return response.data;
};
