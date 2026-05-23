import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';

export const ActivityItem = React.memo(({ log, onDelete, onEdit }) => {
  const isComment = log.isComment || log.action === 'COMMENT';

  // Parse mentions into styled elements
  const renderTextWithMentions = (text) => {
    if (!text) return null;
    const parts = text.split(/(@\w+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm font-medium">{part}</span>;
      }
      return <span key={i}>{part}</span>;
    });
  };

  return (
    <li className="flex items-start gap-x-3 w-full mb-4">
      <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold shrink-0">
        {log.userImage ? (
          <img src={log.userImage} alt="Avatar" className="w-full h-full rounded-full object-cover" />
        ) : (
          log.userName?.charAt(0).toUpperCase()
        )}
      </div>
      <div className="flex flex-col w-full">
        <div className="flex items-center gap-x-2 mb-1">
          <span className="font-semibold text-sm text-neutral-800">{log.userName}</span>
          <span className="text-xs text-neutral-500 hover:underline cursor-pointer" title={format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}>
            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        {isComment ? (
          <div className="bg-white border rounded-md shadow-sm px-3 py-2 text-sm text-neutral-700 w-full mb-1">
            {renderTextWithMentions(log.text)}
          </div>
        ) : (
          <p className="text-sm text-neutral-700">
            {log.action.toLowerCase()}d card <span className="font-medium">"{log.entityTitle}"</span>
          </p>
        )}

        {isComment && onDelete && (
          <div className="flex items-center gap-x-2 text-xs text-neutral-500 font-medium">
            <button className="hover:underline hover:text-neutral-700">Edit</button>
            <span>•</span>
            <button className="hover:underline hover:text-neutral-700" onClick={() => onDelete(log._id)}>Delete</button>
          </div>
        )}
      </div>
    </li>
  );
});

ActivityItem.displayName = 'ActivityItem';
