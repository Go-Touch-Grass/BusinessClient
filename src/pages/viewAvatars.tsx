import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getBusinessAvatars, Avatar } from "../api/avatarApi";
import withAuth from "./withAuth";
import Cookies from 'js-cookie';
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";

const ViewAvatars: React.FC = () => {
    const router = useRouter();
    const [avatars, setAvatars] = useState<Avatar[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [username, setUsername] = useState<string | null>(null);

    useEffect(() => {
        const storedUsername = Cookies.get('username');
        if (storedUsername) {
            setUsername(storedUsername);
        }
    }, []);

    useEffect(() => {
        if (username) {
            fetchAvatars();
        }
    }, [username]);

    const fetchAvatars = async () => {
        if (!username) {
            setError("Username not found. Please log in again.");
            return;
        }

        setIsLoading(true);
        setError(null);
        try {
            const fetchedAvatars = await getBusinessAvatars(username);
            setAvatars(fetchedAvatars);
        } catch (error) {
            console.error("Error fetching avatars:", error);
            // Check if the error message indicates no avatars found
            if ((error as Error).message.includes("No avatars found")) {
                setAvatars([]); // Set avatars to an empty array
            } else {
                setError(`Failed to fetch avatars: ${(error as Error).message}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const renderAvatar = (avatar: Avatar) => (
        <div className="relative w-[170px] h-[170px] cursor-pointer" onClick={() => handleAvatarClick(avatar.id)}>
            {avatar.base && (
                <Image
                    src={avatar.base.filepath}
                    alt={avatar.base.name}
                    width={170}
                    height={170}
                />
            )}
            {avatar.hat && (
                <Image
                    src={avatar.hat.filepath}
                    alt={avatar.hat.name}
                    width={90}
                    height={90}
                    className="absolute top-[-5px] left-[38px]"
                />
            )}
            {avatar.bottom && (
                <Image
                    src={avatar.bottom.filepath}
                    alt={avatar.bottom.name}
                    width={160}
                    height={100}
                    className="absolute top-[115px] left-[5px]"
                />
            )}
            {avatar.shirt && (
                <Image
                    src={avatar.shirt.filepath}
                    alt={avatar.shirt.name}
                    width={105}
                    height={91}
                    className="absolute top-[76px] left-[32px]"
                />
            )}
        </div>
    );

    const handleAvatarClick = (avatarId: number) => {
        // Navigate to the editAvatar page, passing the avatar ID
        router.push({
            pathname: '/editAvatar',
            query: { avatarId: avatarId.toString() },
        });
    };

    const handleBack = () => {
        router.push('/avatarManagement');
    };

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

            {!username && (
                <p className="text-center mb-4">Please log in to view your avatars.</p>
            )}

            {isLoading && (
                <p className="text-center mb-4">Loading avatars...</p>
            )}

            {error && (
                <div className="text-red-500 text-center mb-4">
                    <p>{error}</p>
                    <button 
                        onClick={fetchAvatars}
                        className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                        Retry
                    </button>
                </div>
            )}

            {!isLoading && !error && avatars.length === 0 && (
                <p className="text-center mb-4">No avatars found. Create your first avatar!</p>
            )}

            {!isLoading && !error && avatars.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {avatars.map((avatar) => (
                        <div key={avatar.id} className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-start" style={{ width: '210px', height: '300px' }}>
                            {renderAvatar(avatar)}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default withAuth(ViewAvatars);
