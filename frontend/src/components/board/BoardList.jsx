import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User2, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createBoard } from '../../redux/slices/boardSlice';
import { checkSubscription } from '../../redux/slices/subscriptionSlice';
import { openProModal } from '../../redux/slices/uiSlice';
import { toast } from 'sonner';
import { FormPicker } from '../form/FormPicker';

export const BoardList = () => {
  const { boards, loading } = useSelector(state => state.boards);
  const { currentOrg } = useSelector(state => state.organizations);
  const { isPro, availableCount } = useSelector(state => state.subscription);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [boardTitle, setBoardTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!boardTitle.trim()) return;
    if (!selectedImage) {
      toast.error('Please select an image');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await dispatch(createBoard({ 
        title: boardTitle, 
        orgId: currentOrg._id,
        image: selectedImage
      })).unwrap();
      
      toast.success("Board created!");
      setPopoverOpen(false);
      setBoardTitle('');
      setSelectedImage('');
      dispatch(checkSubscription(currentOrg._id));
      navigate(`/board/${res._id}`);
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center font-semibold text-lg text-neutral-700">
        <User2 className="h-6 w-6 mr-2" />
        Your boards
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {boards.map((board) => (
          <div
            key={board._id}
            onClick={() => navigate(`/board/${board._id}`)}
            className="group relative aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm h-full w-full p-2 overflow-hidden cursor-pointer"
            style={{ backgroundImage: `url(${board.imageThumbUrl || board.imageFullUrl})` }}
          >
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
            <p className="relative font-semibold text-white">
              {board.title}
            </p>
          </div>
        ))}
        
        {/* Create Board Button */}
        {!isPro && availableCount >= 5 ? (
          <div
            onClick={() => dispatch(openProModal())}
            role="button"
            className="aspect-video relative h-full w-full bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition cursor-pointer"
          >
            <p className="text-sm">Create new board</p>
            <span className="text-xs">0 remaining</span>
            <HelpCircle className="h-[14px] w-[14px] absolute bottom-2 right-2 text-muted-foreground" />
          </div>
        ) : (
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <div
                role="button"
                className="aspect-video relative h-full w-full bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition cursor-pointer"
              >
                <p className="text-sm">Create new board</p>
                <span className="text-xs">
                  {isPro ? "Unlimited" : `${5 - availableCount} remaining`}
                </span>
                <HelpCircle className="h-[14px] w-[14px] absolute bottom-2 right-2 text-muted-foreground" />
              </div>
            </PopoverTrigger>
            <PopoverContent className="w-80 pt-3" side="right" sideOffset={18}>
            <div className="text-sm font-medium text-center text-neutral-600 pb-4">
              Create board
            </div>
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <FormPicker onSelect={setSelectedImage} />
              <div className="space-y-2">
                <Label htmlFor="title">Board title</Label>
                <Input 
                  id="title" 
                  value={boardTitle}
                  onChange={(e) => setBoardTitle(e.target.value)}
                  placeholder="e.g. 'Project Alpha'"
                  required
                />
              </div>
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Creating..." : "Create"}
              </Button>
            </form>
          </PopoverContent>
          </Popover>
        )}
      </div>
    </div>
  );
};
