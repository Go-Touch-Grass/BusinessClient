import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/Register/ui/button";
import withAuth from "./withAuth";
import api from "@/api";
import Cookies from 'js-cookie';
import { ItemType, Item, getItems } from "@/api/avatarApi";
import Image from "next/image";

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

const CustomItem: React.FC = () => {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [selectedOutlet, setSelectedOutlet] = useState<number | null>(null);
    const [selectedItemType, setSelectedItemType] = useState<ItemType>(ItemType.HAT);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [avatarCustomization, setAvatarCustomization] = useState<{
        [ItemType.BASE]: Item | null;
        [ItemType.HAT]: Item | null;
        [ItemType.SHIRT]: Item | null;
        [ItemType.BOTTOM]: Item | null;
    }>({
        [ItemType.BASE]: null,
        [ItemType.HAT]: null,
        [ItemType.SHIRT]: null,
        [ItemType.BOTTOM]: null,
    });
    const [items, setItems] = useState<Item[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<ItemType | null>(null);
    const [customItemScale, setCustomItemScale] = useState<number>(1);
    const [customItemOffsetX, setCustomItemOffsetX] = useState<number>(0);
    const [customItemOffsetY, setCustomItemOffsetY] = useState<number>(0);

    useEffect(() => {
        fetchProfile();
        fetchItems();
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

    const fetchItems = async () => {
        try {
            const fetchedItems = await getItems();
            setItems(fetchedItems);
            // Set default base item
            const baseItem = fetchedItems.find(item => item.type === ItemType.BASE && item.id === 1);
            if (baseItem) {
                setAvatarCustomization(prev => ({
                    ...prev,
                    [ItemType.BASE]: baseItem
                }));
            }
        } catch (error) {
            console.error("Error fetching items:", error);
            setError("Failed to fetch items");
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
                // Create a temporary URL for the file
                const objectUrl = URL.createObjectURL(selectedFile);
                setPreviewUrl(objectUrl);
                // Update avatar customization with the new item
                setAvatarCustomization(prev => ({
                    ...prev,
                    [selectedItemType]: { id: 0, name: 'Custom Item', filepath: objectUrl, type: selectedItemType }
                }));
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

    const handleItemTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const newItemType = event.target.value as ItemType;
        setSelectedItemType(newItemType);
        // Reset file, preview, all avatar customizations, and selected category when item type changes
        setFile(null);
        setPreviewUrl(null);
        setSelectedCategory(null);
        setAvatarCustomization({
            [ItemType.BASE]: items.find(item => item.type === ItemType.BASE && item.id === 1) || null,
            [ItemType.HAT]: null,
            [ItemType.SHIRT]: null,
            [ItemType.BOTTOM]: null,
        });
        // Reset slider values
        setCustomItemScale(1);
        setCustomItemOffsetX(0);
        setCustomItemOffsetY(0);
    };

    const handleSelectItem = (item: Item) => {
        setAvatarCustomization(prev => ({
            ...prev,
            [item.type]: item,
        }));
    };

    const renderWardrobeItems = (itemType: ItemType) => {
        const filteredItems = items.filter(item => item.type === itemType);
        return (
            <div className="flex space-x-4 overflow-x-auto">
                {filteredItems.map((item) => (
                    <div
                        key={item.id}
                        onClick={() => handleSelectItem(item)}
                        className="cursor-pointer"
                    >
                        <Image
                            src={item.filepath}
                            alt={item.name}
                            width={64}
                            height={64}
                            className="rounded border"
                        />
                    </div>
                ))}
            </div>
        );
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

        const formData = new FormData();
        formData.append('customItem', file);
        formData.append('entityType', selectedOutlet ? 'outlet' : 'business');
        formData.append('entityId', selectedOutlet ? selectedOutlet.toString() : businessRegistration!.registration_id.toString());
        formData.append('itemType', selectedItemType);

        try {
            const response = await api.post('/api/custom-item/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.status === 200) {
                alert("Custom item uploaded successfully!");
                setFile(null);
                setSelectedOutlet(null);
                setSelectedItemType(ItemType.HAT);
            } else {
                setError("Failed to upload custom item.");
            }
        } catch (err) {
            setError("An error occurred while uploading the custom item.");
            console.error('API call error:', err);
        }
    };

    const renderCustomItemControls = () => {
        return (
            <div className="w-full mb-6">
                <h3 className="text-lg font-semibold mb-2">Adjust Custom Item:</h3>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="scale-slider" className="block mb-1">Scale: {customItemScale.toFixed(2)}</label>
                        <input
                            id="scale-slider"
                            type="range"
                            min="0.5"
                            max="2.0"
                            step="0.01"
                            value={customItemScale}
                            onChange={(e) => setCustomItemScale(parseFloat(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="x-offset-slider" className="block mb-1">X Offset: {customItemOffsetX}</label>
                        <input
                            id="x-offset-slider"
                            type="range"
                            min="-75"
                            max="75"
                            step="1"
                            value={customItemOffsetX}
                            onChange={(e) => setCustomItemOffsetX(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label htmlFor="y-offset-slider" className="block mb-1">Y Offset: {customItemOffsetY}</label>
                        <input
                            id="y-offset-slider"
                            type="range"
                            min="-75"
                            max="75"
                            step="1"
                            value={customItemOffsetY}
                            onChange={(e) => setCustomItemOffsetY(parseInt(e.target.value))}
                            className="w-full"
                        />
                    </div>
                </div>
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
                    Custom Item Upload
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

                <div className="w-full mb-6">
                    <label htmlFor="itemTypeSelect" className="block mb-2 font-semibold">Select Item Type:</label>
                    <select
                        id="itemTypeSelect"
                        value={selectedItemType}
                        onChange={handleItemTypeChange}
                        className="border rounded p-2 w-full"
                    >
                        <option value={ItemType.HAT}>Hat</option>
                        <option value={ItemType.SHIRT}>Shirt</option>
                        <option value={ItemType.BOTTOM}>Bottom</option>
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
                        <div className="flex flex-col items-center mt-4">
                            <div className="relative">
                                {avatarCustomization[ItemType.BASE] && (
                                    <Image
                                        src={avatarCustomization[ItemType.BASE].filepath}
                                        alt={avatarCustomization[ItemType.BASE].name}
                                        width={170}
                                        height={170}
                                    />
                                )}
                                {avatarCustomization[ItemType.HAT] && selectedItemType !== ItemType.HAT && (
                                    <Image
                                        src={avatarCustomization[ItemType.HAT].filepath}
                                        alt={avatarCustomization[ItemType.HAT].name}
                                        width={90}
                                        height={90}
                                        className="absolute top-[-5px] left-[38px]"
                                    />
                                )}
                                {avatarCustomization[ItemType.BOTTOM] && selectedItemType !== ItemType.BOTTOM && (
                                    <Image
                                        src={avatarCustomization[ItemType.BOTTOM].filepath}
                                        alt={avatarCustomization[ItemType.BOTTOM].name}
                                        width={160}
                                        height={100}
                                        className="absolute top-[115px] left-[5px]"
                                    />
                                )}
                                {avatarCustomization[ItemType.SHIRT] && selectedItemType !== ItemType.SHIRT && (
                                    <Image
                                        src={avatarCustomization[ItemType.SHIRT].filepath}
                                        alt={avatarCustomization[ItemType.SHIRT].name}
                                        width={105}
                                        height={91}
                                        className="absolute top-[76px] left-[32px]"
                                    />
                                )}
                                <Image
                                    src={previewUrl}
                                    alt="Custom Item"
                                    width={100}
                                    height={100}
                                    className={`absolute ${selectedItemType === ItemType.HAT ? 'top-[-5px] left-[38px]' :
                                            selectedItemType === ItemType.SHIRT ? 'top-[76px] left-[32px]' :
                                                selectedItemType === ItemType.BOTTOM ? 'top-[115px] left-[5px]' : ''
                                        }`}
                                    style={{
                                        transform: `scale(${customItemScale}) translate(${customItemOffsetX}px, ${customItemOffsetY}px)`,
                                        transformOrigin: 'center',
                                    }}
                                />
                            </div>
                        </div>

                        {renderCustomItemControls()}

                        <p className="mt-6 text-center">
                            Check out how your custom {selectedItemType === ItemType.HAT ? "Hat" :
                                selectedItemType === ItemType.SHIRT ? "Shirt" :
                                    selectedItemType === ItemType.BOTTOM ? "Bottom" : selectedItemType} design fits with other items!
                        </p>

                        <div className="mt-4 flex justify-center space-x-4">
                            {[ItemType.BASE, ...Object.values(ItemType).filter(type => type !== selectedItemType && type !== ItemType.BASE)].map(itemType => (
                                <Button
                                    key={itemType}
                                    onClick={() => setSelectedCategory(itemType)}
                                    variant={selectedCategory === itemType ? "default" : "outline"}
                                >
                                    {itemType === ItemType.BASE ? "Base" :
                                        itemType === ItemType.HAT ? "Hat" :
                                            itemType === ItemType.SHIRT ? "Shirt" :
                                                itemType === ItemType.BOTTOM ? "Bottom" : itemType}
                                </Button>
                            ))}
                        </div>

                        <div className="mt-6 overflow-x-auto">
                            <div className="mt-6 flex justify-center">
                                {renderWardrobeItems(selectedCategory as ItemType)}
                            </div>
                        </div>
                    </div>
                )}

                <Button
                    onClick={handleUpload}
                    disabled={!file || (!selectedOutlet && !businessRegistration)}
                >
                    Upload Custom Item
                </Button>
                <p className="text-sm text-gray-600 mt-2">
                    Designs are subject to approval.
                </p>
                {error && <p className="text-red-500">{error}</p>}
            </div>
        </div>
    );
};

export default withAuth(CustomItem);