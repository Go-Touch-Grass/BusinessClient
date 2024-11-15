import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import api from "@/api";
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
import { Button } from "@/components/components/button";

const cashoutOptions = [
  {
    cash: "$5",
    gems: 50,
  },
  {
    cash: "$10",
    gems: 100,
  },
  {
    cash: "$25",
    gems: 250,
  },
  {
    cash: "$50",
    gems: 500,
  },
  {
    cash: "$100",
    gems: 1000,
  },
];

const Cashout = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasStripeAccount, setHasStripeAccount] = useState(false);
  const [balance, setBalance] = useState(0);
  const [selectedCashoutOption, setSelectedCashoutOption] = useState<string>();
  const [selectedGems, setSelectedGems] = useState<number>(0);

  // Fetch business details and check if they have a Stripe account
  useEffect(() => {
    const fetchBusinessData = async () => {
      try {
        const response = await api.get("/api/payment/business-stripe-status");
        const { stripeAccountId, gemBalance } = response.data;
        setHasStripeAccount(!!stripeAccountId);
        setBalance(gemBalance);
      } catch (error) {
        console.error("Error fetching business data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBusinessData();
  }, []);

  // Handle redirect to Stripe onboarding
  const handleOnboardingRedirect = async () => {
    try {
      const response = await api.post("/api/payment/create-business-onboarding-link", {});
      const { onboardingUrl } = response.data;
      router.push(onboardingUrl);
    } catch (error) {
      console.error("Error creating onboarding link:", error);
    }
  };

  // Handle cashout request
  const handleCashout = async () => {
    if (!selectedCashoutOption) return alert("Please select a cashout option");
    if (balance < selectedGems) {
      return alert("Insufficient gem balance");
    }

    try {
      const currencyAmount = Number(cashoutOptions[selectedCashoutOption].cash.substring(1));
      const gemAmount = cashoutOptions[selectedCashoutOption].gems;
      await api.post("/api/payment/cashout", {
        currency_amount: currencyAmount,
        gem_amount: gemAmount,
      });
      alert(`Successfully cashed out $${currencyAmount}`);
      setBalance((prev) => prev - selectedGems);
      setSelectedCashoutOption("");
    } catch (error) {
      console.error("Cashout failed:", error);
      alert("Cashout failed, please try again later.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Cashout Gems for Cash</h2>
      {!hasStripeAccount ? (
        <div>
          <p>You need to complete your Stripe onboarding to cash out.</p>
          <Button onClick={handleOnboardingRedirect}>Complete Stripe Onboarding</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div>
            <p>Your current gem balance: {balance}</p>
          </div>
          <div>
            <Table>
              <TableCaption>Options for Cashout</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Cash Amount (SGD)</TableHead>
                  <TableHead>Gems Required</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cashoutOptions.map((option) => (
                  <TableRow key={option.cash}>
                    <TableCell className="font-medium">{option.cash}</TableCell>
                    <TableCell>{option.gems}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <hr />
          <div className="flex flex-row justify-between py-6 gap-10">
            <div className="flex flex-col gap-6">
              <div className="flex flex-row items-center gap-6">
                <b>Select Cashout Amount:</b>
                <Select onValueChange={(value) => {
                  setSelectedCashoutOption(value);
                  setSelectedGems(cashoutOptions[Number(value)].gems);
                }}>
                  <SelectTrigger className="w-fit">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {cashoutOptions.map((option, index) => (
                        <SelectItem key={index} value={index.toString()}>
                          {option.cash}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
              {selectedCashoutOption && (
                <div className="flex flex-col gap-6">
                  <div className="flex flex-row justify-between">
                    <b>Gems Required:</b>
                    <p>{selectedGems}</p>
                  </div>
                  <div className="flex flex-row justify-between">
                    <b>Amount Payable:</b>
                    <p>{cashoutOptions[selectedCashoutOption].cash}</p>
                  </div>
                </div>
              )}
              <Button
                disabled={!selectedCashoutOption || balance < selectedGems}
                onClick={handleCashout}
              >
                Cash Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cashout;
