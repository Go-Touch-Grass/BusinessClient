import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { Item } from "@/api/itemApi";

const CustomItemPreview: React.FC = () => {
    const router = useRouter();
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        const storedItem = sessionStorage.getItem('uploadedItem');
        if (storedItem) {
            setItem(JSON.parse(storedItem));
            // Clear the item from sessionStorage
            sessionStorage.removeItem('uploadedItem');
        } else {
            // If not in sessionStorage, redirect to the custom item page
            router.push('/customItem');
        }
    }, []);

    if (!item) {
        return <div>Loading...</div>;
    }

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={() => router.push('/avatarManagement')} variant="outline">
                    Back to Avatar Management
                </Button>
                <h1 className="text-4xl font-bold text-zinc-700 text-center">
                    Custom Item Submitted
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
                    Your custom item has been submitted for admin approval.
                </p>

                <div className="bg-gray-100 p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-bold mb-4">Item Preview</h2>
                    <div className="flex flex-col items-center space-y-4">
                        <Image
                            src={item.filepath}
                            alt={item.name}
                            width={200}
                            height={200}
                            className="rounded border"
                        />
                        <p><strong>Item Name:</strong> {item.name}</p>
                        <p><strong>Item Type:</strong> {item.type}</p>
                        <p><strong>Item ID:</strong> {item.id}</p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 mt-4">
                    You will be notified once your item has been approved.
                </p>

                {/* <Button onClick={() => router.push('/viewCustomItems')} variant="secondary">
                    View All Custom Items
                </Button> */}
            </div>
        </div>
    );
};

export default withAuth(CustomItemPreview);
