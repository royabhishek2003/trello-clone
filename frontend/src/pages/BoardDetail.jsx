import React, { useEffect } from 'react';
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

const BoardDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBoard, loading } = useSelector(state => state.boards);
  const { lists, loading: listsLoading } = useSelector(state => state.lists);
  const [searchParams, setSearchParams] = useSearchParams();

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
    return <div className="pt-20 text-center">Loading board...</div>;
  }

  if (!currentBoard) return <div className="pt-20 text-center">Board not found</div>;

  return (
    <div 
      className="relative h-screen bg-no-repeat bg-cover bg-center"
      style={{ backgroundImage: `url(${currentBoard.imageFullUrl})` }}
    >
      <Navbar />
      <div className="absolute inset-0 bg-black/10" />
      <main className="relative pt-28 h-full flex flex-col">
        <BoardHeader board={currentBoard} />
        <div className="p-4 h-full overflow-x-auto">
          <ListContainer boardId={id} />
        </div>
      </main>
    </div>
  );
};

export default BoardDetail;
