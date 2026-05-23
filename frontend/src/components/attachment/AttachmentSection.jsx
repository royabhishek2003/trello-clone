import React, { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import { AttachmentItem } from './AttachmentItem';
import { AttachmentDropzone } from './AttachmentDropzone';
import attachmentService from '../../services/attachmentService';
import { Button } from '../ui/button';

export const AttachmentSection = forwardRef(({ cardId, onPreviewImage, coverImageKey, onSetCover }, ref) => {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showDropzone, setShowDropzone] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkUploading, setLinkUploading] = useState(false);

  useImperativeHandle(ref, () => ({
    openDropzone: () => setShowDropzone(true)
  }));

  const handleAddLink = async () => {
    try {
      setLinkUploading(true);
      const newAttachment = await attachmentService.addLinkAttachment(cardId, linkUrl, linkTitle);
      setAttachments(prev => [newAttachment, ...prev]);
      toast.success('Link attached');
      setLinkUrl('');
      setLinkTitle('');
      setShowDropzone(false);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to attach link');
    } finally {
      setLinkUploading(false);
    }
  };

  const fetchAttachments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await attachmentService.getAttachments(cardId);
      setAttachments(data);
    } catch (error) {
      toast.error('Failed to load attachments');
    } finally {
      setLoading(false);
    }
  }, [cardId]);

  useEffect(() => {
    fetchAttachments();
  }, [fetchAttachments]);

  const handleUpload = async (acceptedFiles) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const newAttachments = await attachmentService.uploadAttachments(cardId, acceptedFiles, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });
      
      setAttachments(prev => [...newAttachments, ...prev]);
      toast.success(`${acceptedFiles.length} file(s) attached`);
      setShowDropzone(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Upload failed');
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      const attachment = attachments.find(a => a._id === attachmentId);
      await attachmentService.deleteAttachment(attachmentId);
      setAttachments(prev => prev.filter(a => a._id !== attachmentId));
      toast.success('Attachment deleted');
      if (attachment && attachment.storageKey === coverImageKey) {
        onSetCover(null);
      }
    } catch (error) {
      toast.error('Failed to delete attachment');
    }
  };

  const handleRename = async (attachmentId, newName, newUrl = null) => {
    try {
      const updated = await attachmentService.renameAttachment(attachmentId, newName, newUrl);
      setAttachments(prev => prev.map(a => a._id === attachmentId ? updated : a));
      toast.success('Attachment updated');
    } catch (error) {
      toast.error('Failed to rename attachment');
    }
  };

  const links = attachments.filter(a => a.fileType === 'link');
  const files = attachments.filter(a => a.fileType !== 'link');

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
          <div className="mb-4 bg-neutral-50 p-3 border border-neutral-200 rounded-md shadow-sm">
            <div className="mb-3">
              <label className="text-xs font-semibold text-neutral-700 mb-1 block">Search or paste a link*</label>
              <input 
                value={linkUrl} 
                onChange={(e) => setLinkUrl(e.target.value)} 
                placeholder="Find recent links or paste a new link" 
                className="w-full h-8 px-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-neutral-700 mb-1 block">Display text (optional)</label>
              <input 
                value={linkTitle} 
                onChange={(e) => setLinkTitle(e.target.value)} 
                placeholder="Text to display" 
                className="w-full h-8 px-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500" 
              />
            </div>
            <div className="flex items-center gap-x-2 mb-4">
              <Button onClick={handleAddLink} disabled={!linkUrl || linkUploading}>Insert</Button>
              <Button variant="ghost" onClick={() => setShowDropzone(false)}>Cancel</Button>
            </div>
            
            <hr className="mb-4 border-neutral-200" />
            <p className="text-xs font-semibold text-neutral-700 mb-2">Or choose a file</p>
            <AttachmentDropzone 
              onUpload={handleUpload} 
              isUploading={uploading} 
              progress={uploadProgress} 
            />
          </div>
        )}

        {links.length > 0 && (
          <div className="mb-6">
            <p className="text-sm font-semibold text-neutral-700 mb-2">Links</p>
            {links.map(attachment => (
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

        {files.length > 0 && (
          <div className="mt-2">
            <p className="text-sm font-semibold text-neutral-700 mb-2">Files</p>
            {files.map(attachment => (
              <AttachmentItem 
                key={attachment._id} 
                attachment={attachment}
                onDelete={handleDelete}
                onRename={handleRename}
                onPreview={onPreviewImage}
                isCover={attachment.storageKey === coverImageKey}
                onSetCover={() => onSetCover(attachment.storageKey)}
                onRemoveCover={() => onSetCover(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});
