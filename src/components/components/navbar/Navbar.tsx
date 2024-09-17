import Container from '../global/Container';
import CartButton from './CartButton';
import DarkMode from './DarkMode';
import LinksDropdown from './LinksDropdown';
import Logo from './Logo';
import NavSearch from './NavSearch';
import { Suspense } from 'react';

import Cookies from 'js-cookie';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, buttonVariants } from '../ui/button';
import { useAuth } from '@/pages/AuthContext';

const Navbar = () => {

  /*
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    // Check for the presence of the username or auth token in cookies
    const username = Cookies.get('username');
    console.log("login", username)
    if (username) {
      setIsLoggedIn(true);
    }
  }, []);
  */
  const { isLoggedIn } = useAuth();
  return (
    <nav className='border-b'>
      <Container className='flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap py-8 gap-4'>
        <Logo />
        <ul className="flex gap-4 justify-between">
          {!isLoggedIn ? (
            <>

              <li>
                <Button variant='default'>
                  <Link href="/Login" >
                    Login
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant='default'>
                  <Link href="/SignUp" >
                    Sign Up
                  </Link>
                </Button>
              </li>
            </>
          ) : (
            <>
              {/*
              Not used, becuase it will be in the dropdown
              <li>
                <Button variant='secondary'>
                  <Link href="/profile" >
                    Profile
                  </Link>
                </Button>
              </li>
              <li>
                <Button variant='secondary'>
                  <Link href="/registerBusiness" >
                    Register Business
                  </Link>
                </Button>
              </li>
                  <li>
                <Button variant='destructive'>
                  <a
                    href="/"
                    onClick={() => {
                      Cookies.remove('username');
                      setIsLoggedIn(false); // Log out
                    }}
                  >
                    Logout
                  </a>
                </Button>
              </li>
              */}

              <div className='flex-grow flex justify-center sm:justify-end'>
                <Suspense>
                  <NavSearch />
                </Suspense>
              </div>
              <div className='flex gap-4 items-center'>
                <DarkMode />
                <LinksDropdown />
              </div>
            </>
          )}
        </ul>
      </Container>
    </nav>

  );
}
export default Navbar;