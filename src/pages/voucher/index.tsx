import React, { useEffect, useState } from 'react';
import api from '@/api';

interface voucher {
    listing_id: number;
    name: string;
    description: string;
    price: number;
    discount: number;
    voucherImage: string;
}

const VoucherList = ({ business_id, outlet_id }) => {
    const [vouchers, setVouchers] = useState<voucher[]>([]);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const response = await api.get('/api/business/get_all_voucher', {
                    params: {
                        business_id,
                        outlet_id,
                    },
                });
                if (response.status === 200) {
                    setVouchers(response.data.vouchers);
                    setErrorMessage('');
                } else {
                    setErrorMessage('No vouchers found');
                }
            } catch (error) {
                console.error('Error fetching vouchers:', error);
                setErrorMessage('Error fetching vouchers');
            }
        };

        fetchVouchers();
    }, [business_id, outlet_id]);

    return (
        <div>
            <h2>Vouchers</h2>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <ul>
                {vouchers.length > 0 ? (
                    vouchers.map((voucher) => (
                        <li key={voucher.listing_id}>
                            <h3>{voucher.name}</h3>
                            <p>{voucher.description}</p>
                            <p>Price: {voucher.price}</p>
                            <p>Discount: {voucher.discount}%</p>
                        </li>
                    ))
                ) : (
                    <p>No vouchers available.</p>
                )}
            </ul>
        </div>
    );
};

export default VoucherList;
