import React from 'react';

const Avatar = ({ src, alt = 'User', size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'w-8 h-8 text-xs',
    medium: 'w-10 h-10 text-sm',
    large: 'w-16 h-16 text-lg',
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`rounded-full object-cover border border-gray-150 dark:border-dark-700 ${sizeClasses[size]} ${className}`}
      />
    );
  }

  return (
    <div
      className={`rounded-full flex items-center justify-center font-bold bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 select-none uppercase ${sizeClasses[size]} ${className}`}
    >
      {getInitials(alt)}
    </div>
  );
};

export default Avatar;
