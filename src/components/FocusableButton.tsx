
import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface FocusableButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'default' | 'filter' | 'action';
  isActive?: boolean;
  isFocused?: boolean;
}

const FocusableButton = forwardRef<HTMLButtonElement, FocusableButtonProps>(
  ({ children, variant = 'default', isActive = false, isFocused = false, className, ...props }, ref) => {
    const baseClasses = "transition-all duration-200 outline-none";
    
    const variantClasses = {
      default: "px-4 py-2 rounded-xl font-semibold",
      filter: "px-6 py-2 rounded-lg font-medium",
      action: "flex items-center gap-2 px-4 py-3 rounded-xl font-semibold"
    };

    const stateClasses = {
      default: isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" 
        : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 hover:text-white",
      filter: isActive 
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25" 
        : "bg-slate-800/50 text-gray-300 hover:bg-slate-700/50 hover:text-white",
      action: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg hover:shadow-purple-600/25"
    };

    const focusClasses = isFocused 
      ? "ring-4 ring-blue-400/60 ring-offset-2 ring-offset-slate-900 scale-105" 
      : "";

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          stateClasses[variant],
          focusClasses,
          className
        )}
        tabIndex={isFocused ? 0 : -1}
        {...props}
      >
        {children}
      </button>
    );
  }
);

FocusableButton.displayName = 'FocusableButton';

export default FocusableButton;
