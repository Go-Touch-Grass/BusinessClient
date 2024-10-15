import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import api from "@/api";
import Image from "next/image";
import AvatarRenderer from '@/components/avatar/AvatarRenderer';
import { Item, ItemType, uploadCustomItem } from "@/api/itemApi";
import Cookies from 'js-cookie';

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

const CustomAvatar: React.FC = () => {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);

    useEffect(() => {
        fetchProfile();
    }, []);

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

    const handleBack = () => {
        router.push('/avatarManagement');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "image/png") {
                setFile(selectedFile);
                setError(null);
                const objectUrl = URL.createObjectURL(selectedFile);
                setPreviewUrl(objectUrl);
            } else {
                setFile(null);
                setPreviewUrl(null);
                setError("Please select a PNG file.");
            }
        }
    };

    const handleSelectChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value ? parseInt(event.target.value) : null;
        setSelectedOutlet(selectedId);
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        if (!selectedOutlet && !businessRegistration) {
            setError("Please select a business or outlet.");
            return;
        }

        try {
            const uploadedItem = await uploadCustomItem(
                file,
                "Custom Avatar",
                ItemType.BASE,
                1, // scale
                0, // xOffset
                0, // yOffset
                selectedOutlet ? undefined : businessRegistration!.registration_id,
                selectedOutlet || undefined
            );

            // Store the uploaded item data in sessionStorage
            sessionStorage.setItem('uploadedAvatar', JSON.stringify(uploadedItem));

            // Navigate to the preview page with just the ID in the query
            router.push({
                pathname: '/customAvatarPreview',
                query: { id: uploadedItem.id },
            });
        } catch (err) {
            setError("An error occurred while uploading the custom avatar.");
            console.error('API call error:', err);
        }
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={handleBack} variant="outline">
                    Back
                </Button>
                <h1 className="text-4xl font-bold text-zinc-700 text-center">
                    Custom Avatar Upload
                </h1>
                <div className="w-[100px]"></div>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <div className="w-full mb-6">
                    <label htmlFor="entitySelect" className="block mb-2 font-semibold">Select Business/Outlet:</label>
                    <select
                        id="entitySelect"
                        value={selectedOutlet !== null ? selectedOutlet.toString() : ""}
                        onChange={handleSelectChange}
                        className="border rounded p-2 w-full"
                    >
                        {businessRegistration && (
                            <option value="">
                                {businessRegistration.entityName} (Business Registration)
                            </option>
                        )}
                        {outlets.map((outlet) => (
                            <option key={outlet.outlet_id} value={outlet.outlet_id.toString()}>
                                {outlet.outlet_name} (Outlet)
                            </option>
                        ))}
                    </select>
                </div>

                <input
                    type="file"
                    accept=".png"
                    onChange={handleFileChange}
                    className="mb-4"
                />

                {previewUrl && (
                    <div className="w-full mb-6">
                        <h2 className="text-xl font-semibold mb-2">Preview:</h2>
                        <div className="flex justify-center">
                            <div className="relative w-[170px] h-[170px]">
                                <AvatarRenderer
                                    customization={{
                                        [ItemType.BASE]: {
                                            id: 0,
                                            name: 'Custom Avatar',
                                            filepath: previewUrl,
                                            type: ItemType.BASE,
                                        } as Item,
                                        [ItemType.HAT]: null,
                                        [ItemType.SHIRT]: null,
                                        [ItemType.BOTTOM]: null,
                                    }}
                                    width={170}
                                    height={170}
                                />
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleUpload}
                    disabled={!file || (!selectedOutlet && !businessRegistration)}
                >
                    Upload Custom Avatar
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                    Avatars are subject to approval.
                </p>
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default withAuth(CustomAvatar);
