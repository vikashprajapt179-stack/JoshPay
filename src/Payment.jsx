import { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

function Payment({ user, onNavigate }) {
  const [selectedTab, setSelectedTab] = useState("Top Picks");

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

  const filteredPayments = payments.filter((payment) => {
    if (selectedTab === "Top Picks") return true;

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
  });

  const loadBalance = async () => {
    if (!userId) return;

    try {
      const response = await fetch(
        `http://localhost:5000/api/user/${userId}/balance`
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
              transaction.status === "Processing"
          )
          .reduce(
            (total, transaction) =>
              total +
              Number(transaction.amount || 0),
            0
          );

      setPending(processingAmount);

      localStorage.setItem(
        "okpayWallet",
        String(Number(data.balance ?? 0))
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

    const interval = setInterval(() => {
      loadBalance();
    }, 1000);

    return () =>
      clearInterval(interval);
  }, [userId]);

  const handleClaim = (payment) => {
    onNavigate("order", payment);
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb]">

      <div className="pb-[125px]">

        {/* TITLE */}

        <div className="pt-5 text-center">
          <h1 className="text-[30px] font-extrabold text-[#078b5d]">
            Payment
          </h1>
        </div>

        {/* CASHBACK CARD */}

        <div className="relative mx-[23px] mt-[45px] h-[442px] overflow-hidden rounded-[25px] bg-gradient-to-br from-[#159f6c] to-[#0c9b68] shadow-lg">

          <div className="absolute -right-[45px] -top-[25px] h-[190px] w-[190px] rounded-full bg-[#f0c932]" />

          <div className="absolute -right-[70px] top-[38px] h-[250px] w-[250px] rounded-full bg-[#477fdb]" />

          <div className="relative p-[47px]">

            <p className="text-[25px] text-white">
              Cashback
            </p>

            <p className="mt-1 text-[72px] font-extrabold leading-none text-white">
              4.5%
            </p>

            <div className="mt-[37px] flex gap-[13px]">

              {/* BALANCE */}

              <div className="h-[190px] flex-[5] rounded-[11px] border border-white/35 bg-white/10 p-3">

                <p className="text-[15px] font-medium text-white">
                  Balance
                </p>

                <div className="flex h-[145px] items-center justify-center">

                  <p className="text-[29px] font-bold text-white">
                    ₹{balance.toFixed(2)}
                  </p>

                </div>

              </div>

              {/* RIGHT */}

              <div className="flex flex-[4] flex-col gap-[14px]">

                {/* REWARD */}

                <div className="h-[89px] rounded-[11px] border border-white/35 bg-white/10 p-3">

                  <p className="text-[15px] font-medium text-white">
                    Reward
                  </p>

                  <div className="flex h-[52px] items-center justify-center">

                    <p className="text-[29px] font-bold text-white">
                      ₹{reward.toFixed(2)}
                    </p>

                  </div>

                </div>

                {/* PENDING */}

                <div className="h-[89px] rounded-[11px] border border-white/35 bg-white/10 p-3">

                  <p className="text-[15px] font-medium text-white">
                    Pending
                  </p>

                  <div className="flex h-[52px] items-center justify-center">

                    <p className="text-[29px] font-bold text-white">
                      ₹{pending.toFixed(2)}
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* WARNING */}

        <div className="mx-[45px] mt-6 flex items-start">

          <span className="text-[20px] text-[#3a9d78]">
            ⚠
          </span>

          <p className="flex-1 text-center text-[17px] font-medium leading-[1.35] text-[#298c70]">
            Please use Freecharge or Mobikwik or Paytm wallet for payment!
          </p>

        </div>

        {/* TABS */}

        <div className="mt-[27px] overflow-x-auto">

          <div className="flex w-max gap-[13px] px-[23px]">

            {tabs.map((tab) => {

              const selected =
                selectedTab === tab;

              return (
                <button
                  key={tab}
                  onClick={() =>
                    setSelectedTab(tab)
                  }
                  className={`h-[61px] rounded-full px-[27px] text-[20px] transition ${
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

        {/* PAYMENT LIST */}

        <div className="mt-[28px] px-6">

          {filteredPayments.map(
            (payment, index) => (

              <div
                key={index}
                className="mb-[27px] rounded-[17px] bg-white px-[37px] py-[21px] shadow-sm"
              >

                <div className="flex items-start justify-between gap-4">

                  {/* LEFT */}

                  <div>

                    <p className="text-[26px] font-extrabold text-[#078e62]">
                      INR
                    </p>

                    <div className="mt-[10px] flex items-center">

                      <span className="text-[18px] text-[#555]">
                        Amount:
                      </span>

                      <span className="ml-1 text-[19px] font-bold text-[#079665]">
                        ₹{payment.amount}
                      </span>

                    </div>

                    <div className="mt-[6px] flex items-center">

                      <span className="text-[18px] text-[#444]">
                        Income:
                      </span>

                      <span className="ml-1 text-[19px] font-bold text-[#e64d55]">
                        {payment.income}
                      </span>

                    </div>

                  </div>

                  {/* RIGHT */}

                  <div className="flex flex-col items-end">

                    <div className="flex items-center">

                      <span className="rounded-[5px] bg-[#e1f4ec] px-[10px] py-1 text-[15px] font-bold text-[#248d69]">
                        Code
                      </span>

                      <span className="ml-2 text-[17px] font-medium text-[#222]">
                        {payment.code}
                      </span>

                    </div>

                    {/* CLAIM */}

                    <button
                      onClick={() =>
                        handleClaim(payment)
                      }
                      className="mt-7 rounded-full bg-[#079665] px-[27px] py-[10px] text-[17px] font-bold text-white shadow-md transition hover:bg-[#067f55]"
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

      <BottomNavigation
        active="Payment"
        onNavigate={onNavigate}
      />

    </div>
  );
}

export default Payment;