import React from "react";
import telegram from "./assets/telegram.png";

function Service({ onNavigate }) {
  const telegramLink =
    "https://t.me/joshpaycustomerservice";

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f8fc]">

      {/* ================= HEADER ================= */}

      <div className="relative h-[92px] sm:h-[168px] bg-white">

        {/* Back Button */}

        <button
          onClick={() => onNavigate("my")}
          type="button"
          className="absolute left-3 sm:left-[23px] bottom-3 sm:top-[109px] sm:bottom-auto z-50 flex h-[40px] w-[40px] sm:h-[55px] sm:w-[55px] cursor-pointer items-center justify-center"
        >
          <span className="text-[38px] sm:text-[52px] leading-none font-light text-[#159268]">
            ←
          </span>
        </button>

        {/* Page Title */}

        <h1 className="absolute left-0 right-0 bottom-3 sm:top-[101px] sm:bottom-auto text-center text-[25px] sm:text-[38px] font-bold text-[#129366]">
          Service
        </h1>

      </div>

      {/* ================= CONTENT ================= */}

      <div className="px-4 sm:px-[18px] pt-5 sm:pt-[36px]">

        {/* Customer Service Card */}

        <div className="flex min-h-[100px] sm:min-h-[128px] items-center rounded-[17px] sm:rounded-[20px] bg-white px-3 sm:px-[20px] py-3 sm:py-0 shadow-sm">

          {/* Telegram Logo */}

          <div className="flex h-[58px] w-[58px] sm:h-[80px] sm:w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf2fb]">

            <img
              src={telegram}
              alt="Telegram"
              className="h-[46px] w-[46px] sm:h-[64px] sm:w-[64px] rounded-full object-cover"
            />

          </div>

          {/* Customer Service Text */}

          <div className="ml-3 sm:ml-[20px] min-w-0 flex-1">

            <h2 className="text-[17px] sm:text-[25px] font-bold leading-tight text-[#263342]">
              CustomerService
            </h2>

            <p className="mt-1.5 sm:mt-[10px] text-[12px] sm:text-[19px] leading-tight text-[#8493a8]">
              OnlineCustomerService
            </p>

          </div>

          {/* Contact Button */}

          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-[9px] sm:rounded-[11px] bg-[#159268] px-3 sm:px-[39px] py-2.5 sm:py-[14px] text-[14px] sm:text-[23px] font-bold text-white shadow-sm transition active:scale-95"
          >
            Contact
          </a>

        </div>

      </div>

    </div>
  );
}

export default Service;