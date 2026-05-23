import React, { useState, memo } from 'react';
import { FileImage, FileText, FileArchive, FileVideo, File, ExternalLink, MoreHorizontal, Check, X, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { toast } from 'sonner';

const getFileIcon = (fileType) => {
  switch (fileType) {
    case 'image': return <FileImage className="h-6 w-6" />;
    case 'pdf':
    case 'document': return <FileText className="h-6 w-6" />;
    case 'zip': return <FileArchive className="h-6 w-6" />;
    case 'video': return <FileVideo className="h-6 w-6" />;
    case 'link': return <div className="bg-neutral-200/50 p-1.5 rounded"><LinkIcon className="h-5 w-5 text-neutral-600" /></div>;
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

export const AttachmentItem = memo(({ attachment, onDelete, onRename, onPreview, isCover, onSetCover, onRemoveCover, onComment }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newName, setNewName] = useState(attachment.fileName);
  const [newUrl, setNewUrl] = useState(attachment.fileUrl || '');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const handleSaveRename = () => {
    if (newName.trim() !== '') {
      if (attachment.fileType === 'link' && newUrl.trim() !== '') {
        onRename(attachment._id, newName, newUrl);
      } else {
        onRename(attachment._id, newName);
      }
    } else {
      setNewName(attachment.fileName); // reset
      setNewUrl(attachment.fileUrl);
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSaveRename();
    if (e.key === 'Escape') {
      setNewName(attachment.fileName);
      setNewUrl(attachment.fileUrl);
      setIsEditing(false);
    }
  };

  const handleDownload = () => {
    const url = attachment.downloadUrl || attachment.fileUrl;
    const link = document.createElement('a');
    link.href = url;
    link.download = attachment.fileName;
    // target _blank ensures it doesn't navigate away if Content-Disposition fails for some reason
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleAction = (action) => {
    setIsPopoverOpen(false);
    switch (action) {
      case 'edit':
        setIsEditing(true);
        break;
      case 'comment':
        if (onComment) onComment(attachment);
        break;
      case 'download':
        handleDownload();
        break;
      case 'cover':
        if (isCover) {
          onRemoveCover();
        } else {
          onSetCover();
        }
        break;
      case 'remove':
        onDelete(attachment._id);
        break;
      default:
        break;
    }
  };

  return (
    <div className="flex items-center gap-x-4 mb-3 hover:bg-neutral-200/60 p-2 rounded-md transition-colors group">
      {/* Thumbnail or Icon */}
      <div 
        className={`${attachment.fileType === 'link' ? 'w-[48px] h-[48px] bg-neutral-100' : 'w-[112px] h-[80px] bg-neutral-200'} rounded-md shrink-0 flex items-center justify-center overflow-hidden cursor-pointer relative`}
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
          <div className="text-neutral-500 flex items-center justify-center h-full w-full">
            {getFileIcon(attachment.fileType)}
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex flex-col flex-1 min-w-0 py-1">
        {!isEditing ? (
          <p 
            className="font-bold text-neutral-800 text-sm truncate cursor-pointer hover:underline mb-1"
            onClick={() => attachment.isImage ? onPreview(attachment.fileUrl) : window.open(attachment.fileUrl, '_blank')}
          >
            {attachment.fileName}
          </p>
        ) : (
          <div className="flex flex-col gap-y-2 mb-2">
            <div className="flex items-center gap-x-1">
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Link text"
                autoFocus
                className="h-8 text-sm px-2 w-full max-w-[200px]"
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600" onClick={handleSaveRename}>
                <Check className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => { setIsEditing(false); setNewName(attachment.fileName); setNewUrl(attachment.fileUrl); }}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            {attachment.fileType === 'link' && (
              <Input
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Link URL"
                className="h-8 text-sm px-2 w-full max-w-[200px]"
              />
            )}
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="text-xs text-neutral-500 flex items-center gap-x-1.5">
            <span>Added {formatDistanceToNow(new Date(attachment.createdAt), { addSuffix: true })}</span>
            {attachment.fileType !== 'link' && (
              <>
                <span>•</span>
                <span>{formatBytes(attachment.fileSize)}</span>
              </>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-x-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-neutral-600 hover:text-neutral-900"
              onClick={() => window.open(attachment.fileUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>

            <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-neutral-600 hover:text-neutral-900 bg-neutral-200/50 hover:bg-neutral-300"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-1 bg-[#282E33] border-[#282E33] text-[#B6C2CF]" align="end">
                <div className="flex flex-col">
                  <Button variant="ghost" className="justify-start h-8 px-2 hover:bg-[#A6C5E229] hover:text-[#B6C2CF] rounded-sm text-sm font-normal" onClick={() => handleAction('edit')}>
                    Edit
                  </Button>
                  <Button variant="ghost" className="justify-start h-8 px-2 hover:bg-[#A6C5E229] hover:text-[#B6C2CF] rounded-sm text-sm font-normal" onClick={() => handleAction('comment')}>
                    Comment
                  </Button>
                  {attachment.fileType !== 'link' && (
                    <>
                      <Button variant="ghost" className="justify-start h-8 px-2 hover:bg-[#A6C5E229] hover:text-[#B6C2CF] rounded-sm text-sm font-normal" onClick={() => handleAction('download')}>
                        Download
                      </Button>
                      {attachment.isImage && (
                        <Button variant="ghost" className="justify-start h-8 px-2 hover:bg-[#A6C5E229] hover:text-[#B6C2CF] rounded-sm text-sm font-normal" onClick={() => handleAction('cover')}>
                          {isCover ? 'Remove cover' : 'Make cover'}
                        </Button>
                      )}
                    </>
                  )}
                  <Button variant="ghost" className="justify-start h-8 px-2 text-[#EF5C48] hover:bg-[#A6C5E229] hover:text-[#EF5C48] rounded-sm text-sm font-normal" onClick={() => handleAction('remove')}>
                    Remove
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
});
