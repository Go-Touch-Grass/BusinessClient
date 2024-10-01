import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import api from '@/api';

// Load Stripe with your publishable key
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const PaymentPage: React.FC = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setPaymentProcessing(true);

    // Call your backend API to create a PaymentIntent and get the clientSecret
    const { clientSecret } = await api
      .post('/api/payment/create-payment-intent', {
        amount: 1000, // in cents (i.e. $10.00)
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
    }

    setPaymentProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe || paymentProcessing}>
        {paymentProcessing ? 'Processing...' : 'Pay $10'}
      </button>
      {errorMessage && <div style={{ color: 'red' }}>{errorMessage}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}
    </form>
  );
};

// Wrap your component with Stripe's Elements
const PaymentWrapper: React.FC = () => (
  <Elements stripe={stripePromise}>
    <PaymentPage />
  </Elements>
);

export default PaymentWrapper;
