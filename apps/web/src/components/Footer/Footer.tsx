"use client"
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const Footer: React.FC = () => {
    const pathname = usePathname();
    return (
        <footer style={{ width: '100%', padding: '24px 20px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb', marginTop: 'auto' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#03d69d' }}>Woovi</span>
                        <p style={{ fontSize: '0.875rem', color: '#6b7280', marginTop: '8px' }}>Simplified banking for everyone</p>
                    </div>

                    {/* Center Section: Links */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px' }}>
                        <a href="/about" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>About Us</a>
                        <a href="/contact" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Contact</a>
                        <a href="/privacy" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Privacy Policy</a>
                        <a href="/terms" style={{ color: '#4b5563', textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500 }}>Terms of Service</a>
                    </div>
                </div>
                
                <div style={{ paddingTop: '16px', borderTop: '1px solid #f3f4f6', display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', textAlign: 'center' }}>
                    <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '8px 0' }}>© {new Date().getFullYear()} Woovi. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
