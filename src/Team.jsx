import {
  ArrowLeft,
  Copy,
  Send,
  MessageCircle,
  Link,
} from "lucide-react";

function Team({ onNavigate }) {
  const copyLink = () => {
    navigator.clipboard.writeText("W9lGy5");
    alert("Link copied");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fc] pb-6">

      {/* ================= HEADER ================= */}

      <div className="relative flex items-center justify-center px-4 sm:px-5 pt-6 sm:pt-10 pb-5 sm:pb-7">

        <button
          type="button"
          onClick={() => onNavigate("my")}
          className="absolute left-3 sm:left-5 top-6 sm:top-11 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full active:bg-green-50"
        >
          <ArrowLeft
            size={27}
            strokeWidth={2}
            className="text-[#128c68] sm:hidden"
          />

          <ArrowLeft
            size={42}
            strokeWidth={2}
            className="hidden text-[#128c68] sm:block"
          />
        </button>

        <h1 className="text-[26px] sm:text-[38px] font-bold text-[#128c68]">
          Team
        </h1>

      </div>

      {/* ================= COMMISSION CARD ================= */}

      <div className="mx-4 sm:mx-5 rounded-[20px] sm:rounded-[28px] bg-gradient-to-br from-[#0ca86c] to-[#11b875] px-4 sm:px-6 py-5 sm:py-7 text-white shadow-lg">

        <div className="text-center">

          <p className="text-[15px] sm:text-[24px]">
            My Total Commissions:
          </p>

          <h2 className="text-[36px] sm:text-[50px] font-bold leading-tight">
            +0.00
          </h2>

        </div>

        <div className="mt-3 sm:mt-4 grid grid-cols-2 gap-2.5 sm:gap-3">

          <InfoBox
            title="Commissions Yesterday"
            value="+0.00"
          />

          <InfoBox
            title="Total Team Members"
            value="+0"
          />

          <InfoBox
            title="Commissions Today"
            value="+0.00"
          />

          <InfoBox
            title="Total Team Deposit"
            value="+0.00"
          />

        </div>

      </div>

      {/* ================= INVITATION ================= */}

      <div className="mx-4 sm:mx-5 mt-5 sm:mt-7 overflow-hidden rounded-[20px] sm:rounded-[25px] border border-[#138f6b] bg-white shadow-sm">

        <div className="bg-[#138f6b] px-4 sm:px-7 py-2.5 sm:py-3">

          <h2 className="text-[20px] sm:text-[28px] font-bold text-white">
            Invitation
          </h2>

        </div>

        <div className="bg-[#138f6b] px-4 sm:px-7 pb-4 sm:pb-5">

          <button
            type="button"
            onClick={copyLink}
            className="flex w-full items-center justify-between gap-2 rounded-full bg-gradient-to-r from-[#0bb66f] to-[#0caf6b] px-4 sm:px-7 py-3 sm:py-4 text-white"
          >

            <span className="text-[20px] sm:text-[31px] font-bold">
              Link
            </span>

            <span className="flex items-center gap-1.5 sm:gap-2 text-[17px] sm:text-[27px]">

              W9lGy5

              <Copy
                size={19}
                className="sm:hidden"
              />

              <Copy
                size={25}
                className="hidden sm:block"
              />

            </span>

          </button>

        </div>

        <div className="px-4 sm:px-5 py-4">

          <h3 className="text-center text-[18px] sm:text-[24px] font-semibold text-gray-800">
            New Team Members:
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-2.5 sm:gap-4">

            <LevelBox level="Level.B" />

            <LevelBox level="Level.C" />

          </div>

        </div>

      </div>

      {/* ================= SHARE APP ================= */}

      <div className="mx-4 sm:mx-5 mt-5 sm:mt-7 rounded-[18px] sm:rounded-[22px] bg-white p-4 sm:p-5 shadow-sm">

        <h2 className="text-[21px] sm:text-[30px] font-bold text-gray-900">
          Share APP to
        </h2>

        <div className="mt-3 sm:mt-4 grid grid-cols-4 gap-2 sm:gap-3">

          {/* Telegram */}

          <ShareButton
            icon={
              <>
                <Send
                  size={24}
                  className="sm:hidden"
                />

                <Send
                  size={35}
                  className="hidden sm:block"
                />
              </>
            }
            title="Telegram"
          />

          {/* Facebook */}

          <ShareButton
            icon={
              <span className="text-[27px] sm:text-4xl font-bold text-[#1877f2]">
                f
              </span>
            }
            title="Facebook"
          />

          {/* Message */}

          <ShareButton
            icon={
              <>
                <MessageCircle
                  size={24}
                  className="sm:hidden"
                />

                <MessageCircle
                  size={35}
                  className="hidden sm:block"
                />
              </>
            }
            title="Message"
          />

          {/* Copy Link */}

          <ShareButton
            icon={
              <>
                <Link
                  size={24}
                  className="sm:hidden"
                />

                <Link
                  size={35}
                  className="hidden sm:block"
                />
              </>
            }
            title="Copy link"
            onClick={copyLink}
          />

        </div>

      </div>

      {/* ================= COMMISSION / DEPOSIT ================= */}

      <div className="mx-4 sm:mx-5 mt-5 sm:mt-7 overflow-hidden rounded-[20px] sm:rounded-[25px] border border-[#138f6b] bg-white">

        <div className="bg-[#138f6b] px-4 sm:px-7 py-2.5 sm:py-3">

          <h2 className="text-[20px] sm:text-[27px] font-bold text-white">
            Commissions / Deposit
          </h2>

        </div>

        <div className="px-4 sm:px-7 py-4 sm:py-5">

          <div className="flex items-center justify-between gap-3">

            <span className="text-[18px] sm:text-[26px] font-bold text-[#128c68]">
              Level.B
            </span>

            <span className="text-[16px] sm:text-[25px] text-gray-500">
              0.00/0.00
            </span>

          </div>

          <div className="mt-2 flex items-center justify-between gap-3">

            <span className="text-[18px] sm:text-[26px] font-bold text-[#128c68]">
              Level.C
            </span>

            <span className="text-[16px] sm:text-[25px] text-gray-500">
              0.00/0.00
            </span>

          </div>

          <button
            type="button"
            className="mt-3 sm:mt-4 text-[14px] sm:text-[20px] text-blue-600 underline"
          >
            View details&gt;
          </button>

        </div>

      </div>

    </div>
  );
}


/* ============================================================
   INFO BOX
============================================================ */

function InfoBox({ title, value }) {
  return (
    <div className="rounded-xl sm:rounded-2xl bg-white px-2 sm:px-3 py-2.5 sm:py-3 text-center">

      <p className="text-[10px] sm:text-[17px] leading-4 sm:leading-normal text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-[18px] sm:text-[25px] font-bold text-[#07865f]">
        {value}
      </p>

    </div>
  );
}


/* ============================================================
   LEVEL BOX
============================================================ */

function LevelBox({ level }) {
  return (
    <div className="rounded-xl sm:rounded-2xl border border-[#d4e9e0] bg-[#eef9f4] px-2.5 sm:px-4 py-3">

      <h3 className="text-center text-[20px] sm:text-[28px] font-bold text-[#07865f]">
        {level}
      </h3>

      <div className="mt-2.5 sm:mt-3 flex justify-between gap-1 text-[11px] sm:text-[16px] text-gray-500">

        <span>
          Today:
        </span>

        <span className="font-semibold text-[#07865f]">
          0
        </span>

      </div>

      <div className="mt-1.5 sm:mt-2 flex justify-between gap-1 text-[11px] sm:text-[16px] text-gray-500">

        <span>
          Yesterday:
        </span>

        <span className="font-semibold text-[#07865f]">
          0
        </span>

      </div>

    </div>
  );
}


/* ============================================================
   SHARE BUTTON
============================================================ */

function ShareButton({
  icon,
  title,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-[90px] sm:h-[145px] min-w-0 flex-col items-center justify-center rounded-xl sm:rounded-2xl border border-gray-200 bg-white shadow-sm active:scale-[0.98] transition"
    >

      <div className="flex h-11 w-11 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-gray-100 text-[#168c6b]">

        {icon}

      </div>

      <span className="mt-2 sm:mt-3 max-w-full truncate px-1 text-[9px] sm:text-[16px] text-gray-700">
        {title}
      </span>

    </button>
  );
}


export default Team;