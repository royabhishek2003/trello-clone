import React, { useState, memo } from 'react';
import { FileImage, FileText, FileArchive, FileVideo, File, ExternalLink, Trash2, Edit2, Check, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image': return <FileImage className="h-6 w-6" />;
    case 'pdf':
    case 'document': return <FileText className="h-6 w-6" />;
    case 'zip': return <FileArchive className="h-6 w-6" />;
    case 'video': return <FileVideo className="h-6 w-6" />;
    default: return <File className="h-6 w-6" />;
  }
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export const AttachmentItem = memo(({ attachment, onDelete, onRename, onPreview }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(attachment.fileName);

  const handleSaveRename = () => {
    if (newName.trim() !== '' && newName !== attachment.fileName) {
      onRename(attachment._id, newName);
    } else {
      setNewName(attachment.fileName); // reset
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') {
      setNewName(attachment.fileName);
      setIsEditing(false);
    }
  };

  return (
    <div className="flex items-start gap-x-4 mb-3 hover:bg-neutral-100 p-2 rounded-md transition-colors group">
      {/* Thumbnail or Icon */}
      <div 
        className="w-[112px] h-[80px] rounded-md bg-neutral-200 shrink-0 flex items-center justify-center overflow-hidden cursor-pointer relative"
        onClick={() => attachment.isImage ? onPreview(attachment.fileUrl) : window.open(attachment.fileUrl, '_blank')}
      >
        {attachment.isImage ? (
          <img 
            src={attachment.fileUrl} 
            alt={attachment.fileName} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="text-neutral-500">
            {getFileIcon(attachment.fileType)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0">
        {!isEditing ? (
          <p 
            className="font-bold text-neutral-800 text-sm truncate cursor-pointer hover:underline"
            onClick={() => attachment.isImage ? onPreview(attachment.fileUrl) : window.open(attachment.fileUrl, '_blank')}
          >
            {attachment.fileName}
          </p>
        ) : (
          <div className="flex items-center gap-x-1 mb-1">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="h-7 text-sm px-2 w-full max-w-[200px]"
            />
            <Button variant="ghost" size="icon" className="h-7 w-7 text-green-600" onClick={handleSaveRename}>
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600" onClick={() => { setIsEditing(false); setNewName(attachment.fileName); }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="text-xs text-neutral-500 flex items-center gap-x-2 mt-1">
          <span>Added {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}</span>
          <span>•</span>
          <span>{formatBytes(attachment.fileSize)}</span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-x-2 mt-2 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
          <Button 
            variant="ghost" 
            className="h-auto p-1 text-xs text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
            onClick={() => window.open(attachment.fileUrl, '_blank')}
          >
            <ExternalLink className="h-3 w-3 mr-1 inline" /> Open
          </Button>
          {!isEditing && (
            <Button 
              variant="ghost" 
              className="h-auto p-1 text-xs text-neutral-600 hover:text-neutral-900 underline underline-offset-2"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="h-3 w-3 mr-1 inline" /> Edit
            </Button>
          )}
          <Button 
            variant="ghost" 
            className="h-auto p-1 text-xs text-red-600 hover:text-red-700 underline underline-offset-2"
            onClick={() => onDelete(attachment._id)}
          >
            <Trash2 className="h-3 w-3 mr-1 inline" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
});
