import { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

// Authentication context to manage the user's login state and automatically update UI components.
const AuthContext = createContext({ isLoggedIn: false, setIsLoggedIn: (value: boolean) => { } });

export const AuthProvider = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        const username = Cookies.get('username');
        if (username) {
            setIsLoggedIn(true);
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