'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authStore } from '../../lib/auth-store';

export default function Dashboard() {
    const router = useRouter();
    const { token, user } = authStore.getState();

    const checkTokenValidity = async () => {
      try {
        const response = await fetch('http://localhost:4000/graphql', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: '{ me { id } }'
          })
        });
        
        if (response.status === 401) {
          authStore.setState({ token: null, user: null });
          router.push('/login');
        }
      } catch (error) {
        console.error('Auth check failed');
      }
    };
    
    checkTokenValidity();
    const interval = setInterval(checkTokenValidity, 60000); // Check every 60 seconds
  
    useEffect(() => {
      if (!token) {
        router.push('/login');
      }
    }, [token, router]);
  
    if (!token) return <div>Loading...</div>;
  
    return (
      <div>
        <h1>Welcome, {user?.email || 'User'}</h1>
        {/* TODO: Rest of dashboard */}
      </div>
    );
}