import { useState, useRef, FormEvent } from "react";
import api from "@/api";
import { useRouter } from "next/router";
import Cookies from 'js-cookie';

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const firstNameRef = useRef<HTMLInputElement | null>(null);
  const lastNameRef = useRef<HTMLInputElement | null>(null);
  const emailRef = useRef<HTMLInputElement | null>(null);
  const userNameRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const confirmPasswordRef = useRef<HTMLInputElement | null>(null);

  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccess(null);


    if (!isRepresentative) {
      setError('You must confirm that you are the representative of the company.');
      return;
    }

    const password = passwordRef.current?.value || '';
    const confirmPassword = confirmPasswordRef.current?.value || '';

    if (password.length < 8) {
      setError("password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (
      firstNameRef.current &&
      lastNameRef.current &&
      emailRef.current &&
      userNameRef.current &&
      passwordRef.current &&
      confirmPasswordRef.current
    ) {
      try {
        const response = await api.post('/api/business/account', {
          firstName: firstNameRef.current.value,
          lastName: lastNameRef.current.value,
          email: emailRef.current.value,
          username: userNameRef.current.value,
          password: passwordRef.current.value,
          isRepresentative,  // Include the representative checkbox value
        });

        if (response.status === 201) {
          const { token } = response.data;
          // Store the token in a cookie
          Cookies.set('authToken', token, { expires: 1 }); // Token expires in 1 day

          setSuccess('Account created successfully!');
          //router.push('/Login');
          router.push('/verifyOTP');
        } else {
          setError(response.data.message || 'Something went wrong');
        }
      } catch (err) {
        setError('An error occurred');
        console.error('API call error:', err);
      }
    } else {
      setError('Form fields are not properly initialized');
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-green-50'>
      <div className='w-full max-w-md p-8 bg-white rounded-lg shadow-lg'>
        <h1 className='text-2xl font-semibold mb-6 text-center text-gray-700'>Create Your Account</h1>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='firstName' className='block text-sm font-medium text-gray-600'>
              First Name
            </label>
            <input
              id='firstName'
              type='text'
              placeholder='John'
              ref={firstNameRef}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-green-300 focus:border-green-300 sm:text-sm'
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='lastName' className='block text-sm font-medium text-gray-600'>
              Last Name
            </label>
            <input
              id='lastName'
              type='text'
              placeholder='Doe'
              ref={lastNameRef}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 sm:text-sm'
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='email' className='block text-sm font-medium text-gray-600'>
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='you@example.com'
              ref={emailRef}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 sm:text-sm'
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='username' className='block text-sm font-medium text-gray-600'>
              Username
            </label>
            <input
              id='username'
              type='text'
              placeholder='john_doe'
              ref={userNameRef}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 sm:text-sm'
              required
            />
          </div>

          <div className='mb-4'>
            <label htmlFor='password' className='block text-sm font-medium text-gray-600'>
              Password
            </label>
            <input
              id='password'
              type='password'
              placeholder='********'
              ref={passwordRef}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 sm:text-sm'
              required
            />
          </div>

          <div className='mb-6'>
            <label htmlFor='confirm-password' className='block text-sm font-medium text-gray-600'>
              Confirm Password
            </label>
            <input
              id='confirm-password'
              type='password'
              placeholder='********'
              ref={confirmPasswordRef}
              className='mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 sm:text-sm'
              required
            />
          </div>

          <div className='mb-4'>
            <label className='inline-flex items-center'>
              <input
                type='checkbox'
                checked={isRepresentative}
                onChange={(e) => setIsRepresentative(e.target.checked)}
                className='form-checkbox h-5 w-5 text-green-600'
              />
              <span className='ml-2 text-gray-700'>I am the representative of the company</span>
            </label>
          </div>

          {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
          {success && <p className='text-green-500 text-sm mb-4'>{success}</p>}

          <button
            type='submit'
            className='w-full bg-green-500 text-white py-2 px-4 rounded-md shadow-sm hover:bg-green-600 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:ring-offset-2'
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
