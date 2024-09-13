import Container from '../global/Container';
import CartButton from './CartButton';
import DarkMode from './DarkMode';
import LinksDropdown from './LinksDropdown';
import Logo from './Logo';
import NavSearch from './NavSearch';
import { Suspense } from 'react';
function Navbar() {
  return (
    <nav className='border-b'>
      <Container className='flex flex-col sm:flex-row sm:justify-between sm:items-center flex-wrap py-8 gap-4'>
        <Logo />
        <div className='flex-grow flex justify-center sm:justify-end'>
          <Suspense>
            <NavSearch />
          </Suspense>
        </div>
        <div className='flex gap-4 items-center'>
      
          <DarkMode />
          <LinksDropdown />
        </div>
      </Container>
    </nav>
  );
}
export default Navbar;