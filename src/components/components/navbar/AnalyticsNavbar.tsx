import { useRouter } from "next/router";
import Link from "next/link";

const AnalyticsNavbar = () => {
  const router = useRouter();

  // Define the navigation options for analytics
  const analyticsNavOptions = [
    { href: "/analytics/popular-voucher", text: "Most Popular Voucher" },
    { href: "/analytics/redemption-rate", text: "Voucher Redemption Rate" },
    { href: "/analytics/total-sales", text: "Total Sales" },
    { href: "/analytics/gem-utilization", text: "Gem Utilization" },
    { href: "/analytics/transactions", text: "Number of Transactions" },
    { href: "/analytics/engagement", text: "Number of Engagements" },
    { href: "/analytics/group-purchase", text: "Group Purchase Analytics" },
  ];

  return (
    <div className="fixed z-30 w-56 bg-white flex flex-col h-screen justify-between py-6 border border-border-primary overflow-auto shadow-lg">
      {/* Analytics Title */}
      <div className="flex flex-col justify-start p-4">
        <b className="pl-6 pb-6 text-blue-500 text-2xl">Analytics</b>
        <hr className="border-border-primary w-full p-2" />

        {/* Navigation Links */}
        {analyticsNavOptions.map((navOption, index) => (
          <div key={index} className="p-2">
            <Link href={navOption.href}>
              <span
                className={`block rounded-md p-3 text-lg hover:bg-blue-100 transition-colors ${
                  router.pathname === navOption.href
                    ? "bg-blue-500 text-white"
                    : "text-gray-800"
                }`}
              >
                {navOption.text}
              </span>
            </Link>
          </div>
        ))}
      </div>

      {/* Footer Section */}
      <div>
        <hr className="border-border-primary w-full p-2" />
        <div className="pl-10 pb-6">
          <button
            onClick={() => router.push("/")}
            className="rounded-3xl p-4 bg-blue-500 text-white font-bold text-lg hover:bg-blue-600 transition-colors duration-300"
          >
            <span className="hover:underline text-text-primary">Back to Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsNavbar;
