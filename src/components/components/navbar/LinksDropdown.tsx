import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/components/ui/dropdown-menu';
import { LuAlignLeft } from 'react-icons/lu';
import Link from 'next/link';
import { Button } from '../ui/button';

import { useAuth } from '@/pages/AuthContext';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';

// Define the type for the dropdown items
interface DropdownItem {
  label: string;
  href: string;
  onClick?: () => void;
}

const LinksDropdown = () => {
  const { isLoggedIn, setIsLoggedIn } = useAuth();
  const router = useRouter(); // Use useRouter instead of importing router directly

  // Default links for all users
  let links: DropdownItem[] = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about' },
  ];

  const clearAllCookies = () => {
    const allCookies = Cookies.get();
    Object.keys(allCookies).forEach(cookieName => Cookies.remove(cookieName));
    console.log('All cookies cleared:', Cookies.get());
  };

  // Logout handler
  const handleLogout = () => {
    // Remove cookies and reset auth state
    clearAllCookies();
    setIsLoggedIn(false);
    router.push('/'); // Redirect to homepage or login
    console.log('Logout process initiated');

    if (typeof window !== 'undefined') {
      window.history.replaceState(null, '', window.location.href); // Disable the back button by replacing the current state in history
      window.onpopstate = function () { // Prevent the user from going back to a protected page using the back button
        router.replace("/");
      };
    }
  };

  // If logged in, add additional links
  if (isLoggedIn) {
    links = [
      { label: 'Profile', href: '/profile' },
      { label: 'Map', href: '/map' },
      { label: 'Register Business', href: '/registerBusiness' },
      { label: 'Avatar Management', href: '/avatarManagement' },
      //...links, //  original links from logged out view 
      { label: 'View Subscriptions', href: '/viewSubscriptionPage' },

      { label: 'Logout', href: '#', onClick: handleLogout },
    ];
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='outline' className='flex gap-4 max-w-[100px]'>
          <LuAlignLeft className='w-6 h-6' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className='w-40' align='start' sideOffset={10}>
        {links.map((link) => {
          return (
            <DropdownMenuItem key={link.href}>
              {link.onClick ? (
                <button onClick={link.onClick} className='capitalize w-full'>
                  {link.label}
                </button>
              ) : (
                <Link href={link.href} className='capitalize w-full'>
                  {link.label}
                </Link>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LinksDropdown;