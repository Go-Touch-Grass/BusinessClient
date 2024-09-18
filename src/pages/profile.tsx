import { useEffect, useState } from 'react';
import api from '@/api';
import { Label } from '../components/components/ui/label';
import { Input } from '../components/components/ui/input';
import { Button } from '../components/components/ui/button';
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import withAuth from './withAuth';
import { useAuth } from "./AuthContext";

interface BusinessAccount {
    firstName: string;
    lastName: string;
    email: string;
    username: string;
}

interface Outlet {
    outlet_name: string;
    location: string;
    contact: string;
    description: string;
}

interface BusinessRegistration {
    entityName: string;
    location: string;
    category: string;
    status: string;
    proof?: string;
}

const ProfilePage: React.FC = () => {
    const { isLoggedIn, setIsLoggedIn } = useAuth();

    const [profile, setProfile] = useState<BusinessAccount | null>(null);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState<boolean>(false);

    const [profileImage, setProfileImage] = useState<string | null>(null); // For storing the profile image
    const [imagePreview, setImagePreview] = useState<string | null>(null); // For showing image preview

    const [formData, setFormData] = useState<BusinessAccount>({
        firstName: '',
        lastName: '',
        email: '',
        username: ''
    });

    const router = useRouter();

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
                    setProfile(response.data.business);
                    console.log("profile image retrieved", response.data.business.profileImage);
                    setProfileImage(response.data.business.profileImage); // Set the profile image
                    setOutlets(response.data.outlets);
                    setBusinessRegistration(response.data.registeredBusiness); // Set the business registration data
                    setFormData(response.data.business);
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
                setProfile(formData);
                setIsEditing(false);
                setError(null);
            } else {
                setError(response.data.message || 'Failed to update profile');
            }
        } catch (err) {
            setError('An error occurred while updating profile');
            console.error('API call error:', err);
        }
    };

    const handleLogout = () => {
        clearAllCookies();
        router.push('/Login');
        setIsLoggedIn(false);
        console.log('Logout process initiated');

        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.href);
        }
    };

    const clearAllCookies = () => {
        const allCookies = Cookies.get();
        Object.keys(allCookies).forEach(cookieName => Cookies.remove(cookieName));
        console.log('All cookies cleared:', Cookies.get());
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string); //store the image preview as base64
            };
            reader.readAsDataURL(file); // // Convert the image file to a base64 string for preview

            // Prepare to upload the image
            const formData = new FormData();
            formData.append('profileImage', file);
            formData.append('username', profile?.username || '');

            api.post(`/api/business/profile/${profile?.username}/uploadImage`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'  // for file uploads
                }
            })
                .then(response => {
                    setProfileImage(response.data.imagePath); // Save uploaded image path
                    //setImagePreview(null);  // Clear preview after successful upload
                })
                .catch(error => {
                    setError('Error uploading image');
                    console.error(error);
                });
        }
    };
    console.log("Image Preview:", imagePreview);
    console.log("Profile Image Path:", profileImage);
    return (
        <div className='px-4 space-y-6 md:px-6'>
            <header className='space-y-1.5'>
                <div className='flex items-center space-x-4'>

                    <img
                        src={imagePreview || (profileImage ? `http://localhost:8080/${profileImage}` : '/images/profile.png')} // defualt image if failed to load
                        alt='Profile'
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
                <input type="file" onChange={handleImageChange} />
            </header>

            <div className='space-y-6'>
                <div className='space-y-2'>
                    <h1 className='text-lg font-semibold'>Personal Information</h1>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <Label htmlFor='firstName'>Representative's First Name</Label>
                            <Input
                                id='firstName'
                                placeholder='Enter your first name'
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={!isEditing}
                            />
                        </div>
                        <div>
                            <Label htmlFor='lastName'>Representative's Last Name</Label>
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
                                disabled={!isEditing}
                            />
                        </div>
                    </div>
                </div>

                <div className='space-y-6'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-lg font-semibold'>Your Outlets</h2>

                        {/* Conditionally disable the button based on businessRegistration status */}
                        <Button
                            className={`${businessRegistration?.status === 'approved'
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-gray-300 cursor-not-allowed'
                                } text-white`}
                            onClick={() => router.push('/addOutlet')}
                            disabled={businessRegistration?.status !== 'approved'}  // Disable if not approved
                        >
                            + Add New Outlet
                        </Button>
                    </div>

                    {/* Display reason why the button is disabled */}
                    {businessRegistration?.status !== 'approved' && (
                        <p className="text-sm text-gray-500">
                            You cannot add an outlet because your business registration is currently <strong>{businessRegistration?.status}</strong>.
                        </p>
                    )}

                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {outlets.length === 0 ? (
                            <p>No outlets found.</p>
                        ) : (
                            outlets.map(outlet => (
                                <div key={outlet.outlet_name} className='border p-4 rounded-lg'>
                                    <h3 className='text-xl font-semibold'>{outlet.outlet_name}</h3>
                                    <p><strong>Location:</strong> {outlet.location}</p>
                                    <p><strong>Contact:</strong> {outlet.contact}</p>
                                    <p><strong>Description:</strong> {outlet.description}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>


                <div className='space-y-6'>
                    <div className='flex justify-between items-center'>
                        <h2 className='text-lg font-semibold'>Business Registration</h2>
                        <Button className='bg-green-500 hover:bg-green-600 text-white' onClick={() => router.push('/registerBusiness')}>
                            + Register New Business
                        </Button>
                    </div>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        {!businessRegistration ? (
                            <p>No business registration found.</p>
                        ) : (
                            <div key={businessRegistration.entityName} className='border p-4 rounded-lg'>
                                <h3 className='text-xl font-semibold'>{businessRegistration.entityName}</h3>
                                <p><strong>Location:</strong> {businessRegistration.location}</p>
                                <p><strong>Category:</strong> {businessRegistration.category}</p>
                                <p><strong>Status:</strong> {businessRegistration.status}</p>
                                {businessRegistration.proof && (
                                    <a href={`/${businessRegistration.proof}`} target="_blank" rel="noopener noreferrer">
                                        View Proof
                                    </a>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className='flex space-x-4'>
                    <Button onClick={handleEditToggle}>
                        {isEditing ? 'Cancel' : 'Edit Profile'}
                    </Button>
                    {isEditing && (
                        <Button onClick={handleUpdateProfile} className='bg-green-300 hover:bg-green-300'>
                            Save Changes
                        </Button>
                    )}
                    <Button onClick={handleLogout} className='bg-red-500 hover:bg-red-600'>
                        Log Out
                    </Button>
                </div>
                {error && <p className='text-red-500 text-sm'>{error}</p>}
            </div>
        </div>
    );
};

export default withAuth(ProfilePage);
