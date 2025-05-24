'use client';

import Link from 'next/link';
import { Button } from '../components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <div className="space-y-6 text-center">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-[#edfdf9] flex items-center justify-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#03d69d]">
              <path d="M16 16v2a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v2" />
              <path d="M10 10h10l-4-4" />
              <path d="M10 14h10l-4 4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Page Not Found</h2>
        </div>
        <p className="text-gray-600 max-w-md">
          Sorry, the page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex justify-center">
          <Button
            asChild
            className="bg-gradient-to-r from-[#03d69d] to-[#02b987] text-white hover:shadow-lg transition-all"
          >
            <Link href="/">
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
