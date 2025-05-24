'use client';

import { Loader2 } from 'lucide-react';

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-[70vh]">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-[#03d69d]" />
        <p className="text-lg font-medium text-gray-600">Loading...</p>
      </div>
    </div>
  );
}
