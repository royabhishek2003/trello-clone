import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, CreditCard, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Input } from '../ui/input';
import api from '../../services/api';
import { openCardModal } from '../../redux/slices/uiSlice';

export const CardSearchPopover = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  
  const { currentBoard } = useSelector(state => state.boards);
  const { currentOrg } = useSelector(state => state.organizations);
  const { lists } = useSelector(state => state.lists);
  
  const inputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Debounced search effect
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      setSelectedIndex(-1);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      return;
    }

    let localResults = [];
    const qLower = query.toLowerCase();

    // 1. Optimistic Local Filtering (if on a board and lists are loaded)
    if (currentBoard && lists && lists.length > 0) {
      for (const list of lists) {
        if (list.cards) {
          const matched = list.cards.filter(c => c.title.toLowerCase().includes(qLower));
          const mappedMatched = matched.map(c => ({
            ...c,
            listId: { _id: list._id, title: list.title },
            boardId: { _id: currentBoard._id, title: currentBoard.title }
          }));
          localResults = [...localResults, ...mappedMatched];
        }
      }
      // Set local results instantly
      setResults(localResults);
    }

    setLoading(true);

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const timer = setTimeout(async () => {
      try {
        let endpoint = `/api/cards/search?q=${encodeURIComponent(query)}`;
        if (currentBoard) {
          endpoint += `&boardId=${currentBoard._id}`;
        } else if (currentOrg) {
          endpoint += `&orgId=${currentOrg._id}`;
        } else {
          setLoading(false);
          return;
        }

        const res = await api.get(endpoint, {
          signal: abortControllerRef.current.signal
        });
        
        // Ensure current board matches are prioritized by sorting
        const fetchedResults = res.data;
        if (currentBoard) {
          fetchedResults.sort((a, b) => {
            const aIsCurrent = a.listId?.boardId?._id === currentBoard._id;
            const bIsCurrent = b.listId?.boardId?._id === currentBoard._id;
            if (aIsCurrent && !bIsCurrent) return -1;
            if (!aIsCurrent && bIsCurrent) return 1;
            return 0;
          });
        }
        
        setResults(fetchedResults);
      } catch (err) {
        if (err.name !== 'CanceledError' && err.message !== 'canceled') {
          console.error("Search failed:", err);
        }
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [query, currentBoard, currentOrg, lists]);

  const handleSelect = (card) => {
    setOpen(false);
    setQuery('');
    setResults([]);
    inputRef.current?.blur();

    const cardBoardId = card.listId?.boardId?._id || card.boardId?._id;
    
    if (currentBoard && currentBoard._id === cardBoardId) {
      // We are already on the correct board, just open the modal using Redux lists if possible
      // Or we can just use the query param approach consistently for simplicity
      navigate(`/board/${cardBoardId}?cardId=${card._id}`);
    } else {
      // Different board, navigate to it with cardId
      navigate(`/board/${cardBoardId}?cardId=${card._id}`);
    }
  };

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSelect(results[selectedIndex]);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  const renderHighlightedText = (text, highlight) => {
    if (!highlight) return text;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === highlight.toLowerCase() ? (
            <span key={i} className="bg-yellow-200/70 font-medium text-black">{part}</span>
          ) : (
            part
          )
        )}
      </span>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <div className="relative group w-28 sm:w-48 md:w-64 max-w-sm shrink-0">
          <Search className="absolute left-2.5 top-[9px] h-4 w-4 text-slate-400 group-hover:text-slate-500 transition" />
          <Input 
            ref={inputRef}
            placeholder="Search" 
            className="pl-8 pr-8 h-8 bg-slate-100 hover:bg-slate-200 focus-visible:ring-1 focus-visible:ring-sky-500 border-none transition-colors w-full"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              if (!open) setOpen(true);
            }}
            onFocus={() => {
              if (query.length > 0) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <X 
              className="absolute right-2 top-[9px] h-4 w-4 text-slate-400 hover:text-slate-600 cursor-pointer transition" 
              onClick={(e) => {
                e.stopPropagation();
                clearSearch();
              }}
            />
          )}
        </div>
      </PopoverTrigger>
      <PopoverContent 
        className="w-[300px] md:w-[400px] p-2 shadow-xl border-slate-200"
        align="start"
        sideOffset={8}
        onOpenAutoFocus={(e) => e.preventDefault()} // prevent popover from stealing focus from input
      >
        <div className="flex flex-col max-h-[60vh] overflow-hidden">
          <div className="px-2 pb-2 mb-1 border-b text-xs font-semibold text-slate-500 flex justify-between shrink-0">
            <span>CARDS</span>
            {loading && <span className="text-sky-600 animate-pulse">Searching...</span>}
          </div>

          <div className="overflow-y-auto scrollbar-thin py-1">
            {query.trim().length > 0 && query.trim().length < 2 && (
              <div className="px-3 py-4 text-sm text-center text-slate-500">
                Type at least 2 characters to search...
              </div>
            )}
            
            {query.trim().length >= 2 && results.length === 0 && !loading && (
              <div className="px-3 py-8 text-center text-sm text-slate-500">
                No cards match your search.
              </div>
            )}

            {results.map((card, idx) => {
              const boardTitle = card.listId?.boardId?.title || card.boardId?.title || 'Unknown Board';
              const listTitle = card.listId?.title || 'Unknown List';
              const locationStr = `${boardTitle}: ${listTitle}`;
              const isSelected = selectedIndex === idx;

              return (
                <div 
                  key={card._id}
                  className={`flex items-start gap-x-3 p-2 rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-sky-50' : 'hover:bg-slate-100'}`}
                  onClick={() => handleSelect(card)}
                  onMouseEnter={() => setSelectedIndex(idx)}
                >
                  <CreditCard className={`h-5 w-5 mt-0.5 shrink-0 ${isSelected ? 'text-sky-600' : 'text-slate-400'}`} />
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-slate-800 truncate block">
                      {renderHighlightedText(card.title, query)}
                    </span>
                    <span className="text-xs text-slate-500 truncate block">
                      {locationStr}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};
