import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createList, reorderLists, setListsLocally } from '../../redux/slices/listSlice';
import { reorderCards } from '../../redux/slices/cardSlice';
import { ListCard } from './ListCard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, X } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { toast } from 'sonner';

export const ListContainer = ({ boardId }) => {
  const dispatch = useDispatch();
  const { lists } = useSelector(state => state.lists);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const [orderedLists, setOrderedLists] = useState(lists);

  useEffect(() => {
    setOrderedLists(lists);
  }, [lists]);

  const handleAddList = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    await dispatch(createList({ title, boardId }))
      .unwrap()
      .then((data) => toast.success(`List "${data.title}" created`))
      .catch((err) => toast.error(err || "Failed to create list"));
    setTitle('');
    setIsAdding(false);
  };

  const onDragEnd = (result) => {
    const { destination, source, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    if (type === 'list') {
      const items = Array.from(orderedLists);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);

      const updatedItems = items.map((item, index) => ({ ...item, order: index }));
      setOrderedLists(updatedItems);
      dispatch(setListsLocally(updatedItems));
      dispatch(reorderLists({ items: updatedItems, boardId }))
        .unwrap()
        .then(() => toast.success("List reordered"))
        .catch((err) => toast.error(err || "Failed to reorder list"));
    }

    if (type === 'card') {
      let newOrderedLists = [...orderedLists];
      const sourceListIndex = newOrderedLists.findIndex(l => l._id === source.droppableId);
      const destListIndex = newOrderedLists.findIndex(l => l._id === destination.droppableId);

      if (sourceListIndex < 0 || destListIndex < 0) return;

      const sourceList = newOrderedLists[sourceListIndex];
      const destList = newOrderedLists[destListIndex];

      if (!sourceList.cards) sourceList.cards = [];
      if (!destList.cards) destList.cards = [];

      if (source.droppableId === destination.droppableId) {
        const reorderedCards = [...sourceList.cards];
        const [movedCard] = reorderedCards.splice(source.index, 1);
        reorderedCards.splice(destination.index, 0, movedCard);

        const updatedCards = reorderedCards.map((card, idx) => ({ ...card, order: idx }));
        
        newOrderedLists[sourceListIndex] = {
          ...sourceList,
          cards: updatedCards
        };

        setOrderedLists(newOrderedLists);
        dispatch(reorderCards({ items: updatedCards, boardId }))
          .unwrap()
          .then(() => toast.success("Card reordered"))
          .catch((err) => toast.error(err || "Failed to reorder cards"));
      } else {
        const sourceCards = [...sourceList.cards];
        const destCards = [...destList.cards];

        const [movedCard] = sourceCards.splice(source.index, 1);
        const updatedMovedCard = { ...movedCard, listId: destination.droppableId };
        
        destCards.splice(destination.index, 0, updatedMovedCard);

        const updatedSourceCards = sourceCards.map((card, idx) => ({ ...card, order: idx }));
        const updatedDestCards = destCards.map((card, idx) => ({ ...card, order: idx }));

        newOrderedLists[sourceListIndex] = {
          ...sourceList,
          cards: updatedSourceCards
        };
        newOrderedLists[destListIndex] = {
          ...destList,
          cards: updatedDestCards
        };

        setOrderedLists(newOrderedLists);
        dispatch(reorderCards({ items: [...updatedSourceCards, ...updatedDestCards], boardId }))
          .unwrap()
          .then(() => toast.success("Card reordered"))
          .catch((err) => toast.error(err || "Failed to reorder cards"));
      }
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex gap-x-3 h-full"
          >
            {orderedLists.map((list, index) => (
              <ListCard key={list._id} list={list} index={index} />
            ))}
            {provided.placeholder}
            
            <li className="shrink-0 h-full w-[272px] select-none">
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full rounded-md bg-white/80 hover:bg-white/50 transition p-3 flex items-center font-medium text-sm text-neutral-800"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a list
                </button>
              ) : (
                <form onSubmit={handleAddList} className="w-full bg-white rounded-md p-3 space-y-2 shadow-md">
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Enter list title..."
                    autoFocus
                    className="text-sm px-2 py-1 h-7 border-none"
                  />
                  <div className="flex items-center gap-x-1">
                    <Button type="submit" size="sm" variant="primary">Add list</Button>
                    <Button type="button" onClick={() => setIsAdding(false)} size="sm" variant="ghost">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              )}
            </li>
          </ol>
        )}
      </Droppable>
    </DragDropContext>
  );
};
