import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { X, ChevronLeft, Edit2 } from 'lucide-react';
import { fetchLabels, createLabel, updateLabel, deleteLabel } from '../../redux/slices/labelSlice';
import { updateCardLabels } from '../../redux/slices/cardSlice';
import { fetchLists } from '../../redux/slices/listSlice';

export const COLORS = [
  { id: 'green', color: 'bg-green-600 hover:bg-green-700' },
  { id: 'yellow', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { id: 'orange', color: 'bg-orange-500 hover:bg-orange-600' },
  { id: 'red', color: 'bg-red-600 hover:bg-red-700' },
  { id: 'purple', color: 'bg-purple-600 hover:bg-purple-700' },
  { id: 'blue', color: 'bg-blue-600 hover:bg-blue-700' },
  { id: 'sky', color: 'bg-sky-500 hover:bg-sky-600' },
  { id: 'pink', color: 'bg-pink-600 hover:bg-pink-700' },
  { id: 'lime', color: 'bg-lime-500 hover:bg-lime-600' },
  { id: 'black', color: 'bg-slate-800 hover:bg-slate-900' },
];

export const LabelPopover = ({ children }) => {
  const dispatch = useDispatch();
  const { currentBoard } = useSelector(state => state.boards);
  const { labels, loading } = useSelector(state => state.labels);
  const { cardData } = useSelector(state => state.ui);

  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit'
  const [editingLabel, setEditingLabel] = useState(null);
  const [title, setTitle] = useState('');
  const [selectedColor, setSelectedColor] = useState('green');

  // Load board labels when popover opens
  useEffect(() => {
    if (isOpen && currentBoard?._id) {
      dispatch(fetchLabels(currentBoard._id));
    }
  }, [isOpen, currentBoard, dispatch]);

  const resetForm = () => {
    setTitle('');
    setSelectedColor('green');
    setEditingLabel(null);
  };

  const handleCreate = async () => {
    const action = await dispatch(createLabel({
      boardId: currentBoard._id,
      data: { title, color: selectedColor }
    }));
    
    // Automatically apply newly created label to the card
    if (action.payload && action.payload._id && cardData) {
      const currentLabels = cardData.labels || [];
      const currentLabelIds = currentLabels.map(l => l._id || l);
      const newLabelIds = [...currentLabelIds, action.payload._id];
      await dispatch(updateCardLabels({ id: cardData._id, labels: newLabelIds }));
      if (currentBoard?._id) dispatch(fetchLists(currentBoard._id));
    }
    
    setView('list');
  };

  const handleUpdate = async () => {
    if (!editingLabel) return;
    await dispatch(updateLabel({
      id: editingLabel._id,
      data: { title, color: selectedColor }
    }));
    if (currentBoard?._id) dispatch(fetchLists(currentBoard._id));
    setView('list');
  };

  const handleDelete = async () => {
    if (!editingLabel) return;
    await dispatch(deleteLabel(editingLabel._id));
    // Optimistically update cardData labels by removing the deleted label id
    if (cardData.labels) {
       const newLabels = cardData.labels.filter(l => (l._id || l) !== editingLabel._id);
       await dispatch(updateCardLabels({ id: cardData._id, labels: newLabels.map(l => l._id || l) }));
       if (currentBoard?._id) dispatch(fetchLists(currentBoard._id));
    }
    setView('list');
  };

  const toggleLabel = async (labelId) => {
    if (!cardData) return;
    const currentLabels = cardData.labels || [];
    // labels can be populated objects or strings
    const currentLabelIds = currentLabels.map(l => l._id || l);
    
    let newLabelIds;
    if (currentLabelIds.includes(labelId)) {
      newLabelIds = currentLabelIds.filter(id => id !== labelId);
    } else {
      newLabelIds = [...currentLabelIds, labelId];
    }
    await dispatch(updateCardLabels({ id: cardData._id, labels: newLabelIds }));
    if (currentBoard?._id) dispatch(fetchLists(currentBoard._id));
  };

  const isLabelActive = (labelId) => {
    if (!cardData || !cardData.labels) return false;
    return cardData.labels.some(l => (l._id || l) === labelId);
  };

  return (
    <Popover modal={true} open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) setView('list');
    }}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-80 pt-3 max-h-[300px] overflow-y-auto" align="start" side="bottom">
        <div className="relative flex items-center justify-center pb-2 mb-4 border-b">
          {view !== 'list' && (
            <Button
              className="absolute left-0 top-0 h-auto w-auto p-1 text-neutral-600"
              variant="ghost"
              onClick={() => setView('list')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <span className="font-semibold text-sm text-neutral-700">
            {view === 'list' && 'Labels'}
            {view === 'create' && 'Create label'}
            {view === 'edit' && 'Edit label'}
          </span>
          <Button
            className="absolute right-0 top-0 h-auto w-auto p-1 text-neutral-600"
            variant="ghost"
            onClick={() => setIsOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        {view === 'list' && (
          <div className="flex flex-col gap-y-2">
            <p className="text-xs font-semibold text-neutral-700">Labels</p>
            {loading ? (
              <p className="text-sm text-neutral-500">Loading...</p>
            ) : labels.length === 0 ? (
              <p className="text-sm text-neutral-500 mb-2">No labels found.</p>
            ) : (
              <ul className="flex flex-col gap-y-1 mb-2">
                {labels.map(label => {
                  const colorObj = COLORS.find(c => c.id === label.color) || COLORS[0];
                  const isActive = isLabelActive(label._id);
                  return (
                    <li key={label._id} className="flex items-center gap-x-2">
                      <div
                        onClick={() => toggleLabel(label._id)}
                        role="button"
                        className={`flex-1 h-8 px-3 rounded-sm flex items-center text-white font-semibold text-sm transition cursor-pointer ${colorObj.color.split(' ')[0]} hover:opacity-80`}
                      >
                        <span className="truncate">{label.title}</span>
                        {isActive && <div className="ml-auto w-2 h-2 rounded-full bg-white" />}
                      </div>
                      <Button
                        variant="ghost"
                        className="h-8 w-8 p-0 shrink-0 rounded-sm hover:bg-neutral-200"
                        onClick={() => {
                          setEditingLabel(label);
                          setTitle(label.title);
                          setSelectedColor(label.color);
                          setView('edit');
                        }}
                      >
                        <Edit2 className="h-4 w-4 text-neutral-600" />
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
            <Button
              className="w-full bg-neutral-200 text-neutral-700 hover:bg-neutral-300 transition"
              onClick={() => {
                resetForm();
                setView('create');
              }}
            >
              Create a new label
            </Button>
          </div>
        )}

        {(view === 'create' || view === 'edit') && (
          <div className="flex flex-col gap-y-4">
            <div className="flex items-center justify-center mb-4">
               {/* Preview */}
               <div className={`w-full max-w-[240px] h-8 px-3 rounded-sm flex items-center text-white font-semibold text-sm ${COLORS.find(c => c.id === selectedColor)?.color.split(' ')[0]}`}>
                 {title || 'Preview'}
               </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-neutral-700">Title</label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Label name"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-neutral-700">Select a color</label>
              <div className="grid grid-cols-5 gap-2">
                {COLORS.map(c => (
                  <div
                    key={c.id}
                    onClick={() => setSelectedColor(c.id)}
                    role="button"
                    className={`h-8 rounded-sm cursor-pointer border-2 transition ${c.color.split(' ')[0]} ${selectedColor === c.id ? 'border-blue-600' : 'border-transparent hover:opacity-80'}`}
                  />
                ))}
              </div>
            </div>

            {view === 'create' ? (
              <Button className="w-full" onClick={handleCreate}>Create</Button>
            ) : (
              <div className="flex items-center justify-between gap-x-2">
                <Button className="flex-1" onClick={handleUpdate}>Save</Button>
                <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
};
