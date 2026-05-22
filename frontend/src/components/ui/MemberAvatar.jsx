import React from 'react';

export const MemberAvatar = ({ member, className = '', onClick }) => {
  const name = member?.firstName && member?.lastName 
    ? `${member.firstName} ${member.lastName}` 
    : member?.email || 'Unknown';
    
  const initials = member?.firstName 
    ? member.firstName.charAt(0).toUpperCase() 
    : (member?.email ? member.email.charAt(0).toUpperCase() : '?');

  return (
    <div 
      className={`w-7 h-7 bg-purple-700 text-white rounded-full flex items-center justify-center text-xs font-semibold shrink-0 select-none ${onClick ? 'cursor-pointer' : ''} ${className}`}
      title={name}
      onClick={onClick}
    >
      {initials}
    </div>
  );
};
