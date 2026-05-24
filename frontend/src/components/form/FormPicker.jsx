import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Check, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { defaultImages } from '../../constants/images';

export const FormPicker = ({ onSelect }) => {
  const [images, setImages] = useState(defaultImages || []);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImageId, setSelectedImageId] = useState(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const res = await axios.get('https://api.unsplash.com/photos/random', {
          params: {
            collectionIds: '317099',
            count: 9,
          },
          headers: {
            Authorization: `Client-ID ${import.meta.env.VITE_UNSPLASH_ACCESS_KEY}`
          }
        });

        if (res && res.data) {
          setImages(res.data);
        } else {
          console.error("Failed to get images from Unsplash");
        }
      } catch (error) {
        console.error(error);
        setImages(defaultImages || []);
      } finally {
        setIsLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="h-6 w-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="grid grid-cols-3 gap-2 mb-2">
        {images.map((image) => (
          <div 
            key={image.id}
            className={cn(
              "cursor-pointer relative aspect-video group hover:opacity-75 transition bg-muted"
            )}
            onClick={() => {
              setSelectedImageId(image.id);
              // image format: "id|thumb|full|username|linkHTML"
              onSelect(`${image.id}|${image.urls.thumb}|${image.urls.full}|${image.user.name}|${image.links.html}`);
            }}
          >
            <img
              src={image.urls.thumb}
              alt="Unsplash image"
              className="object-cover rounded-sm h-full w-full absolute inset-0"
            />
            {selectedImageId === image.id && (
              <div className="absolute inset-y-0 h-full w-full bg-black/30 flex items-center justify-center z-10">
                <Check className="h-4 w-4 text-white" />
              </div>
            )}
            <a 
              href={image.links.html}
              target="_blank"
              rel="noreferrer"
              className="opacity-0 group-hover:opacity-100 absolute bottom-0 w-full text-[10px] truncate text-white hover:underline p-1 bg-black/50 z-10"
            >
              {image.user.name}
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
