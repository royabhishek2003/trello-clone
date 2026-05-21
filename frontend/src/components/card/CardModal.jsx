import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent } from '../ui/dialog';
import { closeCardModal } from '../../redux/slices/uiSlice';
import { updateCard, deleteCard } from '../../redux/slices/cardSlice';
import { fetchLists } from '../../redux/slices/listSlice';
import { Layout, AlignLeft, CreditCard, Trash } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';

export const CardModal = () => {
  const dispatch = useDispatch();
  const { isCardModalOpen, cardData } = useSelector(state => state.ui);
  const { currentBoard } = useSelector(state => state.boards);
  
  const [title, setTitle] = useState(cardData?.title || '');
  const [description, setDescription] = useState(cardData?.description || '');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  // Update local state when cardData changes
  React.useEffect(() => {
    if (cardData) {
      setTitle(cardData.title);
      setDescription(cardData.description || '');
    }
  }, [cardData]);

  if (!cardData) return null;

  const handleUpdate = async (field, value) => {
    if (cardData[field] === value) return;
    await dispatch(updateCard({ id: cardData._id, data: { [field]: value } }));
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteCard(cardData._id));
    dispatch(closeCardModal());
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  return (
    <Dialog open={isCardModalOpen} onOpenChange={(open) => !open && dispatch(closeCardModal())}>
      <DialogContent className="max-w-3xl">
        {/* Header */}
        <div className="flex items-start gap-x-3 mb-6 w-full">
          <Layout className="h-5 w-5 mt-1 text-neutral-700" />
          <div className="w-full">
            {!isEditingTitle ? (
              <div 
                onClick={() => setIsEditingTitle(true)}
                className="font-semibold text-xl mb-1 cursor-pointer"
              >
                {title}
              </div>
            ) : (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  handleUpdate('title', title);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    handleUpdate('title', title);
                  }
                }}
                autoFocus
                className="font-semibold text-xl px-1 text-neutral-700 mb-0.5 border-transparent focus-visible:bg-white focus-visible:border-input"
              />
            )}
            <p className="text-sm text-muted-foreground">
              in list <span className="underline">...</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            {/* Description */}
            <div className="flex items-start gap-x-3 w-full">
              <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
              <div className="w-full">
                <p className="font-semibold text-neutral-700 mb-2">Description</p>
                {!isEditingDesc ? (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    role="button"
                    className="min-h-[78px] bg-neutral-200 text-sm font-medium py-3 px-3.5 rounded-md"
                  >
                    {description || "Add a more detailed description..."}
                  </div>
                ) : (
                  <div className="flex flex-col gap-y-2">
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full mt-2"
                      placeholder="Add a more detailed description..."
                    />
                    <div className="flex items-center gap-x-2">
                      <Button onClick={() => {
                        setIsEditingDesc(false);
                        handleUpdate('description', description);
                      }}>Save</Button>
                      <Button variant="ghost" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <p className="text-xs font-semibold text-neutral-700 mb-2">Actions</p>
            <Button variant="gray" className="w-full justify-start mb-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
            <Button variant="gray" className="w-full justify-start">
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
