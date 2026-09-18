import React, { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

function Home({ user, onLogout, onNavigate }) {
  const [balance, setBalance] = useState(
    Number(user?.balance ?? 200)
  );

  const [totalDeposit, setTotalDeposit] = useState(
    Number(user?.totalDeposit ?? 0)
  );

  const [totalWithdrawal, setTotalWithdrawal] = useState(
    Number(user?.totalWithdrawal ?? 0)
  );

  const [transactions, setTransactions] = useState([]);

  const [loadingTransactions, setLoadingTransactions] =
    useState(true);

  const userId =
    user?._id ||
    user?.id ||
    user?.userId ||
    "";

  const updateUserData = (data) => {
    const newBalance = Number(data.balance ?? 0);
    const newTotalDeposit = Number(
      data.totalDeposit ?? 0
    );
    const newTotalWithdrawal = Number(
      data.totalWithdrawal ?? 0
    );

    setBalance(newBalance);
    setTotalDeposit(newTotalDeposit);
    setTotalWithdrawal(newTotalWithdrawal);

    if (Array.isArray(data.transactions)) {
      setTransactions(data.transactions);
    }

    // Keep local user data updated
    const currentUser =
      JSON.parse(
        localStorage.getItem("okpayUser") || "null"
      ) || {};

    const updatedUser = {
      ...currentUser,
      ...user,
      balance: newBalance,
      totalDeposit: newTotalDeposit,
      totalWithdrawal: newTotalWithdrawal,
      taskRewardUnlocked:
        data.taskRewardUnlocked ??
        currentUser.taskRewardUnlocked ??
        false,
      taskRewardClaimed:
        data.taskRewardClaimed ??
        currentUser.taskRewardClaimed ??
        false,
      taskReward:
        data.taskReward ??
        currentUser.taskReward ??
        300,
    };

    localStorage.setItem(
      "okpayUser",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem(
      "okpayWallet",
      String(newBalance)
    );

    if (data.taskRewardUnlocked) {
      localStorage.setItem(
        "taskUnlocked",
        "true"
      );
    }
  };

  const loadUserData = async () => {
    if (!userId) {
      setLoadingTransactions(false);
      return;
    }

    try {
      const response = await fetch(
        `https://joshpay.onrender.com/api/user/${userId}/balance`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Balance API Error:",
          data
        );
        return;
      }

      updateUserData(data);
    } catch (error) {
      console.error(
        "Load user data error:",
        error
      );
    } finally {
      setLoadingTransactions(false);
    }
  };

  // Initial load
  useEffect(() => {
    loadUserData();
  }, [userId]);

  // Poll balance and transactions
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `https://joshpay.onrender.com/api/user/${userId}/balance`
        );

        const data = await response.json();

        if (!response.ok) return;

        updateUserData(data);

        const processingTransactions =
          (data.transactions || []).filter(
            (transaction) =>
              transaction.status === "Processing" &&
              transaction.orderNo
          );

        // Check processing orders
        for (const transaction of processingTransactions) {
          try {
            await fetch(
              `https://joshpay.onrender.com/api/order/status/${userId}/${transaction.orderNo}`
            );
          } catch (error) {
            console.error(
              "Order status error:",
              error
            );
          }
        }

        // Reload after order status check
        if (processingTransactions.length > 0) {
          const updatedResponse =
            await fetch(
              `https://joshpay.onrender.com/api/user/${userId}/balance`
            );

          const updatedData =
            await updatedResponse.json();

          if (updatedResponse.ok) {
            updateUserData(updatedData);
          }
        }
      } catch (error) {
        console.error(
          "Transaction polling error:",
          error
        );
      }
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [userId]);

  const getStatusClass = (status) => {
    if (status === "Completed") {
      return "bg-[#e5f7ee] text-[#129267]";
    }

    if (status === "Processing") {
      return "bg-[#fff3df] text-[#e69a24]";
    }

    if (status === "Cancelled") {
      return "bg-[#ffebeb] text-[#e05252]";
    }

    return "bg-gray-100 text-gray-500";
  };

  const formatDate = (date) => {
    if (!date) return "";

    try {
      return new Date(date).toLocaleString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    } catch {
      return "";
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f7] flex justify-center text-[#1b2430]">
      <div className="w-full max-w-[420px] min-h-screen bg-[#f2f4f7] pb-[80px] relative">

        {/* TOP BAR */}

        <div className="flex justify-between items-center px-5 pt-[18px] pb-2">

          <div className="flex items-center gap-2.5">

            <div className="w-[42px] h-[42px] rounded-full bg-gradient-to-br from-[#cfe0ff] to-[#9db8f5] flex items-center justify-center">

              <svg
                viewBox="0 0 24 24"
                className="w-[22px] h-[22px] fill-[#5b7fd6]"
              >
                <path d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 5v2h16v-2c0-3-4-5-8-5z" />
              </svg>

            </div>

            <div>

              <div className="text-[17px] font-bold">
                {user?.username || "Ashish_90"}
              </div>

              <div className="text-[13px] text-[#8a94a6] flex items-center gap-1.5 mt-0.5">

                ID:{" "}
                {user?.id ||
                  user?._id ||
                  user?.userId ||
                  "272322"}

                <span className="bg-[#eceff3] rounded-[5px] p-[2px] flex items-center">

                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#8a94a6"
                    strokeWidth="2"
                  >
                    <rect
                      x="9"
                      y="9"
                      width="12"
                      height="12"
                      rx="2"
                    />

                    <rect
                      x="3"
                      y="3"
                      width="12"
                      height="12"
                      rx="2"
                    />
                  </svg>

                </span>

              </div>

            </div>

          </div>

          <svg
            className="w-6 h-6 text-[#1b2430]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M12 2a6 6 0 00-6 6v3.6c0 .8-.3 1.5-.8 2.1L4 15h16l-1.2-1.3c-.5-.6-.8-1.3-.8-2.1V8a6 6 0 00-6-6z" />
            <path d="M9.5 19a2.5 2.5 0 005 0" />
          </svg>

        </div>

        {/* BALANCE */}

        <div className="relative overflow-hidden mx-5 mt-[14px] rounded-[18px] bg-gradient-to-br from-[#15b06a] to-[#0f9d58] text-white px-[22px] pt-[22px] pb-[26px]">

          <div className="absolute rounded-full w-[110px] h-[110px] bg-[#f2b705] opacity-55 -top-10 -right-2.5" />

          <div className="absolute rounded-full w-[140px] h-[140px] bg-[#4a7fe0] opacity-65 top-2.5 -right-[50px]" />

          <div className="absolute rounded-full w-[90px] h-[90px] bg-white/15 -bottom-10 -left-[30px]" />

          <div className="relative z-10 text-[14px] font-medium opacity-90">
            Available Balance
          </div>

          <div className="relative z-10 flex items-baseline gap-1 mt-2 text-[34px] font-extrabold">

            <span className="text-[22px]">
              ₹
            </span>

            {balance.toFixed(2)}

          </div>

          <button
            onClick={() =>
              onNavigate("wallet")
            }
            className="relative z-10 mt-[18px] bg-white text-[#0f9d58] font-bold text-[14px] rounded-[22px] px-[26px] py-[9px]"
          >
            Detail
          </button>

        </div>

        {/* DEPOSIT / WITHDRAWAL */}

        <div className="relative overflow-hidden mx-5 mt-[14px] rounded-[16px] bg-gradient-to-r from-[#4a7fe0] via-[#0f9d58] to-[#0f9d58] text-white flex px-2.5 py-4">

          <div className="absolute rounded-full w-[70px] h-[70px] bg-[#4a7fe0] opacity-40 -top-5 -left-5" />

          <div className="absolute rounded-full w-[80px] h-[80px] bg-[#f2b705] opacity-40 -bottom-[30px] -right-5" />

          {/* DEPOSIT */}

          <div
            onClick={() =>
              onNavigate("deposit")
            }
            className="flex-1 text-center relative z-10 cursor-pointer"
          >

            <div className="flex items-center justify-center gap-1.5 text-[14px] font-semibold">
              <span className="text-[#c9ffd8]">
                ↑
              </span>

              Deposit
            </div>

            <div className="text-[20px] font-extrabold mt-1.5">
              ₹ {totalDeposit.toFixed(2)}
            </div>

          </div>

          <div className="w-px bg-white/30 my-0.5" />

          {/* WITHDRAWAL */}

          <div
            onClick={() =>
              onNavigate("withdraw")
            }
            className="flex-1 text-center relative z-10 cursor-pointer"
          >

            <div className="flex items-center justify-center gap-1.5 text-[14px] font-semibold">
              <span className="text-[#ffd3d3]">
                ↓
              </span>

              Withdrawal
            </div>

            <div className="text-[20px] font-extrabold mt-1.5">
              ₹ {totalWithdrawal.toFixed(2)}
            </div>

          </div>

        </div>

        {/* QUICK ACTIONS */}

        <div className="flex justify-between px-5 pt-[18px] pb-1">

          {/* USDT */}

          <div className="flex-1 flex flex-col items-center gap-2 relative">

            <span className="absolute -top-1.5 right-1.5 bg-[#0f9d58] text-white text-[10px] font-bold rounded-lg px-1.5 py-0.5">
              110 INR
            </span>

            <div className="w-[54px] h-[54px] rounded-[14px] bg-[#e7f7ee] flex items-center justify-center">

              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-[#1b2430] fill-none"
                strokeWidth="1.8"
              >
                <path d="M6 3h12M6 21h12M9 3v4l-3 5h12l-3-5V3M12 12v6M9.5 15h5" />
              </svg>

            </div>

            <div className="text-[13px] font-semibold text-[#3a4453]">
              USDT
            </div>

          </div>

          {/* TASK */}

          <button
            type="button"
            onClick={() =>
              onNavigate("task")
            }
            className="flex-1 flex flex-col items-center gap-2 bg-transparent border-0 outline-none cursor-pointer"
          >

            <div className="w-[54px] h-[54px] rounded-[14px] bg-[#e7f7ee] flex items-center justify-center">

              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-[#1b2430] fill-none"
                strokeWidth="1.8"
              >
                <circle cx="5" cy="6" r="1" />
                <circle cx="5" cy="12" r="1" />
                <circle cx="5" cy="18" r="1" />
                <path d="M9 6h11M9 12h11M9 18h11" />
              </svg>

            </div>

            <div className="text-[13px] font-semibold text-[#3a4453]">
              Task
            </div>

          </button>

          {/* TEAM */}

          <button
            type="button"
            onClick={() =>
              onNavigate("team")
            }
            className="flex-1 flex flex-col items-center gap-2 bg-transparent border-0 outline-none cursor-pointer"
          >

            <div className="w-[54px] h-[54px] rounded-[14px] bg-[#e7f7ee] flex items-center justify-center">

              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-[#1b2430] fill-none"
                strokeWidth="1.8"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 21c0-4 3.5-6 8-6s8 2 8 6" />
                <path d="M18 8h3M19.5 6.5v3" />
              </svg>

            </div>

            <div className="text-[13px] font-semibold text-[#3a4453]">
              Team
            </div>

          </button>

          {/* ORDER */}

          <button
            type="button"
            onClick={() =>
              onNavigate("payment")
            }
            className="flex-1 flex flex-col items-center gap-2 bg-transparent border-0 outline-none cursor-pointer"
          >

            <div className="w-[54px] h-[54px] rounded-[14px] bg-[#e7f7ee] flex items-center justify-center">

              <svg
                viewBox="0 0 24 24"
                className="w-6 h-6 stroke-[#1b2430] fill-none"
                strokeWidth="1.8"
              >
                <path d="M8 4h8v3H8z" />

                <rect
                  x="5"
                  y="6"
                  width="14"
                  height="15"
                  rx="2"
                />

                <path
                  d="M12 12l2 2 4-4"
                  strokeWidth="2"
                />
              </svg>

            </div>

            <div className="text-[13px] font-semibold text-[#3a4453]">
              Order
            </div>

          </button>

        </div>

        {/* TRANSACTIONS */}

        <div className="mx-5 mt-4 bg-white rounded-[16px] p-[18px]">

          <div className="flex justify-between items-center mb-3">

            <h3 className="text-[17px] font-bold">
              Transactions
            </h3>

            <span className="text-[13px] text-[#4a7fe0] font-semibold">
              See All
            </span>

          </div>

          {loadingTransactions && (
            <div className="py-8 text-center text-[14px] text-gray-400">
              Loading transactions...
            </div>
          )}

          {!loadingTransactions &&
            transactions.length === 0 && (
              <div className="py-8 text-center">

                <div className="text-[15px] font-medium text-[#8a94a6]">
                  No transactions yet
                </div>

                <div className="text-[12px] text-[#b0b7c3] mt-1">
                  Your transactions will appear here
                </div>

              </div>
            )}

          {!loadingTransactions &&
            transactions.length > 0 && (
              <div className="space-y-3">

                {[...transactions]
                  .reverse()
                  .map((transaction) => (

                    <div
                      key={
                        transaction._id ||
                        transaction.orderNo
                      }
                      className="rounded-[13px] border border-[#edf0f3] bg-[#fafbfc] px-4 py-3"
                    >

                      <div className="flex justify-between items-start">

                        <div>

                          <div className="text-[16px] font-bold text-[#129267]">
                            {transaction.type || "Order"}
                          </div>

                          <div className="mt-1 text-[12px] text-gray-400">
                            {transaction.orderNo}
                          </div>

                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-[12px] font-bold ${getStatusClass(
                            transaction.status
                          )}`}
                        >
                          {transaction.status}
                        </span>

                      </div>

                      <div className="mt-3 flex justify-between items-center">

                        <div>

                          <div className="text-[12px] text-gray-400">
                            Amount
                          </div>

                          <div className="text-[19px] font-extrabold text-[#129267]">
                            ₹
                            {Number(
                              transaction.amount || 0
                            ).toFixed(2)}
                          </div>

                        </div>

                        <div className="text-right">

                          <div className="text-[12px] text-gray-400">
                            UTR
                          </div>

                          <div className="max-w-[120px] truncate text-[13px] font-medium text-[#333]">
                            {transaction.utr || "-"}
                          </div>

                        </div>

                      </div>

                      <div className="mt-2 text-[11px] text-gray-400">
                        {formatDate(
                          transaction.createdAt
                        )}
                      </div>

                    </div>

                  ))}

              </div>
            )}

        </div>

        <BottomNavigation
          active="Home"
          onNavigate={onNavigate}
        />

      </div>
    </div>
  );
}

export default Home;
