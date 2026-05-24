import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ResponsiveModal } from '../common/ResponsiveModal';
import { closeCardModal } from '../../redux/slices/uiSlice';
import { updateCard, deleteCard, copyCard } from '../../redux/slices/cardSlice';
import { fetchLists } from '../../redux/slices/listSlice';
import { Layout, AlignLeft, CreditCard, Trash, Copy, Activity, Tag, Clock, ChevronDown, CheckSquare, Plus, Image as ImageIcon, MoreHorizontal, X } from 'lucide-react';
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
import { User, Paperclip } from 'lucide-react';
import { AttachmentSection } from '../attachment/AttachmentSection';
import { ImagePreviewModal } from '../attachment/ImagePreviewModal';
import { CommentInput } from './CommentInput';
import { ActivityItem, ActivitySkeleton } from './ActivityItem';
import { CoverPopover } from './CoverPopover';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';

export const CardModal = () => {
  const dispatch = useDispatch();
  const { isCardModalOpen, cardData } = useSelector(state => state.ui);
  const { currentBoard } = useSelector(state => state.boards);
  const { currentOrg } = useSelector(state => state.organizations);
  const { lists } = useSelector(state => state.lists);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [showDetails, setShowDetails] = useState(true);
  const [logs, setLogs] = useState([]);
  const [orgMembers, setOrgMembers] = useState([]);
  const [localChecklists, setLocalChecklists] = useState([]);
  const [localMembers, setLocalMembers] = useState([]);
  const [previewImage, setPreviewImage] = useState(null);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const attachmentRef = React.useRef(null);
  const commentInputRef = React.useRef(null);
  const leftColumnRef = React.useRef(null);
  const attachmentScrollRef = React.useRef(null);
  const checklistsEndRef = React.useRef(null);
  const checklistsStartRef = React.useRef(null);

  // Fetch org members for mentions
  useEffect(() => {
    if (currentOrg?._id) {
      api.get(`/api/orgs/${currentOrg._id}`)
        .then(res => setOrgMembers(res.data?.members?.map(m => m.user) || []))
        .catch(err => console.error("Failed to fetch org details", err));
    }
  }, [currentOrg]);

  // Fetch logs whenever card changes
  useEffect(() => {
    if (cardData && isCardModalOpen) {
      setTitle(cardData.title);
      setDescription(cardData.description || '');
      setIsEditingTitle(false);
      setIsEditingDesc(false);
      setLocalChecklists(cardData.checklists || []);
      setLocalMembers(cardData.cardMembers || []);
      setIsLoadingLogs(true);
      api.get(`/api/cards/${cardData._id}/activity`)
        .then(res => {
          setLogs(res.data.data || res.data);
          setIsLoadingLogs(false);
        })
        .catch(err => {
          console.error("Failed to fetch logs", err);
          setIsLoadingLogs(false);
        });
    }
  }, [cardData, isCardModalOpen]);

  if (!cardData) return null;

  // Find the list this card belongs to
  const listIdStr = cardData.listId?._id || cardData.listId;
  const listName = cardData.listId?.title || lists.find(l => l._id === listIdStr)?.title || '...';

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
      api.get(`/api/cards/${cardData._id}/activity`).then(res => setLogs(res.data.data || res.data));
    }
  };

  const handleRemoveCover = async () => {
    await dispatch(updateCard({ id: cardData._id, data: { coverImage: null, coverColor: null } }))
      .unwrap()
      .then(() => toast.success("Cover removed"))
      .catch((err) => toast.error(err || "Failed to remove cover"));
    if (currentBoard?._id) {
      dispatch(fetchLists(currentBoard._id));
      api.get(`/api/cards/${cardData._id}/activity`).then(res => setLogs(res.data.data || res.data));
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
    setTimeout(() => {
      checklistsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }, 100);
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

  const handleAddComment = async (optimisticComment, rawText) => {
    // Optimistic UI
    setLogs(prev => [optimisticComment, ...prev]);

    const mentionRegex = /@(\w+)/g;
    const matches = rawText.match(mentionRegex) || [];
    
    const mentions = matches.map(m => {
      const username = m.slice(1).toLowerCase();
      const user = orgMembers.find(b => 
        (b.firstName + b.lastName).toLowerCase() === username
      );
      return user ? user._id : null;
    }).filter(Boolean);

    try {
      const { data } = await api.post(`/api/cards/${cardData._id}/comments`, {
        text: rawText,
        mentions
      });
      // Ensure backend returns normalized comment structure for ActivityItem
      const normalizedComment = {
        ...data,
        isComment: true,
        action: 'COMMENT',
        userName: data.userId ? `${data.userId.firstName} ${data.userId.lastName}` : 'Unknown',
        userImage: data.userId ? data.userId.imageUrl : ''
      };
      setLogs(prev => prev.map(log => log._id === optimisticComment._id ? normalizedComment : log));
    } catch (err) {
      toast.error('Failed to post comment');
      setLogs(prev => prev.filter(log => log._id !== optimisticComment._id));
    }
  };

  const handleDeleteComment = async (commentId) => {
    // Optimistic UI delete
    const previousLogs = [...logs];
    setLogs(prev => prev.filter(log => log._id !== commentId));
    try {
      await api.delete(`/api/comments/${commentId}`);
      toast.success('Comment deleted');
    } catch (err) {
      toast.error('Failed to delete comment');
      setLogs(previousLogs);
    }
  };

  const handleAttachmentComment = (attachment) => {
    const cleanUrl = attachment.fileUrl.split('?')[0];
    const textToInsert = `[${attachment.fileName}](${cleanUrl})`;
    if (commentInputRef.current) {
      commentInputRef.current.insertText(textToInsert);
    }
  };

  const toggleDateComplete = () => {
    handleUpdate('isDateComplete', !cardData.isDateComplete);
  };

  const hasDates = cardData.startDate || cardData.dueDate;
  const dateStatus = getCardDateStatus(cardData.dueDate, cardData.isDateComplete);
  const badgeColor = getBadgeColor(dateStatus);

  const filteredLogs = showDetails ? logs : logs.filter(log => log.isComment);

  const hasCover = cardData?.coverUrl || cardData?.coverColor;
  const topButtonStyle = hasCover 
    ? "bg-black/30 text-white hover:bg-black/50 border-none"
    : "bg-transparent text-muted-foreground hover:bg-hover-bg border-none";
  const coverColorClass = cardData?.coverColor ? COLORS.find(c => c.id === cardData.coverColor)?.color.split(' ')[0] : '';

  return (
    <ResponsiveModal 
      isOpen={isCardModalOpen} 
      onClose={() => dispatch(closeCardModal())}
      className="max-h-[100dvh] md:max-h-[85vh] md:h-[85vh] flex flex-col overflow-hidden p-4 md:p-6"
    >
      {/* Top Right Action Buttons */}
      <div className="absolute top-4 right-4 z-[60] flex items-center gap-x-2">
        <CoverPopover onUploadClick={() => attachmentRef.current?.openDropzone()}>
          <Button variant="outline" size="icon" className={`h-8 w-8 rounded-full ${topButtonStyle}`}>
            <ImageIcon className="h-4 w-4" />
          </Button>
        </CoverPopover>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="icon" className={`h-8 w-8 rounded-full ${topButtonStyle}`}>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-3" align="end">
            <div className="text-sm font-semibold text-center text-muted-foreground mb-4 pb-2 border-b border-border">Card Actions</div>
            <Button variant="ghost" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-500/10" onClick={handleDelete}>
              <Trash className="h-4 w-4 mr-2" />
              Delete Card
            </Button>
          </PopoverContent>
        </Popover>
        <Button variant="outline" size="icon" className={`h-8 w-8 rounded-full ${topButtonStyle}`} onClick={() => dispatch(closeCardModal())}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {hasCover && (
        <div className={`w-[calc(100%+2rem)] md:w-[calc(100%+3rem)] -mx-4 md:-mx-6 -mt-4 md:-mt-6 mb-4 h-[160px] shrink-0 relative group ${coverColorClass || 'bg-muted'}`}>
          {cardData.coverUrl && (
            <img 
              src={cardData.coverUrl} 
              alt="Cover" 
              className="w-full h-full object-cover rounded-t-lg" 
            />
          )}
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="gray" size="sm" onClick={handleRemoveCover}>
              <Layout className="h-4 w-4 mr-2" />
              Remove cover
            </Button>
          </div>
        </div>
      )}
      <div className={`flex flex-col lg:grid lg:grid-cols-5 lg:gap-6 flex-1 min-h-0 overflow-hidden ${!hasCover ? 'pt-8' : ''}`}>
        {/* Left Column */}
        <div ref={leftColumnRef} className="lg:col-span-3 pb-8 lg:pb-0 overflow-y-auto pr-2 custom-scrollbar min-h-0 h-full">
          <div className="flex items-start gap-x-3 mb-4 w-full">
            <Layout className="h-5 w-5 mt-1 text-muted-foreground" />
            <div className="w-full">
              {!isEditingTitle ? (
                <div 
                  onClick={() => setIsEditingTitle(true)}
                  className="font-semibold text-xl mb-1 cursor-pointer text-foreground"
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
                    } else if (e.key === 'Escape') {
                      setIsEditingTitle(false);
                      setTitle(cardData.title);
                    }
                  }}
                  autoFocus
                  className="font-semibold text-xl px-1 text-foreground mb-0.5 border-transparent focus-visible:bg-input focus-visible:border-primary"
                />
              )}
              <p className="text-sm text-muted-foreground mb-4">
                in list <span className="underline">{listName}</span>
              </p>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap gap-2 mb-6 ml-0">
                <Button variant="gray" size="sm" className="h-8">
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add
                </Button>
                {localChecklists.length > 0 ? (
                  <Button 
                    variant="gray" 
                    size="sm" 
                    className="h-8"
                    onClick={() => {
                      checklistsStartRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }}
                  >
                    <CheckSquare className="h-4 w-4 mr-1.5" />
                    Checklist
                  </Button>
                ) : (
                  <ChecklistPopover onAdd={handleAddChecklist}>
                    <Button variant="gray" size="sm" className="h-8">
                      <CheckSquare className="h-4 w-4 mr-1.5" />
                      Checklist
                    </Button>
                  </ChecklistPopover>
                )}
                <MembersPopover cardMembers={localMembers} onMemberToggle={handleToggleMember}>
                  <Button variant="gray" size="sm" className="h-8">
                    <User className="h-4 w-4 mr-1.5" />
                    Members
                  </Button>
                </MembersPopover>
                <Button 
                  variant="gray" 
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    attachmentRef.current?.openDropzone();
                    setTimeout(() => {
                      attachmentScrollRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  }}
                >
                  <Paperclip className="h-4 w-4 mr-1.5" />
                  Attachment
                </Button>
                <LabelPopover>
                  <Button variant="gray" size="sm" className="h-8">
                    <Tag className="h-4 w-4 mr-1.5" />
                    Labels
                  </Button>
                </LabelPopover>
                <DatePopover>
                  <Button variant="gray" size="sm" className="h-8">
                    <Clock className="h-4 w-4 mr-1.5" />
                    Dates
                  </Button>
                </DatePopover>
                <Button variant="gray" size="sm" className="h-8" onClick={handleCopy}>
                  <Copy className="h-4 w-4 mr-1.5" />
                  Copy
                </Button>
                <Button variant="gray" size="sm" className="h-8 text-red-600 dark:text-red-500 hover:text-red-700 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={handleDelete}>
                  <Trash className="h-4 w-4 mr-1.5" />
                  Delete
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-6 mb-4 w-full">
                {/* Members Section */}
                {localMembers && localMembers.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Members</p>
                    <div className="flex flex-wrap gap-1">
                      {localMembers.map(m => (
                        <MemberAvatar key={m._id || m} member={m} />
                      ))}
                      <MembersPopover cardMembers={localMembers} onMemberToggle={handleToggleMember}>
                        <div role="button" className="w-7 h-7 bg-muted hover:bg-hover-bg rounded-full flex items-center justify-center transition cursor-pointer text-muted-foreground">
                          <span className="font-medium text-sm">+</span>
                        </div>
                      </MembersPopover>
                    </div>
                  </div>
                )}

                {/* Labels Section */}
                {cardData.labels && cardData.labels.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Labels</p>
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
                        <div role="button" className="h-8 w-10 bg-muted hover:bg-hover-bg rounded-sm flex items-center justify-center transition cursor-pointer text-muted-foreground">
                          <span className="font-medium text-lg mb-0.5">+</span>
                        </div>
                      </LabelPopover>
                    </div>
                  </div>
                )}

                {/* Dates Section */}
                {hasDates && (
                  <div>
                    <p className="text-xs font-semibold text-foreground mb-2">Due date</p>
                    <div className="flex items-center gap-x-2">
                      <input 
                        type="checkbox" 
                        className="w-4 h-4 rounded-sm border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                        checked={cardData.isDateComplete || false}
                        onChange={toggleDateComplete}
                      />
                      <DatePopover>
                        <div role="button" className="h-8 px-3 bg-muted hover:bg-hover-bg rounded-sm flex items-center justify-center transition cursor-pointer text-foreground text-sm font-semibold">
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

          {/* Description */}
          <div className="flex items-start gap-x-3 w-full mb-8">
            <AlignLeft className="h-5 w-5 mt-0.5 text-muted-foreground" />
            <div className="w-full">
              <div className="flex items-center justify-between mb-2">
                <p className="font-semibold text-foreground">Description</p>
                {description && !isEditingDesc && (
                  <Button variant="gray" size="sm" onClick={() => setIsEditingDesc(true)}>Edit</Button>
                )}
              </div>
              {!isEditingDesc ? (
                <div
                  onClick={() => setIsEditingDesc(true)}
                  role="button"
                  className="min-h-[78px] bg-muted hover:bg-hover-bg transition text-sm font-medium py-3 px-3.5 rounded-md"
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
                    autoFocus
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

          <div ref={attachmentScrollRef}>
            <AttachmentSection 
              ref={attachmentRef}
              cardId={cardData._id} 
              onPreviewImage={(url) => setPreviewImage(url)}
              coverImageKey={cardData.coverImage}
              onSetCover={(key) => handleUpdate('coverImage', key)}
              onComment={handleAttachmentComment}
            />
          </div>

          {/* Checklists */}
          {localChecklists.length > 0 && (
            <div className="mb-4 mt-8" ref={checklistsStartRef}>
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
          <div ref={checklistsEndRef} />
        </div>
        
        {/* Right Column: Comments and Activity */}
        <div className="lg:col-span-2 pb-10 lg:pb-0 h-full flex flex-col overflow-y-auto pr-2 custom-scrollbar min-h-0">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-x-3">
              <Activity className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Comments and activity</h3>
            </div>
            <Button variant="gray" size="sm" onClick={() => setShowDetails(!showDetails)}>
              {showDetails ? 'Hide details' : 'Show details'}
            </Button>
          </div>

          <CommentInput 
            ref={commentInputRef}
            cardId={cardData._id}
            boardMembers={orgMembers}
            onAddComment={handleAddComment}
          />

          <ol className="mt-4 space-y-2">
            {isLoadingLogs ? (
              <>
                <ActivitySkeleton />
                <ActivitySkeleton />
              </>
            ) : filteredLogs.map((log) => (
              <ActivityItem 
                key={log._id} 
                log={log} 
                onDelete={handleDeleteComment} 
              />
            ))}
          </ol>
        </div>
      </div>

      <ImagePreviewModal 
        isOpen={!!previewImage} 
        imageUrl={previewImage} 
        onClose={() => setPreviewImage(null)} 
      />
    </ResponsiveModal>
  );
};
