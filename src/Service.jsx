import React from "react";
import telegram from "./assets/telegram.png";

function Service({ onNavigate }) {
  const telegramLink = "https://t.me/joshpaycustomerservice";

  return (
    <div className="min-h-screen bg-[#f5f8fc]">

      {/* ================= HEADER ================= */}
      <div className="relative h-[168px] bg-white">

        {/* Back Button */}
        <button
          onClick={() => onNavigate("my")}
          type="button"
          className="absolute left-[23px] top-[109px] z-50 flex h-[55px] w-[55px] cursor-pointer items-center justify-center"
        >
          <span className="text-[52px] leading-none font-light text-[#159268]">
            ←
          </span>
        </button>

        {/* Page Title */}
        <h1 className="absolute left-0 right-0 top-[101px] text-center text-[38px] font-bold text-[#129366]">
          Service
        </h1>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="px-[18px] pt-[36px]">

        {/* Customer Service Card */}
        <div className="flex min-h-[128px] items-center rounded-[20px] bg-white px-[20px] shadow-sm">

          {/* Telegram Logo */}
          <div className="flex h-[80px] w-[80px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#eaf2fb]">

            <img
              src={telegram}
              alt="Telegram"
              className="h-[64px] w-[64px] rounded-full object-cover"
            />

          </div>

          {/* Customer Service Text */}
          <div className="ml-[20px] flex-1">

            <h2 className="text-[25px] font-bold leading-tight text-[#263342]">
              CustomerService
            </h2>

            <p className="mt-[10px] text-[19px] leading-tight text-[#8493a8]">
              OnlineCustomerService
            </p>

          </div>

          {/* Contact Button */}
          <a
            href={telegramLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex shrink-0 cursor-pointer items-center justify-center rounded-[11px] bg-[#159268] px-[39px] py-[14px] text-[23px] font-bold text-white shadow-sm transition active:scale-95"
          >
            Contact
          </a>

        </div>

      </div>

    </div>
  );
}

export default Service;
