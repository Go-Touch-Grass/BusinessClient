import React, { useEffect, useState } from 'react';
import api from '@/api';
import { Button } from '../../components/components/ui/button';
import { Label } from '../../components/components/ui/label';

interface Voucher {
  listing_id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  voucherImage: string;
  groupPurchaseEnabled: boolean;
  groupSize: number;
  groupDiscount: number;
  rewardItem: {
    id: number;
    name: string;
    filepath: string;
    status: string;
  };
}

const MostPopularVoucher = () => {
  const [voucher, setVoucher] = useState<Voucher | null>(null);

  useEffect(() => {
    const fetchMostPopularVoucher = async () => {
      try {
        const response = await api.get('/api/business-analytics/most-popular-voucher');
        if (response.status === 200) {
          setVoucher(response.data.mostPopularVoucher); // Assuming response has the voucher data
        }
      } catch (err) {
        console.error('Error fetching popular voucher:', err);
      }
    };

    fetchMostPopularVoucher();
  }, []);

  if (!voucher) {
    return <div>Loading...</div>;
  }

  const discountedPrice = (voucher.price - (voucher.price * voucher.discount / 100)).toFixed(2);

  return (
    <div className="border rounded-lg shadow-lg p-4 bg-white">
      <h3 className="text-lg font-semibold mb-2">{voucher.name}</h3>
      {voucher.voucherImage && (
        <div className="h-96 w-full relative mb-2">
          <img
            src={`http://localhost:8080/${voucher.voucherImage}`}
            alt={voucher.name}
            className="w-full h-full object-contain rounded"
          />
        </div>
      )}
      <p className="text-sm text-gray-600 mb-2">{voucher.description}</p>
      <p className="text-gray-900 font-bold mb-2">
        Price: <span className="line-through">${voucher.price}</span>{' '}
        <span className="text-green-500">${discountedPrice}</span>
      </p>
      <p className="text-gray-500 mb-4">Discount: {voucher.discount}%</p>
      <p className="text-gray-500 mb-4 text-sm">
        Group Purchase: {voucher.groupPurchaseEnabled ? 'Enabled' : 'Disabled'}
      </p>
      {voucher.rewardItem && voucher.rewardItem.status === "approved" && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Reward Item:</h3>
          <img
            src={voucher.rewardItem.filepath}
            alt={voucher.rewardItem.name}
            className="w-32 h-32 object-contain mb-2 rounded"
          />
          <h4 className="text-md font-semibold">{voucher.rewardItem.name}</h4>
          <p className="text-sm text-gray-600 mb-2">ID: {voucher.rewardItem.id}</p>
        </div>
      )}
    </div>
  );
};

export default MostPopularVoucher;
