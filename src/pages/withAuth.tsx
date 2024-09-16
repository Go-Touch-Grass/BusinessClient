
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Cookies from 'js-cookie';

const withAuth = (WrappedComponent: React.FC) => {
  const ProtectedRoute: React.FC = (props) => {
    const router = useRouter();

    useEffect(() => {
      const username = Cookies.get('username');
      if (!username) {
        router.replace('/login');
      }
    }, [router]);

    return <WrappedComponent {...props} />;
  };

  return ProtectedRoute;
};

export default withAuth;
