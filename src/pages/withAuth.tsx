
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

//check if username cookie exists, if doesnt ,redirect to login page.

const withAuth = (WrappedComponent: React.FC) => {
  const ProtectedRoute: React.FC = (props) => {
    const router = useRouter();
    const { isLoggedIn, setIsLoggedIn } = useAuth(); // Get isLoggedIn from AuthContext

    useEffect(() => {
      /*
      const username = Cookies.get('username');
      if (!username) {
        router.replace('/login');
      }
        */
      const token = Cookies.get('authToken'); // Check for the token
      /*
      if (!token || isLoggedIn) {
        router.replace('/login'); // Redirect to login if no token is found
      }
         }, [isLoggedIn, router,setIsL]);
    */
      if (!token) {
        // If no token, forcefully log out and redirect
        setIsLoggedIn(false);
        router.replace('/Login'); // Redirect to login if no token is found
      } else if (!isLoggedIn) {
        // If token exists but state says not logged in, set it
        setIsLoggedIn(true);
      }
    }, [isLoggedIn, router, setIsLoggedIn]);

    /*
        // To avoid rendering protected component before the redirect, show a loading indicator.
        if (!isLoggedIn) {
          return <div>Loading...</div>; // You can replace this with a spinner or placeholder
        }
        // Render the component if logged in
        return <WrappedComponent {...props} />;
    */

    // Only render the component if logged in
    return isLoggedIn ? <WrappedComponent {...props} /> : null;


  };

  return ProtectedRoute;
};

export default withAuth;
