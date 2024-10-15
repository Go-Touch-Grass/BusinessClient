import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import { Item, ItemType } from "@/api/itemApi";

const CustomItemDetails: React.FC = () => {
    const router = useRouter();
    const [item, setItem] = useState<Item | null>(null);

    useEffect(() => {
        const storedItem = sessionStorage.getItem('selectedItem');
        if (storedItem) {
            setItem(JSON.parse(storedItem));
            sessionStorage.removeItem('selectedItem');
        } else {
            router.push('/viewCustomItems');
        }
    }, []);

    if (!item) {
        return <div>Loading...</div>;
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case "approved":
                return "text-green-600";
            case "rejected":
                return "text-red-600";
            default:
                return "text-yellow-600";
        }
    };

    const statusColor = getStatusColor(item.status);

    return (
        <div className="container mx-auto p-6">
            <div className="flex justify-between items-center mb-6">
                <Button onClick={() => router.push('/viewCustomItems')} variant="outline">
                    Back
                </Button>
                <h1 className="text-4xl font-bold text-zinc-700 text-center">
                    Custom Item Details
                </h1>
                <div className="w-[100px]"></div>
            </div>

            <div className="flex flex-col items-center space-y-6">
                <div className="bg-gray-100 p-6 rounded-lg shadow-md w-full max-w-2xl">
                    <h2 className="text-2xl font-bold mb-4">Item Preview</h2>
                    <div className="flex flex-col items-center space-y-4">
                        <Image
                            src={item.filepath}
                            alt={item.name}
                            width={200}
                            height={200}
                            className="rounded border"
                        />
                        <div className="grid grid-cols-2 gap-4 w-full">
                            <p><strong>Item Name:</strong> {item.name}</p>
                            <p><strong>Item Type:</strong> {item.type}</p>
                            <p><strong>Item ID:</strong> {item.id}</p>
                            <p><strong>Status:</strong> <span className={`font-bold ${statusColor}`}>{item.status}</span></p>
                            {item?.remarks?.length > 1 && <p><strong>Remarks: </strong>{item.remarks}</p>}
                            <p><strong>Business Registration ID:</strong> {item.business_register_business?.registration_id ?? 'null'}</p>
                            <p><strong>Outlet ID:</strong> {item.outlet?.outlet_id ?? 'null'}</p>
                            <p><strong>Scale:</strong> {item.scale ?? 'null'}</p>
                            <p><strong>X Offset:</strong> {item.xOffset ?? 'null'}</p>
                            <p><strong>Y Offset:</strong> {item.yOffset ?? 'null'}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withAuth(CustomItemDetails);
