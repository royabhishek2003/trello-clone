import React, { useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud } from 'lucide-react';

export const AttachmentDropzone = ({ onUpload, isUploading, progress }) => {
  const onDrop = useCallback((acceptedFiles) => {
    if (acceptedFiles?.length > 0) {
      onUpload(acceptedFiles);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    disabled: isUploading,
    multiple: true,
    maxSize: 25 * 1024 * 1024 // 25MB
  });

  // Global paste handler for images
  useEffect(() => {
    const handlePaste = (e) => {
      if (isUploading) return;
      const items = e.clipboardData?.items;
      if (!items) return;

      const files = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        onUpload(files);
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, [onUpload, isUploading]);

  return (
    <div className="w-full mb-4">
      <div 
        {...getRootProps()} 
        className={`
          relative overflow-hidden rounded-md border-2 border-dashed transition-colors
          ${isDragActive ? 'border-primary bg-primary/10' : 'border-input hover:bg-hover-bg'}
          ${isUploading ? 'opacity-50 cursor-not-allowed border-border bg-muted' : 'cursor-pointer'}
        `}
      >
        <input {...getInputProps()} />
        
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <UploadCloud className={`h-8 w-8 mb-2 ${isDragActive ? 'text-primary' : 'text-muted-foreground'}`} />
          <p className="text-sm font-medium text-foreground">
            {isDragActive ? 'Drop files here' : 'Click or drag files to upload'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Supports any file up to 25MB. You can also paste images directly.
          </p>
        </div>

        {/* Upload Progress Bar Overlay */}
        <AnimatePresence>
          {isUploading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center backdrop-blur-[1px]"
            >
              <div className="w-3/4 max-w-xs h-2 bg-muted rounded-full overflow-hidden mb-2">
                <motion.div 
                  className="h-full bg-primary rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: "linear", duration: 0.2 }}
                />
              </div>
              <span className="text-xs font-semibold text-foreground">{progress}% Uploading...</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
