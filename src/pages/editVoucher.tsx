// pages/editVoucher/index.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api'; // Adjust the import according to your API setup
import { Button } from '../components/components/ui/button'; // Adjust the import paths
import { Input } from '../components/components/ui/input';
import { Label } from '../components/components/ui/label';
import withAuth from './withAuth';
import { Textarea } from '../components/components/ui/textarea';
import Image from 'next/image';
import { Item, getCustomItems } from "@/api/itemApi";

interface Voucher {
    listing_id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    voucherImage: string;
    outlet?: { outlet_id: string };
    rewardItem?: { id: number }; // Update this to match the actual structure
}

const EditVoucher = () => {
    const router = useRouter();
    const { listing_id } = router.query; // Get the listing_id from the query parameters
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [customItems, setCustomItems] = useState<Item[]>([]);
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    // Form states for the editable fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [voucherImage, setVoucherImage] = useState('');

    // Fetch the specific voucher details based on the listing_id
    useEffect(() => {
        if (listing_id) {
            const fetchVoucher = async () => {
                try {
                    const response = await api.get(`/api/business/vouchers/${listing_id}`);
                    if (response.status === 200) {
                        const fetchedVoucher: Voucher = response.data.voucher;
                        setVoucher(fetchedVoucher);
                        setName(fetchedVoucher.name);
                        setDescription(fetchedVoucher.description);
                        setPrice(fetchedVoucher.price);
                        setDiscount(fetchedVoucher.discount);
                        setVoucherImage(fetchedVoucher.voucherImage);
                        // Set the selected item ID if present
                        setSelectedItemId(fetchedVoucher.rewardItem?.id || null);

                        // Fetch custom items
                        const items = await getCustomItems();
                        const approvedItems = items.filter(item => item.status === "approved");
                        setCustomItems(approvedItems);

                        // Filter items based on the voucher's outlet
                        if (fetchedVoucher.outlet) {
                            setFilteredItems(approvedItems.filter(item => 
                                item.outlet && item.outlet.outlet_id === fetchedVoucher.outlet?.outlet_id
                            ));
                        } else {
                            setFilteredItems(approvedItems.filter(item => !item.outlet));
                        }
                    } else {
                        setError('Failed to fetch voucher details.');
                    }
                } catch (err) {
                    setError('Error fetching voucher details.');
                } finally {
                    setLoading(false);
                }
            };

            fetchVoucher();
        }
    }, [listing_id]);

    // Handle image file change
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setImageFile(null);
            setImagePreview(null);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) newErrors.name = "Voucher name is required.";
        if (!description.trim()) newErrors.description = "Description is required.";
        if (price <= 0) newErrors.price = "Price must be greater than 0.";
        if (discount < 0 || discount > 100) newErrors.discount = "Discount must be between 0% and 100%.";

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle form submission to update the voucher
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validateForm()) {
            return;
        }

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price.toString());
            formData.append('discount', discount.toString());
            if (imageFile) {
                formData.append('voucherImage', imageFile);
            }
            // Update this part
            if (selectedItemId) {
                formData.append('reward_item_id', selectedItemId);
            } else {
                formData.append('reward_item_id', ''); // Send an empty string to unequip the item
            }

            const response = await api.put(`/api/business/vouchers/${listing_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.status === 200) {
                alert('Voucher updated successfully!');
                router.push('/voucher');
            } else {
                setError('Failed to update voucher.');
            }
        } catch (err) {
            setError('Error updating voucher.');
        }
    };

    const handleItemSelection = (itemId: string | null) => {
        setSelectedItemId(prevId => prevId === itemId ? null : itemId);
    };

    if (loading) {
        return <p>Loading voucher details...</p>;
    }

    if (error) {
        return <p className="text-red-500">{error}</p>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Edit Voucher</h1>
            {voucher && (
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <Label htmlFor="name">Voucher Name</Label>
                        <Input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="description">Description</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
                        {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="price">Price ($)</Label>
                        <Input
                            id="price"
                            type="number"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            required
                        />
                        {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="discount">Discount (%)</Label>
                        <Input
                            id="discount"
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(Number(e.target.value))}
                            required
                        />
                        {errors.discount && <p className="text-red-500 text-sm">{errors.discount}</p>}
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="voucherImage">Change Voucher Image (Optional)</Label>
                        <Input
                            id="voucherImage"
                            type="file"
                            accept=".jpeg, .jpg, .png"
                            onChange={handleImageChange}
                        />
                        {imagePreview && (
                            <div className="mt-2">
                                <p>New Image Preview:</p>
                                <Image
                                    src={imagePreview}
                                    alt="New voucher preview"
                                    width={200}
                                    height={200}
                                    className="object-contain"
                                />
                            </div>
                        )}
                    </div>

                    <div className="mb-4">
                        <Label>Select Reward Item</Label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2">
                            {filteredItems.length > 0 ? (
                                <>
                                    <div
                                        className={`p-2 border rounded cursor-pointer ${!selectedItemId ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
                                        onClick={() => handleItemSelection(null)}
                                    >
                                        <div className="flex flex-col items-center justify-center h-full">
                                            <p className="text-sm font-semibold text-center">No Reward Item</p>
                                        </div>
                                    </div>
                                    {filteredItems.map((item) => (
                                        <div
                                            key={item.id}
                                            className={`p-2 border rounded cursor-pointer ${selectedItemId === item.id ? 'border-green-500 bg-green-100' : 'border-gray-300'}`}
                                            onClick={() => handleItemSelection(item.id)}
                                        >
                                            <div className="flex flex-col items-center">
                                                <Image
                                                    src={item.filepath}
                                                    alt={item.name}
                                                    width={80}
                                                    height={80}
                                                    className="mb-2 rounded"
                                                />
                                                <p className="text-sm font-semibold text-center">{item.name}</p>
                                                <p className="text-xs text-gray-600">{item.type}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            ) : (
                                <p className="col-span-full text-center text-gray-500">No approved custom items available for this voucher.</p>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <Button
                            className="bg-green-500 hover:bg-green-600 text-white"
                            type="submit"
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            )}
        </div>
    );
};

export default withAuth(EditVoucher);
