import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import api from '@/api';

const Cashout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);
  const [balance, setBalance] = useState(0);
  const [cashoutAmount, setCashoutAmount] = useState('');

  // Fetch business details and check if they have a Stripe account
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await api.get('/api/payment/business-stripe-status');
        const { stripeAccountId, gemBalance } = response.data;
        setHasStripeAccount(!!stripeAccountId);
        setBalance(gemBalance);
      } catch (error) {
        console.error('Error fetching business data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  // Handle redirect to Stripe onboarding
  const handleOnboardingRedirect = async () => {
    try {
      const response = await api.post('/api/payment/create-business-onboarding-link', {});
      const { onboardingUrl } = response.data;
      router.push(onboardingUrl);
    } catch (error) {
      console.error('Error creating onboarding link:', error);
    }
  };

  // Handle cashout request
  const handleCashout = async () => {
    if (!cashoutAmount || parseFloat(cashoutAmount) <= 0) return alert('Invalid amount');
    try {
      const response = await api.post('/api/payment/cashout', {
        amount: cashoutAmount
      });
      alert(`Cashout of $${cashoutAmount} successful!`);
      setBalance((prev) => prev - parseFloat(cashoutAmount));
      setCashoutAmount('');
    } catch (error) {
      console.error('Cashout failed:', error);
      alert('Cashout failed, please try again later.');
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Cashout Gems for Cash</h2>
      {!hasStripeAccount ? (
        <div>
          <p>You need to complete your Stripe onboarding to cash out.</p>
          <button onClick={handleOnboardingRedirect}>Complete Stripe Onboarding</button>
        </div>
      ) : (
        <div>
          <p>Your current gem balance: {balance}</p>
          <input
            type="number"
            value={cashoutAmount}
            onChange={(e) => setCashoutAmount(e.target.value)}
            placeholder="Enter amount to cash out"
          />
          <button onClick={handleCashout}>Cash Out</button>
        </div>
      )}
    </div>
  );
};

export default Cashout;
