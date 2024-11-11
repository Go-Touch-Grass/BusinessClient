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
  const [id, setId] = useState<string | null>(null);
  const [gems, setGems] = useState<number | null>(null);
  const [price, setPrice] = useState<number | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  const [savedPaymentMethodId, setSavedPaymentMethodId] = useState<any | null>(null);
  const [savedPaymentMethod, setSavedPaymentMethod] = useState<any | null>(null);

  useEffect(() => {
    if (router.query.gems && router.query.price) {
      setId(router.query.id as string);
      setGems(parseInt(router.query.gems as string, 10));
      setPrice(parseInt(router.query.price as string, 10));
      setIsRecurring(router.query.recurring === "true");
    }
  }, [router.query]);

  // Fetch saved payment method if exists
  useEffect(() => {
    const fetchSavedPaymentMethod = async () => {
      try {
        const response = await api.get('/api/payment/get-payment-method-id');
        if (response.data.paymentMethodId) {
          setSavedPaymentMethodId(response.data.paymentMethodId);
          const paymentMethodResponse = await api.get('/api/payment/get-payment-method');
          setSavedPaymentMethod(paymentMethodResponse.data);
        }
      } catch (error) {
        console.error("Error fetching saved payment method:", error);
      }
    };

    fetchSavedPaymentMethod();
  }, [router.query.businessId]);

  const payUsingSavedMethod = async (clientSecret: string, paymentIntentId: string) => {
    try {
      const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
        payment_method: savedPaymentMethodId,
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        return false;
      }

      if (paymentIntent?.status === "succeeded") {
        await api.post("/api/business/verify_topup", {
          paymentIntentId,
          gemsAdded: gems,
        });
        setSuccessMessage("Payment and top-up succeeded!");
        return true;
      }
    } catch (error) {
      setErrorMessage("Error processing payment using saved method.");
    }
    return false;
  };

  const payUsingCardEntry = async (clientSecret: string, paymentIntentId: string) => {
    try {
      const cardElement = elements?.getElement(CardElement);
      if (!cardElement) {
        setErrorMessage("Card information not found.");
        return false;
      }

      const { email, username } = await api
        .get("/api/payment/get-user-email-and-username")
        .then((response) => response.data);

      const { error, paymentIntent } = await stripe!.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            email: email, // Fetch user email from API
            name: username, // Fetch user name from API
          },
        },
      });

      if (error) {
        setErrorMessage(error.message || "Payment failed");
        return false;
      }

      if (paymentIntent?.status === "succeeded") {
        await api.post("/api/payment/save-payment-method-id", {
          paymentMethodId: paymentIntent.payment_method,
        });

        await api.post("/api/business/verify_topup", {
          paymentIntentId,
          gemsAdded: gems,
        });
        setSuccessMessage("Payment and top-up succeeded!");
        return true;
      }
    } catch (error) {
      setErrorMessage("Error processing payment using card entry.");
    }
    return false;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    setPaymentProcessing(true);

    if (!gems || !price) {
      setErrorMessage("Invalid gem bundle");
      setPaymentProcessing(false);
      return;
    }

    try {
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

      const paymentSuccessful = savedPaymentMethodId
        ? await payUsingSavedMethod(clientSecret, paymentIntentId)
        : await payUsingCardEntry(clientSecret, paymentIntentId);

      if (!paymentSuccessful) {
        setPaymentProcessing(false);
      }
    } catch (error) {
      setErrorMessage("An error occurred during payment processing.");
      setPaymentProcessing(false);
    }
  };

  const handleDeleteSavedMethod = async () => {
    try {
      await api.delete("/api/payment/delete-payment-method-id");
      setSavedPaymentMethodId(null);
      setSavedPaymentMethod(null);
    } catch (error) {
      setErrorMessage("Error deleting saved payment method.");
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

        {savedPaymentMethod ? (
          <div>
            <b>Saved Payment Method</b>
            <p>{savedPaymentMethod.card.brand} **** {savedPaymentMethod.card.last4}</p>
            <Button onClick={handleSubmit} disabled={paymentProcessing}>
              {paymentProcessing ? "Processing..." : "Pay with Saved Method"}
            </Button>
            <Button variant="destructive" onClick={handleDeleteSavedMethod}>
              Delete Saved Method
            </Button>
          </div>
        ) : (
          <div>
            <b>Card Details </b>
            <CardElement />
            <Button disabled={!stripe || paymentProcessing} onClick={handleSubmit}>
              {paymentProcessing
                ? "Processing..."
                : isRecurring
                  ? "Subscribe For Monthly Payments"
                  : "Pay Now"}
            </Button>

          </div>
        )}
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
