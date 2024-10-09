// pages/editVoucher/index.tsx
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api'; // Adjust the import according to your API setup
import { Button } from '../components/components/ui/button'; // Adjust the import paths
import { Input } from '../components/components/ui/input';
import { Label } from '../components/components/ui/label';
import withAuth from './withAuth';

interface Voucher {
    listing_id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    voucherImage: string;
}

const EditVoucher = () => {
    const router = useRouter();
    const { listing_id } = router.query; // Get the listing_id from the query parameters
    const [voucher, setVoucher] = useState<Voucher | null>(null);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(true);

    // Form states for the editable fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [voucherImage, setVoucherImage] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null); // Image file state


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
            setImageFile(file); // Store the selected image file
            setVoucherImage(URL.createObjectURL(file)); // Preview the image
        }
    };


    // Handle form submission to update the voucher
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price.toString());
            formData.append('discount', discount.toString());

            if (imageFile) {
                formData.append('voucherImage', imageFile); // Append the selected image file
            }

            const response = await api.put(`/api/business/vouchers/${listing_id}`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // header for fileupload
                },
            });

            if (response.status === 200) {
                router.push('/voucher'); // Redirect to voucher list page after successful edit
            } else {
                setError('Failed to update voucher.');
            }
        } catch (err) {
            setError('Error updating voucher.');
        }
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
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            required
                        />
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
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="voucherImage">Voucher Image</Label>
                        <Input
                            id="voucherImage"
                            type="file"
                            accept=".jpeg, .jpg, .png"
                            onChange={handleImageChange}
                        />

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