import { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

function Payment({ user, onNavigate }) {
  const [selectedTab, setSelectedTab] =
    useState("Top Picks");

  const [balance, setBalance] = useState(
    Number(user?.balance ?? 200)
  );

  const [reward, setReward] = useState(
    Number(user?.bonus ?? 0)
  );

  const [pending, setPending] = useState(0);

  const userId =
    user?._id ||
    user?.id ||
    user?.userId ||
    "";

  const tabs = [
    "Top Picks",
    "500-1999",
    "2000-4999",
  ];

  const payments = [
    ...Array.from({ length: 10 }, (_, i) => ({
      amount: 1000,
      income: "+45",
      code: `A7XQ${i + 1}`,
    })),

    ...Array.from({ length: 8 }, (_, i) => ({
      amount: 2000,
      income: "+90",
      code: `OK200${i + 1}`,
    })),
  ];

  const filteredPayments = payments.filter(
    (payment) => {
      if (selectedTab === "Top Picks") {
        return true;
      }

      if (selectedTab === "500-1999") {
        return (
          payment.amount >= 500 &&
          payment.amount <= 1999
        );
      }

      if (selectedTab === "2000-4999") {
        return (
          payment.amount >= 2000 &&
          payment.amount <= 4999
        );
      }

      return true;
    }
  );

  const loadBalance = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `https://joshpay.onrender.com/api/user/${userId}/balance`
      );

      const data = await response.json();

      if (!response.ok) {
        console.error(
          "Payment Balance Error:",
          data
        );
        return;
      }

      setBalance(
        Number(data.balance ?? 0)
      );

      setReward(
        Number(data.bonus ?? 0)
      );

      const transactions =
        Array.isArray(data.transactions)
          ? data.transactions
          : [];

      const processingAmount =
        transactions
          .filter(
            (transaction) =>
              transaction.status ===
              "Processing"
          )
          .reduce(
            (total, transaction) =>
              total +
              Number(
                transaction.amount || 0
              ),
            0
          );

      setPending(processingAmount);

      localStorage.setItem(
        "okpayWallet",
        String(
          Number(data.balance ?? 0)
        )
      );
    } catch (error) {
      console.error(
        "Payment balance error:",
        error
      );
    }
  };

  useEffect(() => {
    loadBalance();

    if (!userId) return;

    // 5 sec polling instead of 1 sec
    const interval = setInterval(() => {
      loadBalance();
    }, 5000);

    return () => clearInterval(interval);
  }, [userId]);

  const handleClaim = (payment) => {
    onNavigate("order", payment);
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fb]">

      <div className="pb-[90px] sm:pb-[125px]">

        {/* ================= TITLE ================= */}

        <div className="pt-4 sm:pt-5 text-center">
          <h1 className="text-[25px] sm:text-[30px] font-extrabold text-[#078b5d]">
            Payment
          </h1>
        </div>

        {/* ================= CASHBACK CARD ================= */}

        <div className="relative mx-4 sm:mx-[23px] mt-6 sm:mt-[45px] min-h-[300px] sm:h-[442px] overflow-hidden rounded-[20px] sm:rounded-[25px] bg-gradient-to-br from-[#159f6c] to-[#0c9b68] shadow-lg">

          {/* Background circles */}

          <div className="absolute -right-[35px] sm:-right-[45px] -top-[20px] sm:-top-[25px] h-[120px] w-[120px] sm:h-[190px] sm:w-[190px] rounded-full bg-[#f0c932]" />

          <div className="absolute -right-[45px] sm:-right-[70px] top-[25px] sm:top-[38px] h-[170px] w-[170px] sm:h-[250px] sm:w-[250px] rounded-full bg-[#477fdb]" />

          <div className="relative p-5 sm:p-[47px]">

            <p className="text-[18px] sm:text-[25px] text-white">
              Cashback
            </p>

            <p className="mt-1 text-[48px] sm:text-[72px] font-extrabold leading-none text-white">
              4.5%
            </p>

            {/* Balance + Reward/Pending */}

            <div className="mt-6 sm:mt-[37px] flex gap-2.5 sm:gap-[13px]">

              {/* BALANCE */}

              <div className="min-h-[145px] sm:h-[190px] flex-[5] rounded-[10px] sm:rounded-[11px] border border-white/35 bg-white/10 p-2.5 sm:p-3">

                <p className="text-[12px] sm:text-[15px] font-medium text-white">
                  Balance
                </p>

                <div className="flex min-h-[105px] sm:h-[145px] items-center justify-center">

                  <p className="text-[20px] sm:text-[29px] font-bold text-white break-all text-center">
                    ₹{balance.toFixed(2)}
                  </p>

                </div>

              </div>

              {/* RIGHT */}

              <div className="flex flex-[4] flex-col gap-2.5 sm:gap-[14px]">

                {/* REWARD */}

                <div className="min-h-[67px] sm:h-[89px] rounded-[10px] sm:rounded-[11px] border border-white/35 bg-white/10 p-2.5 sm:p-3">

                  <p className="text-[12px] sm:text-[15px] font-medium text-white">
                    Reward
                  </p>

                  <div className="flex h-[40px] sm:h-[52px] items-center justify-center">

                    <p className="text-[19px] sm:text-[29px] font-bold text-white break-all">
                      ₹{reward.toFixed(2)}
                    </p>

                  </div>

                </div>

                {/* PENDING */}

                <div className="min-h-[67px] sm:h-[89px] rounded-[10px] sm:rounded-[11px] border border-white/35 bg-white/10 p-2.5 sm:p-3">

                  <p className="text-[12px] sm:text-[15px] font-medium text-white">
                    Pending
                  </p>

                  <div className="flex h-[40px] sm:h-[52px] items-center justify-center">

                    <p className="text-[19px] sm:text-[29px] font-bold text-white break-all">
                      ₹{pending.toFixed(2)}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* ================= WARNING ================= */}

        <div className="mx-5 sm:mx-[45px] mt-4 sm:mt-6 flex items-start gap-1.5 sm:gap-2">

          <span className="shrink-0 text-[17px] sm:text-[20px] text-[#3a9d78]">
            ⚠
          </span>

          <p className="flex-1 text-center text-[12px] sm:text-[17px] font-medium leading-[1.35] text-[#298c70]">
            Please use Freecharge or Mobikwik or Paytm wallet for payment!
          </p>

        </div>

        {/* ================= TABS ================= */}

        <div className="mt-5 sm:mt-[27px] overflow-x-auto scrollbar-hide">

          <div className="flex w-max gap-2.5 sm:gap-[13px] px-4 sm:px-[23px]">

            {tabs.map((tab) => {
              const selected =
                selectedTab === tab;

              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() =>
                    setSelectedTab(tab)
                  }
                  className={`h-[45px] sm:h-[61px] whitespace-nowrap rounded-full px-5 sm:px-[27px] text-[14px] sm:text-[20px] transition ${
                    selected
                      ? "bg-[#079665] font-semibold text-white"
                      : "bg-[#eff0f3] text-[#444444]"
                  }`}
                >
                  {tab}
                </button>
              );
            })}

          </div>

        </div>

        {/* ================= PAYMENT LIST ================= */}

        <div className="mt-5 sm:mt-[28px] px-4 sm:px-6">

          {filteredPayments.map(
            (payment, index) => (

              <div
                key={index}
                className="mb-4 sm:mb-[27px] rounded-[15px] sm:rounded-[17px] bg-white px-4 sm:px-[37px] py-4 sm:py-[21px] shadow-sm"
              >

                <div className="flex items-start justify-between gap-3">

                  {/* LEFT */}

                  <div className="min-w-0">

                    <p className="text-[20px] sm:text-[26px] font-extrabold text-[#078e62]">
                      INR
                    </p>

                    <div className="mt-2 sm:mt-[10px] flex items-center flex-wrap">

                      <span className="text-[13px] sm:text-[18px] text-[#555]">
                        Amount:
                      </span>

                      <span className="ml-1 text-[14px] sm:text-[19px] font-bold text-[#079665]">
                        ₹{payment.amount}
                      </span>

                    </div>

                    <div className="mt-1.5 sm:mt-[6px] flex items-center">

                      <span className="text-[13px] sm:text-[18px] text-[#444]">
                        Income:
                      </span>

                      <span className="ml-1 text-[14px] sm:text-[19px] font-bold text-[#e64d55]">
                        {payment.income}
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <div className="flex shrink-0 flex-col items-end">

                    <div className="flex items-center max-w-full">

                      <span className="rounded-[4px] sm:rounded-[5px] bg-[#e1f4ec] px-2 sm:px-[10px] py-1 text-[11px] sm:text-[15px] font-bold text-[#248d69]">
                        Code
                      </span>

                      <span className="ml-1.5 sm:ml-2 max-w-[75px] sm:max-w-none truncate text-[12px] sm:text-[17px] font-medium text-[#222]">
                        {payment.code}
                      </span>

                    </div>

                    {/* CLAIM */}

                    <button
                      type="button"
                      onClick={() =>
                        handleClaim(payment)
                      }
                      className="mt-4 sm:mt-7 rounded-full bg-[#079665] px-5 sm:px-[27px] py-2 sm:py-[10px] text-[13px] sm:text-[17px] font-bold text-white shadow-md transition hover:bg-[#067f55] active:scale-[0.98]"
                    >
                      Claim
                    </button>

                  </div>

                </div>

              </div>

            )
          )}

        </div>

      </div>

      {/* ================= BOTTOM NAV ================= */}

      <BottomNavigation
        active="Payment"
        onNavigate={onNavigate}
      />

    </div>
  );
}

export default Payment;