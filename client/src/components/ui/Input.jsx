import React from 'react';

const Input = React.forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  name,
  error,
  className = '',
  ...props
}, ref) => {
  return (
    <div className={`w-full flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <input
        type={type}
        name={name}
        ref={ref}
        placeholder={placeholder}
        className={`w-full px-4 py-3 text-sm rounded-lg bg-white dark:bg-dark-800 border ${
          error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-200 dark:border-dark-700 focus:ring-blue-500 focus:border-blue-500'
        } text-gray-800 dark:text-gray-200 placeholder-gray-400 outline-none focus:ring-2 focus:ring-offset-0 transition-all`}
        {...props}
      />
      {error && (
        <span className="text-xs text-red-500 font-medium">
          {error.message || error}
        </span>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
