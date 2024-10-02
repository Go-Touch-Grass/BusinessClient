import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useRouter } from 'next/router';
import api from '@/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentPage: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [gems, setGems] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);

  // Get bundle info from query parameters
  useEffect(() => {
    if (router.query.gems && router.query.price) {
      setGems(parseInt(router.query.gems as string, 10));
      setPrice(parseInt(router.query.price as string, 10));
    }
  }, [router.query]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentProcessing(true);

    if (!gems || !price) {
      setErrorMessage('Invalid gem bundle');
      setPaymentProcessing(false);
      return;
    }

    // Call your backend API to create a PaymentIntent and get the clientSecret
    const { clientSecret } = await api
      .post('/api/payment/create-payment-intent', {
        amount: price, // in cents
        currency: 'sgd',
      })
      .then(response => response.data)
      .catch(error => {
        setErrorMessage('Error creating payment intent');
        setPaymentProcessing(false);
        return { clientSecret: null };
      });

    if (!clientSecret) return;

    const cardElement = elements?.getElement(CardElement);
    if (!cardElement) {
      setErrorMessage('Card information not found.');
      return;
    }

    // Confirm the payment using the clientSecret
    const { error, paymentIntent } = await stripe?.confirmCardPayment(clientSecret, {
      payment_method: {
        card: cardElement,
      },
    }) || {};

    if (error) {
      setErrorMessage(error.message || 'Payment failed');
    } else if (paymentIntent?.status === 'succeeded') {
      setSuccessMessage('Payment succeeded!');
      
      // Call your backend API to update the gem balance after successful payment
      await api.post('/api/business/top_up_gems', {
        currency_cents: price,  // Amount paid in cents
        gems_added: gems,  // Add gems to the business account
      });
    }

    setPaymentProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Pay for {gems} gems (${price && price / 100})</h2>
      <CardElement />
      <button type="submit" disabled={!stripe || paymentProcessing}>
        {paymentProcessing ? 'Processing...' : `Pay $${price && price / 100}`}
      </button>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </form>
  );
};

const PaymentWrapper: React.FC = () => (
  <Elements stripe={stripePromise}>
    <PaymentPage />
  </Elements>
);

export default PaymentWrapper;
