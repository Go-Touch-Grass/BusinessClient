import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import Container from '@/components/components/global/Container';
import Navbar from '@/components/components/navbar/Navbar';
const inter = Inter({ subsets: ['latin'] });



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    
      <html lang='en' suppressHydrationWarning>
        <body className={inter.className}>
          
            <Navbar />
            <Container>{children}</Container>
          
        </body>
      </html>
    
  );
}