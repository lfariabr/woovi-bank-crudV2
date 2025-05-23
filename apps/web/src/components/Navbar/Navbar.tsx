'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { authStore } from '../../lib/auth-store';
import styles from './Navbar.module.css';

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
        }
        router.push('/login');
        router.refresh(); // Ensure the page updates after logout
    };

    // Show or hide navbar on login/register pages
    // if (pathname === '/login' || pathname === '/register') {
    //     return null;
    // }

    return (
        <nav className={styles.navbar}>
            <div className={styles.logo}>
                <Link href="/">
                    <Image
                        src="/logo.png"
                        alt="Woovi Logo"
                        width={80}
                        height={80}
                        priority
                    />
                </Link>
            </div>
            
            <ul className={styles.navLinks}>
                {isClient && token ? (
                    // if user is logged in
                    <>
                        <li>
                            <Link 
                                className={pathname === '/admin' ? styles.active : ''}
                                href="/admin"
                            >
                                Admin
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/dashboard" 
                                className={pathname === '/dashboard' ? styles.active : ''}
                            >
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link 
                                href="/transactions" 
                                className={pathname === '/transactions' ? styles.active : ''}
                            >
                                Transactions
                            </Link>
                        </li>

                        {user?.email && (
                            <li className={styles.userEmail}>
                                Welcome, {user.email}
                                <br />
                                <button 
                                    onClick={handleLogout}
                                    className={styles.logoutButton}
                                >
                                    Logout
                                </button>
                            </li>
                        )}
                    </>
                ) : (
                    // if user is not logged in, show login button
                    <li>
                        <Link 
                            href="/login" 
                            className={pathname === '/login' ? styles.active : ''}
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