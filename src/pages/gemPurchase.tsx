import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/components/ui/input";
import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import axios from "axios";
import api from "@/api";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

type PaymentModel = {
  amount: number;
  cardNo: string;
  CVV: string;
  expiryDate: string;
};

const priceDetails = [
  {
    price: "$5",
    gems: "50",
    bonusGems: "No Bonus",
    totalGems: "50",
  },
  {
    price: "$10",
    gems: "100",
    bonusGems: "1 (1% extra)",
    totalGems: "101",
  },
  {
    price: "$25",
    gems: "250",
    bonusGems: "10 (4% extra)",
    totalGems: "260",
  },
  {
    price: "$50",
    gems: "500",
    bonusGems: "45 (9% extra)",
    totalGems: "545",
  },
  {
    price: "$100",
    gems: "1000",
    bonusGems: "150 (15% extra)",
    totalGems: "1150",
  },
];

const GemPurchase: React.FC = () => {
  const initialPaymentDetails = {
    amount: 0,
    cardNo: "0000 0000 0000 000",
    CVV: "000",
    expiryDate: "00/00",
  };
  const [paymentDetails, setPaymentDetails] = useState<PaymentModel>(
    initialPaymentDetails
  );
  const [amountOfGems, setAmountOfGems] = useState<string>();

  const onChangeDetails =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setPaymentDetails(() => ({
        ...paymentDetails,
        [field]: e.target.value,
      }));
    };

  const handleOnPayment = async () => {
    try {
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectGemAmount = (amountCode: string) => {
    setAmountOfGems(amountCode);
  };
  return (
    <div className="flex flex-col gap-4">
      <div>
        <p>You are required to purchase gems before buying a subscription.</p>
        <p>Please refer to the table below for the respective prices.</p>
        <Table>
          <TableCaption>Prices for Gems Purchase</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Price (SGD)</TableHead>
              <TableHead>Gems</TableHead>
              <TableHead>Bonus Gems</TableHead>
              <TableHead className="text-right">Total Gems</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {priceDetails.map((invoice) => (
              <TableRow key={invoice.price}>
                <TableCell className="font-medium">{invoice.price}</TableCell>
                <TableCell>{invoice.gems}</TableCell>
                <TableCell>{invoice.bonusGems}</TableCell>
                <TableCell className="text-right">
                  {invoice.totalGems}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <hr />
      <div className="flex flex-row justify-between py-6 gap-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-row items-center gap-6">
            <b>Amount of gems to purchase:</b>
            <Select onValueChange={handleSelectGemAmount}>
              <SelectTrigger className="w-fit">
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="0">50</SelectItem>
                  <SelectItem value="1">100</SelectItem>
                  <SelectItem value="2">250</SelectItem>
                  <SelectItem value="3">500</SelectItem>
                  <SelectItem value="4">1000</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          {amountOfGems && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-row justify-between">
                <b>Bonus Gems Given:</b>
                <p>{priceDetails[amountOfGems].bonusGems}</p>
              </div>
              <div className="flex flex-row justify-between">
                <b>Total Gems:</b>
                <p>{priceDetails[amountOfGems].totalGems}</p>
              </div>
              <div className="flex flex-row justify-between">
                <b>Amount Payable:</b>
                <p>{priceDetails[amountOfGems].price}</p>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-col border-2 p-10 w-1/2">
          <b className="text-2xl pb-4">Add Payment Details</b>
          <Elements stripe={stripePromise}>
            <div>here</div>
            <CardElement />
          </Elements>
          {/* <button type="submit" disabled={!stripe || paymentProcessing}>
            {paymentProcessing
              ? "Processing..."
              : `Pay $${price && price / 100}`}
          </button> */}
          <div className="flex flex-col gap-4">
            <div>
              <b>Card Number </b>
              <Input
                className="bg-white"
                placeholder={initialPaymentDetails.cardNo}
                value={paymentDetails.cardNo}
                onChange={onChangeDetails("cardNo")}
              ></Input>
            </div>
            <div className="flex flex-row justify-between">
              <div>
                <b>CVV </b>
                <Input
                  className="bg-white"
                  placeholder={initialPaymentDetails.CVV}
                  value={paymentDetails.CVV}
                  onChange={onChangeDetails("CVV")}
                ></Input>
              </div>
              <div>
                <b>Expiry Date</b>
                <Input
                  className="bg-white"
                  placeholder={initialPaymentDetails.expiryDate}
                  value={paymentDetails.expiryDate}
                  onChange={onChangeDetails("expiryDate")}
                ></Input>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GemPurchase;

// import { useRouter } from 'next/router';
// import Cookies from 'js-cookie';
// import api from '@/api';
// import { useEffect } from 'react';
// import withAuth from './withAuth';

// const SelectGemBundlePage = () => {
//     const token = Cookies.get('authToken');

//     // Use the token to make API requests or identify business_id
//     const fetchBusinessData = async () => {
//         try {
//             const response = await api.get('/api/business/account', {
//                 headers: {
//                     Authorization: `Bearer ${token}` // Attach token to identify business
//                 }
//             });
//             if (response.status === 200) {
//                 const businessId = response.data.business_id;
//                 // Use businessId in subsequent calls
//             } else {
//                 console.error('Failed to fetch business account');
//             }
//         } catch (error) {
//             console.error('Error fetching business account:', error);
//         }
//     };

//     useEffect(() => {
//         if (token) {
//             fetchBusinessData();
//         }
//     }, [token]);

//     const router = useRouter();

//   const bundles = [
//     { id: 1, gems: 100, price: 1000 }, // $10.00 for 100 gems
//     { id: 2, gems: 500, price: 4500 }, // $45.00 for 500 gems
//     { id: 3, gems: 1000, price: 8500 }, // $85.00 for 1000 gems
//   ];

//   const handleSelectBundle = (bundleId: number) => {
//     const selectedBundle = bundles.find(bundle => bundle.id === bundleId);
//     if (selectedBundle) {
//       // Redirect to payment page with the bundle information
//       router.push({
//         pathname: '/payment',
//         query: {
//           gems: selectedBundle.gems,
//           price: selectedBundle.price,
//         },
//       });
//     }
//   };

//   return (
//     <div>
//       <h1>Select a Gem Bundle</h1>
//       {bundles.map(bundle => (
//         <div key={bundle.id}>
//           <p>{bundle.gems} gems - ${bundle.price / 100}</p>
//           <button onClick={() => handleSelectBundle(bundle.id)}>Buy Now</button>
//         </div>
//       ))}
//     </div>
//   );
// };

// export default withAuth(SelectGemBundlePage);
