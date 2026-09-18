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
    <div className="min-h-screen bg-[#f5f7fc] pb-8">

      {/* Header */}
      <div className="relative flex items-center justify-center px-5 pt-10 pb-7">
        <button
          onClick={() => onNavigate("my")}
          className="absolute left-5 top-11"
        >
          <ArrowLeft
            size={42}
            strokeWidth={2}
            className="text-[#128c68]"
          />
        </button>

        <h1 className="text-[38px] font-bold text-[#128c68]">
          Team
        </h1>
      </div>


      {/* Commission Card */}
      <div className="mx-5 rounded-[28px] bg-gradient-to-br from-[#0ca86c] to-[#11b875] px-6 py-7 text-white shadow-lg">

        <div className="text-center">
          <p className="text-[24px]">
            My Total Commissions:
          </p>

          <h2 className="text-[50px] font-bold leading-tight">
            +0.00
          </h2>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">

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


      {/* Invitation */}
      <div className="mx-5 mt-7 overflow-hidden rounded-[25px] border border-[#138f6b] bg-white shadow-sm">

        <div className="bg-[#138f6b] px-7 py-3">
          <h2 className="text-[28px] font-bold text-white">
            Invitation
          </h2>
        </div>

        <div className="bg-[#138f6b] px-7 pb-5">

          <button
            onClick={copyLink}
            className="flex w-full items-center justify-between rounded-full bg-gradient-to-r from-[#0bb66f] to-[#0caf6b] px-7 py-4 text-white"
          >
            <span className="text-[31px] font-bold">
              Link
            </span>

            <span className="flex items-center gap-2 text-[27px]">
              W9lGy5
              <Copy size={25} />
            </span>
          </button>

        </div>


        <div className="px-5 py-4">

          <h3 className="text-center text-[24px] font-semibold text-gray-800">
            New Team Members:
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-4">

            <LevelBox level="Level.B" />

            <LevelBox level="Level.C" />

          </div>

        </div>

      </div>


      {/* Share APP */}
      <div className="mx-5 mt-7 rounded-[22px] bg-white p-5 shadow-sm">

        <h2 className="text-[30px] font-bold text-gray-900">
          Share APP to
        </h2>


        <div className="mt-4 grid grid-cols-4 gap-3">

          {/* Telegram */}
          <ShareButton
            icon={<Send size={35} />}
            title="Telegram"
          />


          {/* Facebook */}
          <ShareButton
            icon={
              <span className="text-4xl font-bold text-[#1877f2]">
                f
              </span>
            }
            title="Facebook"
          />


          {/* Message */}
          <ShareButton
            icon={<MessageCircle size={35} />}
            title="Message"
          />


          {/* Copy Link */}
          <ShareButton
            icon={<Link size={35} />}
            title="Copy link"
            onClick={copyLink}
          />

        </div>

      </div>


      {/* Commission / Deposit */}
      <div className="mx-5 mt-7 overflow-hidden rounded-[25px] border border-[#138f6b] bg-white">

        <div className="bg-[#138f6b] px-7 py-3">

          <h2 className="text-[27px] font-bold text-white">
            Commissions / Deposit
          </h2>

        </div>


        <div className="px-7 py-5">

          <div className="flex justify-between">

            <span className="text-[26px] font-bold text-[#128c68]">
              Level.B
            </span>

            <span className="text-[25px] text-gray-500">
              0.00/0.00
            </span>

          </div>


          <div className="mt-1 flex justify-between">

            <span className="text-[26px] font-bold text-[#128c68]">
              Level.C
            </span>

            <span className="text-[25px] text-gray-500">
              0.00/0.00
            </span>

          </div>


          <button className="mt-4 text-[20px] text-blue-600 underline">
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
    <div className="rounded-2xl bg-white px-3 py-3 text-center">

      <p className="text-[17px] text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-[25px] font-bold text-[#07865f]">
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
    <div className="rounded-2xl border border-[#d4e9e0] bg-[#eef9f4] px-4 py-3">

      <h3 className="text-center text-[28px] font-bold text-[#07865f]">
        {level}
      </h3>


      <div className="mt-3 flex justify-between text-[16px] text-gray-500">

        <span>
          Today:
        </span>

        <span className="font-semibold text-[#07865f]">
          0
        </span>

      </div>


      <div className="mt-2 flex justify-between text-[16px] text-gray-500">

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
      onClick={onClick}
      className="flex h-[145px] flex-col items-center justify-center rounded-2xl border border-gray-200 bg-white shadow-sm"
    >

      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-100 text-[#168c6b]">
        {icon}
      </div>

      <span className="mt-3 text-[16px] text-gray-700">
        {title}
      </span>

    </button>
  );
}


export default Team;
