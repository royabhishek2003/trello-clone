import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { X, Check } from 'lucide-react';
import { updateCard } from '../../redux/slices/cardSlice';
import { fetchLists } from '../../redux/slices/listSlice';
import { COLORS } from './LabelPopover';
import { toast } from 'sonner';

const UNSPLASH_IMAGES = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?w=600&h=400&fit=crop',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=600&h=400&fit=crop',
];

export const CoverPopover = ({ children, onUploadClick }) => {
  const dispatch = useDispatch();
  const { currentBoard } = useSelector(state => state.boards);
  const { cardData } = useSelector(state => state.ui);

  const [isOpen, setIsOpen] = useState(false);

  const handleUpdateCoverColor = async (colorId) => {
    // Set color, clear image
    await dispatch(updateCard({ id: cardData._id, data: { coverColor: colorId, coverImage: null } }))
      .unwrap()
      .then(() => toast.success("Cover updated"))
      .catch((err) => toast.error(err || "Failed to update cover"));
    
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  const handleUpdateCoverImage = async (url) => {
    // Set image, clear color
    await dispatch(updateCard({ id: cardData._id, data: { coverImage: url, coverColor: null } }))
      .unwrap()
      .then(() => toast.success("Cover updated"))
      .catch((err) => toast.error(err || "Failed to update cover"));
    
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  const handleRemoveCover = async () => {
    await dispatch(updateCard({ id: cardData._id, data: { coverImage: null, coverColor: null } }))
      .unwrap()
      .then(() => toast.success("Cover removed"))
      .catch((err) => toast.error(err || "Failed to remove cover"));
    
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  const hasCover = cardData?.coverUrl || cardData?.coverImage || cardData?.coverColor;
  
  // Filter only image attachments
  const imageAttachments = cardData?.attachments?.filter(a => a.fileType?.startsWith('image/')) || [];

  return (
    <Popover modal={true} open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 pt-3 max-h-[350px] overflow-y-auto custom-scrollbar" align="start" side="bottom" collisionPadding={16}>
        <div className="sticky top-0 bg-popover z-10 flex items-center justify-center pb-2 mb-4 border-b">
          <span className="font-semibold text-sm text-neutral-700">Cover</span>
          <Button
            className="absolute right-0 top-0 h-auto w-auto p-1 text-neutral-600"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-col gap-y-4">
          {hasCover && (
            <Button 
              variant="gray" 
              className="w-full text-sm font-semibold"
              onClick={handleRemoveCover}
            >
              Remove cover
            </Button>
          )}

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700">Colors</label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map(c => (
                <div
                  key={c.id}
                  onClick={() => handleUpdateCoverColor(c.id)}
                  role="button"
                  className={`h-8 rounded-sm cursor-pointer flex items-center justify-center transition ${c.color.split(' ')[0]} hover:opacity-80`}
                >
                  {cardData?.coverColor === c.id && <Check className="h-4 w-4 text-white" />}
                </div>
              ))}
            </div>
          </div>

          {imageAttachments.length > 0 && (
            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700">Attachments</label>
              <div className="grid grid-cols-3 gap-2">
                {imageAttachments.map(attachment => (
                  <div
                    key={attachment._id}
                    onClick={() => handleUpdateCoverImage(attachment.storageKey)}
                    role="button"
                    className="h-12 bg-neutral-200 rounded-sm cursor-pointer overflow-hidden relative hover:opacity-80 transition"
                  >
                    <img 
                      src={attachment.fileUrl} 
                      alt={attachment.fileName} 
                      className="w-full h-full object-cover" 
                    />
                    {cardData?.coverImage === attachment.storageKey && (
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                        <Check className="h-4 w-4 text-white" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Button 
              variant="gray" 
              className="w-full text-sm font-semibold"
              onClick={() => {
                setIsOpen(false);
                if (onUploadClick) onUploadClick();
              }}
            >
              Upload a cover image
            </Button>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-neutral-700">Photos from Unsplash</label>
            <div className="grid grid-cols-3 gap-2">
              {UNSPLASH_IMAGES.map((url, i) => (
                <div
                  key={i}
                  onClick={() => handleUpdateCoverImage(url)}
                  role="button"
                  className="h-12 bg-neutral-200 rounded-sm cursor-pointer overflow-hidden relative hover:opacity-80 transition"
                >
                  <img src={url} alt="Unsplash" className="w-full h-full object-cover" />
                  {cardData?.coverImage === url && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      </PopoverContent>
    </Popover>
  );
};
