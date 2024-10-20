import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { Item } from "@/api/itemApi";
import AvatarRenderer from '@/components/avatar/AvatarRenderer';

const CustomAvatarPreview: React.FC = () => {
    const router = useRouter();
    const [avatar, setAvatar] = useState<Item | null>(null);

    useEffect(() => {
        const storedAvatar = sessionStorage.getItem('uploadedAvatar');
        if (storedAvatar) {
            setAvatar(JSON.parse(storedAvatar));
            // Clear the avatar from sessionStorage
            sessionStorage.removeItem('uploadedAvatar');
        } else {
            // If not in sessionStorage, redirect to the custom avatar page
            router.push('/customAvatar');
        }
    }, []);

    if (!avatar) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={() => router.push('/avatarManagement')} variant="outline">
                    Back to Avatar Management
                </Button>
                <h1 className="text-4xl font-bold text-zinc-700 text-center">
                    Custom Avatar Submitted
                </h1>
                <div className="w-[100px]"></div>
            </div>

            <div className="flex flex-col items-center space-y-6">
                <div className="bg-green-100 rounded-full p-4">
                    <svg className="w-16 h-16 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <p className="text-xl font-semibold text-green-600">
                    Your custom avatar has been submitted for admin approval.
                </p>

                <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Avatar Preview</h2>
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative w-[170px] h-[170px]">
                            <AvatarRenderer
                                customization={{
                                    base: avatar,
                                    hat: null,
                                    shirt: null,
                                    bottom: null,
                                }}
                                width={170}
                                height={170}
                            />
                        </div>
                        <p><strong>Avatar Name:</strong> {avatar.name}</p>
                        <p><strong>Avatar ID:</strong> {avatar.id}</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                    You will be notified once your avatar has been approved.
                </p>
            </div>
        </div>
    );
};

export default withAuth(CustomAvatarPreview);