import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBoardById } from '../redux/slices/boardSlice';
import { fetchLists } from '../redux/slices/listSlice';
import { Navbar } from '../components/common/Navbar';
import { BoardHeader } from '../components/board/BoardHeader';
import { ListContainer } from '../components/list/ListContainer';
import { DragDropContext } from '@hello-pangea/dnd';

const BoardDetail = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { currentBoard, loading } = useSelector(state => state.boards);

  useEffect(() => {
    if (id) {
      dispatch(fetchBoardById(id));
      dispatch(fetchLists(id));
    }
  }, [id, dispatch]);

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
      <main className="relative pt-14 h-full flex flex-col">
        <BoardHeader board={currentBoard} />
        <div className="p-4 h-full overflow-x-auto">
          <ListContainer boardId={id} />
        </div>
      </main>
    </div>
  );
};

export default BoardDetail;
