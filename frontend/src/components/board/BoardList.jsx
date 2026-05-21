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
import { CreateBoardPopover } from './CreateBoardPopover';

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
          <CreateBoardPopover side="right" sideOffset={18}>
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
          </CreateBoardPopover>
        )}
      </div>
    </div>
  );
};
