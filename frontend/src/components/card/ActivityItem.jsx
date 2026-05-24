import React from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Skeleton } from '../ui/skeleton';

export const ActivitySkeleton = () => (
  <li className="flex items-start gap-x-3 w-full mb-4">
    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
    <div className="flex flex-col w-full gap-y-2">
      <div className="flex items-center gap-x-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-12 w-full rounded-md" />
    </div>
  </li>
);

export const ActivityItem = React.memo(({ log, onDelete, onEdit }) => {
  const isComment = log.isComment || log.action === 'COMMENT';

  // Parse mentions and markdown links into styled elements
  const renderTextWithMentions = (text) => {
    if (!text) return null;
    // Regex matches [text](url) OR @mention
    const regex = /(\[[^\]]+\]\(https?:\/\/[^\s)]+\)|@\w+)/g;
    const parts = text.split(regex);
    return parts.map((part, i) => {
      if (part.startsWith('@')) {
        return <span key={i} className="text-blue-700 bg-blue-50 px-1 py-0.5 rounded-sm font-medium">{part}</span>;
      }
      const linkMatch = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
      if (linkMatch) {
        return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{linkMatch[1]}</a>;
      }
      return <span key={i} className="whitespace-pre-wrap">{part}</span>;
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
          <span className="font-semibold text-sm text-foreground">{log.userName}</span>
          <span className="text-xs text-muted-foreground hover:underline cursor-pointer" title={format(new Date(log.createdAt), "MMM d, yyyy 'at' h:mm a")}>
            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
          </span>
        </div>
        
        {isComment ? (
          <div className="bg-card border-border border rounded-md shadow-sm px-3 py-2 text-sm text-card-foreground w-full mb-1">
            {renderTextWithMentions(log.text)}
          </div>
        ) : (
          <p className="text-sm text-foreground">
            {log.details ? (
              <>{log.details} <span className="font-medium">"{log.entityTitle}"</span></>
            ) : (
              <>{log.action.toLowerCase()}d card <span className="font-medium">"{log.entityTitle}"</span></>
            )}
          </p>
        )}

        {isComment && onDelete && (
          <div className="flex items-center gap-x-2 text-xs text-muted-foreground font-medium">
            <button className="hover:underline hover:text-foreground">Edit</button>
            <span>•</span>
            <button className="hover:underline hover:text-foreground" onClick={() => onDelete(log._id)}>Delete</button>
          </div>
        )}
      </div>
    </li>
  );
});

ActivityItem.displayName = 'ActivityItem';
