import React, { useEffect, useState } from 'react';
import api from '@/api';
import Cookies from 'js-cookie'; // For managing authentication tokens
import withAuth from '../../withAuth';
import { Input } from '../../../components/components/ui/input';
import { Button } from '../../../components/components/ui/button';
import { Label } from '../../../components/components/ui/label';
import { Textarea } from '../../../components/components/ui/textarea';
import router from 'next/router';
import { Item, getCustomItems } from "@/api/itemApi"; // Add this import
import Image from 'next/image';

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
    const [customItems, setCustomItems] = useState<Item[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [filteredItems, setFilteredItems] = useState<Item[]>([]);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

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

    // Modify the useEffect for fetching custom items
    useEffect(() => {
        const fetchCustomItems = async () => {
            try {
                const items = await getCustomItems();
                // Filter to only include approved items
                const approvedItems = items.filter(item => item.status === "approved");
                setCustomItems(approvedItems);
                filterItemsByOutlet(approvedItems, selectedOutlet);
            } catch (err) {
                console.error('Error fetching custom items:', err);
                setError('Failed to fetch custom items');
            }
        };

        fetchCustomItems();
    }, []);

    // Add a new useEffect to handle filtering when the selected outlet changes
    useEffect(() => {
        const selectedOutletId = outlets.find(o => o.outlet_name === selectedOutlet)?.outlet_id || null;
        filterItemsByOutlet(customItems, selectedOutletId);
    }, [selectedOutlet, customItems, outlets]);

    const filterItemsByOutlet = (items: Item[], outletId: string | null) => {
        if (!outletId) {
            // If no outlet is selected, show items with no outlet (main business items)
            setFilteredItems(items.filter(item => !item.outlet));
        } else {
            // If an outlet is selected, show items for that specific outlet
            setFilteredItems(items.filter(item => item.outlet && item.outlet.outlet_id === outletId));
        }
    };

    // Handle image selection
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!name.trim()) {
            newErrors.name = "Voucher name is required.";
        }

        if (!description.trim()) {
            newErrors.description = "Description is required.";
        }

        if (price <= 0) {
            newErrors.price = "Price must be greater than 0.";
        }

        if (discount < 0 || discount > 100) {
            newErrors.discount = "Discount must be between 0% and 100%.";
        }

        if (duration <= 0) {
            newErrors.duration = "Duration must be greater than 0.";
        }

        if (!imageFile) {
            newErrors.image = "Voucher image is required.";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Handle voucher submission
    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        if (!validateForm()) {
            return;
        }

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
                const selectedOutletId = outlets.find(o => o.outlet_name === selectedOutlet)?.outlet_id;
                if (selectedOutletId) {
                    formData.append('outlet_id', selectedOutletId);
                }
            }
            if (imageFile) {
                formData.append('voucherImage', imageFile); // Append the selected image file
            }
            if (selectedItemId) {
                formData.append('reward_item_id', selectedItemId);
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
                // Add browser alert
                alert('Voucher created successfully!');
                router.push('/voucher'); // Redirect to voucher listing page
            } else {
                setError('Failed to create voucher');
            }
        } catch (err) {
            setError('Error creating voucher');
            console.error('API error:', err);
        }
    };

    const handleItemSelection = (itemId: string | null) => {
        setSelectedItemId(prevId => prevId === itemId ? null : itemId);
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
                {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
                <Label>Description:</Label>
                <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Enter voucher description"
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description}</p>}
            </div>

            <div>
                <Label>Original Price:</Label>
                <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    placeholder="Enter voucher price"
                    min="0"
                    required
                />
                {errors.price && <p className="text-red-500 text-sm">{errors.price}</p>}
            </div>

            <div>
                <Label>Discount Percentage:</Label>
                <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value))))}
                    placeholder="Enter discount percentage"
                    min="0"
                    max="100"
                    step="0.1"
                />
                {errors.discount && <p className="text-red-500 text-sm">{errors.discount}</p>}
            </div>

            <div>
                <Label>Duration (in days):</Label>
                <Input
                    type="number"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                    placeholder="Enter duration in days"
                    min="0"
                    required
                />
                {errors.duration && <p className="text-red-500 text-sm">{errors.duration}</p>}
            </div>

            <div>
                <Label>Voucher Image:</Label>
                <Input type="file" accept=".jpeg, .jpg, .png" onChange={handleImageChange} />
                {errors.image && <p className="text-red-500 text-sm">{errors.image}</p>}
                {imagePreview && (
                    <div className="mt-5">
                        <p>Voucher Image Preview:</p>
                        <Image
                            src={imagePreview}
                            alt="Voucher preview"
                            width={200}
                            height={200}
                            className="object-contain"
                        />
                    </div>
                )}
            </div>

            {/* Conditionally render outlet selection if there are outlets */}
            {outlets.length > 0 && (
                <div className='mt-10'>
                    <Label>Select Outlet (Listing would be added to Main Branch if not chosen):</Label>
                    <br />
                    <select 
                        value={selectedOutlet || ''} 
                        onChange={(e) => setSelectedOutlet(e.target.value || null)}
                    >
                        <option value="">-- Main Branch --</option>
                        {outlets.map((outlet) => (
                            <option key={outlet.outlet_id} value={outlet.outlet_name}>
                                {outlet.outlet_name}
                            </option>
                        ))}
                    </select>
                </div>
            )}
            {/* <br /><br /><br /><br /> */}

            {/* Update the reward item selection section */}
            <div className='mt-10'>
                <Label>Select Reward Item (Optional):</Label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2 p-2 mb-10">
                    {filteredItems.length > 0 ? (
                        filteredItems.map((item) => (
                            <div
                                key={item.id}
                                className={`p-2 border rounded cursor-pointer ${selectedItemId === item.id ? 'border-green-500 bg-green-100' : 'border-green-300'
                                    }`}
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
                        ))
                    ) : (
                        <p className="col-span-full text-center text-gray-500">No approved custom items available for this selection.</p>
                    )}
                </div>
            </div>

            <Button onClick={handleSubmit}>Create Voucher</Button>
        </div>
    );
};

export default withAuth(CreateVoucherPage);
