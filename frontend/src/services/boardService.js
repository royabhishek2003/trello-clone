import api from './api';

export const getBoardsForOrg = async (orgId) => {
  const response = await api.get(`/api/boards?orgId=${orgId}`);
  return response.data;
};

export const createBoardApi = async (boardData) => {
  const response = await api.post('/api/boards', boardData);
  return response.data;
};

export const updateBoardApi = async (boardId, boardData) => {
  const response = await api.patch(`/api/boards/${boardId}`, boardData);
  return response.data;
};

export const deleteBoardApi = async (boardId) => {
  const response = await api.delete(`/api/boards/${boardId}`);
  return response.data;
};
