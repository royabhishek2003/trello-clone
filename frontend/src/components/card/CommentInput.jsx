import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Button } from '../ui/button';
import { Type, Bold, Italic, List, Plus, Paperclip, Smile } from 'lucide-react';
import { useSelector } from 'react-redux';

export const CommentInput = forwardRef(({ cardId, boardMembers, onAddComment }, ref) => {
  const [content, setContent] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionIndex, setMentionIndex] = useState(-1);
  const [selectedMentionIndex, setSelectedMentionIndex] = useState(0);
  
  const textareaRef = useRef(null);
  const { user } = useSelector(state => state.auth);

  // Auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  useImperativeHandle(ref, () => ({
    insertText: (text) => {
      setContent(prev => prev ? `${prev}\n${text}` : text);
      setIsExpanded(true);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(textareaRef.current.value.length, textareaRef.current.value.length);
        }
      }, 0);
    }
  }));

  // Handle Mentions Dropdown
  const filteredMembers = boardMembers.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().includes(mentionSearch.toLowerCase())
  );

  const handleKeyDown = (e) => {
    if (showMentions) {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedMentionIndex(prev => (prev + 1) % filteredMembers.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedMentionIndex(prev => (prev - 1 + filteredMembers.length) % filteredMembers.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        selectMention(filteredMembers[selectedMentionIndex]);
      } else if (e.key === 'Escape') {
        setShowMentions(false);
      }
      return;
    }

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment();
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setContent(val);

    // Naive mention detection: Last word starts with @
    const cursor = e.target.selectionStart;
    const textBeforeCursor = val.slice(0, cursor);
    const match = textBeforeCursor.match(/(?:^|\s)@(\w*)$/);

    if (match) {
      setMentionSearch(match[1]);
      setShowMentions(true);
      setMentionIndex(match.index + (match[0].startsWith(' ') ? 1 : 0));
      setSelectedMentionIndex(0);
    } else {
      setShowMentions(false);
    }
  };

  const selectMention = (member) => {
    if (!member) return;
    const beforeMention = content.slice(0, mentionIndex);
    const afterMention = content.slice(textareaRef.current.selectionStart);
    const newText = `${beforeMention}@${member.firstName}${member.lastName} ${afterMention}`;
    setContent(newText);
    setShowMentions(false);
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const submitComment = () => {
    if (!content.trim()) return;
    
    // Optimistic UI Data
    const tempId = `temp-${Date.now()}`;
    const newComment = {
      _id: tempId,
      cardId,
      userId: user, // populated user object
      text: content,
      mentions: [], // extract from text later
      createdAt: new Date().toISOString(),
      isComment: true,
      userName: `${user.firstName} ${user.lastName}`,
      userImage: user.imageUrl || ''
    };

    onAddComment(newComment, content); // pass both optimistic and raw text
    setContent('');
    setIsExpanded(false);
    setShowMentions(false);
  };

  return (
    <div className="flex gap-x-3 w-full mb-6 relative">
      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shrink-0 mt-0.5">
        {user?.imageUrl ? (
          <img src={user.imageUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          user?.firstName?.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex-1 border border-border rounded-xl overflow-hidden bg-card text-card-foreground shadow-sm transition focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsExpanded(true)}
          placeholder="Write a comment..."
          className="w-full text-sm resize-none px-3 py-2.5 outline-none bg-transparent min-h-[40px] max-h-[300px] text-foreground placeholder:text-muted-foreground"
          rows={1}
        />
        
        {isExpanded && (
          <div className="flex items-center justify-between px-2 py-2 bg-muted/30 border-t border-border">
            <div className="flex items-center gap-x-0.5 text-muted-foreground">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm hover:bg-hover-bg text-muted-foreground hover:text-foreground">
                <Type className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm hover:bg-hover-bg text-muted-foreground hover:text-foreground">
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm hover:bg-hover-bg text-muted-foreground hover:text-foreground">
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <div className="w-px h-4 bg-border mx-1" />
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm hover:bg-hover-bg text-muted-foreground hover:text-foreground">
                <List className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm hover:bg-hover-bg text-muted-foreground hover:text-foreground">
                <Plus className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm hover:bg-hover-bg text-muted-foreground hover:text-foreground">
                <Smile className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0 rounded-sm hover:bg-hover-bg text-muted-foreground hover:text-foreground">
                <Paperclip className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="flex items-center gap-x-2">
              <Button size="sm" variant="primary" className="h-7 text-xs font-semibold px-3" disabled={!content.trim()} onClick={submitComment}>
                Save
              </Button>
            </div>
          </div>
        )}
      </div>

      {showMentions && filteredMembers.length > 0 && (
        <div className="absolute top-10 left-11 w-64 bg-popover text-popover-foreground border-border shadow-lg rounded-md z-50 overflow-hidden">
          {filteredMembers.map((member, i) => (
            <div
              key={member._id}
              className={`flex items-center gap-x-2 px-3 py-2 cursor-pointer ${i === selectedMentionIndex ? 'bg-primary/10' : 'hover:bg-hover-bg'}`}
              onClick={() => selectMention(member)}
            >
              <div className="w-6 h-6 bg-muted text-muted-foreground rounded-full flex items-center justify-center text-xs font-semibold">
                {member.imageUrl ? (
                  <img src={member.imageUrl} className="w-full h-full rounded-full object-cover" />
                ) : (
                  member.firstName.charAt(0)
                )}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-foreground">{member.firstName} {member.lastName}</span>
                <span className="text-xs text-muted-foreground">@{member.firstName}{member.lastName}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});
