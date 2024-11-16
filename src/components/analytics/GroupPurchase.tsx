import React, { useEffect, useState } from 'react';
import api from '@/api';

interface VoucherWithGroupPurchaseAnalytics {
  voucherId: number;
  voucherName: string;
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
  } | null;
  totalStarted: number;
  totalCompleted: number;
  completionPercentage: string;
}

const GroupPurchase = () => {
  const [vouchers, setVouchers] = useState<VoucherWithGroupPurchaseAnalytics[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch group purchase analytics from the backend
  useEffect(() => {
    const fetchGroupPurchaseAnalytics = async () => {
      try {
        const response = await api.get('/api/business-analytics/group-purchase-analytics');
        if (response.status === 200) {
          setVouchers(response.data);
        }
      } catch (err) {
        console.error('Error fetching group purchase analytics:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGroupPurchaseAnalytics();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (vouchers.length === 0) {
    return <div>No vouchers available for group purchases</div>;
  }

  return (
    <div className="space-y-6">
      {vouchers.map((voucher) => {
        const discountedPrice = (voucher.price - (voucher.price * voucher.discount / 100)).toFixed(2);
        return (
          <div key={voucher.voucherId} className="border rounded-lg shadow-lg p-4 bg-white">
            <h3 className="text-lg font-semibold mb-2">{voucher.voucherName}</h3>
            {voucher.voucherImage && (
              <div className="h-96 w-full relative mb-2">
                <img
                  src={`http://localhost:8080/${voucher.voucherImage}`}
                  alt={voucher.voucherName}
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
            <p className="text-gray-500 mb-4">Group Size: {voucher.groupSize}</p>
            <p className="text-gray-500 mb-4">Group Discount: {voucher.groupDiscount}%</p>
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
              <p className="text-gray-500">Group Purchases Started: {voucher.totalStarted}</p>
              <p className="text-gray-500">Group Purchases Completed: {voucher.totalCompleted}</p>
              <p className="text-gray-900 font-bold">
                Completion Rate: <span className="text-green-700">{voucher.completionPercentage}%</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default GroupPurchase;