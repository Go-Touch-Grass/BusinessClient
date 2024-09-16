import { useEffect, useState } from 'react';
import api from '@/api'; 
import { Label } from '../components/components/ui/label';
import { Input } from '../components/components/ui/input';
import { Button } from '../components/components/ui/button';
import Cookies from 'js-cookie';

interface BusinessAccount {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
}

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<BusinessAccount | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [formData, setFormData] = useState<BusinessAccount>({
    firstName: '',
    lastName: '',
    email: '',
    username: ''
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const username = Cookies.get('username');
        if (!username) {
          setError('No username found in cookies');
          return;
        }
        const response = await api.get(`/api/business/profile/${username}`);

        if (response.status === 200) {
          setProfile(response.data);
          setFormData(response.data); // Set initial form data
        } else {
          setError(response.data.message || 'Failed to fetch profile');
        }
      } catch (err) {
        setError('An error occurred while fetching profile');
        console.error('API call error:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [id]: value
    }));
  };

  const handleEditToggle = () => {
    setIsEditing(prev => !prev);
  };

  const handleUpdateProfile = async () => {
    try {
      const username = Cookies.get('username');
      if (!username) {
        setError('No username found in cookies');
        return;
      }

      const response = await api.put(`/api/business/profile/${username}`, formData);

      if (response.status === 200) {
        setProfile(formData); // Update profile with new data
        setIsEditing(false); // Exit edit mode
        setError(null);
      } else {
        setError(response.data.message || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred while updating profile');
      console.error('API call error:', err);
    }
  };

  return (
    <div className='px-4 space-y-6 md:px-6'>
      <header className='space-y-1.5'>
        <div className='flex items-center space-x-4'>
          <img
           src='/images/profile.png' alt='Profile' 
            
            width='96'
            height='96'
            className='border rounded-full'
            style={{ aspectRatio: '96/96', objectFit: 'cover' }}
          />
          <div className='space-y-1.5'>
            <h1 className='text-2xl font-bold'>
              {profile ? `${profile.firstName} ${profile.lastName}` : 'Loading...'}
            </h1>
            <p className='text-gray-500 dark:text-gray-400'>
              {profile ? profile.username : ''}
            </p>
          </div>
        </div>
      </header>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <h2 className='text-lg font-semibold'>Personal Information</h2>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            <div>
              <Label htmlFor='firstName'>First Name</Label>
              <Input
                id='firstName'
                placeholder='Enter your first name'
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input
                id='lastName'
                placeholder='Enter your last name'
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor='email'>Email</Label>
              <Input
                id='email'
                placeholder='Enter your email'
                type='email'
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            <div>
              <Label htmlFor='username'>Username</Label>
              <Input
                id='username'
                placeholder='Enter your username'
                value={formData.username}
                onChange={handleInputChange}
                disabled
              />
            </div>
          </div>
        </div>
        <div className='flex space-x-4'>
          <Button onClick={handleEditToggle}>
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </Button>
          {isEditing && (
            <Button onClick={handleUpdateProfile} className='bg-blue-500 hover:bg-blue-600'>
              Save Changes
            </Button>
          )}
        </div>
        {error && <p className='text-red-500 text-sm'>{error}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;
