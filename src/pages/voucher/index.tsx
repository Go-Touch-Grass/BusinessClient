import React, { useEffect, useState } from 'react';
import api from '@/api';
import withAuth from '../withAuth';
import Cookies from 'js-cookie';
import { Label } from '../../components/components/ui/label';
import { Input } from '../../components/components/ui/input';
import { Button } from '../../components/components/ui/button';
import router from 'next/router';

interface voucher {
    listing_id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    voucherImage: string;
}

interface Outlet {
    outlet_id: number;
    outlet_name: string;
    location: string;
    contact: string;
    description: string;

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

const VoucherList = () => {

    const [vouchers, setVouchers] = useState<voucher[]>([]);
    const [error, setError] = useState('');
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string>(''); // store business_id or outlet_id

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = Cookies.get('authToken');
                if (!token) {
                    setError('No token found. Please log in.');
                    return;
                }
                //const response = await api.get(`/api/business/profile/${username}`);
                const response = await api.get(`/api/business/profile`);
                if (response.status === 200) {
                    setOutlets(response.data.outlets);
                    setBusinessRegistration(response.data.registeredBusiness); // Set the business registration data
                } else {
                    setError(response.data.message || 'Failed to fetch profile');
                }
            } catch (err) {
                setError('An error occurred while fetching profile');
                console.error('API call error:', err);
            }
        };

        fetchProfile();
    }, []);

    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        // Prevent selecting the "Select a Branch" option (empty value)
        if (value === '') {
            return;
        }
        setSelectedBranch(value);
        fetchVouchers(value); // Fetch vouchers based on selected branch
    };

    const fetchVouchers = async (branchId: string) => {
        try {
            let response;

            if (branchId.startsWith('registration_')) {
                const registrationId = branchId.split('_')[1];  // Extract the registration_id (for main business)
                response = await api.get(`/api/business/vouchers?registration_id=${registrationId}`);
            } else {
                const outletId = branchId.split('_')[1]; // Extract the outlet_id
                response = await api.get(`/api/business/vouchers?outlet_id=${outletId}`);
            }

            if (response.status === 200) {
                setVouchers(response.data.vouchers);
            } else {
                setVouchers([]);
                setError(response.data.message || 'No vouchers found');
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setError('Error fetching vouchers');
        }
    };

    const handleEdit = (listingId: number) => {
        //router.push(`/editVoucher/${listingId}`);
    };

    const handleDelete = async (listingId: number) => {
        /*
        try {
            await api.delete(`/api/business/voucher/${listingId}`);
            setVouchers(vouchers.filter(voucher => voucher.listing_id !== listingId));
        } catch (err) {
            console.error('Error deleting voucher:', err);
            setError('An error occurred while deleting the voucher');
        }
        */
    };

    return (
        <div>
            <h1>View Vouchers</h1>
            <div className='flex justify-between items-center'>
                <h2 className='text-lg font-semibold'>Your Outlets</h2>

                {/* Existing Add Outlet Button */}
                <Button
                    className={'bg-green-500 hover:bg-green-600 text-white'}
                    onClick={() => router.push('./voucher/addVoucher')}
                >
                    + Add New Voucher
                </Button>
            </div>

            {/* Dropdown to select between main business and outlets */}
            <Label htmlFor="branch-select">Select Branch: </Label>
            <select id="branch-select" value={selectedBranch} onChange={handleBranchChange}>
                <option value="">-- Select a Branch --</option>

                {/* Main business option */}
                {businessRegistration && (
                    <option value={`registration_${businessRegistration.registration_id}`}>
                        {businessRegistration.entityName} (Main Branch)
                    </option>
                )}

                {/* Outlet options */}
                {outlets.map((outlet) => (
                    <option key={`outlet_${outlet.outlet_id}`} value={`outlet_${outlet.outlet_id}`}>
                        {outlet.outlet_name} (Outlet)
                    </option>
                ))}
            </select>

            {/* Error message if any */}
            {error && <p className="text-red-500">{error}</p>}

            {/* Display vouchers */}
            <br />
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6">Manage Vouchers</h1>

                {error && <p className="text-red-500">{error}</p>}

                {vouchers.length === 0 ? (
                    <p>No vouchers available.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vouchers.map((voucher) => (
                            <div
                                key={voucher.listing_id}
                                className="border rounded-lg shadow-lg p-4 bg-white"
                            >
                                {voucher.voucherImage && (
                                    <img
                                        src={voucher.voucherImage}
                                        alt={voucher.name}
                                        className="w-full h-48 object-cover mb-4 rounded"
                                    />
                                )}
                                <h3 className="text-xl font-semibold mb-2">{voucher.name}</h3>
                                <p className="text-gray-700 mb-2">{voucher.description}</p>
                                <p className="text-gray-900 font-bold mb-2">Price: ${voucher.price}</p>
                                <p className="text-gray-500 mb-4">Discount: {voucher.discount}%</p>
                                <div className="flex justify-between">
                                    <Button
                                        onClick={() => handleEdit(voucher.listing_id)}
                                        variant="default"
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        onClick={() => handleDelete(voucher.listing_id)}
                                        variant="destructive"
                                    >
                                        Delete
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default withAuth(VoucherList);
