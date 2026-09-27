import { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

function MobikwikCard({ phone }) {
  return (
    <div className="relative mx-auto h-[180px] w-full max-w-[650px] overflow-hidden rounded-[22px] bg-gradient-to-br from-[#08a765] via-[#0aa96c] to-[#168e69] px-4 py-4 text-white shadow-lg sm:h-[235px] sm:rounded-[32px] sm:px-8 sm:py-7">

      {/* BACKGROUND SHAPES */}
      <div className="absolute -right-7 -top-10 h-[130px] w-[130px] rounded-full bg-[#f4cf3c] sm:-right-10 sm:-top-16 sm:h-[190px] sm:w-[190px]" />
      <div className="absolute -right-14 top-[55px] h-[190px] w-[190px] rounded-full bg-[#4b88e8] opacity-95 sm:-right-20 sm:top-[70px] sm:h-[260px] sm:w-[260px]" />
      <div className="absolute -left-20 top-12 h-[160px] w-[160px] rounded-full bg-[#0b9764] opacity-50 sm:-left-28 sm:top-16 sm:h-[220px] sm:w-[220px]" />

      {/* CONTENT */}
      <div className="relative z-10">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h2 className="text-[23px] font-bold leading-none sm:text-[34px]">
              Mobikwik
            </h2>

            <p className="mt-2 truncate text-[16px] font-normal sm:mt-3 sm:text-[25px]">
              {phone}@mbk
            </p>
          </div>

          <div className="shrink-0 rounded-full border-2 border-white bg-[#168d68] px-3 py-1 text-[12px] font-bold tracking-wide shadow-sm sm:px-7 sm:py-2 sm:text-[20px]">
            Enabled
          </div>
        </div>

        <div className="mt-6 rounded-[13px] border-2 border-white/30 bg-white/10 px-3 py-2.5 backdrop-blur-sm sm:mt-10 sm:rounded-[18px] sm:px-5 sm:py-4">
          <p className="truncate text-[14px] sm:text-[21px]">
            LimitedRange:10.00~100000.00
          </p>
        </div>
      </div>
    </div>
  );
}

function Tool({ user, onNavigate }) {
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD WALLET
  // ==========================================
  useEffect(() => {
    const loadWallet = async () => {
      if (!user?.id) {
        setWallet(null);
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `https://joshpay.onrender.com/api/mobikwik-wallet/${user.id}`
        );

        const data = await response.json();

        console.log("Mobikwik Wallet From Database:", data);

        if (response.ok && data.wallet) {
          setWallet(data.wallet);
        } else {
          setWallet(null);
        }
      } catch (error) {
        console.error("Wallet loading error:", error);
        setWallet(null);
      } finally {
        setLoading(false);
      }
    };

    loadWallet();
  }, [user?.id]);

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f7fc]">
        <div className="px-4 pb-5 pt-6 text-center sm:px-5 sm:pb-8 sm:pt-10">
          <h1 className="text-[28px] font-bold text-[#148b69] sm:text-[40px]">
            Tool
          </h1>
        </div>

        <div className="flex justify-center px-4 pt-6 sm:pt-10">
          <p className="text-[15px] text-gray-500 sm:text-[18px]">
            Loading...
          </p>
        </div>

        <BottomNavigation
          active="Wallet"
          onNavigate={onNavigate}
        />
      </div>
    );
  }

  // ==========================================
  // TOOL PAGE
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f5f7fc] pb-[90px] sm:pb-[110px]">

      {/* HEADER */}
      <div className="px-4 pb-5 pt-6 text-center sm:px-5 sm:pb-8 sm:pt-10">
        <h1 className="text-[28px] font-bold text-[#148b69] sm:text-[40px]">
          Tool
        </h1>
      </div>

      {/* WALLET CARD */}
      {wallet ? (
        <div className="px-4 sm:px-0">
          <MobikwikCard
            phone={wallet?.phone || user?.phone}
          />
        </div>
      ) : (
        <div className="mx-4 sm:mx-9">
          <div className="rounded-[20px] bg-white px-5 py-5 shadow-md sm:rounded-[30px] sm:px-7 sm:py-8">
            <h2 className="text-[22px] font-bold text-[#159464] sm:text-[30px]">
              Mobikwik
            </h2>

            <p className="mt-1 text-[15px] text-gray-500 sm:mt-2 sm:text-[18px]">
              No wallet added
            </p>
          </div>
        </div>
      )}

      {/* ADD BUTTON */}
      <div className="mx-4 sm:mx-9">
        <button
          type="button"
          onClick={() => onNavigate("add-tool")}
          className="mt-6 w-full rounded-full bg-[#159464] py-3.5 text-[18px] font-bold text-white shadow-lg sm:mt-10 sm:py-5 sm:text-[30px]"
        >
          Add
        </button>
      </div>

      {/* ROBOT */}
      <div className="fixed bottom-[105px] right-4 sm:bottom-[145px] sm:right-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#c8f4cf] text-2xl sm:h-16 sm:w-16 sm:text-3xl">
          🤖
        </div>
      </div>

      {/* BOTTOM NAVIGATION */}
      <BottomNavigation
        active="Wallet"
        onNavigate={onNavigate}
      />
    </div>
  );
}

export default Tool;
