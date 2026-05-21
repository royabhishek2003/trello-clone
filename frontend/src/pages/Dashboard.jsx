import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchOrganizations } from '../redux/slices/organizationSlice';
import { fetchBoards } from '../redux/slices/boardSlice';
import { checkSubscription } from '../redux/slices/subscriptionSlice';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Button } from '../components/ui/button';
import { User2 } from 'lucide-react';
import { BoardList } from '../components/board/BoardList';
import { CreateOrgModal } from '../components/organization/CreateOrgModal';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { currentOrg, loading: orgLoading } = useSelector(state => state.organizations);
  const { isPro } = useSelector(state => state.subscription);
  
  useEffect(() => {
    dispatch(fetchOrganizations());
  }, [dispatch]);

  useEffect(() => {
    if (currentOrg) {
      dispatch(fetchBoards(currentOrg._id));
      dispatch(checkSubscription(currentOrg._id));
    }
  }, [currentOrg, dispatch]);

  if (orgLoading && !currentOrg) {
    return <div>Loading workspace...</div>;
  }

  return (
    <div className="h-full">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 max-w-6xl 2xl:max-w-screen-xl mx-auto">
        <div className="flex gap-x-7">
          <Sidebar />
          
          <div className="flex-1">
            {!currentOrg ? (
              <div className="h-full flex flex-col items-center justify-center p-10 bg-white rounded-lg shadow-sm border">
                <h2 className="text-xl font-semibold text-neutral-700 mb-2">Welcome to Taskify!</h2>
                <p className="text-muted-foreground mb-6 text-center max-w-sm">
                  It looks like you don't belong to any workspaces yet. Create one to start managing your projects and boards.
                </p>
                <div className="w-48">
                  <CreateOrgModal />
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-x-4">
                    <div className="w-[60px] h-[60px] bg-sky-700 rounded-md flex items-center justify-center">
                      <span className="text-white text-xl font-bold uppercase">{currentOrg?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-xl">{currentOrg?.name}</p>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <User2 className="h-3 w-3 mr-1" />
                        {isPro ? "Pro" : "Free"}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Board List */}
                <BoardList />
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
