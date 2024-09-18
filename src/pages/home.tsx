import { useEffect, useState } from 'react';
import api from '@/api'; // Assume this is your API module
import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { Button } from '../components/components/ui/button';

interface BusinessAccount {
    firstName: string;
    lastName: string;
    email: string;
}

const MerchantBusinessHomePage: React.FC = () => {
    const [profile, setProfile] = useState<BusinessAccount | null>(null);
    const [error, setError] = useState<string | null>(null);
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
                    setProfile(response.data.business);  // Only fetch business data (personal info)
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

    const clearAllCookies = () => {
        const allCookies = Cookies.get();
        Object.keys(allCookies).forEach(cookieName => Cookies.remove(cookieName));
        console.log('All cookies cleared:', Cookies.get());
    };

    const handleLogout = () => {
        clearAllCookies();
        router.push('/Login');
        
        console.log('Logout process initiated');
        
        if (typeof window !== 'undefined') {
            window.history.replaceState(null, '', window.location.href);
        }
    };

    return (
        <div className="min-h-screen bg-green-100 p-6">
            <header className="bg-white shadow p-4 mb-6 rounded-lg">
                <div className="container mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">
                            {profile ? `Welcome, ${profile.firstName}` : 'Welcome'}
                        </h1>
                    </div>
                    <Button className="bg-red-500 hover:bg-red-600 text-white" onClick={handleLogout}>
                        Log Out
                    </Button>
                </div>
            </header>

            <main className="container mx-auto space-y-8">
                {/* Add images here */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                        <img
                            src="/images/banner1.jpg"
                            alt=" Voucher 1"
                            className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute bottom-4 left-4 text-white">
                           
                        </div>
                    </div>
                    <div className="relative">
                        <img
                            src="/images/banner2.jpg"
                            alt="Voucher 2"
                            className="w-full h-64 object-cover rounded-lg shadow-md"
                        />
                        <div className="absolute bottom-4 left-4 text-white">
                            
                        </div>
                    </div>
                </div>

                {/* Add more images or content as needed */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <img
                        src="/images/product1.jpg"
                        alt="Voucher 3"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <img
                        src="/images/product2.jpg"
                        alt="Voucher 4"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                    <img
                        src="/images/product3.jpg"
                        alt="Voucher 5"
                        className="w-full h-48 object-cover rounded-lg shadow-md"
                    />
                </div>
            </main>
        </div>
    );
};

export default MerchantBusinessHomePage;
