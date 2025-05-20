'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '../../lib/auth-store';

export default function Dashboard() {
    const router = useRouter();
    const { token, user } = authStore.getState();
  
    useEffect(() => {
      if (!token) {
        router.push('/login');
      }
    }, [token, router]);
  
    if (!token) return <div>Loading...</div>;
  
    return (
      <div>
        <h1>Welcome, {user?.email || 'User'}</h1>
        {/* Rest of your dashboard */}
      </div>
    );
}