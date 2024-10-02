import React, { useEffect, useState } from 'react';
import api from '@/api';
import Cookies from 'js-cookie'; // For managing authentication tokens
import withAuth from '../../withAuth';
import { Input } from '../../../components/components/ui/input';
import { Button } from '../../../components/components/ui/button';
import { Label } from '../../../components/components/ui/label';
import { Textarea } from '../../../components/components/ui/textarea';

const CreateVoucherPage = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [discount, setDiscount] = useState<number>(0);
    const [registeredBusiness, setRegisteredBusiness] = useState<RegisteredBusiness | null>(null);
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [selectedOutlet, setSelectedOutlet] = useState<string | null>(null); // Outlet selection (optional)
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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

    // Handle voucher submission
    const handleSubmit = async () => {
        setError(null);
        setSuccess(null);

        try {
            if (!registeredBusiness) {
                setError('No business selected.');
                return;
            }

            const data = {
                name,
                description,
                price,
                discount,
                business_id: registeredBusiness.registration_id, // Optional, for headquarters
                outlet_id: selectedOutlet || null, // Optional, for specific outlet
            };

            const response = await api.post('/api/business/create_voucher', data);

            if (response.status === 201) {
                setSuccess('Voucher created successfully');
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
                <Label>Price:</Label>
                <Input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(parseFloat(e.target.value))}
                    placeholder="Enter voucher price"
                    required
                />
            </div>

            <div>
                <Label>Discount:</Label>
                <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(parseFloat(e.target.value))}
                    placeholder="Enter discount amount"
                />
            </div>

            {/* Conditionally render outlet selection if there are outlets */}
            {outlets.length > 0 && (
                <div>
                    <Label>Select Outlet (optional):</Label>
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
            <br />
            <Button onClick={handleSubmit}>Create Voucher</Button>
        </div>
    );
};

export default withAuth(CreateVoucherPage);
