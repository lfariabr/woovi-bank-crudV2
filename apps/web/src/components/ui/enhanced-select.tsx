'use client';

import React, { useEffect } from 'react';
import { cn } from '../../lib/utils';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
} from './select';

type EnhancedSelectProps = {
  placeholder?: string;
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  children: React.ReactNode;
  id?: string;
  className?: string;
  contentClassName?: string;
};

/**
 * Enhanced Select component that wraps shadcn-ui Select components
 * for consistent styling and behavior.s
 */
export function EnhancedSelect({
  placeholder,
  value,
  onValueChange,
  disabled = false,
  children,
  id,
  className,
  contentClassName,
}: EnhancedSelectProps) {
  // Add global styles to fix z-index issues
  useEffect(() => {
    // Only run this in the browser
    if (typeof document !== 'undefined') {
      const styleId = 'shadcn-select-fixes';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          /* Force high z-index on Radix UI components */
          [data-radix-popper-content-wrapper] {
            z-index: 9999 !important;
          }
          /* Fix for transparent/hidden select dropdowns */
          .select-content {
            background-color: white !important;
            border: 1px solid #e5e7eb !important;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
            border-radius: 0.375rem !important;
          }
          /* Make sure dropdowns are always interactive */
          [data-radix-popper-content-wrapper] * {
            pointer-events: auto !important;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, []);

  return (
    <Select
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
    >
      <SelectTrigger
        id={id}
        className={cn('w-full rounded-lg border-2 focus:border-[#03d69d] transition-colors duration-200', 
          disabled ? 'opacity-60' : 'hover:border-gray-300',
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>

      <SelectContent 
        className={cn('select-content w-full rounded-lg border-2 border-[#03d69d] shadow-lg', contentClassName)}
        position="popper"
        sideOffset={5}
        align="start"
        avoidCollisions
      >
        <SelectGroup className="p-1">
          {children}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
