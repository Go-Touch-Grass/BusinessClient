import { useState, useRef, FormEvent } from "react";
import { useRouter } from "next/router";
import api from "@/api";
import Cookies from 'js-cookie';
import { useAuth } from "./AuthContext";

const Login = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { setIsLoggedIn } = useAuth();

  const usernameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);

    if (usernameRef.current && passwordRef.current) {
      try {
        const response = await api.post('/api/business/login', {
          username: usernameRef.current.value,
          password: passwordRef.current.value,
        });

        if (response.status === 200) {
          setSuccess('Login successful!');

          const { token, isEmailVerified } = response.data;

          if (!isEmailVerified) {
            // Redirect to verify OTP if email not verified
            Cookies.set('authToken', token, { expires: 10 });
            router.push('/verifyOTP');
          } else {
            // Proceed to profile if email is verified
            setSuccess('Login successful!');
            Cookies.set('authToken', token, { expires: 10 });
            Cookies.set('username', usernameRef.current.value, {
              path: '/',
              expires: 7,
              secure: process.env.NODE_ENV === 'production', // Use Secure cookies in production
              sameSite: 'Lax' // Adjust based on your requirements
            });
            //console.log('Cookie set:', Cookies.get('username')); // Log the cookie value to verify it's set
            // Update authentication state
            setIsLoggedIn(true);
            router.push(`/profile/`);
          }

        } else {
          setError(response.data.message || 'Something went wrong');
        }
      } catch (error: any) {
        console.error('Full error:', error); // Log the full error for better debugging

        // Check if the error has a response and the status
        if (error.response) {
          console.error('Error response:', error.response); // Log the response object
          if (error.response.status === 403) {
            setError('Your account has been deactivated. Please contact support.');
          } else if (error.response.status === 401) {
            setError('Invalid username or password.');
          } else {
            setError('An error occurred while logging in. Ensure you have created an account.');
          }
        } else {
          setError('An error occurred while logging in.');
        }
      }
    } else {
      setError('Form fields are not properly initialized');
    }
  };


  return (
    <div className='flex items-center justify-center min-h-screen bg-green-50'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <h1 className='text-2xl font-semibold mb-6 text-center text-gray-800'>Login</h1>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='username' className='block text-sm font-medium text-gray-700'>
              Username
            </label>
            <input
              id='username'
              type='text'
              placeholder='john_doe'
              ref={usernameRef}
              className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 sm:text-sm'
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='password' className='block text-sm font-medium text-gray-700'>
              Password
            </label>
            <input
              id='password'
              type='password'
              placeholder='********'
              ref={passwordRef}
              className='mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-300 sm:text-sm'
              required
            />
          </div>
          {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
          {success && <p className='text-green-600 text-sm mb-4'>{success}</p>}
          <button
            type='submit'
            className='w-full bg-green-400 text-green-800 py-2 px-4 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-200 focus:ring-offset-2'
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;