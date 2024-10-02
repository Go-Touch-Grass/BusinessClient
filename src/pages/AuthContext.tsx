import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// Authentication context to manage the user's login state and automatically update UI components.
const AuthContext = createContext({ isLoggedIn: false, setIsLoggedIn: (value: boolean) => { } });

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        /*
        const username = Cookies.get('username');
        if (username) {
            setIsLoggedIn(true);
        }*/
        // Check if the JWT token exists in cookies
        const token = Cookies.get('authToken');
        if (token) {
            setIsLoggedIn(true); // User is logged in if the token exists
        } else {
            setIsLoggedIn(false); // If no token is found, user is logged out
        }
    }, []);

    return (
        <AuthContext.Provider value={{ isLoggedIn, setIsLoggedIn }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};