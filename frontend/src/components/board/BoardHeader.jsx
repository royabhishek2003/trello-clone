import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBoard, deleteBoard, updateBoardBackground, uploadBoardBackground, optimisticUpdateBackground } from '../../redux/slices/boardSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal, Trash, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { BoardFilterPopover } from './BoardFilterPopover';
import { BoardBackgroundPicker } from './BoardBackgroundPicker';

export const BoardHeader = ({ board }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpdate = async () => {
    setIsEditing(false);
    if (title === board.title) return;
    await dispatch(updateBoard({ id: board._id, data: { title } }))
      .unwrap()
      .then(() => toast.success(`Board "${title}" updated`))
      .catch((err) => toast.error(err || "Failed to update board"));
  };

  const handleDelete = async () => {
    await dispatch(deleteBoard(board._id))
      .unwrap()
      .then(() => {
        toast.success("Board deleted");
        navigate('/');
      })
      .catch((err) => toast.error(err || "Failed to delete board"));
  };

  const handleSelectBackground = async (type, value, thumbnail, meta) => {
    // Optimistic Update
    const originalBackground = {
      backgroundType: board.backgroundType,
      backgroundValue: board.backgroundValue,
      backgroundThumbnail: board.backgroundThumbnail,
      backgroundMeta: board.backgroundMeta
    };
    
    dispatch(optimisticUpdateBackground({
      backgroundType: type,
      backgroundValue: value,
      backgroundThumbnail: thumbnail || value,
      backgroundMeta: meta || {}
    }));

    try {
      await dispatch(updateBoardBackground({
        id: board._id,
        data: {
          backgroundType: type,
          backgroundValue: value,
          backgroundThumbnail: thumbnail || value,
          backgroundMeta: meta || {}
        }
      })).unwrap();
      toast.success("Background updated");
    } catch (err) {
      // Revert on error
      dispatch(optimisticUpdateBackground(originalBackground));
      toast.error(err || "Failed to update background");
    }
  };

  const handleUploadBackground = async (file) => {
    setIsUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      await dispatch(uploadBoardBackground({ id: board._id, formData })).unwrap();
      toast.success("Background uploaded");
      setIsPickerOpen(false);
    } catch (err) {
      toast.error(err || "Failed to upload background");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full h-14 z-40 bg-black/50 flex items-center px-6 gap-x-4 text-white">
      {!isEditing ? (
        <div 
          onClick={() => setIsEditing(true)} 
          className="font-bold text-lg px-2 py-1 cursor-pointer hover:bg-white/20 rounded-sm transition truncate max-w-[150px] sm:max-w-[300px] md:max-w-[500px]"
        >
          {board.title}
        </div>
      ) : (
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleUpdate}
          onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); }}
          autoFocus
          className="text-lg font-bold px-[7px] py-1 h-7 bg-transparent focus-visible:outline-none focus-visible:ring-transparent border-none text-white w-auto"
        />
      )}

      <div className="ml-auto flex items-center gap-x-2">
        <Button 
          variant="transparent" 
          className="h-auto w-auto p-2 hidden sm:flex"
          onClick={() => setIsPickerOpen(true)}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Background
        </Button>
        <BoardFilterPopover />
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="transparent" className="h-auto w-auto p-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" side="bottom" align="end">
            <div className="text-sm font-medium text-center text-neutral-600 pb-2 border-b mb-2">Board actions</div>
            <Button 
              variant="ghost" 
              onClick={() => {
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
                setIsPickerOpen(true);
              }} 
              className="w-full justify-start sm:hidden"
            >
              <ImageIcon className="h-4 w-4 mr-2" /> Change background
            </Button>
            <Button variant="ghost" onClick={handleDelete} className="w-full justify-start text-red-600">
              <Trash className="h-4 w-4 mr-2" /> Delete board
            </Button>
          </PopoverContent>
        </Popover>
      </div>

      <BoardBackgroundPicker
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        currentBackground={board.backgroundValue || board.imageFullUrl}
        onSelectBackground={handleSelectBackground}
        onUploadBackground={handleUploadBackground}
        isUploading={isUploading}
      />
    </div>
  );
};
