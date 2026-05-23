import React, { useEffect, useState } from 'react';
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
import { MobileDrawer } from '../components/common/MobileDrawer';
import { ResponsiveBoardShell } from '../components/common/ResponsiveBoardShell';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { currentOrg, loading: orgLoading } = useSelector(state => state.organizations);
  const { isPro } = useSelector(state => state.subscription);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    // Organizations are now fetched globally in App.jsx
  }, []);

  useEffect(() => {
    if (currentOrg) {
      dispatch(fetchBoards(currentOrg._id));
      dispatch(checkSubscription(currentOrg._id));
    }
  }, [currentOrg, dispatch]);

  if (orgLoading && !currentOrg) {
    return (
      <div className="h-[100dvh] w-full bg-neutral-100 flex flex-col">
        <div className="h-14 w-full skeleton rounded-none" />
        <div className="flex-1 p-6 flex gap-6 max-w-6xl 2xl:max-w-screen-xl mx-auto w-full">
          <div className="w-64 h-full skeleton opacity-50 hidden md:block" />
          <div className="flex-1 h-full skeleton opacity-50" />
        </div>
      </div>
    );
  }

  return (
    <ResponsiveBoardShell
      header={<Navbar onMenuClick={() => setIsSidebarOpen(prev => !prev)} title="Dashboard" />}
      sidebar={
        <>
          {/* Desktop Sidebar */}
          <div className="hidden md:block pt-24 px-4 h-[100dvh] overflow-y-auto w-64 shrink-0 border-r bg-background">
            <Sidebar />
          </div>
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
        </>
      }
    >
      <div className="h-full overflow-y-auto px-4 md:px-6 pt-20 md:pt-24 pb-10">
        <div className="max-w-6xl 2xl:max-w-screen-xl mx-auto flex gap-x-7">
          <div className="flex-1 min-w-0">
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
                    <div className="w-[60px] h-[60px] bg-sky-700 rounded-md flex items-center justify-center shrink-0">
                      <span className="text-white text-xl font-bold uppercase">{currentOrg?.name?.charAt(0)}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-xl truncate max-w-[200px] sm:max-w-[300px] md:max-w-none">{currentOrg?.name}</p>
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
      </div>
    </ResponsiveBoardShell>
  );
};

export default Dashboard;
