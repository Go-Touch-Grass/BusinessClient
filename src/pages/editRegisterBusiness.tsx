import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import api from '@/api';
import { Input } from '../components/components/ui/input';
import { Button } from '../components/components/ui/button';
import { Label } from '../components/components/ui/label';
import Cookies from 'js-cookie';
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/Register/ui/hover-card";

interface BusinessRegistration {
    entityName: string;
    location: string;
    category: string;
}

const EditRegisterBusiness: React.FC = () => {
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration>({
        entityName: '',
        location: '',
        category: '',
    });
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const fetchBusinessDetails = async () => {
            try {
                const token = Cookies.get('authToken');
                if (!token) {
                    setError('No token found. Please log in.');
                    return;
                }

                const response = await api.get(`/api/business/profile`);
                if (response.status === 200) {
                    setBusinessRegistration(response.data.registeredBusiness);
                } else {
                    setError(response.data.message || 'Failed to fetch business details.');
                }
            } catch (err) {
                console.error('Error fetching business details:', err);
                setError('Error fetching business details');
            }
        };

        fetchBusinessDetails();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setBusinessRegistration((prev) => ({ ...prev, [id]: value }));
    };

    const handleCategoryChange = (value: string) => {
        setBusinessRegistration((prev) => ({ ...prev, category: value }));
    };

    const handleSubmit = async () => {
        try {
            const updatedData = {
                entityName: businessRegistration.entityName,
                location: businessRegistration.location,
                category: businessRegistration.category,
            };

            const token = Cookies.get('authToken');
            if (!token) {
                setError('No token found. Please log in.');
                return;
            }

            const response = await api.put(`/api/business/editBusiness`, updatedData);
            if (response.status === 200) {

                router.push('/profile'); // Redirect to profile page after successful update
            } else {
                setError(response.data.message || 'Failed to update business registration.');
            }
        } catch (err) {
            console.error('Error updating business registration:', err);
            setError('Error updating business registration');
        }
    };

    return (
        <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Business Registration</h1>

            {error && <p className="text-red-500">{error}</p>}

            <div className="space-y-4">
                {/* Business Entity Name */}
                <div>
                    <Label htmlFor="entityName">Business Entity Name</Label>
                    <Input
                        id="entityName"
                        value={businessRegistration.entityName}
                        onChange={handleInputChange}
                        placeholder="Enter the business entity name"
                    />
                </div>

                {/* Business Location */}
                <div>
                    <Label htmlFor="location">Business Location</Label>
                    <Input
                        id="location"
                        value={businessRegistration.location}
                        onChange={handleInputChange}
                        placeholder="Enter the business location"
                    />
                </div>

                {/* Business Category - Radio Button Group */}
                <div>
                    <Label htmlFor="category">Business Category</Label>
                    <div className="flex flex-col space-y-3">
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="specialityretail"
                                name="category"
                                value="specialityretail"
                                checked={businessRegistration.category === 'specialityretail'}
                                onChange={() => handleCategoryChange('specialityretail')}
                            />
                            <Label htmlFor="specialityretail" className="font-normal">
                                Speciality Retail
                            </Label>
                            <HoverCard>
                                <HoverCardTrigger>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    Floristry, Newsagents, Stationery & Bookshops, Community Pharmacy, Specialty Stores, Jewellery, Fashion, Clothing & Footwear
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="foodnbeverage"
                                name="category"
                                value="foodnbeverage"
                                checked={businessRegistration.category === 'foodnbeverage'}
                                onChange={() => handleCategoryChange('foodnbeverage')}
                            />
                            <Label htmlFor="foodnbeverage" className="font-normal">
                                Food and Beverage
                            </Label>
                            <HoverCard>
                                <HoverCardTrigger>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    Supermarkets, Liquor, Fruit & Vegetable, Fast Food & Take-away
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="workhomelifestyle"
                                name="category"
                                value="workhomelifestyle"
                                checked={businessRegistration.category === 'workhomelifestyle'}
                                onChange={() => handleCategoryChange('workhomelifestyle')}
                            />
                            <Label htmlFor="workhomelifestyle" className="font-normal">
                                Work, Home and Lifestyle
                            </Label>
                            <HoverCard>
                                <HoverCardTrigger>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    Entertainment, Communication & Technology, Sport, Recreation & Leisure, Home Living, Hardware, Trade & Gardening
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="generalretail"
                                name="category"
                                value="generalretail"
                                checked={businessRegistration.category === 'generalretail'}
                                onChange={() => handleCategoryChange('generalretail')}
                            />
                            <Label htmlFor="generalretail" className="font-normal">
                                General Retail
                            </Label>
                            <HoverCard>
                                <HoverCardTrigger>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    Department Stores, Discount & Variety
                                </HoverCardContent>
                            </HoverCard>
                        </div>

                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                id="wholesalenlogistics"
                                name="category"
                                value="wholesalenlogistics"
                                checked={businessRegistration.category === 'wholesalenlogistics'}
                                onChange={() => handleCategoryChange('wholesalenlogistics')}
                            />
                            <Label htmlFor="wholesalenlogistics" className="font-normal">
                                Wholesale and Logistics
                            </Label>
                            <HoverCard>
                                <HoverCardTrigger>
                                </HoverCardTrigger>
                                <HoverCardContent>
                                    Wholesale, Distribution, Warehousing, Transport & Logistics
                                </HoverCardContent>
                            </HoverCard>
                        </div>
                    </div>
                </div>

                <Button onClick={handleSubmit} className="bg-blue-500 hover:bg-blue-600 text-white">
                    Save Changes
                </Button>
            </div>
        </div>
    );
};

export default EditRegisterBusiness;
