import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { CardItem } from '../card/CardItem';
import { createCard } from '../../redux/slices/cardSlice';
import { fetchLists, deleteList, updateList, copyList } from '../../redux/slices/listSlice';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Plus, X, MoreHorizontal, Trash } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '../ui/popover';
import { Separator } from '../ui/separator';
import { toast } from 'sonner';

export const ListCard = ({ list, index }) => {
  const dispatch = useDispatch();
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [cardTitle, setCardTitle] = useState('');
  const [listTitle, setListTitle] = useState(list.title);
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const handleAddCard = async (e) => {
    e.preventDefault();
    if (!cardTitle.trim()) return;
    await dispatch(createCard({ title: cardTitle, listId: list._id, boardId: list.boardId }))
      .unwrap()
      .then((data) => toast.success(`Card "${data.title}" created`))
      .catch((err) => toast.error(err || "Failed to create card"));
    setCardTitle('');
    setIsAddingCard(false);
    dispatch(fetchLists(list.boardId));
  };

  const handleUpdateListTitle = async () => {
    setIsEditingTitle(false);
    if (listTitle === list.title) return;
    await dispatch(updateList({ id: list._id, data: { title: listTitle, boardId: list.boardId } }))
      .unwrap()
      .then((data) => toast.success(`Renamed list "${data.title}"`))
      .catch((err) => toast.error(err || "Failed to update list"));
  };

  const handleDeleteList = async () => {
    await dispatch(deleteList(list._id))
      .unwrap()
      .then(() => toast.success(`List "${list.title}" deleted`))
      .catch((err) => toast.error(err || "Failed to delete list"));
  };

  const handleCopyList = async () => {
    await dispatch(copyList(list._id))
      .unwrap()
      .then((data) => toast.success(`List "${data.title}" copied`))
      .catch((err) => toast.error(err || "Failed to copy list"));
    dispatch(fetchLists(list.boardId));
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(provided) => (
        <li 
          {...provided.draggableProps}
          ref={provided.innerRef}
          className="shrink-0 h-full w-[272px] select-none"
        >
          <div {...provided.dragHandleProps} className="w-full rounded-md bg-[#f1f2f4] shadow-md pb-2">
            <div className="flex justify-between items-start pt-2 px-2 pb-1">
              {!isEditingTitle ? (
                <div onClick={() => setIsEditingTitle(true)} className="w-full text-sm font-semibold px-2.5 py-1 h-7 border-transparent cursor-pointer">
                  {list.title}
                </div>
              ) : (
                <Input
                  value={listTitle}
                  onChange={e => setListTitle(e.target.value)}
                  onBlur={handleUpdateListTitle}
                  onKeyDown={e => { if (e.key === 'Enter') handleUpdateListTitle(); }}
                  autoFocus
                  className="text-sm px-2.5 py-1 h-7 font-medium border-transparent hover:border-input focus:border-input transition"
                />
              )}
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" className="h-auto w-auto p-2">
                    <MoreHorizontal className="h-4 w-4 text-neutral-500" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-72 px-0 pt-3 pb-3" side="bottom" align="start">
                  <div className="text-sm font-semibold text-center text-neutral-600 pb-2 relative">
                    List actions
                    <PopoverClose asChild>
                      <Button variant="ghost" className="h-auto w-auto p-2 absolute top-[-4px] right-2 text-neutral-600">
                        <X className="h-4 w-4" />
                      </Button>
                    </PopoverClose>
                  </div>
                  <Separator />
                  <div className="flex flex-col mt-2">
                    <PopoverClose asChild>
                      <Button variant="ghost" onClick={() => setIsAddingCard(true)} className="w-full justify-start rounded-none px-4 py-2 h-auto text-sm font-normal text-neutral-700 hover:bg-neutral-100">
                        Add card...
                      </Button>
                    </PopoverClose>
                    <PopoverClose asChild>
                      <Button variant="ghost" onClick={handleCopyList} className="w-full justify-start rounded-none px-4 py-2 h-auto text-sm font-normal text-neutral-700 hover:bg-neutral-100">
                        Copy list...
                      </Button>
                    </PopoverClose>
                    <Separator className="my-2" />
                    <PopoverClose asChild>
                      <Button variant="ghost" onClick={handleDeleteList} className="w-full justify-start rounded-none px-4 py-2 h-auto text-sm font-normal text-neutral-700 hover:bg-neutral-100">
                        Delete this list
                      </Button>
                    </PopoverClose>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <Droppable droppableId={list._id} type="card">
              {(provided) => (
                <ol
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="mx-1 px-1 py-0.5 flex flex-col gap-y-2 min-h-[2px]"
                >
                  {list.cards?.map((card, idx) => (
                    <CardItem key={card._id} card={card} index={idx} />
                  ))}
                  {provided.placeholder}
                </ol>
              )}
            </Droppable>

            <div className="pt-2 px-2">
              {!isAddingCard ? (
                <Button 
                  onClick={() => setIsAddingCard(true)}
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground text-sm"
                >
                  <Plus className="h-4 w-4 mr-2" /> Add a card
                </Button>
              ) : (
                <form onSubmit={handleAddCard} className="m-1 py-0.5 px-1 space-y-2">
                  <Textarea
                    value={cardTitle}
                    onChange={e => setCardTitle(e.target.value)}
                    placeholder="Enter a title for this card..."
                    className="resize-none"
                    autoFocus
                  />
                  <div className="flex items-center gap-x-1">
                    <Button type="submit" size="sm" variant="primary">Add card</Button>
                    <Button type="button" onClick={() => setIsAddingCard(false)} size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </li>
      )}
    </Draggable>
  );
};
