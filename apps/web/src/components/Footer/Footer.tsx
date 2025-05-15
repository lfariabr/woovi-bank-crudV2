"use client"
import React from 'react';
import Link from 'next/link';
// import Images from '../../assets/images';
import styles from './Footer.module.css';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
    const pathname = usePathname();
    return (
        <footer className={styles.footer}>
            <div className={styles.left}>
                {/* <Image
                    src="/logo.png"
                    alt="Site Logo"
                    width={50}
                    height={50}
                /> */}
                <span>Woovi</span>
            </div>

            {/* Center Section: Links */}
            <div className={styles.center}>
                <a href="/about">About Us</a>
                <a href="/contact">Contact</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/terms">Terms of Service</a>
            </div>

        </footer>
    );
};

export default Footer;
