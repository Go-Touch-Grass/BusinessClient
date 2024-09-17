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

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check for the presence of the username or auth token in cookies
    const username = Cookies.get('username');
    if (username) {
      setIsLoggedIn(true);
    }
  }, []);

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
              <li>
                <Link href="/profile" >
                  Profile
                </Link>
              </li>
              <li>
                <Link href="/registerBusiness" >
                  Register Business
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  onClick={() => {
                    Cookies.remove('username');
                    setIsLoggedIn(false); // Log out
                  }}

                >
                  Logout
                </a>
              </li>
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