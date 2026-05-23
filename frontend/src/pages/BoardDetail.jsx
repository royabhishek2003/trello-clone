import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoardById } from '../redux/slices/boardSlice';
import { fetchLists } from '../redux/slices/listSlice';
import { fetchLabels } from '../redux/slices/labelSlice';
import { openCardModal } from '../redux/slices/uiSlice';
import { Navbar } from '../components/common/Navbar';
import { BoardHeader } from '../components/board/BoardHeader';
import { ListContainer } from '../components/list/ListContainer';
import { DragDropContext } from '@hello-pangea/dnd';
import { MobileDrawer } from '../components/common/MobileDrawer';
import { Sidebar } from '../components/common/Sidebar';

const BoardDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBoard, loading } = useSelector(state => state.boards);
  const { lists, loading: listsLoading } = useSelector(state => state.lists);
  const [searchParams, setSearchParams] = useSearchParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchBoardById(id));
      dispatch(fetchLists(id));
      dispatch(fetchLabels(id));
    }
  }, [id, dispatch]);

  useEffect(() => {
    if (currentBoard?.title) {
      document.title = `${currentBoard.title} | Taskify`;
    } else {
      document.title = 'Taskify';
    }
    
    return () => {
      document.title = 'Taskify';
    };
  }, [currentBoard]);

  useEffect(() => {
    const cardId = searchParams.get('cardId');
    if (cardId && !listsLoading && lists.length > 0) {
      // Find card in loaded lists
      for (const list of lists) {
        const card = list.cards?.find(c => c._id === cardId);
        if (card) {
          dispatch(openCardModal(card));
          // Remove query param cleanly using replace
          searchParams.delete('cardId');
          setSearchParams(searchParams, { replace: true });
          break;
        }
      }
    }
  }, [searchParams, lists, listsLoading, dispatch, setSearchParams]);

  if (loading && !currentBoard) {
    return (
      <div className="h-[100dvh] w-full bg-neutral-100 flex flex-col">
        <div className="h-14 w-full skeleton rounded-none" />
        <div className="flex-1 p-4 flex gap-4">
          <div className="w-[280px] h-full skeleton opacity-50" />
          <div className="w-[280px] h-full skeleton opacity-50 hidden sm:block" />
          <div className="w-[280px] h-full skeleton opacity-50 hidden md:block" />
        </div>
      </div>
    );
  }

  if (!currentBoard) return <div className="h-[100dvh] flex items-center justify-center text-center">Board not found</div>;

  // Calculate dynamic background style
  const getBackgroundStyle = () => {
    if (!currentBoard) return {};
    
    // Legacy support
    if (!currentBoard.backgroundType && currentBoard.imageFullUrl) {
      return { backgroundImage: `url(${currentBoard.imageFullUrl})` };
    }

    switch (currentBoard.backgroundType) {
      case 'color':
        return { backgroundColor: currentBoard.backgroundValue };
      case 'gradient':
        return { backgroundImage: currentBoard.backgroundValue };
      case 'image':
        return { backgroundImage: `url(${currentBoard.backgroundValue})` };
      default:
        // Fallback to legacy
        return currentBoard.imageFullUrl ? { backgroundImage: `url(${currentBoard.imageFullUrl})` } : { backgroundColor: '#0079bf' };
    }
  };

  const bgStyle = getBackgroundStyle();
  const isImageOrGradient = currentBoard?.backgroundType === 'image' || currentBoard?.backgroundType === 'gradient' || (!currentBoard?.backgroundType && currentBoard?.imageFullUrl);

  return (
    <div 
      className={`relative h-[100dvh] w-full bg-no-repeat bg-cover bg-center overflow-hidden flex flex-col transition-all duration-300`}
      style={bgStyle}
    >
      <Navbar onMenuClick={() => setIsSidebarOpen(prev => !prev)} title={currentBoard.title} />
      
      {/* Mobile Sidebar */}
      <MobileDrawer
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        title="Menu"
      >
        <div className="mt-2">
          <Sidebar />
        </div>
      </MobileDrawer>

      {/* Safe Overlay System for readability */}
      {isImageOrGradient && (
        <div className="absolute inset-0 bg-black/25 pointer-events-none transition-opacity duration-300" />
      )}
      
      <main className="relative pt-14 flex-1 flex flex-col h-full min-w-0">
        <BoardHeader board={currentBoard} />
        <div className="flex-1 overflow-x-auto overflow-y-hidden p-4 touch-pan-x scrollbar-hide">
          <ListContainer boardId={id} />
        </div>
      </main>
    </div>
  );
};

export default BoardDetail;
