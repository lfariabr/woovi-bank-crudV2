import type { Metadata } from 'next';
// Temporarily disabled font loading to fix build error
// import { Inter } from 'next/font/google';
import './globals.css';
import { Layout } from '../components/Layout';
import { RelayProvider } from '../providers/RelayProvider';

// const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Woovi',
  description: 'Woovi - Bank Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <RelayProvider>
          <Layout>
            {children}
          </Layout>
        </RelayProvider>
      </body>
    </html>
  );
}
