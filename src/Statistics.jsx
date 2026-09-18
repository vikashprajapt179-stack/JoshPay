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
          `http://localhost:5000/api/user/${userId}/balance`
        );

        const data = await response.json();

        console.log(
          "Statistics From Database:",
          data
        );

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load statistics"
          );
        }

        const transactions =
          Array.isArray(data.transactions)
            ? data.transactions
            : [];

        // =================================================
        // IN PROCESS PAYMENTS
        // =================================================

        const processingPayments =
          transactions.filter(
            (tx) =>
              tx.type === "Payment" &&
              tx.status === "Processing"
          );

        const inProcessAmount =
          processingPayments.reduce(
            (total, tx) =>
              total +
              Number(tx.amount || 0),
            0
          );

        const inProcessOrders =
          processingPayments.length;

        // =================================================
        // SELL
        // =================================================
        // Current server.js does not have a separate
        // "sell" field, so keep it at 0 instead of
        // showing a fake hardcoded amount.

        const sell = 0;

        // =================================================
        // UPDATE STATE
        // =================================================

        setStats({
          balance: Number(
            data.balance || 0
          ),

          deposit: Number(
            data.totalDeposit || 0
          ),

          commission: Number(
            data.bonus || 0
          ),

          sell,

          inProcessAmount,

          inProcessOrders,
        });
      } catch (error) {
        console.error(
          "Statistics loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    // Load immediately
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

  const estimatedIncome =
    Number(
      (
        stats.inProcessAmount *
        0.045
      ).toFixed(2)
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
    <div className="min-h-screen bg-[#f7f7f7] pb-[105px]">

      {/* Header */}

      <div className="px-5 pt-10 pb-8 text-center">

        <h1 className="text-[38px] font-bold text-[#07865f]">
          Statistics
        </h1>

      </div>

      {/* Main Card */}

      <div className="mx-5 rounded-[22px] bg-white px-5 py-5 shadow-sm">

        {/* Statistics Heading */}

        <div className="mb-5 flex items-center gap-3">

          <div className="h-7 w-2 rounded-full bg-[#08a875]" />

          <h2 className="text-[28px] font-medium text-gray-900">
            Statistics
          </h2>

          <span className="text-[19px] text-gray-400">
            ({formattedDate})
          </span>

        </div>

        {/* Statistics Grid */}

        <div className="grid grid-cols-2 gap-x-6 gap-y-7">

          {/* BALANCE */}

          <StatItem
            icon={<CreditCard size={27} />}
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
            icon={<ArrowUpRight size={28} />}
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
            icon={<Wallet size={28} />}
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
            icon={<RefreshCcw size={28} />}
            iconBg="bg-[#f35b70]"
            title="Commission"
            amount={
              loading
                ? "..."
                : `₹ ${stats.commission.toFixed(2)}`
            }
          />

        </div>

        {/* Payment Heading */}

        <div className="mt-8 mb-5 flex items-center gap-3">

          <div className="h-7 w-2 rounded-full bg-[#08a875]" />

          <h2 className="text-[28px] font-medium text-gray-900">
            Payment
          </h2>

        </div>

        {/* Payment Card */}

        <div className="rounded-[20px] bg-[#f5f7fa] p-4">

          {/* Exchange Rate */}

          <div className="flex items-center justify-between rounded-xl bg-[#d8eee7] px-3 py-3 text-[#148b69]">

            <span className="text-[20px] font-medium">
              Real Time Exchange Rates (INR/USDT)
            </span>

            <span className="text-[20px] font-semibold">
              110
            </span>

          </div>

          {/* Payment Details */}

          <div className="mt-3 grid grid-cols-2 gap-3">

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
                  : String(
                      stats.inProcessOrders
                    )
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

      {/* Closed Selling Button */}

      <div className="mx-14 mt-9">

        <button
          onClick={() =>
            onNavigate("payment")
          }
          className="w-full rounded-full bg-[#f8c52d] py-5 text-[27px] font-bold text-white shadow-md"
        >
          Closed Selling
        </button>

      </div>

      {/* Chat Icon */}

      <button
        onClick={() =>
          onNavigate("message")
        }
        className="fixed bottom-[145px] right-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#c9f5d0] text-3xl shadow-sm"
      >
        🤖
      </button>

      {/* Bottom Navigation */}

      <BottomNavigation
        active="Statistics"
        onNavigate={onNavigate}
      />

    </div>
  );
}

function StatItem({
  icon,
  iconBg,
  title,
  amount,
}) {
  return (
    <div>

      <div className="flex items-center gap-3">

        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-white ${iconBg}`}
        >
          {icon}
        </div>

        <span className="text-[20px] text-gray-400">
          {title}
        </span>

      </div>

      <p className="mt-3 text-center text-[27px] font-bold text-gray-900">
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
    <div className="rounded-2xl bg-white px-3 py-3 shadow-sm">

      <div className="flex items-start gap-2">

        <span className="mt-1 text-[#f1ca4b]">
          ◉
        </span>

        <span className="text-[18px] leading-6 text-gray-400">
          {title}
        </span>

      </div>

      <p className="mt-1 text-center text-[25px] font-bold text-gray-900">
        {amount}
      </p>

    </div>
  );
}

export default Statistics;