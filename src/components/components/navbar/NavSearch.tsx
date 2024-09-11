import { Input } from '../ui/input';

function NavSearch() {
  return (
    <Input
      type='search'
      placeholder='search voucher listings...'
      className='max-w-xs dark:bg-muted '
    />
  );
}
export default NavSearch;