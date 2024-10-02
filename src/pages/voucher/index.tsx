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
        setSelectedBranch(e.target.value);
        fetchVouchers(e.target.value); // Fetch vouchers based on selected branch
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
            <div>
                {vouchers.length > 0 ? (
                    <ul>
                        {vouchers.map((voucher) => (
                            <li key={voucher.listing_id} className="voucher-item">
                                <h3>{voucher.name}</h3>
                                <p>{voucher.description}</p>
                                <p>Price: {voucher.price}</p>
                                <p>Discount: {voucher.discount}%</p>
                            </li>
                        ))}
                    </ul>
                ) : (

                    <p>No vouchers available</p>
                )}
            </div>
        </div>
    );
};

export default withAuth(VoucherList);
