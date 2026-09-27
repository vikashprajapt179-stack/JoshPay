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

        console.log(
          "My Asset From Database:",
          data
        );

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Unable to load asset data"
          );
        }

        setAssets({
          deposit: Number(
            data.totalDeposit || 0
          ),
          withdraw: Number(
            data.totalWithdrawal || 0
          ),
          commission: Number(
            data.bonus || 0
          ),
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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fc] pb-[85px] sm:pb-[95px]">

      {/* ================= HEADER ================= */}

      <div className="flex items-center justify-center pt-6 sm:pt-10 pb-5 sm:pb-8">
        <h1 className="text-[25px] sm:text-[32px] font-bold text-[#168c6b]">
          My Asset
        </h1>
      </div>

      {/* ================= ASSET CARD ================= */}

      <div className="mx-4 rounded-[18px] sm:rounded-[22px] bg-white p-4 sm:p-5 shadow-sm">

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4">

          {/* DEPOSIT */}

          <div className="flex min-h-[72px] sm:h-[82px] items-center rounded-[12px] sm:rounded-[14px] bg-[#eff7f3] px-2.5 sm:px-4">

            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-[10px] sm:rounded-[12px] bg-[#d8f0e7]">

              <CreditCard
                size={23}
                className="text-[#527fdb] sm:hidden"
                strokeWidth={2}
              />

              <CreditCard
                size={29}
                className="hidden text-[#527fdb] sm:block"
                strokeWidth={2}
              />

            </div>

            <div className="ml-2 sm:ml-3 min-w-0">

              <p className="text-[12px] sm:text-[17px] text-[#555]">
                Deposit
              </p>

              <p className="truncate text-[15px] sm:text-[20px] font-bold text-[#222]">
                ₹{" "}
                {loading
                  ? "..."
                  : assets.deposit.toFixed(2)}
              </p>

            </div>

          </div>

          {/* WITHDRAW */}

          <div className="flex min-h-[72px] sm:h-[82px] items-center rounded-[12px] sm:rounded-[14px] bg-[#eff7f3] px-2.5 sm:px-4">

            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-[10px] sm:rounded-[12px] bg-[#d8f0e7]">

              <CreditCard
                size={23}
                className="text-[#885de0] sm:hidden"
                strokeWidth={2}
              />

              <CreditCard
                size={29}
                className="hidden text-[#885de0] sm:block"
                strokeWidth={2}
              />

            </div>

            <div className="ml-2 sm:ml-3 min-w-0">

              <p className="text-[12px] sm:text-[17px] text-[#555]">
                Withdraw
              </p>

              <p className="truncate text-[15px] sm:text-[20px] font-bold text-[#222]">
                ₹{" "}
                {loading
                  ? "..."
                  : assets.withdraw.toFixed(2)}
              </p>

            </div>

          </div>

          {/* COMMISSION */}

          <div className="flex min-h-[72px] sm:h-[82px] items-center rounded-[12px] sm:rounded-[14px] bg-[#eff7f3] px-2.5 sm:px-4">

            <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-[10px] sm:rounded-[12px] bg-[#d8f0e7]">

              <Coins
                size={24}
                className="text-[#e5b91e] sm:hidden"
                strokeWidth={2}
              />

              <Coins
                size={30}
                className="hidden text-[#e5b91e] sm:block"
                strokeWidth={2}
              />

            </div>

            <div className="ml-2 sm:ml-3 min-w-0">

              <p className="text-[12px] sm:text-[17px] text-[#555]">
                Commission
              </p>

              <p className="truncate text-[15px] sm:text-[20px] font-bold text-[#222]">
                ₹{" "}
                {loading
                  ? "..."
                  : assets.commission.toFixed(2)}
              </p>

            </div>

          </div>

        </div>

      </div>

      {/* ================= MENU CARD ================= */}

      <div className="mx-4 mt-5 sm:mt-8 rounded-[18px] sm:rounded-[22px] bg-white px-3 sm:px-8 py-5 sm:py-7 shadow-sm">

        <div className="grid grid-cols-3 gap-y-6 sm:gap-y-8">

          {/* WALLET */}

          <MenuItem
            icon={
              <Wallet
                size={30}
                className="sm:hidden"
                strokeWidth={1.7}
              />
            }
            desktopIcon={
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
                size={30}
                className="sm:hidden"
                strokeWidth={1.7}
              />
            }
            desktopIcon={
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
                size={30}
                className="sm:hidden"
                strokeWidth={1.7}
              />
            }
            desktopIcon={
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
                size={30}
                className="sm:hidden"
                strokeWidth={1.7}
              />
            }
            desktopIcon={
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
                size={30}
                className="sm:hidden"
                strokeWidth={1.7}
              />
            }
            desktopIcon={
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
                size={30}
                className="sm:hidden"
                strokeWidth={1.7}
              />
            }
            desktopIcon={
              <BookOpen
                size={38}
                strokeWidth={1.7}
              />
            }
            title="Tutorial"
          />

        </div>

        {/* VERSION */}

        <div className="mt-4 text-right text-[11px] sm:text-[14px] text-[#69b99d]">
          v1.0.2
        </div>

      </div>

      {/* ================= LOGOUT ================= */}

      <div className="mx-10 sm:mx-20 mt-5 sm:mt-6">

        <button
          onClick={onLogout}
          type="button"
          className="flex h-[50px] sm:h-[58px] w-full items-center justify-center gap-2 rounded-full bg-[#0eaa68] text-[16px] sm:text-[20px] font-bold text-white shadow-sm active:scale-[0.98]"
        >

          <LogOut
            size={18}
            className="sm:hidden"
          />

          <LogOut
            size={20}
            className="hidden sm:block"
          />

          Logout

        </button>

      </div>

      {/* ================= BOTTOM NAVIGATION ================= */}

      <BottomNavigation
        active="My"
        onNavigate={onNavigate}
      />

    </div>
  );
}

function MenuItem({
  icon,
  desktopIcon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex min-w-0 flex-col items-center justify-center"
    >

      <div className="flex h-[50px] w-[50px] sm:h-[58px] sm:w-[58px] items-center justify-center rounded-[11px] sm:rounded-[12px] bg-[#dff3ed] text-[#333]">

        <span className="sm:hidden">
          {icon}
        </span>

        <span className="hidden sm:block">
          {desktopIcon}
        </span>

      </div>

      <span className="mt-1.5 sm:mt-2 text-[13px] sm:text-[17px] font-semibold tracking-wide text-[#222]">
        {title}
      </span>

    </button>
  );
}

export default My;