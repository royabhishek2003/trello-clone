import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';

export const BackgroundUpload = ({ onUpload, isUploading }) => {
  const [compressing, setCompressing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);

  const onDrop = useCallback(async (acceptedFiles) => {
    if (!acceptedFiles || acceptedFiles.length === 0) return;
    
    const file = acceptedFiles[0];
    
    // Quick preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setError(null);
    setCompressing(true);

    try {
      const options = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(file, options);
      setCompressing(false);
      onUpload(compressedFile);
    } catch (err) {
      console.error('Compression error:', err);
      setError('Failed to process image.');
      setCompressing(false);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp']
    },
    maxSize: 10 * 1024 * 1024, // 10MB limit before compression
    multiple: false
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div
        {...getRootProps()}
        className={`w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center p-4 cursor-pointer transition-colors ${
          isDragActive ? 'border-blue-500 bg-blue-50' : 
          isDragReject ? 'border-red-500 bg-red-50' : 
          'border-gray-300 hover:border-gray-400 bg-gray-50/50'
        }`}
        aria-label="Upload custom background image"
        role="button"
        tabIndex={0}
      >
        <input {...getInputProps()} />
        
        {compressing || isUploading ? (
          <div className="flex flex-col items-center text-gray-500">
            <Loader2 className="w-8 h-8 animate-spin mb-2" />
            <span className="text-sm">{compressing ? 'Compressing...' : 'Uploading...'}</span>
          </div>
        ) : previewUrl ? (
          <div className="w-full h-full relative rounded overflow-hidden">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover opacity-50" />
            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
               <UploadCloud className="w-8 h-8 text-white drop-shadow-md" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-gray-500 text-center">
            <UploadCloud className="w-8 h-8 mb-2" />
            <span className="text-sm font-medium">Click or drag image here</span>
            <span className="text-xs text-gray-400 mt-1">JPG, PNG, WEBP up to 10MB</span>
          </div>
        )}
      </div>
      {error && <p className="text-red-500 text-xs mt-2">{error}</p>}
    </div>
  );
};
