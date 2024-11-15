import { useState } from "react";

// Sample Analytics Components
import MostPopularVoucher from "@/components/analytics/MostPopularVoucher";
import RedemptionRate from "@/components/analytics/RedemptionRate";
import TotalSales from "@/components/analytics/TotalSales";
import GemUtilization from "@/components/analytics/GemUtilization";
import Transactions from "@/components/analytics/Transactions";
import Engagement from "@/components/analytics/Engagement";
import GroupPurchase from "@/components/analytics/GroupPurchase";

import { Button } from "@/components/components/button";

const Analytics = () => {
  const [selectedTab, setSelectedTab] = useState("mostPopularVoucher");

  // Function to render content based on the selected tab
  const renderContent = () => {
    switch (selectedTab) {
      case "mostPopularVoucher":
        return <MostPopularVoucher />;
      case "redemptionRate":
        return <RedemptionRate />;
      case "totalSales":
        return <TotalSales />;
      case "gemUtilization":
        return <GemUtilization />;
      case "transactions":
        return <Transactions />;
      case "engagement":
        return <Engagement />;
      case "groupPurchase":
        return <GroupPurchase />;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Analytics Header (Above the whole layout) */}
      <h1 className="text-4xl font-bold text-zinc-700 text-center mb-6">
        Analytics
      </h1>
  
      <div className="flex">
        {/* Sidebar Navigation */}
        <nav className="w-full md:w-1/4 bg-gray-100 h-screen p-6 shadow-lg">
          <ul className="space-y-4">
            {[
              { id: "mostPopularVoucher", label: "Most Popular Voucher" },
              { id: "redemptionRate", label: "Voucher Redemption Rate" },
              { id: "totalSales", label: "Total Sales" },
              { id: "gemUtilization", label: "Gem Utilization" },
              { id: "transactions", label: "Transaction Summary" },
              { id: "engagement", label: "Engagement with Avatar" },
              { id: "groupPurchase", label: "Group Purchase Analytics" },
            ].map((tab) => (
              <li key={tab.id}>
                <Button
                  onClick={() => setSelectedTab(tab.id)}
                  variant={selectedTab === tab.id ? "default" : "outline"}
                  size="default"
                  className="w-full text-left p-3 rounded-lg"
                >
                  {tab.label}
                </Button>
              </li>
            ))}
          </ul>
        </nav>
  
        {/* Content Area */}
        <div className="w-full md:w-3/4 p-8 bg-gray-50 min-h-screen">
          {renderContent()}
        </div>
      </div>
    </div>
  );  
};

export default Analytics;
