import { Inter } from 'next/font/google';
import Container from '@/components/components/global/Container';
import Navbar from '@/components/components/navbar/Navbar';
import Providers from './providers';
import { AuthProvider } from '@/pages/AuthContext'; // Add AuthProvider

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={inter.className}>
      <AuthProvider>
        <Providers>
          <Navbar />
          <Container className='py-20'>{children}</Container>
        </Providers>
      </AuthProvider>

    </div>
  );
}
