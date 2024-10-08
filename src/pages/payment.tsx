import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { useRouter } from "next/router";
import withAuth from "./withAuth";
import api from "@/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/components/button";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

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
    setPaymentProcessing(true);

    if (!gems || !price) {
      setErrorMessage("Invalid gem bundle");
      setPaymentProcessing(false);
      return;
    }

    try {
      // Call your backend API to create a PaymentIntent and get the clientSecret
      const { clientSecret, paymentIntentId } = await api
        .post("/api/payment/create-payment-intent", {
          amount: price * 100, // in cents
          currency: "sgd",
        })
        .then((response) => response.data);

      if (!clientSecret || !paymentIntentId) {
        setErrorMessage("Error creating payment intent");
        setPaymentProcessing(false);
        return;
      }

      const cardElement = elements?.getElement(CardElement);
      if (!cardElement) {
        setErrorMessage("Card information not found.");
        setPaymentProcessing(false);
        return;
      }

      // Confirm the payment using the clientSecret
      const { error, paymentIntent } =
        (await stripe?.confirmCardPayment(clientSecret, {
          payment_method: {
            card: cardElement,
          },
        })) || {};

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        setPaymentProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Call backend to verify the top-up based on paymentIntentId
        const verificationResponse = await api
          .post("/api/business/verify_topup", {
            paymentIntentId,
            gemsAdded: gems,
          })
          .then((response) => response.data);

        if (verificationResponse.success) {
          setSuccessMessage("Payment and top-up succeeded!");
        } else {
          setErrorMessage("Top-up verification failed.");
        }
      } else {
        setErrorMessage("Payment did not succeed.");
      }
    } catch (error) {
      setErrorMessage("An error occurred during payment processing.");
    } finally {
      setPaymentProcessing(false);
    }
  };

  return (
    <div className="flex flex-col border-2 gap-4 p-10 w-full">
      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Heads up!</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}
      {successMessage && (
        <Alert variant="default">
          <AlertTitle>Success!</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}
      <b className="text-2xl pb-4">Add Payment Details</b>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col">
          <p>Total Payable Amount: ${price}</p>
          <p>You will be credited: {gems} gems</p>
        </div>
        <b>Card Details </b>
        <CardElement />
        <Button disabled={!stripe || paymentProcessing} onClick={handleSubmit}>
          {paymentProcessing ? "Processing..." : `Pay Now`}
        </Button>
      </div>
    </div>
  );
};

const PaymentWrapper: React.FC = () => (
  <Elements stripe={stripePromise}>
    <PaymentPage />
  </Elements>
);

export default withAuth(PaymentWrapper);
