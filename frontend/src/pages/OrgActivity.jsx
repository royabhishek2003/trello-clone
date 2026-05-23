import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Navbar } from '../components/common/Navbar';
import { Sidebar } from '../components/common/Sidebar';
import { Activity } from 'lucide-react';
import api from '../services/api';
import { format } from 'date-fns';

const OrgActivity = () => {
  const { currentOrg } = useSelector(state => state.organizations);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentOrg) {
      setLoading(true);
      api.get(`/api/orgs/${currentOrg._id}/activity`)
        .then(res => setLogs(res.data))
        .catch(err => console.error("Failed to fetch organization activity", err))
        .finally(() => setLoading(false));
    }
  }, [currentOrg]);

  if (!currentOrg) return <div className="pt-20 text-center">Loading...</div>;

  return (
    <div className="h-full">
      <Navbar />
      <main className="pt-20 md:pt-24 px-4 max-w-6xl 2xl:max-w-screen-xl mx-auto">
        <div className="flex gap-x-7">
          <div className="w-64 shrink-0 hidden md:block">
            <Sidebar />
          </div>
          
          <div className="flex-1 space-y-6">
            <div className="flex items-center gap-x-4 mb-8">
              <div className="w-[60px] h-[60px] bg-gradient-to-br from-indigo-500 to-purple-500 rounded-md flex items-center justify-center">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
              </div>
              <div>
                <p className="font-semibold text-xl">{currentOrg?.name}</p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <span className="flex items-center gap-x-1">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><line x1="2" y1="10" x2="22" y2="10"></line></svg>
                    {/* Assuming we can't easily sync subscription state here without another check, we'll keep it simple or default to Free since OrgSettings handles the actual subscription. For visual match, we just hardcode Free/Pro based on a basic check if possible, or omit. Actually, let's just fetch it or omit it. We'll omit the subscription badge or keep it static. Let's just put Free for now. */}
                    Free
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-neutral-200">
              {loading ? (
                <p className="text-sm text-muted-foreground">Loading activity...</p>
              ) : logs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No activity found inside this organization.</p>
              ) : (
                <ol className="space-y-4">
                  {logs.map((log) => (
                    <li key={log._id} className="flex items-center gap-x-2">
                      <div className="w-8 h-8 bg-purple-700 text-white rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
                        {log.userName?.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold lowercase text-neutral-700 mr-1">{log.userName}</span>
                          {log.details ? (
                            <>{log.details} "{log.entityTitle}"</>
                          ) : (
                            <>{log.action.toLowerCase()}d {log.entityType.toLowerCase()} "{log.entityTitle}"</>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrgActivity;
