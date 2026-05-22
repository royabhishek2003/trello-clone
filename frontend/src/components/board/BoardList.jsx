import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { User2, HelpCircle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { createBoard, setBoardsLocally, reorderBoards } from '../../redux/slices/boardSlice';
import { checkSubscription } from '../../redux/slices/subscriptionSlice';
import { openProModal } from '../../redux/slices/uiSlice';
import { toast } from 'sonner';
import { FormPicker } from '../form/FormPicker';
import { CreateBoardPopover } from './CreateBoardPopover';

// dnd-kit imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableBoard } from './SortableBoard';

export const BoardList = () => {
  const { boards, loading } = useSelector(state => state.boards);
  const { currentOrg } = useSelector(state => state.organizations);
  const { isPro, availableCount } = useSelector(state => state.subscription);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = boards.findIndex((board) => board._id === active.id);
      const newIndex = boards.findIndex((board) => board._id === over.id);

      const reorderedArray = arrayMove(boards, oldIndex, newIndex);
      const updatedItems = reorderedArray.map((board, index) => ({
        ...board,
        order: index
      }));

      dispatch(setBoardsLocally(updatedItems));
      if (currentOrg) {
        dispatch(reorderBoards({ items: updatedItems, orgId: currentOrg._id }))
          .unwrap()
          .then(() => toast.success("Board reordered"))
          .catch((err) => toast.error(err || "Failed to reorder boards"));
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center font-semibold text-lg text-neutral-700">
        <User2 className="h-6 w-6 mr-2" />
        Your boards
      </div>
      
      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <SortableContext 
            items={boards.map(b => b._id)}
            strategy={rectSortingStrategy}
          >
            {boards.map((board) => (
              <SortableBoard key={board._id} board={board} />
            ))}
          </SortableContext>
          
          {/* Create Board Button (Outside SortableContext so it doesn't move) */}
          {!isPro && availableCount >= 5 ? (
            <div
              onClick={() => dispatch(openProModal())}
              role="button"
              className="aspect-video relative h-full w-full bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition cursor-pointer"
            >
              <p className="text-sm">Create new board</p>
              <span className="text-xs">0 remaining</span>
              <TooltipProvider>
                <Tooltip delayDuration={0}>
                  <TooltipTrigger asChild>
                    <HelpCircle className="h-[14px] w-[14px] absolute bottom-2 right-2 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="w-[280px] p-3 text-sm">
                    Free Workspaces can have up to 5 open boards. For unlimited boards, upgrade this Workspace.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
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
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <HelpCircle className="h-[14px] w-[14px] absolute bottom-2 right-2 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="w-[280px] p-3 text-sm">
                      Free Workspaces can have up to 5 open boards. For unlimited boards, upgrade this Workspace.
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CreateBoardPopover>
          )}
        </div>
      </DndContext>
    </div>
  );
};
