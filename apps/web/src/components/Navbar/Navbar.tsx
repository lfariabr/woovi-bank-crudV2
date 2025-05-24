'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { authStore } from '../../lib/auth-store';

const Navbar: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { token, user } = authStore.getState();
    const [isClient, setIsClient] = React.useState(false);

    // ensures we're on the client before accessing localStorage
    React.useEffect(() => {
        setIsClient(true);
    }, []);

    const handleLogout = () => {
        authStore.setState({ token: null, user: null });
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        router.push('/login');
        router.refresh(); // Ensure the page updates after logout
    };

    // Show or hide navbar on login/register pages
    // if (pathname === '/login' || pathname === '/register') {
    //     return null;
    // }

    return (
        <nav style={{ width: '100%', borderBottom: '1px solid #e5e7eb', background: 'white', padding: '10px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Link href="/" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
                    <Image
                        src="/logo.png"
                        alt="Woovi Logo"
                        width={45}
                        height={45}
                        style={{ marginRight: '10px' }}
                        priority
                    />
                    <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#03d69d' }}>Woovi</span>
                </Link>
            </div>
            
            <ul style={{ display: 'flex', alignItems: 'center', listStyle: 'none', gap: '20px', margin: 0, padding: 0 }}>
                {isClient && token ? (
                    // if user is logged in
                    <>
                        <li>
                            <Link 
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    color: pathname === '/admin' ? 'white' : '#4b5563',
                                    backgroundColor: pathname === '/admin' ? '#03d69d' : 'transparent',
                                    fontWeight: 500
                                }}
                                href="/admin"
                            >
                                Admin
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/dashboard" 
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    color: pathname === '/dashboard' ? 'white' : '#4b5563',
                                    backgroundColor: pathname === '/dashboard' ? '#03d69d' : 'transparent',
                                    fontWeight: 500
                                }}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/transactions" 
                                style={{
                                    padding: '8px 16px',
                                    borderRadius: '4px',
                                    textDecoration: 'none',
                                    color: pathname === '/transactions' ? 'white' : '#4b5563',
                                    backgroundColor: pathname === '/transactions' ? '#03d69d' : 'transparent',
                                    fontWeight: 500
                                }}
                            >
                                Transactions
                            </Link>
                        </li>

                        {user?.email && (
                            <li style={{ marginLeft: '20px', paddingLeft: '20px', borderLeft: '1px solid #e5e7eb' , marginRight: '20px'}}>
                                <div>
                                    <span style={{ fontSize: '0.875rem', color: '#4b5563' }}>Hi, {user.first_name}</span>
                                    <br />
                                    <button 
                                        onClick={handleLogout}
                                        style={{ 
                                            fontSize: '0.875rem', 
                                            color: '#ef4444', 
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: '0',
                                            marginTop: '4px'
                                        }}
                                    >
                                        Logout
                                    </button>
                                </div>
                            </li>
                        )}
                    </>
                ) : (
                    // if user is not logged in, show login button
                    <li>
                        <Link 
                            href="/login" 
                            style={{
                                padding: '8px 16px',
                                borderRadius: '4px',
                                backgroundColor: '#03d69d',
                                color: 'white',
                                textDecoration: 'none',
                                fontWeight: 500
                            }}
                        >
                            Login
                        </Link>
                    </li>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;