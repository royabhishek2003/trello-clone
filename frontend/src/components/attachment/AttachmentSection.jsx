import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { AttachmentItem } from './AttachmentItem';
import { AttachmentDropzone } from './AttachmentDropzone';
import attachmentService from '../../services/attachmentService';
import { Button } from '../ui/button';

export const AttachmentSection = forwardRef(({ cardId, onPreviewImage }, ref) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDropzone, setShowDropzone] = useState(false);

  useImperativeHandle(ref, () => ({
    openDropzone: () => setShowDropzone(true)
  }));

  const fetchAttachments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await attachmentService.getAttachments(cardId);
      setAttachments(data);
    } catch (err) {
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleUpload = async (files) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const newAttachments = await attachmentService.uploadAttachments(cardId, files, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      
      setAttachments(prev => [...newAttachments, ...prev]);
      toast.success(`${files.length} file(s) uploaded`);
      setShowDropzone(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to upload files');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      await attachmentService.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a._id !== attachmentId));
      toast.success('Attachment deleted');
    } catch (err) {
      toast.error('Failed to delete attachment');
    }
  };

  const handleRename = async (attachmentId, newName) => {
    try {
      const updated = await attachmentService.renameAttachment(attachmentId, newName);
      setAttachments(prev => prev.map(a => a._id === attachmentId ? updated : a));
      toast.success('Attachment renamed');
    } catch (err) {
      toast.error('Failed to rename attachment');
    }
  };

  if (loading && attachments.length === 0) {
    return (
      <div className="flex items-start gap-x-3 w-full mb-8">
        <Paperclip className="h-5 w-5 mt-0.5 text-neutral-400" />
        <div className="w-full">
          <p className="font-semibold text-neutral-400 mb-4">Attachments</p>
          <div className="space-y-3">
            <div className="w-full h-[80px] bg-neutral-200 animate-pulse rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (attachments.length === 0 && !showDropzone) {
    return null; // The parent component can render the "Add Attachment" button
  }

  return (
    <div className="flex items-start gap-x-3 w-full mb-8">
      <Paperclip className="h-5 w-5 mt-0.5 text-neutral-700" />
      <div className="w-full">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-neutral-700">Attachments</p>
          {!showDropzone && (
            <Button variant="gray" size="sm" onClick={() => setShowDropzone(true)}>
              Add
            </Button>
          )}
        </div>

        {showDropzone && (
          <AttachmentDropzone 
            onUpload={handleUpload} 
            isUploading={uploading} 
            progress={uploadProgress} 
          />
        )}

        {attachments.length > 0 && (
          <div className="mt-2">
            {attachments.map(attachment => (
              <AttachmentItem 
                key={attachment._id} 
                attachment={attachment}
                onDelete={handleDelete}
                onRename={handleRename}
                onPreview={onPreviewImage}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
