import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Popover, PopoverContent, PopoverTrigger, PopoverClose } from '../ui/popover';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { MoreHorizontal } from 'lucide-react';
import api from '../../services/api';
import { fetchOrganizations } from '../../redux/slices/organizationSlice';

const OrgMembers = () => {
  const dispatch = useDispatch();
  const { currentOrg } = useSelector(state => state.organizations);
  const { user } = useSelector(state => state.auth);
  
  const [activeTab, setActiveTab] = useState('members'); // 'members' | 'invitations'
  const [isInviting, setIsInviting] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  
  // Local state for the org data so we can update it immediately
  const [orgData, setOrgData] = useState(null);
  
  // Fetch full org data when component mounts or currentOrg changes
  useEffect(() => {
    if (currentOrg) {
      fetchOrgDetails();
    }
  }, [currentOrg]);

  const fetchOrgDetails = async () => {
    try {
      const res = await api.get(`/api/orgs/${currentOrg._id}`);
      setOrgData(res.data);
    } catch (error) {
      console.error("Failed to fetch organization details", error);
    }
  };

  const handleSendInvitations = async () => {
    try {
      if (!inviteEmails.trim()) {
        toast.error('Please enter at least one email address');
        return;
      }
      
      const res = await api.post(`/api/orgs/${currentOrg._id}/invitations`, {
        emails: inviteEmails,
        role: inviteRole
      });
      
      toast.success(res.data.message || 'Invitations sent successfully');
      setInviteEmails('');
      setInviteRole('member');
      setIsInviting(false);
      fetchOrgDetails(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send invitations');
    }
  };

  const handleRevokeInvitation = async (email) => {
    try {
      await api.delete(`/api/orgs/${currentOrg._id}/invitations/${encodeURIComponent(email)}`);
      toast.success('Invitation revoked');
      fetchOrgDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to revoke invitation');
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      await api.delete(`/api/orgs/${currentOrg._id}/members/${userId}`);
      toast.success('Member removed');
      fetchOrgDetails();
      // If we removed ourselves, we might need to refresh global orgs
      if (userId === user._id) {
        dispatch(fetchOrganizations());
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to remove member');
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await api.patch(`/api/orgs/${currentOrg._id}/members/${userId}`, { role: newRole });
      toast.success('Role updated');
      fetchOrgDetails();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update role');
    }
  };

  if (!orgData) return <div className="p-4 text-sm text-muted-foreground">Loading members...</div>;

  const isAdmin = orgData.members.some(m => m.user._id === user._id && m.role === 'admin');

  if (isInviting) {
    return (
      <div className="w-full">
        <div className="flex items-center text-sm text-muted-foreground mb-6">
          <button onClick={() => setIsInviting(false)} className="hover:text-neutral-700">Members</button>
          <span className="mx-2">/</span>
          <span className="text-neutral-700 font-medium">Invite members</span>
        </div>
        
        <h2 className="text-2xl font-bold text-neutral-700">Invite members</h2>
        <p className="text-muted-foreground mt-1 mb-8">Invite new members to this organization</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Email addresses</label>
            <p className="text-xs text-muted-foreground mb-2">Enter or paste one or more email addresses, separated by spaces or commas</p>
            <textarea 
              className="w-full min-h-[100px] p-3 border rounded-md shadow-sm resize-y focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              value={inviteEmails}
              onChange={(e) => setInviteEmails(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">Role</label>
            <select 
              value={inviteRole} 
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-[200px] h-10 px-3 py-2 rounded-md border border-input bg-background text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="admin">Admin</option>
              <option value="member">Member</option>
            </select>
          </div>
          
          <div className="flex items-center justify-end gap-x-4 pt-4">
            <Button variant="ghost" className="font-semibold" onClick={() => setIsInviting(false)}>
              CANCEL
            </Button>
            <Button variant="primary" className="bg-indigo-500 hover:bg-indigo-600 font-semibold" onClick={handleSendInvitations}>
              SEND INVITATIONS
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-y-4">
        <div>
          <h2 className="text-2xl font-bold text-neutral-700">Members</h2>
          <p className="text-muted-foreground mt-1">View and manage organization members</p>
        </div>
        {isAdmin && (
          <Button variant="primary" className="bg-indigo-600 hover:bg-indigo-700 h-9 px-4 text-xs font-semibold" onClick={() => setIsInviting(true)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><line x1="19" y1="8" x2="19" y2="14"></line><line x1="22" y1="11" x2="16" y2="11"></line></svg>
            INVITE WORKSPACE MEMBERS
          </Button>
        )}
      </div>
      
      <div className="flex items-center border-b border-neutral-200 mb-6">
        <button 
          className={`pb-2 px-4 text-sm font-medium ${activeTab === 'members' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-neutral-500 hover:text-neutral-700'}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button 
          className={`pb-2 px-4 text-sm font-medium ${activeTab === 'invitations' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-neutral-500 hover:text-neutral-700'}`}
          onClick={() => setActiveTab('invitations')}
        >
          Invitations
        </button>
      </div>
      
      {activeTab === 'members' && (
        <div className="w-full">
          <div className="grid grid-cols-12 text-sm font-semibold text-neutral-500 pb-3 border-b mb-3">
            <div className="col-span-6">User</div>
            <div className="col-span-3">Joined</div>
            <div className="col-span-3">Role</div>
          </div>
          
          <div className="space-y-1">
            {orgData.members.map((member, index) => {
              const isYou = member.user._id === user._id;
              
              return (
                <div key={member.user._id} className="grid grid-cols-12 items-center py-3 border-b border-neutral-100 last:border-0">
                  <div className="col-span-6 flex items-center gap-x-3">
                    <div className="w-9 h-9 bg-purple-700 text-white rounded-full flex items-center justify-center font-bold">
                      {member.user.firstName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-700 flex items-center gap-x-2">
                        {member.user.firstName} {member.user.lastName}
                        {isYou && (
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded font-semibold uppercase">You</span>
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">{member.user.email}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-3 text-sm text-neutral-600">
                    {/* Assuming member object doesn't have joinedAt populated explicitly, we fallback to user creation or default */}
                    {member.joinedAt ? format(new Date(member.joinedAt), "dd/MM/yyyy") : format(new Date(orgData.createdAt), "dd/MM/yyyy")}
                  </div>
                  
                  <div className="col-span-3 flex items-center justify-between pr-2">
                    {isAdmin ? (
                      <select 
                        value={member.role} 
                        onChange={(e) => handleChangeRole(member.user._id, e.target.value)}
                        disabled={!isAdmin || isYou}
                        className="h-8 w-[100px] text-xs rounded-md border border-input bg-background px-2 py-1 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <option value="admin">Admin</option>
                        <option value="member">Member</option>
                      </select>
                    ) : (
                      <span className="text-sm text-neutral-600 capitalize">{member.role}</span>
                    )}
                    
                    {isAdmin && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="end">
                          <PopoverClose asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 h-auto py-2"
                              onClick={() => handleRemoveMember(member.user._id)}
                            >
                              Remove member
                            </Button>
                          </PopoverClose>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="mt-6 flex items-center justify-between text-sm text-neutral-500">
            <p>Displaying <span className="font-bold text-neutral-700">{orgData.members.length}</span> of <span className="font-bold text-neutral-700">{orgData.members.length}</span></p>
            <div className="flex gap-x-4">
              <button disabled className="text-neutral-400">Previous</button>
              <button className="font-medium text-neutral-700">1</button>
              <button disabled className="text-neutral-400">Next</button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'invitations' && (
        <div className="w-full">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h3 className="text-sm font-semibold text-neutral-700">Individual invitations</h3>
              <p className="text-sm text-muted-foreground mt-1">Manage pending invitations sent to users.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-12 text-sm font-semibold text-neutral-500 pb-3 border-b mb-3">
            <div className="col-span-6">User</div>
            <div className="col-span-4">Invited</div>
            <div className="col-span-2">Role</div>
          </div>
          
          {(!orgData.invitations || orgData.invitations.length === 0) ? (
            <div className="py-6 text-center text-sm font-medium text-neutral-700">
              No invitations to display
            </div>
          ) : (
            <div className="space-y-1">
              {orgData.invitations.map((inv) => (
                <div key={inv._id || inv.email} className="grid grid-cols-12 items-center py-3 border-b border-neutral-100 last:border-0">
                  <div className="col-span-6 flex items-center gap-x-3">
                    <div className="w-9 h-9 bg-neutral-200 text-neutral-500 rounded-full flex items-center justify-center font-bold">
                      {inv.email.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-sm text-neutral-700">{inv.email}</p>
                    </div>
                  </div>
                  
                  <div className="col-span-4 text-sm text-neutral-600">
                    {format(new Date(inv.invitedAt || Date.now()), "dd/MM/yyyy")}
                  </div>
                  
                  <div className="col-span-2 flex items-center justify-between pr-2">
                    <span className="text-sm text-neutral-600 capitalize">{inv.role}</span>
                    {isAdmin && (
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 text-neutral-500 hover:text-neutral-700">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-1" align="end">
                          <PopoverClose asChild>
                            <Button 
                              variant="ghost" 
                              className="w-full justify-start text-sm text-red-600 hover:text-red-700 hover:bg-red-50 h-auto py-2"
                              onClick={() => handleRevokeInvitation(inv.email)}
                            >
                              Revoke invitation
                            </Button>
                          </PopoverClose>
                        </PopoverContent>
                      </Popover>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          <div className="mt-6 flex items-center justify-between text-sm text-neutral-500 border-t pt-4">
            <p>Displaying <span className="font-bold text-neutral-700">{orgData.invitations?.length || 0}</span> of <span className="font-bold text-neutral-700">{orgData.invitations?.length || 0}</span></p>
            <div className="flex gap-x-4">
              <button disabled className="text-neutral-400">Previous</button>
              <button className="font-medium text-neutral-700">1</button>
              <button disabled className="text-neutral-400">Next</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrgMembers;
