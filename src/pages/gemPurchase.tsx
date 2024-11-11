import { useRouter } from "next/router";
import Cookies from "js-cookie";
import api from "@/api";
import { useEffect } from "react";
import withAuth from "./withAuth";
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

import { useState } from "react";
import { Button } from "@/components/components/button";

export const priceDetails = [
  {
    productName: "bundle50Gems",
    price: "$5",
    gems: 50,
    bonusGems: "No Bonus",
    totalGems: 50,
  },
  {
    productName: "bundle100Gems",
    price: "$10",
    gems: 100,
    bonusGems: "1 (1% extra)",
    totalGems: 101,
  },
  {
    productName: "bundle250Gems",
    price: "$25",
    gems: 250,
    bonusGems: "10 (4% extra)",
    totalGems: 260,
  },
  {
    productName: "bundle500Gems",
    price: "$50",
    gems: 500,
    bonusGems: "45 (9% extra)",
    totalGems: 545,
  },
  {
    productName: "bundle1000Gems",
    price: "$100",
    gems: 1000,
    bonusGems: "150 (15% extra)",
    totalGems: 1150,
  },
];

const SelectGemBundlePage = () => {
  const token = Cookies.get("authToken");

  const [amountOfGems, setAmountOfGems] = useState<string>();
  const [isRecurring, setIsRecurring] = useState<boolean>(false);
  // Use the token to make API requests or identify business_id
  const fetchBusinessData = async () => {
    try {
      const response = await api.get("/api/business/account", {
        headers: {
          Authorization: `Bearer ${token}`, // Attach token to identify business
        },
      });
      if (response.status === 200) {
        const businessId = response.data.business_id;
        // Use businessId in subsequent calls
      } else {
        console.error("Failed to fetch business account");
      }
    } catch (error) {
      console.error("Error fetching business account:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBusinessData();
    }
  }, [token]);

  const router = useRouter();

  const handleSelectGemAmount = (amountCode: string) => {
    setAmountOfGems(amountCode);
  };

  const handlePayment = () => {
    if (amountOfGems) {
      router.push({
        pathname: "/payment",
        query: {
          productName: priceDetails[amountOfGems].productName,
          gems: priceDetails[amountOfGems].totalGems,
          price: Number(priceDetails[amountOfGems].price.substring(1)),
          recurring: isRecurring,
        },
      });
    }
  };

  return (
    <div>
      <div className="flex flex-col gap-4">
        <div>
          <p>You are required to purchase gems before buying subscriptions.</p>
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
            <div className="flex flex-row items-center gap-4">
              <input
                type="checkbox"
                id="recurring"
                checked={isRecurring}
                onChange={(e) => setIsRecurring(e.target.checked)}
              />
              <label htmlFor="recurring">Make this a monthly recurring purchase</label>
            </div>
            <Button disabled={!amountOfGems} onClick={handlePayment}>
              Proceed to Payment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withAuth(SelectGemBundlePage);
