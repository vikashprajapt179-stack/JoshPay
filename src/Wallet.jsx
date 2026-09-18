import {
  Wallet as WalletIcon,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  ChevronRight,
} from "lucide-react";
import BottomNavigation from "./BottomNavigation";

function Wallet({ user, onNavigate }) {
  const balance = user?.balance ?? "32646.00";

  const transactions = [
    {
      title: "Deposit",
      date: "Today, 10:30 AM",
      amount: "+₹5,000.00",
      type: "deposit",
    },
    {
      title: "Withdraw",
      date: "Yesterday, 04:20 PM",
      amount: "-₹2,000.00",
      type: "withdraw",
    },
    {
      title: "Payment",
      date: "Yesterday, 11:15 AM",
      amount: "-₹850.00",
      type: "withdraw",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f7fc] pb-[100px]">
      {/* Header */}
      <div className="bg-[#168c6b] px-5 pt-10 pb-8 text-white">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <WalletIcon size={25} />
          </div>

          <div>
            <p className="text-sm opacity-80">My Wallet</p>
            <h1 className="text-2xl font-bold">Wallet Balance</h1>
          </div>
        </div>

        <div className="mt-7">
          <p className="text-sm opacity-80">Available Balance</p>
          <h2 className="mt-1 text-[34px] font-bold">
            ₹{balance}
          </h2>
        </div>
      </div>

      {/* Deposit / Withdraw */}
      <div className="mx-4 -mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate("deposit")}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#e8f8f1] py-4 text-[#168c6b]"
          >
            <ArrowDownToLine size={21} />
            <span className="font-semibold">Deposit</span>
          </button>

          <button
            onClick={() => onNavigate("withdraw")}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#fff5df] py-4 text-[#d89616]"
          >
            <ArrowUpFromLine size={21} />
            <span className="font-semibold">Withdraw</span>
          </button>
        </div>
      </div>

      {/* Wallet Information */}
      <div className="mx-4 mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800">
          Wallet Information
        </h2>

        <div className="mt-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Total Deposit</span>
            <span className="font-semibold text-gray-800">
              ₹32,646.00
            </span>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Total Withdraw</span>
            <span className="font-semibold text-gray-800">
              ₹34,428.00
            </span>
          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex items-center justify-between">
            <span className="text-gray-500">Commission</span>
            <span className="font-semibold text-[#168c6b]">
              ₹1,469.07
            </span>
          </div>
        </div>
      </div>

      {/* Transaction History */}
      <div className="mx-4 mt-5 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History size={20} className="text-[#168c6b]" />
            <h2 className="text-lg font-bold text-gray-800">
              Recent Transactions
            </h2>
          </div>

          <button
            onClick={() => onNavigate("history")}
            className="flex items-center text-sm font-medium text-[#168c6b]"
          >
            View All
            <ChevronRight size={17} />
          </button>
        </div>

        <div className="mt-4">
          {transactions.map((transaction, index) => (
            <div
              key={index}
              className={`flex items-center justify-between py-4 ${
                index !== transactions.length - 1
                  ? "border-b border-gray-100"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    transaction.type === "deposit"
                      ? "bg-green-100"
                      : "bg-orange-100"
                  }`}
                >
                  {transaction.type === "deposit" ? (
                    <ArrowDownToLine
                      size={19}
                      className="text-green-600"
                    />
                  ) : (
                    <ArrowUpFromLine
                      size={19}
                      className="text-orange-500"
                    />
                  )}
                </div>

                <div>
                  <p className="font-semibold text-gray-800">
                    {transaction.title}
                  </p>
                  <p className="text-xs text-gray-400">
                    {transaction.date}
                  </p>
                </div>
              </div>

              <span
                className={`font-semibold ${
                  transaction.type === "deposit"
                    ? "text-green-600"
                    : "text-red-500"
                }`}
              >
                {transaction.amount}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation
        active="Wallet"
        onNavigate={onNavigate}
      />
    </div>
  );
}

export default Wallet;
