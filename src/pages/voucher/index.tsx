import React, { useEffect, useState } from 'react';
import api from '@/api';
import withAuth from '../withAuth';
import Cookies from 'js-cookie';
import { Label } from '../../components/components/ui/label';
import { Input } from '../../components/components/ui/input';
import { Button } from '../../components/components/ui/button';
import router from 'next/router';
import { isAxiosError } from 'axios';
import { BusinessAccount } from '../profile';

interface Voucher {
    listing_id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    voucherImage: string;
    rewardItem: {
        id: number;
        name: string;
        filepath: string;
        status: string;
    };
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

    const [vouchers, setVouchers] = useState<Voucher[]>([]);
    const [error, setError] = useState('');
    const [outlets, setOutlets] = useState<Outlet[]>([]);
    const [businessRegistration, setBusinessRegistration] = useState<BusinessRegistration | null>(null);
    const [selectedBranch, setSelectedBranch] = useState<string>(''); // store business_id or outlet_id
    const [searchTerm, setSearchTerm] = useState(''); // Single search term
    const [profile,setProfile] = useState<BusinessAccount>()

    const handleViewTransactions = (voucher: Voucher) => {
        router.push({
            pathname: '/viewVoucherTransaction', // Replace with the actual path to the transactions page
            query: { listing_id: voucher.listing_id },
        });
    };

    useEffect(() => {
        const fetchProfileAndVouchers = async () => {
            try {
                const token = Cookies.get('authToken');
                if (!token) {
                    setError('No token found. Please log in.');
                    return;
                }
                const response = await api.get(`/api/business/profile`);
                if (response.status === 200) {
                    setOutlets(response.data.outlets);
                    setProfile(response.data.business)
                    setBusinessRegistration(response.data.registeredBusiness);
                    
                    const branchOptions = [
                        ...(response.data.registeredBusiness ? [`registration_${response.data.registeredBusiness.registration_id}`] : []),
                        ...response.data.outlets.map((outlet: Outlet) => `outlet_${outlet.outlet_id}`)
                    ];
                    
                    if (branchOptions.length === 1) {
                        setSelectedBranch(branchOptions[0]);
                        await fetchVouchers(branchOptions[0], '');
                    } else if (branchOptions.length > 1) {
                        // If there are multiple branches, select the first one and fetch its vouchers
                        setSelectedBranch(branchOptions[0]);
                        await fetchVouchers(branchOptions[0], '');
                    }
                } else {
                    setError(response.data.message || 'Failed to fetch profile');
                }
            } catch (err) {
                setError('An error occurred while fetching profile');
                console.error('API call error:', err);
            }
        };

        fetchProfileAndVouchers();
    }, []);


    const handleBranchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        setSelectedBranch(value);
        fetchVouchers(value, searchTerm);
    };

    const fetchVouchers = async (branchId: string, searchTerm: string = '') => {
        try {
            let response;
            const params: any = {};
            if (searchTerm.trim()) {
                params.searchTerm = searchTerm;
            }
            if (branchId.startsWith('registration_')) {
                const registrationId = branchId.split('_')[1];
                params.registration_id = registrationId;
            } else {
                const outletId = branchId.split('_')[1];
                params.outlet_id = outletId;
            }

            response = await api.get(`/api/business/vouchers`, { params });

            if (response.status === 200) {
                setVouchers(response.data.vouchers);
                console.log(response.data.vouchers);
            } else if (response.status === 404) {
                setVouchers([]);
                setError('');  // Clear error for 404 case to show no voucher message.
            }
            else {
                setVouchers([]);
                setError('An error occurred while fetching vouchers');
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);
            setError('Error fetching vouchers');
        }
    };
    const searchVouchers = async (searchTerm: string) => {
        if (!searchTerm.trim()) {
            setError('Please enter a search term');
            return;
        }
        try {
            const response = await api.get(`/api/business/vouchers/search`, {
                params: { searchTerm },
            });

            if (response.status === 200) {
                if (response.data.vouchers.length === 0) {
                    // If no vouchers are found, set a message instead of an error
                    setVouchers([]);
                    setError('No vouchers found');
                } else {
                    // If vouchers are found, clear the error message and set vouchers
                    setVouchers(response.data.vouchers);
                    setError(''); // Clear error if successful
                }
            } else if (response.status === 404) {
                setVouchers([]);
                setError('No vouchers found');
            } else {
                setError('An error occurred while fetching vouchers');
            }
        } catch (error) {
            console.error('Error fetching vouchers:', error);

            if (isAxiosError(error)) {
                if (error.response && error.response.status === 404) {
                    setVouchers([]);
                    setError('No results found');
                } else {
                    setError(error.message);
                }
            } else if (error instanceof Error) {
                setError(error.message);
            } else {
                setError('Error fetching vouchers');
            }
        }
    };

    const handleSearch = () => {
        setVouchers([]);  // Clear previous results
        setError('');     // Clear any previous errors
        fetchVouchers(selectedBranch, searchTerm);  // Send search term to the backend
    };

    const clearSearch = () => {
        setSearchTerm('');  // Clear search input
        setError('');       // Clear any previous error messages
        setVouchers([]);    // Clear current vouchers
        fetchVouchers(selectedBranch); // Reload vouchers for the selected branch
    };

    const handleEdit = (voucher: Voucher) => {
        router.push({
            pathname: '/editVoucher',
            query: {
                listing_id: voucher.listing_id,
                name: voucher.name,
                description: voucher.description,
                price: voucher.price,
                discount: voucher.discount,
                voucherImage: voucher.voucherImage,
            },
        });
    };






    const handleDelete = async (listingId: number) => {
        const confirmDelete = confirm('Are you sure you want to delete this voucher?');

        if (!confirmDelete) {
            return; // If the user cancels the delete action
        }

        try {
            // Make the API call to delete the voucher
            const response = await api.delete(`/api/business/vouchers/${listingId}`);

            if (response.status === 200) {
                // Update the vouchers state to remove the deleted voucher
                setVouchers((prevVouchers) =>
                    prevVouchers.filter((voucher) => voucher.listing_id !== listingId)
                );
                setError(''); // Clear any existing error message
            } else {
                setError(response.data.message || 'Failed to delete voucher');
            }
        } catch (err) {
            console.error('Error deleting voucher:', err);
            setError('An error occurred while deleting the voucher');
        }
    };


    //console.log('vouchers:', vouchers);
    //console.log('error:', error);
    return (
        <div>
            <h1>Search Vouchers</h1>

            {/* Single Search Box */}
            <div className="flex space-x-4 mb-10">
                <Input
                    placeholder="Search vouchers by name, description or price"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Button onClick={handleSearch}>Search</Button>
                <Button onClick={clearSearch}>Clear Search</Button>
            </div>
            <div className={`flex flex-col relative ${profile?.banStatus && "cursor-not-allowed"}`}>
            {profile?.banStatus && <div className="absolute bg-gray-400 w-full h-full font-bold opacity-90 p-10 flex flex-col justify-center items-center">
        <div>Your account has been locked by our admin due to the following reason(s):</div>
        <div>{profile.banRemarks}</div>
        <div>Please resolve the above issues to proceed further.</div>
        </div> }
            <div className='flex justify-between items-center space-y-2'>
                <h2 className='text-lg font-semibold'>Your Outlets</h2>

                {/* Existing Add Outlet Button */}
                <Button
                    className={'bg-green-500 hover:bg-green-600 text-white'}
                    onClick={() => router.push('./voucher/addVoucher')}
                >
                    + Add New Voucher
                </Button>
            </div>

            {/* Updated branch selection dropdown */}
            {(businessRegistration || outlets.length > 0) && (
                <div>
                    <Label htmlFor="branch-select">Select Branch: </Label>
                    <select 
                        id="branch-select" 
                        value={selectedBranch} 
                        onChange={handleBranchChange}
                        className="w-full p-2 border rounded"
                    >
                        {businessRegistration && (
                            <option value={`registration_${businessRegistration.registration_id}`}>
                                {businessRegistration.entityName} (Main Branch)
                            </option>
                        )}
                        {outlets.map((outlet) => (
                            <option key={`outlet_${outlet.outlet_id}`} value={`outlet_${outlet.outlet_id}`}>
                                {outlet.outlet_name} (Outlet)
                            </option>
                        ))}
                    </select>
                </div>
            )}

            <div className="flex justify-between items-center space-y-4"></div>

            {/* Display vouchers */}
            <br />
            <div className="container mx-auto">
                <h1 className="text-2xl font-bold mb-6 mt-10">Manage Vouchers</h1>

                {Array.isArray(vouchers) && vouchers.length === 0 ? (
                    <p>No vouchers available.</p>
                ) : error === 'No results found' ? (
                    <p>No results found.</p>
                ) : error && error !== 'No results found' ? (
                    <p className="text-red-500">{error}</p>
                ) : Array.isArray(vouchers) && vouchers.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {vouchers.map((voucher) => {
                            const discountedPrice = (voucher.price - (voucher.price * voucher.discount / 100)).toFixed(2);
                            return (
                                <div
                                    key={voucher.listing_id}
                                    className="border rounded-lg shadow-lg p-4 bg-white"
                                >
                                    <h3 className="text-lg font-semibold mb-2">Voucher:</h3>
                                    {voucher.voucherImage && (
                                        <img
                                            src={`http://localhost:8080/${voucher.voucherImage}`}
                                            alt={voucher.name}
                                            className="w-full h-48 object-cover mb-2 rounded"
                                        />
                                    )}
                                    <h4 className="text-md font-semibold">Voucher Name: {voucher.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">ID: {voucher.description}</p>
                                    
                                    <p className="text-gray-900 font-bold mb-2">
                                        Price: <span className="line-through">${voucher.price}</span>{' '}
                                        <span className="text-green-500">${discountedPrice}</span>
                                    </p>
                                    <p className="text-gray-500 mb-4">Discount: {voucher.discount}%</p>
                                    
                                    {voucher.rewardItem && voucher.rewardItem.status === "approved" && (
                                        <div className="mt-4">
                                            <h3 className="text-lg font-semibold mb-2">Reward Item:</h3>
                                            <img
                                                src={voucher.rewardItem.filepath}
                                                alt={voucher.rewardItem.name}
                                                className="w-32 h-32 object-cover mb-2 rounded"
                                            />
                                            <h4 className="text-md font-semibold">{voucher.rewardItem.name}</h4>
                                            <p className="text-sm text-gray-600 mb-2">ID: {voucher.rewardItem.id}</p>
                                        </div>
                                    )}
                                    
                                    <div className="flex justify-between mt-4">
                                        <Button
                                            onClick={() => handleEdit(voucher)}
                                            variant="default"
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            onClick={() => handleViewTransactions(voucher)}
                                            variant="default"
                                        >
                                            View Transactions
                                        </Button>
                                        <Button
                                            onClick={() => handleDelete(voucher.listing_id)}
                                            variant="destructive"
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <p>No vouchers found.</p>
                )}
            </div>
            </div>
        </div>
    );
};

export default withAuth(VoucherList);