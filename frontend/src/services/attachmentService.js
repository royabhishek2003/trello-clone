import api from './api';

const attachmentService = {
  uploadAttachments: async (cardId, files, onUploadProgress) => {
    const formData = new FormData();
    Array.from(files).forEach((file) => {
      formData.append('files', file);
    });

    const response = await api.post(`/api/attachments/${cardId}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  getAttachments: async (cardId) => {
    const response = await api.get(`/api/attachments/${cardId}`);
    return response.data;
  },

  deleteAttachment: async (attachmentId) => {
    const response = await api.delete(`/api/attachments/${attachmentId}`);
    return response.data;
  },

  renameAttachment: async (attachmentId, newName) => {
    const response = await api.patch(`/api/attachments/${attachmentId}`, { fileName: newName });
    return response.data;
  }
};

export default attachmentService;
