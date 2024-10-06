import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import api from '@/api';
import { Input } from '../components/components/ui/input';
import { Label } from '../components/components/ui/label';
import { Button } from '../components/components/ui/button';
import withAuth from './withAuth';

interface Outlet {
    outlet_id: number;
    outlet_name: string;
    location: string;
    contact: string;
    description: string;
}

const EditOutlet = () => {
    const router = useRouter();
    const { outletId } = router.query;

    const [outlet, setOutlet] = useState<Outlet | null>(null);
    const [error, setError] = useState('');

    useEffect(() => {
        if (outletId) {
            fetchOutletDetails(outletId as string);
        }
    }, [outletId]);

    const fetchOutletDetails = async (id: string) => {
        try {
            const response = await api.get(`/api/business/outlets/${id}`);
            if (response.status === 200) {
                setOutlet(response.data);
            } else {
                setError('Failed to fetch outlet details');
            }
        } catch (err) {
            setError('Error fetching outlet details');
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setOutlet((prevOutlet) => prevOutlet ? { ...prevOutlet, [id]: value } : null);
    };

    const handleUpdateOutlet = async () => {
        try {
            if (outlet) {
                const response = await api.put(`/api/business/outlets/${outlet.outlet_id}`, outlet);
                if (response.status === 200) {
                    router.push('/profile'); // Redirect back to profile after successful update
                } else {
                    setError('Failed to update outlet');
                }
            }
        } catch (err) {
            setError('Error updating outlet');
        }
    };

    if (!outlet) return <p>Loading...</p>;

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Outlet</h1>
            {error && <p className="text-red-500">{error}</p>}
            <div className="space-y-6">
                <div>
                    <Label htmlFor="outlet_name">Outlet Name</Label>
                    <Input
                        id="outlet_name"
                        value={outlet.outlet_name}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                        id="location"
                        value={outlet.location}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <Label htmlFor="contact">Contact</Label>
                    <Input
                        id="contact"
                        value={outlet.contact}
                        onChange={handleInputChange}
                    />
                </div>
                <div>
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={outlet.description}
                        onChange={handleInputChange}
                    />
                </div>
                <div className="flex justify-end">
                    <Button
                        className="bg-green-500 hover:bg-green-600 text-white"
                        onClick={handleUpdateOutlet}
                    >
                        Save Changes
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default withAuth(EditOutlet);
