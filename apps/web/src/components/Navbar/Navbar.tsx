"use client"
import React from 'react';
import Link from 'next/link';
// import Images from '../../assets/images';
import styles from './Navbar.module.css';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

const Navbar: React.FC = () => {
    const pathname = usePathname();
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
                <li>
                    <Link href="/login" className={
                        pathname === "/login" 
                            ? styles.active 
                            : ""
                    }>Login</Link>
                </li>
            </ul>
        </nav>
    );
};

export default Navbar;
