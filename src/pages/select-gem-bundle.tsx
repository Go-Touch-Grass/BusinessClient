import { useRouter } from 'next/router';
import Cookies from 'js-cookie';
import api from '@/api';
import { useEffect } from 'react';
import withAuth from './withAuth';

const SelectGemBundlePage = () => {
    const token = Cookies.get('authToken');

    // Use the token to make API requests or identify business_id
    const fetchBusinessData = async () => {
        try {
            const response = await api.get('/api/business/account', {
                headers: {
                    Authorization: `Bearer ${token}` // Attach token to identify business
                }
            });
            if (response.status === 200) {
                const businessId = response.data.business_id;
                // Use businessId in subsequent calls
            } else {
                console.error('Failed to fetch business account');
            }
        } catch (error) {
            console.error('Error fetching business account:', error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchBusinessData();
        }
    }, [token]);

    const router = useRouter();

  const bundles = [
    { id: 1, gems: 100, price: 1000 }, // $10.00 for 100 gems
    { id: 2, gems: 500, price: 4500 }, // $45.00 for 500 gems
    { id: 3, gems: 1000, price: 8500 }, // $85.00 for 1000 gems
  ];

  const handleSelectBundle = (bundleId: number) => {
    const selectedBundle = bundles.find(bundle => bundle.id === bundleId);
    if (selectedBundle) {
      // Redirect to payment page with the bundle information
      router.push({
        pathname: '/payment',
        query: {
          gems: selectedBundle.gems,
          price: selectedBundle.price,
        },
      });
    }
  };

  return (
    <div>
      <h1>Select a Gem Bundle</h1>
      {bundles.map(bundle => (
        <div key={bundle.id}>
          <p>{bundle.gems} gems - ${bundle.price / 100}</p>
          <button onClick={() => handleSelectBundle(bundle.id)}>Buy Now</button>
        </div>
      ))}
    </div>
  );
};

export default withAuth(SelectGemBundlePage);

