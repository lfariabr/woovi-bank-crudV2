'use client';

import React from 'react';
import { Button } from '../components/ui/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Something went wrong!</h2>
        </div>
        <p className="text-gray-600 max-w-md">
          We apologize for the inconvenience. An error occurred while processing your request.
        </p>
        <div className="flex justify-center space-x-4">
          <Button
            onClick={reset}
            className="bg-gradient-to-r from-[#03d69d] to-[#02b987] text-white hover:shadow-lg transition-all"
          >
            Try again
          </Button>
          <Button
            variant="outline" 
            onClick={() => window.location.href = '/'}
            className="border-2 hover:border-gray-300"
          >
            Go to Home
          </Button>
        </div>
      </div>
    </div>
  );
}
