import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createList, reorderLists, setListsLocally, clearFilters } from '../../redux/slices/listSlice';
import { reorderCards } from '../../redux/slices/cardSlice';
import { ListCard } from './ListCard';
import { matchesCardFilters } from '../../utils/filterUtils';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Plus, X } from 'lucide-react';
import { DragDropContext, Droppable } from '@hello-pangea/dnd';
import { toast } from 'sonner';
import { FloatingActionButton } from '../common/FloatingActionButton';

export const ListContainer = ({ boardId }) => {
  const dispatch = useDispatch();
  const { lists, filters } = useSelector(state => state.lists);
  const { user } = useSelector(state => state.auth);
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');

  const [orderedLists, setOrderedLists] = useState(lists);

  useEffect(() => {
    setOrderedLists(lists);
  }, [lists]);

  const filteredLists = useMemo(() => {
    return orderedLists.map(list => {
      if (!list.cards) return list;
      return {
        ...list,
        cards: list.cards.filter(card => matchesCardFilters(card, filters, user?._id))
      };
    });
  }, [orderedLists, filters, user]);

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
    const { destination, source, type, draggableId } = result;

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
        
        // Find exact item in unfiltered list
        const sourceIndex = reorderedCards.findIndex(c => c._id === draggableId);
        if (sourceIndex === -1) return;
        
        const [movedCard] = reorderedCards.splice(sourceIndex, 1);
        
        // Simulate move in filtered list to find the item that should come AFTER the moved card
        const filteredSourceList = filteredLists.find(l => l._id === source.droppableId);
        const filteredCards = [...(filteredSourceList.cards || [])];
        const filteredSourceIndex = source.index;
        const filteredDestIndex = destination.index;
        
        const [filteredMovedCard] = filteredCards.splice(filteredSourceIndex, 1);
        filteredCards.splice(filteredDestIndex, 0, filteredMovedCard);
        
        const itemAfter = filteredCards[filteredDestIndex + 1];
        
        let destIndex = reorderedCards.length; // default to end
        if (itemAfter) {
          const targetIndex = reorderedCards.findIndex(c => c._id === itemAfter._id);
          if (targetIndex !== -1) {
            destIndex = targetIndex;
          }
        }

        reorderedCards.splice(destIndex, 0, movedCard);

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

        const sourceIndex = sourceCards.findIndex(c => c._id === draggableId);
        if (sourceIndex === -1) return;

        const [movedCard] = sourceCards.splice(sourceIndex, 1);
        const updatedMovedCard = { ...movedCard, listId: destination.droppableId };
        
        const filteredDestList = filteredLists.find(l => l._id === destination.droppableId);
        const targetCard = filteredDestList.cards[destination.index];

        let destIndex = destCards.length;
        if (targetCard) {
          const targetIndex = destCards.findIndex(c => c._id === targetCard._id);
          if (targetIndex !== -1) destIndex = targetIndex;
        }
        
        destCards.splice(destIndex, 0, updatedMovedCard);

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

  const totalVisibleCards = filteredLists.reduce((acc, list) => acc + (list.cards?.length || 0), 0);
  const totalCards = orderedLists.reduce((acc, list) => acc + (list.cards?.length || 0), 0);
  const isFiltering = filters.labels.length > 0 || filters.members.length > 0 || filters.due.length > 0;

  return (
    <div className="h-full flex flex-col">
      {isFiltering && totalVisibleCards === 0 && totalCards > 0 && (
        <div className="mb-4 bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-md font-medium text-sm border border-white/30 flex items-center justify-between">
          <span>No cards match your current filters.</span>
          <Button variant="ghost" size="sm" onClick={() => dispatch(clearFilters())} className="h-auto py-1 px-2 text-white hover:bg-white/20">
            Clear filters
          </Button>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="lists" type="list" direction="horizontal">
        {(provided) => (
          <ol
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="flex h-full pb-4 items-start touch-pan-x"
          >
            {filteredLists.map((list, index) => (
              <ListCard key={list._id} list={list} index={index} />
            ))}
            {provided.placeholder}
            
            <li className="shrink-0 h-full w-[280px] sm:w-[300px] md:w-[320px] select-none">
              {!isAdding ? (
                <button
                  onClick={() => setIsAdding(true)}
                  className="w-full rounded-md bg-white/80 dark:bg-black/50 hover:bg-white/60 dark:hover:bg-black/40 transition p-3 flex items-center font-medium text-sm text-slate-800 dark:text-slate-200 backdrop-blur-sm"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add a list
                </button>
              ) : (
                <form onSubmit={handleAddList} className="w-full bg-list rounded-md p-3 space-y-2 shadow-md">
                  <Input 
                    value={title} 
                    onChange={e => setTitle(e.target.value)} 
                    placeholder="Enter list title..."
                    autoFocus
                    className="text-sm px-2 py-1 h-7 border-transparent focus:border-input hover:border-input bg-input text-foreground transition"
                  />
                  <div className="flex items-center gap-x-1">
                    <Button type="submit" size="sm" variant="primary">Add list</Button>
                    <Button type="button" onClick={() => setIsAdding(false)} size="sm" variant="ghost" className="hover:bg-hover-bg text-muted-foreground">
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
    {!isAdding && (
      <FloatingActionButton 
        onClick={() => {
          setIsAdding(true);
          // Scroll to right if needed, though adding a new list is best handled by simply toggling the form
          setTimeout(() => {
            const listContainer = document.querySelector('.snap-x-mandatory');
            if (listContainer) {
              listContainer.scrollTo({ left: listContainer.scrollWidth, behavior: 'smooth' });
            }
          }, 100);
        }} 
      />
    )}
    </div>
  );
};
