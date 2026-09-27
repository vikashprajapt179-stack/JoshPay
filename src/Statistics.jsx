import {
  CreditCard,
  ArrowUpRight,
  RefreshCcw,
  Wallet,
} from "lucide-react";

import { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

function Statistics({ user, onNavigate }) {
  const [stats, setStats] = useState({
    balance: 0,
    deposit: 0,
    commission: 0,
    sell: 0,
    inProcessAmount: 0,
    inProcessOrders: 0,
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD LIVE STATISTICS
  // =====================================================

  useEffect(() => {
    let intervalId;

    const loadStatistics = async () => {
      const userId = user?.id || user?._id;

      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://joshpay.onrender.com/api/user/${userId}/balance`
        );

        const data = await response.json();

        console.log("Statistics From Database:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load statistics"
          );
        }

        const transactions = Array.isArray(data.transactions)
          ? data.transactions
          : [];

        // =================================================
        // IN PROCESS PAYMENTS
        // =================================================

        const processingPayments = transactions.filter(
          (tx) =>
            tx.type === "Payment" &&
            tx.status === "Processing"
        );

        const inProcessAmount = processingPayments.reduce(
          (total, tx) => total + Number(tx.amount || 0),
          0
        );

        const inProcessOrders = processingPayments.length;

        // =================================================
        // SELL
        // =================================================

        const sell = 0;

        // =================================================
        // UPDATE STATE
        // =================================================

        setStats({
          balance: Number(data.balance || 0),
          deposit: Number(data.totalDeposit || 0),
          commission: Number(data.bonus || 0),
          sell,
          inProcessAmount,
          inProcessOrders,
        });
      } catch (error) {
        console.error("Statistics loading error:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStatistics();

    // Update every 5 seconds
    intervalId = setInterval(() => {
      loadStatistics();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id, user?._id]);

  // =====================================================
  // ESTIMATED INCOME
  // =====================================================

  const estimatedIncome = Number(
    (stats.inProcessAmount * 0.045).toFixed(2)
  );

  // =====================================================
  // DATE
  // =====================================================

  const today = new Date();

  const formattedDate =
    `${String(today.getDate()).padStart(2, "0")}/` +
    `${String(today.getMonth() + 1).padStart(2, "0")}/` +
    `${today.getFullYear()}`;

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f7f7f7] pb-[90px] sm:pb-[105px]">

      {/* ================= HEADER ================= */}

      <div className="px-4 pt-6 pb-5 text-center sm:px-5 sm:pt-10 sm:pb-8">
        <h1 className="text-[28px] font-bold text-[#07865f] sm:text-[38px]">
          Statistics
        </h1>
      </div>

      {/* ================= MAIN CARD ================= */}

      <div className="mx-3 rounded-[18px] bg-white px-3 py-4 shadow-sm sm:mx-5 sm:rounded-[22px] sm:px-5 sm:py-5">

        {/* Statistics Heading */}

        <div className="mb-5 flex min-w-0 items-center gap-2 sm:gap-3">
          <div className="h-6 w-1.5 shrink-0 rounded-full bg-[#08a875] sm:h-7 sm:w-2" />

          <h2 className="text-[22px] font-medium text-gray-900 sm:text-[28px]">
            Statistics
          </h2>

          <span className="min-w-0 text-[13px] text-gray-400 sm:text-[19px]">
            ({formattedDate})
          </span>
        </div>

        {/* ================= STATISTICS GRID ================= */}

        <div className="grid grid-cols-2 gap-x-3 gap-y-7 sm:gap-x-6 sm:gap-y-7">

          {/* BALANCE */}

          <StatItem
            icon={<CreditCard size={21} className="sm:hidden" />}
            desktopIcon={<CreditCard size={27} />}
            iconBg="bg-[#6389e9]"
            title="Balance"
            amount={
              loading
                ? "..."
                : `₹ ${stats.balance.toFixed(2)}`
            }
          />

          {/* SELL */}

          <StatItem
            icon={<ArrowUpRight size={22} className="sm:hidden" />}
            desktopIcon={<ArrowUpRight size={28} />}
            iconBg="bg-[#f5bd16]"
            title="Sell"
            amount={
              loading
                ? "..."
                : `₹ ${stats.sell.toFixed(2)}`
            }
          />

          {/* DEPOSIT */}

          <StatItem
            icon={<Wallet size={22} className="sm:hidden" />}
            desktopIcon={<Wallet size={28} />}
            iconBg="bg-[#10b98c]"
            title="Deposit"
            amount={
              loading
                ? "..."
                : `₹ ${stats.deposit.toFixed(2)}`
            }
          />

          {/* COMMISSION */}

          <StatItem
            icon={<RefreshCcw size={22} className="sm:hidden" />}
            desktopIcon={<RefreshCcw size={28} />}
            iconBg="bg-[#f35b70]"
            title="Commission"
            amount={
              loading
                ? "..."
                : `₹ ${stats.commission.toFixed(2)}`
            }
          />
        </div>

        {/* ================= PAYMENT HEADING ================= */}

        <div className="mt-7 mb-4 flex items-center gap-2 sm:mt-8 sm:mb-5 sm:gap-3">
          <div className="h-6 w-1.5 shrink-0 rounded-full bg-[#08a875] sm:h-7 sm:w-2" />

          <h2 className="text-[22px] font-medium text-gray-900 sm:text-[28px]">
            Payment
          </h2>
        </div>

        {/* ================= PAYMENT CARD ================= */}

        <div className="rounded-[16px] bg-[#f5f7fa] p-3 sm:rounded-[20px] sm:p-4">

          {/* Exchange Rate */}

          <div className="flex items-center justify-between gap-2 rounded-xl bg-[#d8eee7] px-3 py-3 text-[#148b69] sm:px-3 sm:py-3">

            <span className="min-w-0 text-[13px] font-medium leading-5 sm:text-[20px]">
              Real Time Exchange Rates (INR/USDT)
            </span>

            <span className="shrink-0 text-[17px] font-semibold sm:text-[20px]">
              110
            </span>
          </div>

          {/* Payment Details */}

          <div className="mt-3 grid grid-cols-2 gap-2 sm:gap-3">

            {/* IN PROCESS AMOUNT */}

            <PaymentItem
              title="In Process Amount"
              amount={
                loading
                  ? "..."
                  : `₹ ${stats.inProcessAmount.toFixed(2)}`
              }
            />

            {/* IN PROCESS ORDERS */}

            <PaymentItem
              title="In Process Orders"
              amount={
                loading
                  ? "..."
                  : String(stats.inProcessOrders)
              }
            />

            {/* COMMISSION RATE */}

            <PaymentItem
              title="Commission Rate"
              amount="4.50 %"
            />

            {/* ESTIMATED INCOME */}

            <PaymentItem
              title="Estimated Income"
              amount={
                loading
                  ? "..."
                  : `₹ ${estimatedIncome.toFixed(2)}`
              }
            />
          </div>
        </div>
      </div>

      {/* ================= CLOSED SELLING BUTTON ================= */}

      <div className="mx-4 mt-7 sm:mx-14 sm:mt-9">
        <button
          type="button"
          onClick={() => onNavigate("payment")}
          className="w-full rounded-full bg-[#f8c52d] py-3.5 text-[18px] font-bold text-white shadow-md transition active:scale-[0.98] sm:py-5 sm:text-[27px]"
        >
          Closed Selling
        </button>
      </div>

      {/* ================= CHAT ICON ================= */}

      <button
        type="button"
        onClick={() => onNavigate("message")}
        className="fixed bottom-[82px] right-4 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#c9f5d0] text-2xl shadow-sm sm:bottom-[145px] sm:right-5 sm:h-16 sm:w-16 sm:text-3xl"
      >
        🤖
      </button>

      {/* ================= BOTTOM NAVIGATION ================= */}

      <BottomNavigation
        active="Statistics"
        onNavigate={onNavigate}
      />
    </div>
  );
}

function StatItem({
  icon,
  desktopIcon,
  iconBg,
  title,
  amount,
}) {
  return (
    <div className="min-w-0">

      <div className="flex items-center gap-2 sm:gap-3">

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white sm:h-12 sm:w-12 ${iconBg}`}
        >
          <span className="sm:hidden">
            {icon}
          </span>

          <span className="hidden sm:block">
            {desktopIcon}
          </span>
        </div>

        <span className="min-w-0 truncate text-[14px] text-gray-400 sm:text-[20px]">
          {title}
        </span>
      </div>

      <p className="mt-2 truncate text-center text-[19px] font-bold text-gray-900 sm:mt-3 sm:text-[27px]">
        {amount}
      </p>
    </div>
  );
}

function PaymentItem({
  title,
  amount,
}) {
  return (
    <div className="min-w-0 rounded-[14px] bg-white px-2.5 py-3 shadow-sm sm:rounded-2xl sm:px-3 sm:py-3">

      <div className="flex min-w-0 items-start gap-1.5 sm:gap-2">

        <span className="mt-1 shrink-0 text-[11px] text-[#f1ca4b] sm:text-base">
          ◉
        </span>

        <span className="min-w-0 text-[13px] leading-5 text-gray-400 sm:text-[18px] sm:leading-6">
          {title}
        </span>
      </div>

      <p className="mt-1 truncate text-center text-[18px] font-bold text-gray-900 sm:text-[25px]">
        {amount}
      </p>
    </div>
  );
}

export default Statistics;