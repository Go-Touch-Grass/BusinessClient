import React, { useState, useEffect } from "react";
import Image from "next/image";
import withAuth from "./withAuth";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import { Item, getCustomItems } from "@/api/itemApi";

const ViewCustomItems: React.FC = () => {
    const router = useRouter();
    const [items, setItems] = useState<Item[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchCustomItems();
    }, []);

    const fetchCustomItems = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const fetchedItems = await getCustomItems();
            console.log("Fetched custom items:", fetchedItems); // Log the fetched items
            setItems(fetchedItems);
        } catch (err) {
            console.error('Error fetching custom items:', err);
            setError('Failed to fetch custom items. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleItemClick = (item: Item) => {
        // Store the selected item in sessionStorage
        sessionStorage.setItem('selectedItem', JSON.stringify(item));
        router.push('/customItemDetails');
    };

    const handleBack = () => {
        router.push('/avatarManagement');
    };


    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "bg-green-100 text-green-800";
            case "rejected":
                return "bg-red-100 text-red-800";
            default:
                return "bg-yellow-100 text-yellow-800";
        }
    };

    const renderItem = (item: Item) => {
        const status = getStatusColor(item.status);

        return (
            <div 
                key={item.id} 
                className="bg-white p-4 rounded-lg shadow-md flex flex-col items-center justify-start cursor-pointer relative"
                onClick={() => handleItemClick(item)}
                style={{ width: '210px', height: '300px' }}
            >
                <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${status}`}>
                    {item.status}
                </div>
                <Image
                    src={item.filepath}
                    alt={item.name}
                    width={170}
                    height={170}
                    className="mb-4 rounded"
                />
                <p className="text-center font-semibold">{item.name}</p>
                <p className="text-center text-sm text-gray-600">{item.type}</p>
            </div>
        );
    };

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={handleBack} variant="outline">
                    Back
                </Button>
                <h1 className="text-4xl font-bold text-zinc-700 text-center">
                    Custom Assets
                </h1>
                <div className="w-[100px]"></div>
            </div>

            {isLoading && (
                <p className="text-center mb-4">Loading custom items...</p>
            )}

            {error && (
                <div className="text-red-500 text-center mb-4">
                    <p>{error}</p>
                    <Button 
                        onClick={fetchCustomItems}
                        className="mt-2"
                    >
                        Retry
                    </Button>
                </div>
            )}

            {!isLoading && !error && items.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {items.map(renderItem)}
                </div>
            )}

            {!isLoading && !error && items.length === 0 && (
                <p className="text-center mb-4">No custom items found.</p>
            )}
        </div>
    );
};

export default withAuth(ViewCustomItems);
