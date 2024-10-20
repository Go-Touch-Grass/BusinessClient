import React, { useEffect, useState } from 'react';
import api from '@/api';
import Cookies from 'js-cookie'; // For managing authentication tokens
import withAuth from '../../withAuth';
import { Input } from '../../../components/components/ui/input';
import { Button } from '../../../components/components/ui/button';
import { Label } from '../../../components/components/ui/label';
import { Textarea } from '../../../components/components/ui/textarea';
import router from 'next/router';

const CreateVoucherPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [duration, setDuration] = useState<number>(0); // State for duration input
    const [registeredBusiness, setRegisteredBusiness] = useState<RegisteredBusiness | null>(null);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null); // Outlet selection (optional)
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null); // State for image file
    const [enableGroupPurchase, setEnableGroupPurchase] = useState<boolean>(false);
    const [groupSize, setGroupSize] = useState<number>(2);
    const [groupDiscount, setGroupDiscount] = useState<number>(0);


    interface RegisteredBusiness {
        registration_id: number;
        entityName: string;
        location: string;
        category: string;
        proof: string;
        status: string;
        remarks: string;
    }

    interface Outlet {
        outlet_id: string;
        outlet_name: string;
        location: string;
        description: string;
        contact: string;
    }

    // Fetch business and outlet data when the page loads
    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = Cookies.get('authToken');
                if (!token) {
                    setError('Not authenticated');
                    return;
                }

                const response = await api.get('/api/business/profile'); // Fetch profile (business and outlets)
                if (response.status === 200) {
                    setRegisteredBusiness(response.data.registeredBusiness); // Set business headquarters
                    setOutlets(response.data.outlets); // Set branch outlets (if any)
                } else {
                    setError('Failed to fetch profile');
                }
            } catch (err) {
                setError('Error fetching profile');
                console.error('API error:', err);
            }
        };

        fetchData();
    }, []);

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file); // Store the selected image file
        }
    };

    // Handle voucher submission
    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        try {
            if (!registeredBusiness) {
                setError('No business selected.');
                return;
            }

            const formData = new FormData();
            formData.append('name', name);
            formData.append('description', description);
            formData.append('price', price.toString());
            formData.append('discount', discount.toString());
            formData.append('duration', duration.toString());
            formData.append('business_id', registeredBusiness.registration_id.toString());
            if (selectedOutlet) {
                formData.append('outlet_id', selectedOutlet);
            }
            if (imageFile) {
                formData.append('voucherImage', imageFile); // Append the selected image file
            }
            formData.append('enableGroupPurchase', enableGroupPurchase.toString());
            if (enableGroupPurchase) {
                formData.append('groupSize', groupSize.toString());
                formData.append('groupDiscount', groupDiscount.toString());
            }

            const token = Cookies.get('authToken');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }

            const response = await api.post('/api/business/create_voucher', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data', // Required for file uploads
                },
            });

            if (response.status === 201) {
                setSuccess('Voucher created successfully');
                router.push('/voucher'); // Redirect to voucher listing page
            } else {
                setError('Failed to create voucher');
            }
        } catch (err) {
            setError('Error creating voucher');
            console.error('API error:', err);
        }
    };

    return (
        <div>
            <h1>Create a New Voucher</h1>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {success && <p style={{ color: 'green' }}>{success}</p>}

            <div>
                <Label>Voucher Name:</Label>
                <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter voucher name"
                    required
                />
            </div>

            <div>
                <Label>Description:</Label>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter voucher description"
                />
            </div>

            <div>
                <Label>Original Price:</Label>
                <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    placeholder="Enter voucher price"
                    required
                />
            </div>

            <div>
                <Label>Discount to apply:</Label>
                <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value))}
                    placeholder="Enter discount amount"
                />
            </div>

            <div className="mb-4 flex items-center">
                <Label htmlFor="enableGroupPurchase">Enable Group Purchase</Label>
                <Input
                    id="enableGroupPurchase"
                    type="checkbox"
                    checked={enableGroupPurchase}
                    onChange={(e) => setEnableGroupPurchase(e.target.checked)}
                    className="mr-2" // Add margin to the right for spacing
                />
            </div>

            {enableGroupPurchase && (
                <>
                    <div className="mb-4">
                        <Label htmlFor="groupSize">Group Size</Label>
                        <Input
                            id="groupSize"
                            type="number"
                            value={groupSize}
                            onChange={(e) => setGroupSize(Number(e.target.value))}
                        />
                    </div>

                    <div className="mb-4">
                        <Label htmlFor="groupDiscount">Group Discount (%)</Label>
                        <Input
                            id="groupDiscount"
                            type="number"
                            value={groupDiscount}
                            onChange={(e) => setGroupDiscount(Number(e.target.value))}
                        />
                    </div>
                </>
            )}


            {/* New field for voucher duration */}
            <div>
                <Label>Duration (in days):</Label>
                <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="Enter duration in days"
                    required
                />
                <div>
                    <Label>Voucher Image:</Label>
                    <Input type="file" accept=".jpeg, .jpg, .png" onChange={handleImageChange} /> {/* Image upload input */}
                </div>

                {/* Conditionally render outlet selection if there are outlets */}
                {outlets.length > 0 && (
                    <div>
                        <Label>Select Outlet (Listing would be added to Main Branch if not chosen):</Label>
                        <br />
                        <select value={selectedOutlet || ''} onChange={(e) => setSelectedOutlet(e.target.value)}>
                            <option value="">-- Select an Outlet --</option>
                            {outlets.map((outlet) => (
                                <option key={outlet.outlet_id} value={outlet.outlet_id}>
                                    {outlet.outlet_name}
                                </option>
                            ))}
                        </select>
                    </div>
                )}
                <br /><br /><br /><br />
                <Button onClick={handleSubmit}>Create Voucher</Button>
            </div>
        </div>
    );
};

export default withAuth(CreateVoucherPage);
