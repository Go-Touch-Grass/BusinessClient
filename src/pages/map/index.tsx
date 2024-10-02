import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import api from '@/api';
import MapComponent from "@/components/map/mapComponent";
import { useRouter } from 'next/router';
import withAuth from '../withAuth';
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
    outlet_id: number;
}

interface BusinessRegistration {

    entityName: string;
    location: string;
    category: string;
    status: string;
    remarks: string;
    proof?: string;
}

const BusinessMap = () => {

    const [profile, setProfile] = useState<BusinessAccount | null>(null);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null); // For storing the profile image
    const [formData, setFormData] = useState<BusinessAccount>({
        firstName: '',
        lastName: '',
        email: '',
        username: ''
    });
    const router = useRouter();

    const fetchProfile = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }
            //const response = await api.get(`/api/business/profile/${username}`);
            const response = await api.get(`/api/business/profile`);
            if (response.status === 200) {
                setProfile(response.data.business);
                setBusinessRegistration(response.data.registeredBusiness); // Set the business registration data
                console.log("profile image retrieved", response.data.business.profileImage);
                setProfileImage(response.data.business.profileImage); // Set the profile image
                setOutlets(response.data.outlets);
                setFormData(response.data.business);
            } else {
                setError(response.data.message || 'Failed to fetch profile');
            }
        } catch (err) {
            setError('An error occurred while fetching profile');
            console.error('API call error:', err);
        }
    };

    useEffect(() => {
        fetchProfile();

    }, []);

    // Redirect functions
    const redirectToRegisterBusiness = () => {
        router.push('/registerBusiness');  // Replace with the actual path to register business
    };

    const redirectToAddOutlet = () => {
        router.push('/profile');  // Replace with the actual path to add an outlet
    };

    return (
        <div>
            <h1>Business Location</h1>
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {/* Check business registration status, display map or message accordingly */}
            {businessRegistration ? (
                businessRegistration.status === 'approved' ? (
                    <div>
                        <h2>{businessRegistration.entityName} Main Location</h2>
                        {/* Render MapComponent for business location */}
                        {businessRegistration.location && (
                            <MapComponent address={businessRegistration.location} />
                        )}
                    </div>
                ) : (
                    <div>
                        <p>Your business registration is {businessRegistration.status}. Please complete the registration process to display the business on the map.</p>
                        <button
                            onClick={redirectToRegisterBusiness}
                            className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600"
                        >
                            Register Your Business
                        </button>
                    </div>
                )
            ) : (
                <p>You have not registered your business. Please register to display the business on the map.</p>
            )}


            {/* Render outlets on the map */}
            {outlets.length > 0 ? (
                <div>
                    <h2>Outlet Locations</h2>
                    {outlets.map((outlet) => (
                        <div key={outlet.outlet_id}>
                            <h3>{outlet.outlet_name}</h3>
                            <MapComponent address={outlet.location} />
                        </div>
                    ))}
                </div>
            ) : (
                <div>
                    <p>No outlets registered. Add outlets to display them on the map.</p>
                    <button
                        onClick={redirectToAddOutlet}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg mt-4 hover:bg-green-600"
                    >
                        Add Outlet
                    </button>
                </div>
            )}
        </div>
    );
};

export default withAuth(BusinessMap);
