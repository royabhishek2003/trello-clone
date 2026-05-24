import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, Image as ImageIcon, Droplet, Upload, Check } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { searchPhotos, getRandomPhotos } from '../../services/unsplashService';
import { SOLID_COLORS, GRADIENTS } from '../../constants/boardBackgrounds';
import { BackgroundUpload } from './BackgroundUpload';

// Skeleton Loader for Images
const ImageSkeleton = () => (
  <div className="w-full h-24 rounded-md bg-gray-200 animate-pulse" />
);

export const BoardBackgroundPicker = ({
  isOpen,
  onClose,
  currentBackground,
  onSelectBackground,
  onUploadBackground,
  isUploading
}) => {
  const [activeTab, setActiveTab] = useState('photos');
  const [photos, setPhotos] = useState([]);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery] = useDebounce(searchQuery, 500);

  // Fetch photos on load or search
  useEffect(() => {
    let isMounted = true;
    const fetchPhotos = async () => {
      if (activeTab !== 'photos') return;
      
      setLoadingPhotos(true);
      try {
        const results = debouncedSearchQuery
          ? await searchPhotos(debouncedSearchQuery, 1, 30)
          : await getRandomPhotos(30);
          
        if (isMounted) {
          // Unsplash random response might be an array, search response is under 'results' handled in service
          setPhotos(Array.isArray(results) ? results : []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoadingPhotos(false);
      }
    };
    fetchPhotos();
    return () => { isMounted = false; };
  }, [debouncedSearchQuery, activeTab]);

  // Handle ESC to close
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Handle Photo Selection
  const handlePhotoSelect = useCallback((photo) => {
    const backgroundMeta = {
      username: photo.user.name,
      userLink: photo.user.links.html,
      thumb: photo.urls.thumb,
      full: photo.urls.full,
      blurHash: photo.blur_hash
    };
    onSelectBackground('image', photo.urls.full, photo.urls.thumb, backgroundMeta);
  }, [onSelectBackground]);

  // Handle Color/Gradient
  const handleStyleSelect = useCallback((type, value) => {
    onSelectBackground(type, value, value, {});
  }, [onSelectBackground]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Mobile Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
            onClick={onClose}
          />
          
          {/* Picker Container */}
          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 top-14 right-0 z-50 w-full md:w-[350px] bg-card shadow-2xl flex flex-col sm:rounded-tl-2xl md:rounded-none text-card-foreground"
            role="dialog"
            aria-label="Board background picker"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-foreground">Board Background</h2>
              <button 
                onClick={onClose}
                className="p-2 text-muted-foreground hover:bg-hover-bg rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                aria-label="Close picker"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-1 bg-muted/30 border-b">
              {[
                { id: 'photos', icon: ImageIcon, label: 'Photos' },
                { id: 'colors', icon: Droplet, label: 'Colors' },
                { id: 'upload', icon: Upload, label: 'Upload' }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === tab.id ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:bg-hover-bg'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
              
              {/* Photos Tab */}
              {activeTab === 'photos' && (
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search photos..."
                      className="w-full pl-9 pr-4 py-2 bg-input border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-md outline-none transition-all text-sm text-foreground placeholder:text-muted-foreground"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    {loadingPhotos ? (
                      Array.from({ length: 10 }).map((_, i) => <ImageSkeleton key={i} />)
                    ) : photos.length > 0 ? (
                      photos.map(photo => {
                        const isSelected = currentBackground === photo.urls.full;
                        return (
                          <button
                            key={photo.id}
                            onClick={() => handlePhotoSelect(photo)}
                            className="group relative w-full h-24 rounded-md overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          >
                            <img 
                              src={photo.urls.thumb} 
                              alt={photo.alt_description || 'Unsplash image'} 
                              loading="lazy"
                              className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                            {isSelected && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <Check className="w-6 h-6 text-white" />
                              </div>
                            )}
                            <a
                              href={`${photo.user.links.html}?utm_source=taskify&utm_medium=referral`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="absolute bottom-1 left-2 text-[10px] text-white opacity-0 group-hover:opacity-100 hover:underline truncate w-11/12 text-left"
                            >
                              {photo.user.name}
                            </a>
                          </button>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center text-sm text-muted-foreground py-8">
                        No photos found
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Colors & Gradients Tab */}
              {activeTab === 'colors' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Colors</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {SOLID_COLORS.map(color => (
                        <button
                          key={color}
                          onClick={() => handleStyleSelect('color', color)}
                          className="h-16 rounded-md relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        >
                          {currentBackground === color && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Gradients</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {GRADIENTS.map(gradient => (
                        <button
                          key={gradient}
                          onClick={() => handleStyleSelect('gradient', gradient)}
                          className="h-16 rounded-md relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
                          style={{ backgroundImage: gradient }}
                          aria-label="Select gradient"
                        >
                          {currentBackground === gradient && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center rounded-md">
                              <Check className="w-5 h-5 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Upload Tab */}
              {activeTab === 'upload' && (
                <div className="pt-2">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Custom Background</h3>
                  <BackgroundUpload 
                    onUpload={onUploadBackground} 
                    isUploading={isUploading} 
                  />
                </div>
              )}

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
