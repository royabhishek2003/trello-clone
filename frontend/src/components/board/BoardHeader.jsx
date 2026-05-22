import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBoard, deleteBoard } from '../../redux/slices/boardSlice';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { MoreHorizontal, Trash } from 'lucide-react';
import { toast } from 'sonner';

export const BoardHeader = ({ board }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(board.title);

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

  return (
    <div className="w-full h-14 z-40 bg-black/50 flex items-center px-6 gap-x-4 text-white absolute top-14">
      {!isEditing ? (
        <div 
          onClick={() => setIsEditing(true)} 
          className="font-bold text-lg px-2 py-1 cursor-pointer hover:bg-white/20 rounded-sm transition"
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

      <div className="ml-auto">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="transparent" className="h-auto w-auto p-2">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56" side="bottom" align="end">
            <div className="text-sm font-medium text-center text-neutral-600 pb-2">Board actions</div>
            <Button variant="ghost" onClick={handleDelete} className="w-full justify-start text-red-600">
              <Trash className="h-4 w-4 mr-2" /> Delete board
            </Button>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};
