import React, { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import api from "@/api";

const CustomAvatar: React.FC = () => {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleBack = () => {
        router.push('/avatarManagement');
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === "image/png") {
                setFile(selectedFile);
                setError(null);
            } else {
                setFile(null);
                setError("Please select a PNG file.");
            }
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file to upload.");
            return;
        }

        const formData = new FormData();
        formData.append('customAvatar', file);

        try {
            const response = await api.post('/api/custom-avatar/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                alert("Custom avatar uploaded successfully!");
                setFile(null);
            } else {
                setError("Failed to upload custom avatar.");
            }
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
                <input
                    type="file"
                    accept=".png"
                    onChange={handleFileChange}
                    className="mb-4"
                />
                <Button onClick={handleUpload} disabled={!file}>
                    Upload Custom Avatar
                </Button>
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default withAuth(CustomAvatar);