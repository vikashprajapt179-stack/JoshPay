import { useEffect, useState } from "react";
import BottomNavigation from "./BottomNavigation";

function MobikwikCard({ phone }) {
  return (
    <div className="relative mx-auto h-[235px] w-full max-w-[650px] overflow-hidden rounded-[32px] bg-gradient-to-br from-[#08a765] via-[#0aa96c] to-[#168e69] px-8 py-7 text-white shadow-lg">

      {/* BACKGROUND SHAPES */}

      <div className="absolute -right-10 -top-16 h-[190px] w-[190px] rounded-full bg-[#f4cf3c]" />

      <div className="absolute -right-20 top-[70px] h-[260px] w-[260px] rounded-full bg-[#4b88e8] opacity-95" />

      <div className="absolute -left-28 top-16 h-[220px] w-[220px] rounded-full bg-[#0b9764] opacity-50" />

      {/* CONTENT */}

      <div className="relative z-10">

        <div className="flex items-start justify-between">

          <div>

            <h2 className="text-[34px] font-bold leading-none">
              Mobikwik
            </h2>

            <p className="mt-3 text-[25px] font-normal">
              {phone}@mbk
            </p>

          </div>

          <div className="rounded-full border-2 border-white bg-[#168d68] px-7 py-2 text-[20px] font-bold tracking-wide shadow-sm">
            Enabled
          </div>

        </div>

        <div className="mt-10 rounded-[18px] border-2 border-white/30 bg-white/10 px-5 py-4 backdrop-blur-sm">

          <p className="text-[21px]">
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
          `http://localhost:5000/api/mobikwik-wallet/${user.id}`
        );

        const data = await response.json();

        console.log(
          "Mobikwik Wallet From Database:",
          data
        );

        if (response.ok && data.wallet) {

          setWallet(data.wallet);

        } else {

          setWallet(null);

        }

      } catch (error) {

        console.error(
          "Wallet loading error:",
          error
        );

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

        <div className="px-5 pt-10 pb-8 text-center">

          <h1 className="text-[40px] font-bold text-[#148b69]">
            Tool
          </h1>

        </div>

        <div className="flex justify-center pt-10">

          <p className="text-[18px] text-gray-500">
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
    <div className="min-h-screen bg-[#f5f7fc] pb-[110px]">

      {/* HEADER */}

      <div className="px-5 pt-10 pb-8 text-center">

        <h1 className="text-[40px] font-bold text-[#148b69]">
          Tool
        </h1>

      </div>

      {/* ========================================= */}
      {/* WALLET CARD */}
      {/* ========================================= */}

      {wallet ? (

        <MobikwikCard
          phone={wallet?.phone || user?.phone}
        />

      ) : (

        <div className="mx-9">

          <div className="rounded-[30px] bg-white px-7 py-8 shadow-md">

            <h2 className="text-[30px] font-bold text-[#159464]">
              Mobikwik
            </h2>

            <p className="mt-2 text-[18px] text-gray-500">
              No wallet added
            </p>

          </div>

        </div>

      )}

      {/* ========================================= */}
      {/* ADD BUTTON */}
      {/* ========================================= */}

      <div className="mx-9">

        <button
          type="button"
          onClick={() => onNavigate("add-tool")}
          className="mt-10 w-full rounded-full bg-[#159464] py-5 text-[30px] font-bold text-white shadow-lg"
        >
          Add
        </button>

      </div>

      {/* ROBOT */}

      <div className="fixed bottom-[145px] right-5">

        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#c8f4cf] text-3xl">
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