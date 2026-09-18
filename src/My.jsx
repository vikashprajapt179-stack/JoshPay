import {
  CreditCard,
  Wallet,
  Headphones,
  FileText,
  ShieldCheck,
  BookOpen,
  Coins,
  LogOut,
  Users,
} from "lucide-react";

import { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

function My({ user, onLogout, onNavigate }) {
  const [assets, setAssets] = useState({
    deposit: 0,
    withdraw: 0,
    commission: 0,
  });

  const [loading, setLoading] = useState(true);

  // =====================================================
  // LOAD REAL-TIME ASSET DATA
  // =====================================================

  useEffect(() => {
    let intervalId;

    const loadAssets = async () => {
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

        console.log("My Asset From Database:", data);

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load asset data"
          );
        }

        setAssets({
          deposit: Number(data.totalDeposit || 0),
          withdraw: Number(data.totalWithdrawal || 0),
          commission: Number(data.bonus || 0),
        });
      } catch (error) {
        console.error(
          "My Asset loading error:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    // First load immediately
    loadAssets();

    // Automatically update every 5 seconds
    intervalId = setInterval(() => {
      loadAssets();
    }, 5000);

    return () => {
      clearInterval(intervalId);
    };
  }, [user?.id, user?._id]);

  return (
    <div className="min-h-screen bg-[#f5f7fc] pb-[95px]">

      {/* HEADER */}

      <div className="flex items-center justify-center pt-10 pb-8">
        <h1 className="text-[32px] font-bold text-[#168c6b]">
          My Asset
        </h1>
      </div>

      {/* ASSET CARD */}

      <div className="mx-4 rounded-[22px] bg-white p-5 shadow-sm">

        <div className="grid grid-cols-2 gap-4">

          {/* DEPOSIT */}

          <div className="flex h-[82px] items-center rounded-[14px] bg-[#eff7f3] px-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#d8f0e7]">

              <CreditCard
                size={29}
                strokeWidth={2}
                className="text-[#527fdb]"
              />

            </div>

            <div className="ml-3">

              <p className="text-[17px] text-[#555]">
                Deposit
              </p>

              <p className="text-[20px] font-bold text-[#222]">
                ₹{" "}
                {loading
                  ? "..."
                  : assets.deposit.toFixed(2)}
              </p>

            </div>

          </div>

          {/* WITHDRAW */}

          <div className="flex h-[82px] items-center rounded-[14px] bg-[#eff7f3] px-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#d8f0e7]">

              <CreditCard
                size={29}
                strokeWidth={2}
                className="text-[#885de0]"
              />

            </div>

            <div className="ml-3">

              <p className="text-[17px] text-[#555]">
                Withdraw
              </p>

              <p className="text-[20px] font-bold text-[#222]">
                ₹{" "}
                {loading
                  ? "..."
                  : assets.withdraw.toFixed(2)}
              </p>

            </div>

          </div>

          {/* COMMISSION */}

          <div className="flex h-[82px] items-center rounded-[14px] bg-[#eff7f3] px-4">

            <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[#d8f0e7]">

              <Coins
                size={30}
                strokeWidth={2}
                className="text-[#e5b91e]"
              />

            </div>

            <div className="ml-3">

              <p className="text-[17px] text-[#555]">
                Commission
              </p>

              <p className="text-[20px] font-bold text-[#222]">
                ₹{" "}
                {loading
                  ? "..."
                  : assets.commission.toFixed(2)}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* MENU CARD */}

      <div className="mx-4 mt-8 rounded-[22px] bg-white px-8 py-7 shadow-sm">

        <div className="grid grid-cols-3 gap-y-8">

          {/* WALLET */}

          <MenuItem
            icon={
              <Wallet
                size={38}
                strokeWidth={1.7}
              />
            }
            title="Wallet"
            onClick={() =>
              onNavigate("wallet")
            }
          />

          {/* TEAM */}

          <MenuItem
            icon={
              <Users
                size={38}
                strokeWidth={1.7}
              />
            }
            title="Team"
            onClick={() =>
              onNavigate("team")
            }
          />

          {/* SERVICE */}

          <MenuItem
            icon={
              <Headphones
                size={38}
                strokeWidth={1.7}
              />
            }
            title="Service"
            onClick={() =>
              onNavigate("service")
            }
          />

          {/* MESSAGE */}

          <MenuItem
            icon={
              <FileText
                size={38}
                strokeWidth={1.7}
              />
            }
            title="Message"
            onClick={() =>
              onNavigate("message")
            }
          />

          {/* PIN */}

          <MenuItem
            icon={
              <ShieldCheck
                size={38}
                strokeWidth={1.7}
              />
            }
            title="Pin"
            onClick={() =>
              onNavigate("pin")
            }
          />

          {/* TUTORIAL */}

          <MenuItem
            icon={
              <BookOpen
                size={38}
                strokeWidth={1.7}
              />
            }
            title="Tutorial"
          />

        </div>

        {/* VERSION */}

        <div className="mt-2 text-right text-[14px] text-[#69b99d]">
          v1.0.2
        </div>

      </div>

      {/* LOGOUT */}

      <div className="mx-20 mt-6">

        <button
          onClick={onLogout}
          className="flex h-[58px] w-full items-center justify-center gap-2 rounded-full bg-[#0eaa68] text-[20px] font-bold text-white shadow-sm"
        >

          <LogOut size={20} />

          Logout

        </button>

      </div>

      {/* BOTTOM NAVIGATION */}

      <BottomNavigation
        active="My"
        onNavigate={onNavigate}
      />

    </div>
  );
}

function MenuItem({
  icon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center"
    >

      <div className="flex h-[58px] w-[58px] items-center justify-center rounded-[12px] bg-[#dff3ed] text-[#333]">
        {icon}
      </div>

      <span className="mt-2 text-[17px] font-semibold tracking-wide text-[#222]">
        {title}
      </span>

    </button>
  );
}

export default My;
