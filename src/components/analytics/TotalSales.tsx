import React, { useEffect, useState } from 'react';
import api from '@/api';
import { Button } from '../../components/components/ui/button';
import { Label } from '../../components/components/ui/label';

interface VoucherTotalSales {
  listing_id: number;
  name: string;
  description: string;
  price: number;
  discount: number;
  voucherImage: string;
  created_at: Date;
  updated_at: Date;
  duration: number;
  expirationDate: Date;
  discountedPrice: number;
  groupPurchaseEnabled: boolean;
  groupSize: number;
  groupDiscount: number;
  rewardItem: {
    id: number;
    name: string;
    filepath: string;
    status: string;
  } | null;
  totalSales: number;
}

const TotalSales = () => {
  const [vouchers, setVouchers] = useState<VoucherTotalSales[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVoucherTotalSales = async () => {
      try {
        const response = await api.get('/api/business-analytics/total-sales');
        if (response.status === 200) {
          setVouchers(response.data.vouchers);
        }
      } catch (err) {
        console.error('Error fetching total sales:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoucherTotalSales();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (vouchers.length === 0) {
    return <div>No vouchers available</div>;
  }

  return (
    <div className="space-y-6">
      {vouchers.map((voucher) => {
        const discountedPrice = (voucher.price - (voucher.price * voucher.discount / 100)).toFixed(2);
        return (
          <div key={voucher.listing_id} className="border rounded-lg shadow-lg p-4 bg-white">
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
            <p className="text-gray-500 mb-4">
              Group Purchase: {voucher.groupPurchaseEnabled ? 'Enabled' : 'Disabled'}
            </p>
            {voucher.rewardItem && voucher.rewardItem.status === 'approved' && (
              <div className="mt-4">
                <h4 className="text-lg font-semibold mb-2">Reward Item:</h4>
                <img
                  src={voucher.rewardItem.filepath}
                  alt={voucher.rewardItem.name}
                  className="w-32 h-32 object-contain mb-2 rounded"
                />
                <p className="text-sm text-gray-600">{voucher.rewardItem.name}</p>
              </div>
            )}
            <div className="mt-4">
              <p className="text-gray-900 font-bold">
                Total Sales: <span className="text-green-700">{voucher.totalSales}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TotalSales;
