import React, { useState, useEffect } from "react";
import Image from "next/image";
import { AvatarInfo, getAvatarByBusinessRegistrationId, getAvatarByOutletId } from "../api/avatarApi";
import withAuth from "./withAuth";
import Cookies from 'js-cookie';
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import api from "@/api";
import AvatarRenderer from '@/components/avatar/AvatarRenderer';
import { ItemType } from "../api/itemApi";

interface Outlet {
    outlet_name: string;
    location: string;
    contact: string;
    description: string;
    outlet_id: number;
}

interface BusinessRegistration {
    registration_id: number;
    entityName: string;
    location: string;
    category: string;
    status: string;
    remarks: string;
    proof?: string;
}

const ViewAvatars: React.FC = () => {
    const router = useRouter();
    const [avatar, setAvatar] = useState<AvatarInfo | undefined>(undefined);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchProfile();
    }, []);

    useEffect(() => {
        if (businessRegistration && outlets.length === 0) {
            // Only business registration exists
            fetchAvatarsByBusinessRegistrationId(businessRegistration.registration_id);
        } else if (!businessRegistration && outlets.length === 1) {
            // Only one outlet exists
            setSelectedOutlet(outlets[0].outlet_id);
            fetchAvatarsByOutletId(outlets[0].outlet_id);
        }
    }, [businessRegistration, outlets]);

    const fetchProfile = async () => {
        try {
            const token = Cookies.get('authToken');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }

            const response = await api.get(`/api/business/profile`);
            if (response.status === 200) {
                setOutlets(response.data.outlets);
                setBusinessRegistration(response.data.registeredBusiness);
            } else {
                setError(response.data.message || 'Failed to fetch profile');
            }
        } catch (err) {
            setError('An error occurred while fetching profile');
            console.error('API call error:', err);
        }
    };

    const fetchAvatarsByBusinessRegistrationId = async (registrationId: number) => {
        console.log("Fetching avatars for Business Registration ID:", registrationId);
        setIsLoading(true);
        setError(null);
        try {
            const avatar = await getAvatarByBusinessRegistrationId(registrationId);
            
            setAvatar(avatar);
        } catch (error) {
            console.error("Error fetching avatars by business registration:", error);
            setError('Failed to fetch avatars');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchAvatarsByOutletId = async (outletId: number) => {
        console.log("Fetching avatars for Outlet ID:", outletId);
        setIsLoading(true);
        setError(null);
        try {
            const avatar = await getAvatarByOutletId(outletId);
            console.log("Avatar fetched successfully:", avatar);
            setAvatar(avatar);
        } catch (error) {
            console.error("Error fetching avatars by outlet:", error);
            setError('Failed to fetch avatars');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAvatarClick = (avatarId: number) => {
        router.push({
            pathname: '/editAvatar',
            query: { avatarId: avatarId.toString() },
        });
    };

    const handleBack = () => {
        router.push('/avatarManagement');
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = event.target.value;

        // Clear previous avatar and error when selecting a new entity
        setAvatar(undefined);
        setError(null);

        // Check if a business registration is selected
        if (selectedValue.includes("Business")) {
            // Fetch avatars for the registered business
            if (businessRegistration) {
                setSelectedOutlet(null); // Clear outlet selection
                fetchAvatarsByBusinessRegistrationId(businessRegistration.registration_id);
            }
        } 
        // Check if an outlet is selected
        else if (selectedValue.includes("Outlet")) {
            const outletId = parseInt(selectedValue.split(" ")[0]); // Get the outlet ID
            setSelectedOutlet(outletId);
            fetchAvatarsByOutletId(outletId);
        }
    };

    const renderAvatar = (avatar: AvatarInfo) => (
        <div className="relative w-[170px] h-[170px] cursor-pointer" onClick={() => handleAvatarClick(avatar.id)}>
            <AvatarRenderer
                customization={{
                    [ItemType.BASE]: avatar.base || null,
                    [ItemType.HAT]: avatar.hat || null,
                    [ItemType.SHIRT]: avatar.shirt || null,
                    [ItemType.BOTTOM]: avatar.bottom || null,
                }}
                width={170}
                height={170}
            />
        </div>
    );

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={handleBack} variant="outline">
                    Back
                </Button>
                <h1 className="text-4xl font-bold text-zinc-700 text-center">
                    Your Avatars
                </h1>
                <div className="w-[100px]"></div> {/* Spacer for alignment */}
            </div>

            {/* Dropdown to select outlet or business registration */}
            <div className="mb-6">
                <label htmlFor="entitySelect" className="block mb-2 font-semibold">Select Business/Outlet:</label>
                <select
                    id="entitySelect"
                    value={
                        selectedOutlet
                            ? `${selectedOutlet} (Outlet)`
                            : businessRegistration
                            ? `${businessRegistration.registration_id} (Business Registration)`
                            : ""
                    }
                    onChange={handleSelectChange}
                    className="border rounded p-2 w-full"
                >
                    {businessRegistration && (
                        <option value={`${businessRegistration.registration_id} (Business Registration)`}>
                            {businessRegistration.entityName} (Business Registration)
                        </option>
                    )}
                    {outlets.map((outlet) => (
                        <option key={outlet.outlet_id} value={`${outlet.outlet_id} (Outlet)`}>
                            {outlet.outlet_name} (Outlet)
                        </option>
                    ))}
                </select>
            </div>

            {isLoading && (
                <p className="text-center mb-4">Loading avatars...</p>
            )}

            {error && (
                <div className="text-red-500 text-center mb-4">
                    <p>{error}</p>
                    <button 
                        onClick={() => {
                            if (businessRegistration) {
                                fetchAvatarsByBusinessRegistrationId(businessRegistration.registration_id);
                            } else if (selectedOutlet) {
                                fetchAvatarsByOutletId(selectedOutlet);
                            }
                        }}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!isLoading && !error && avatar && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    <div key={avatar.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-start" style={{ width: '210px', height: '300px' }}>
                        {renderAvatar(avatar)}
                    </div>
                </div>
            )}

            {!isLoading && !error && !avatar && (
                <p className="text-center mb-4">No avatar found.</p>
            )}
        </div>
    );
};

export default withAuth(ViewAvatars);
