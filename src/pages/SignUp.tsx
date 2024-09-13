import { useState } from 'react';

const SignUpPage = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      const response = await fetch('/api/merchant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Handle successful response
        console.log('Merchant created:', data);
        // Redirect or show success message
      } else {
        // Handle errors
        setError(data.message || 'Something went wrong');
      }
    } catch (err) {
      setError('An error occurred');
      console.error(err);
    }
  };

  return (
    <div className='flex items-center justify-center min-h-screen bg-gray-100'>
      <div className='w-full max-w-md p-8 bg-white rounded shadow-md'>
        <h1 className='text-2xl font-bold mb-6'>Sign Up</h1>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label htmlFor='firstName' className='block text-sm font-medium text-gray-700'>
              First Name
            </label>
            <input
              id='firstName'
              type='text'
              placeholder='John'
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className='mt-1'
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='lastName' className='block text-sm font-medium text-gray-700'>
              Last Name
            </label>
            <input
              id='lastName'
              type='text'
              placeholder='Doe'
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className='mt-1'
              required
            />
          </div>
          <div className='mb-4'>
            <label htmlFor='email' className='block text-sm font-medium text-gray-700'>
              Email
            </label>
            <input
              id='email'
              type='email'
              placeholder='you@example.com'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='mt-1'
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
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='mt-1'
              required
            />
          </div>
          <div className='mb-6'>
            <label htmlFor='confirm-password' className='block text-sm font-medium text-gray-700'>
              Confirm Password
            </label>
            <input
              id='confirm-password'
              type='password'
              placeholder='********'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='mt-1'
              required
            />
          </div>
          {error && <p className='text-red-500 text-sm mb-4'>{error}</p>}
          <button type='submit' className='w-full bg-blue-500 text-white p-2 rounded'>
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUpPage;
