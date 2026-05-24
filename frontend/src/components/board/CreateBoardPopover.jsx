import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createBoard } from '../../redux/slices/boardSlice';
import { checkSubscription } from '../../redux/slices/subscriptionSlice';
import { toast } from 'sonner';
import { FormPicker } from '../form/FormPicker';

export const CreateBoardPopover = ({ children, side = 'bottom', sideOffset = 18 }) => {
  const { currentOrg } = useSelector(state => state.organizations);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [boardTitle, setBoardTitle] = useState('');
  const [selectedImage, setSelectedImage] = useState('');
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateBoard = async (e) => {
    e.preventDefault();
    if (!currentOrg) {
      toast.error('Please select an organization first');
      return;
    }
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
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 pt-3" side={side} sideOffset={sideOffset}>
        <div className="text-sm font-medium text-center text-foreground pb-4">
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
          <Button type="submit" disabled={isSubmitting} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isSubmitting ? "Creating..." : "Create"}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  );
};
