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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fc] pb-[85px] sm:pb-[105px]">

      {/* ================= HEADER ================= */}

      <div className="bg-[#168c6b] px-4 sm:px-5 pt-7 sm:pt-10 pb-6 sm:pb-8 text-white">

        <div className="flex items-center gap-2.5 sm:gap-3">

          <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-full bg-white/20">
            <WalletIcon
              size={22}
              className="sm:hidden"
            />

            <WalletIcon
              size={25}
              className="hidden sm:block"
            />
          </div>

          <div className="min-w-0">
            <p className="text-[12px] sm:text-sm opacity-80">
              My Wallet
            </p>

            <h1 className="text-[21px] sm:text-2xl font-bold truncate">
              Wallet Balance
            </h1>
          </div>

        </div>

        <div className="mt-5 sm:mt-7">

          <p className="text-[12px] sm:text-sm opacity-80">
            Available Balance
          </p>

          <h2 className="mt-1 text-[28px] sm:text-[34px] font-bold break-all">
            ₹{balance}
          </h2>

        </div>

      </div>

      {/* ================= DEPOSIT / WITHDRAW ================= */}

      <div className="mx-4 sm:mx-5 -mt-4 sm:-mt-5 rounded-2xl bg-white p-3.5 sm:p-4 shadow-sm">

        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">

          <button
            type="button"
            onClick={() => onNavigate("deposit")}
            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#e8f8f1] py-3 sm:py-4 text-[#168c6b] active:scale-[0.98] transition"
          >

            <ArrowDownToLine
              size={19}
              className="sm:hidden"
            />

            <ArrowDownToLine
              size={21}
              className="hidden sm:block"
            />

            <span className="text-[14px] sm:text-base font-semibold">
              Deposit
            </span>

          </button>

          <button
            type="button"
            onClick={() => onNavigate("withdraw")}
            className="flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl bg-[#fff5df] py-3 sm:py-4 text-[#d89616] active:scale-[0.98] transition"
          >

            <ArrowUpFromLine
              size={19}
              className="sm:hidden"
            />

            <ArrowUpFromLine
              size={21}
              className="hidden sm:block"
            />

            <span className="text-[14px] sm:text-base font-semibold">
              Withdraw
            </span>

          </button>

        </div>

      </div>

      {/* ================= WALLET INFORMATION ================= */}

      <div className="mx-4 sm:mx-5 mt-4 sm:mt-5 rounded-2xl bg-white p-4 sm:p-5 shadow-sm">

        <h2 className="text-[17px] sm:text-lg font-bold text-gray-800">
          Wallet Information
        </h2>

        <div className="mt-4 sm:mt-5 space-y-3.5 sm:space-y-4">

          <div className="flex items-center justify-between gap-3">

            <span className="text-[13px] sm:text-base text-gray-500">
              Total Deposit
            </span>

            <span className="text-[14px] sm:text-base font-semibold text-gray-800">
              ₹32,646.00
            </span>

          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex items-center justify-between gap-3">

            <span className="text-[13px] sm:text-base text-gray-500">
              Total Withdraw
            </span>

            <span className="text-[14px] sm:text-base font-semibold text-gray-800">
              ₹34,428.00
            </span>

          </div>

          <div className="h-px bg-gray-100" />

          <div className="flex items-center justify-between gap-3">

            <span className="text-[13px] sm:text-base text-gray-500">
              Commission
            </span>

            <span className="text-[14px] sm:text-base font-semibold text-[#168c6b]">
              ₹1,469.07
            </span>

          </div>

        </div>

      </div>

      {/* ================= TRANSACTION HISTORY ================= */}

      <div className="mx-4 sm:mx-5 mt-4 sm:mt-5 rounded-2xl bg-white p-4 sm:p-5 shadow-sm">

        <div className="flex items-center justify-between gap-2">

          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">

            <History
              size={18}
              className="shrink-0 text-[#168c6b] sm:hidden"
            />

            <History
              size={20}
              className="hidden shrink-0 text-[#168c6b] sm:block"
            />

            <h2 className="text-[16px] sm:text-lg font-bold text-gray-800 truncate">
              Recent Transactions
            </h2>

          </div>

          <button
            type="button"
            onClick={() => onNavigate("history")}
            className="flex shrink-0 items-center text-[12px] sm:text-sm font-medium text-[#168c6b]"
          >
            View All

            <ChevronRight
              size={15}
              className="sm:hidden"
            />

            <ChevronRight
              size={17}
              className="hidden sm:block"
            />
          </button>

        </div>

        <div className="mt-3 sm:mt-4">

          {transactions.map(
            (transaction, index) => (

              <div
                key={index}
                className={`flex items-center justify-between gap-3 py-3.5 sm:py-4 ${
                  index !==
                  transactions.length - 1
                    ? "border-b border-gray-100"
                    : ""
                }`}
              >

                {/* LEFT SIDE */}

                <div className="flex min-w-0 items-center gap-2.5 sm:gap-3">

                  <div
                    className={`flex h-9 w-9 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-full ${
                      transaction.type ===
                      "deposit"
                        ? "bg-green-100"
                        : "bg-orange-100"
                    }`}
                  >

                    {transaction.type ===
                    "deposit" ? (
                      <ArrowDownToLine
                        size={17}
                        className="text-green-600 sm:hidden"
                      />
                    ) : (
                      <ArrowUpFromLine
                        size={17}
                        className="text-orange-500 sm:hidden"
                      />
                    )}

                    {transaction.type ===
                    "deposit" ? (
                      <ArrowDownToLine
                        size={19}
                        className="hidden text-green-600 sm:block"
                      />
                    ) : (
                      <ArrowUpFromLine
                        size={19}
                        className="hidden text-orange-500 sm:block"
                      />
                    )}

                  </div>

                  <div className="min-w-0">

                    <p className="text-[14px] sm:text-base font-semibold text-gray-800 truncate">
                      {transaction.title}
                    </p>

                    <p className="text-[10px] sm:text-xs text-gray-400 truncate">
                      {transaction.date}
                    </p>

                  </div>

                </div>

                {/* AMOUNT */}

                <span
                  className={`shrink-0 text-[14px] sm:text-base font-semibold ${
                    transaction.type ===
                    "deposit"
                      ? "text-green-600"
                      : "text-red-500"
                  }`}
                >
                  {transaction.amount}
                </span>

              </div>

            )
          )}

        </div>

      </div>

      {/* ================= BOTTOM NAVIGATION ================= */}

      <BottomNavigation
        active="Wallet"
        onNavigate={onNavigate}
      />

    </div>
  );
}

export default Wallet;