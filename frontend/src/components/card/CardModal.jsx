import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Dialog, DialogContent } from '../ui/dialog';
import { closeCardModal } from '../../redux/slices/uiSlice';
import { updateCard, deleteCard, copyCard } from '../../redux/slices/cardSlice';
import { fetchLists } from '../../redux/slices/listSlice';
import { Layout, AlignLeft, CreditCard, Trash, Copy, Activity, Tag, Clock, ChevronDown, CheckSquare } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import api from '../../services/api';
import { format } from 'date-fns';
import { LabelPopover, COLORS } from './LabelPopover';
import { DatePopover } from './DatePopover';
import { formatCardDate } from '../../utils/formatCardDate';
import { getCardDateStatus, getBadgeColor } from '../../utils/dateStatus';
import { DragDropContext } from '@hello-pangea/dnd';
import { ChecklistPopover } from './ChecklistPopover';
import { Checklist } from './Checklist';
import { MembersPopover } from './MembersPopover';
import { MemberAvatar } from '../ui/MemberAvatar';
import { User } from 'lucide-react';

export const CardModal = () => {
  const dispatch = useDispatch();
  const { isCardModalOpen, cardData } = useSelector(state => state.ui);
  const { currentBoard } = useSelector(state => state.boards);
  const { lists } = useSelector(state => state.lists);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [logs, setLogs] = useState([]);
  const [localChecklists, setLocalChecklists] = useState([]);
  const [localMembers, setLocalMembers] = useState([]);

  // Fetch logs whenever card changes
  useEffect(() => {
    if (cardData && isCardModalOpen) {
      setTitle(cardData.title);
      setDescription(cardData.description || '');
      setLocalChecklists(cardData.checklists || []);
      setLocalMembers(cardData.cardMembers || []);
      api.get(`/api/cards/${cardData._id}/activity`)
        .then(res => setLogs(res.data))
        .catch(err => console.error("Failed to fetch logs", err));
    }
  }, [cardData, isCardModalOpen]);

  if (!cardData) return null;

  // Find the list this card belongs to
  const listName = lists.find(l => l._id === cardData.listId)?.title || '...';

  const handleUpdate = async (field, value) => {
    if (cardData[field] === value) return;
    await dispatch(updateCard({ id: cardData._id, data: { [field]: value } }))
      .unwrap()
      .then(() => {
        if (field === 'title') {
          toast.success(`Renamed card "${value}"`);
        } else {
          toast.success(`Card "${cardData.title}" updated`);
        }
      })
      .catch((err) => toast.error(err || "Failed to update card"));
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
      api.get(`/api/cards/${cardData._id}/activity`).then(res => setLogs(res.data));
    }
  };

  const handleUpdateChecklists = async (newChecklists) => {
    setLocalChecklists(newChecklists); // Optimistic UI
    await dispatch(updateCard({ id: cardData._id, data: { checklists: newChecklists } }));
  };

  const handleToggleMember = async (userObj) => {
    const userId = userObj._id;
    const isAssigned = localMembers.some(m => m._id === userId || m === userId);
    let newMembers;
    if (isAssigned) {
      newMembers = localMembers.filter(m => m._id !== userId && m !== userId);
    } else {
      // Optimistically push the full user object
      newMembers = [...localMembers, userObj]; 
    }
    setLocalMembers(newMembers); // Optimistic
    
    // We only send array of IDs to the backend
    const memberIds = newMembers.map(m => m._id || m);
    await dispatch(updateCard({ id: cardData._id, data: { cardMembers: memberIds } }));
    
    // Refetch to ensure populated data is correct
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  const handleAddChecklist = (checklistTitle) => {
    const generateObjectId = () => [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const newChecklist = {
      _id: generateObjectId(),
      title: checklistTitle,
      items: [],
      position: localChecklists.length
    };
    handleUpdateChecklists([...localChecklists, newChecklist]);
  };

  const handleUpdateChecklist = (updatedChecklist) => {
    const newChecklists = localChecklists.map(c => c._id === updatedChecklist._id ? updatedChecklist : c);
    handleUpdateChecklists(newChecklists);
  };

  const handleDeleteChecklist = (checklistId) => {
    const newChecklists = localChecklists.filter(c => c._id !== checklistId);
    handleUpdateChecklists(newChecklists);
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    
    const { source, destination } = result;
    const sourceChecklistId = source.droppableId.replace('checklist-', '');
    const destChecklistId = destination.droppableId.replace('checklist-', '');
    
    const newChecklists = [...localChecklists];
    const sourceChecklist = newChecklists.find(c => c._id === sourceChecklistId);
    const destChecklist = newChecklists.find(c => c._id === destChecklistId);
    
    if (!sourceChecklist || !destChecklist) return;

    if (sourceChecklistId === destChecklistId) {
      const newItems = Array.from(sourceChecklist.items || []);
      const [movedItem] = newItems.splice(source.index, 1);
      newItems.splice(destination.index, 0, movedItem);
      
      handleUpdateChecklist({ ...sourceChecklist, items: newItems });
    } else {
      const sourceItems = Array.from(sourceChecklist.items || []);
      const destItems = Array.from(destChecklist.items || []);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destItems.splice(destination.index, 0, movedItem);
      
      const updatedChecklists = newChecklists.map(c => {
        if (c._id === sourceChecklistId) return { ...c, items: sourceItems };
        if (c._id === destChecklistId) return { ...c, items: destItems };
        return c;
      });
      handleUpdateChecklists(updatedChecklists);
    }
  };

  const handleDelete = async () => {
    await dispatch(deleteCard(cardData._id))
      .unwrap()
      .then(() => toast.success(`Card "${cardData.title}" deleted`))
      .catch((err) => toast.error(err || "Failed to delete card"));
    dispatch(closeCardModal());
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  const handleCopy = async () => {
    await dispatch(copyCard(cardData._id))
      .unwrap()
      .then((data) => {
        toast.success(`Card "${data.title}" copied`);
        dispatch(closeCardModal());
      })
      .catch((err) => toast.error(err || "Failed to copy card"));
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
    }
  };

  const toggleDateComplete = () => {
    handleUpdate('isDateComplete', !cardData.isDateComplete);
  };

  const hasDates = cardData.startDate || cardData.dueDate;
  const dateStatus = getCardDateStatus(cardData.dueDate, cardData.isDateComplete);
  const badgeColor = getBadgeColor(dateStatus);

  return (
    <Dialog open={isCardModalOpen} onOpenChange={(open) => !open && dispatch(closeCardModal())}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start gap-x-3 mb-6 w-full">
          <Layout className="h-5 w-5 mt-1 text-neutral-700" />
          <div className="w-full">
            {!isEditingTitle ? (
              <div 
                onClick={() => setIsEditingTitle(true)}
                className="font-semibold text-xl mb-1 cursor-pointer"
              >
                {title}
              </div>
            ) : (
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                onBlur={() => {
                  setIsEditingTitle(false);
                  handleUpdate('title', title);
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    setIsEditingTitle(false);
                    handleUpdate('title', title);
                  }
                }}
                autoFocus
                className="font-semibold text-xl px-1 text-neutral-700 mb-0.5 border-transparent focus-visible:bg-white focus-visible:border-input"
              />
            )}
            <p className="text-sm text-muted-foreground mb-4">
              in list <span className="underline">{listName}</span>
            </p>
            
            <div className="flex flex-wrap gap-6 mb-4 w-full">
              {/* Members Section */}
              {localMembers && localMembers.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Members</p>
                  <div className="flex flex-wrap gap-1">
                    {localMembers.map(m => (
                      <MemberAvatar key={m._id || m} member={m} />
                    ))}
                    <MembersPopover cardMembers={localMembers} onMemberToggle={handleToggleMember}>
                      <div role="button" className="w-7 h-7 bg-neutral-200/60 hover:bg-neutral-300 rounded-full flex items-center justify-center transition cursor-pointer text-neutral-600">
                        <span className="font-medium text-sm">+</span>
                      </div>
                    </MembersPopover>
                  </div>
                </div>
              )}

              {/* Labels Section */}
              {cardData.labels && cardData.labels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Labels</p>
                  <div className="flex flex-wrap gap-2">
                    {cardData.labels.map(label => {
                      const l = typeof label === 'object' ? label : null;
                      if (!l) return null;
                      const colorObj = COLORS.find(c => c.id === l.color) || COLORS[0];
                      return (
                        <div key={l._id} className={`h-8 px-3 rounded-sm flex items-center justify-center text-white font-semibold text-sm min-w-[48px] ${colorObj.color.split(' ')[0]}`}>
                          {l.title}
                        </div>
                      );
                    })}
                    <LabelPopover>
                      <div role="button" className="h-8 w-10 bg-neutral-200/60 hover:bg-neutral-300 rounded-sm flex items-center justify-center transition cursor-pointer text-neutral-600">
                        <span className="font-medium text-lg mb-0.5">+</span>
                      </div>
                    </LabelPopover>
                  </div>
                </div>
              )}

              {/* Dates Section */}
              {hasDates && (
                <div>
                  <p className="text-xs font-semibold text-neutral-700 mb-2">Dates</p>
                  <div className="flex items-center gap-x-2">
                    <input 
                      type="checkbox" 
                      className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      checked={cardData.isDateComplete || false}
                      onChange={toggleDateComplete}
                    />
                    <DatePopover>
                      <div role="button" className="h-8 px-3 bg-neutral-200/60 hover:bg-neutral-300 rounded-sm flex items-center justify-center transition cursor-pointer text-neutral-800 text-sm font-semibold">
                        {formatCardDate(cardData.startDate, cardData.dueDate, cardData.hasDueTime)}
                        {cardData.dueDate && (
                          <span className={`ml-2 px-1.5 py-0.5 rounded-sm text-xs ${badgeColor} flex items-center gap-x-1`}>
                            {dateStatus === 'complete' && 'complete'}
                            {dateStatus === 'overdue' && 'overdue'}
                            {dateStatus === 'due_soon' && 'due soon'}
                            <ChevronDown className="h-3 w-3" />
                          </span>
                        )}
                      </div>
                    </DatePopover>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 md:gap-4">
          <div className="col-span-3">
            {/* Description */}
            <div className="flex items-start gap-x-3 w-full mb-8">
              <AlignLeft className="h-5 w-5 mt-0.5 text-neutral-700" />
              <div className="w-full">
                <p className="font-semibold text-neutral-700 mb-2">Description</p>
                {!isEditingDesc ? (
                  <div
                    onClick={() => setIsEditingDesc(true)}
                    role="button"
                    className="min-h-[78px] bg-neutral-200 text-sm font-medium py-3 px-3.5 rounded-md"
                  >
                    {description || "Add a more detailed description..."}
                  </div>
                ) : (
                  <div className="flex flex-col gap-y-2">
                    <Textarea
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      className="w-full mt-2"
                      placeholder="Add a more detailed description..."
                    />
                    <div className="flex items-center gap-x-2">
                      <Button onClick={() => {
                        setIsEditingDesc(false);
                        handleUpdate('description', description);
                      }}>Save</Button>
                      <Button variant="ghost" onClick={() => setIsEditingDesc(false)}>Cancel</Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Checklists */}
            {localChecklists.length > 0 && (
              <div className="mb-4">
                <DragDropContext onDragEnd={onDragEnd}>
                  {localChecklists.map(checklist => (
                    <Checklist 
                      key={checklist._id} 
                      checklist={checklist}
                      onUpdate={handleUpdateChecklist}
                      onDelete={() => handleDeleteChecklist(checklist._id)}
                    />
                  ))}
                </DragDropContext>
              </div>
            )}

            {/* Activity */}
            <div className="flex items-start gap-x-3 w-full">
              <Activity className="h-5 w-5 mt-0.5 text-neutral-700" />
              <div className="w-full">
                <p className="font-semibold text-neutral-700 mb-4">Activity</p>
                <ol className="mt-2 space-y-4">
                  {logs.map((log) => (
                    <li key={log._id} className="flex items-center gap-x-2">
                      <div className="w-8 h-8 bg-purple-700 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                        {log.userName.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col space-y-0.5">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold lowercase text-neutral-700 mr-1">{log.userName}</span>
                          {log.action.toLowerCase()}d card "{log.entityTitle}"
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
          
          <div className="col-span-1">
            <p className="text-xs font-semibold text-neutral-700 mb-2">Actions</p>
            <MembersPopover cardMembers={localMembers} onMemberToggle={handleToggleMember}>
              <Button variant="gray" className="w-full justify-start mb-2">
                <User className="h-4 w-4 mr-2" />
                Members
              </Button>
            </MembersPopover>
            <LabelPopover>
              <Button variant="gray" className="w-full justify-start mb-2">
                <Tag className="h-4 w-4 mr-2" />
                Labels
              </Button>
            </LabelPopover>
            <DatePopover>
              <Button variant="gray" className="w-full justify-start mb-2">
                <Clock className="h-4 w-4 mr-2" />
                Dates
              </Button>
            </DatePopover>
            <ChecklistPopover onAdd={handleAddChecklist}>
              <Button variant="gray" className="w-full justify-start mb-2">
                <CheckSquare className="h-4 w-4 mr-2" />
                Checklist
              </Button>
            </ChecklistPopover>
            <Button variant="gray" className="w-full justify-start mb-2" onClick={handleCopy}>
              <Copy className="h-4 w-4 mr-2" />
              Copy
            </Button>
            <Button variant="gray" className="w-full justify-start mb-2 text-red-600 hover:text-red-700 hover:bg-red-50" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
