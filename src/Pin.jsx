import { useState } from "react";
import { LockKeyhole } from "lucide-react";

function Pin({ onNavigate }) {
  const [oldPin, setOldPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleConfirm = () => {
    if (!oldPin || !newPin || !confirmPin) {
      alert("Please fill all PIN fields");
      return;
    }

    if (newPin.length !== 6 || confirmPin.length !== 6) {
      alert("PIN must be 6 digits");
      return;
    }

    if (newPin !== confirmPin) {
      alert("New PIN and Confirm PIN do not match");
      return;
    }

    alert("PIN changed successfully");

    setOldPin("");
    setNewPin("");
    setConfirmPin("");
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fc]">
      {/* HEADER */}
      <div className="flex w-full items-center px-4 pt-5 pb-4 sm:px-8 sm:pt-8 sm:pb-6">
        <button
          type="button"
          onClick={() => onNavigate("my")}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-[30px] leading-none text-[#333] sm:h-12 sm:w-12 sm:text-[36px]"
        >
          ←
        </button>

        <h1 className="ml-3 text-[24px] font-bold text-[#222] sm:ml-5 sm:text-[32px]">
          Pin Code
        </h1>
      </div>

      {/* FORM */}
      <div className="mx-4 mt-3 w-auto rounded-[18px] bg-white px-4 py-6 shadow-sm sm:mx-auto sm:mt-6 sm:max-w-[650px] sm:rounded-[25px] sm:px-8 sm:py-9">
        {/* ICON */}
        <div className="mb-6 flex justify-center sm:mb-8">
          <div className="flex h-[65px] w-[65px] items-center justify-center rounded-full bg-[#dff3ed] sm:h-[80px] sm:w-[80px]">
            <LockKeyhole
              size={34}
              strokeWidth={1.7}
              className="text-[#129267] sm:hidden"
            />

            <LockKeyhole
              size={40}
              strokeWidth={1.7}
              className="hidden text-[#129267] sm:block"
            />
          </div>
        </div>

        {/* OLD PIN */}
        <PinInput
          placeholder="Old PIN"
          value={oldPin}
          onChange={setOldPin}
        />

        {/* NEW PIN */}
        <PinInput
          placeholder="New PIN"
          value={newPin}
          onChange={setNewPin}
        />

        {/* CONFIRM PIN */}
        <PinInput
          placeholder="Confirm New PIN"
          value={confirmPin}
          onChange={setConfirmPin}
        />

        {/* BUTTONS */}
        <div className="mt-6 flex gap-3 sm:mt-8 sm:gap-4">
          <button
            type="button"
            onClick={() => onNavigate("my")}
            className="h-[52px] flex-1 rounded-full border border-[#129267] bg-white text-[16px] font-semibold text-[#129267] transition active:scale-[0.98] sm:h-[60px] sm:text-[19px]"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="h-[52px] flex-1 rounded-full bg-[#129267] text-[16px] font-semibold text-white shadow-sm transition active:scale-[0.98] sm:h-[60px] sm:text-[19px]"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

function PinInput({ placeholder, value, onChange }) {
  return (
    <div className="mb-4 flex h-[56px] w-full items-center rounded-full border border-[#d7e9e3] bg-[#f9fbfa] px-4 sm:mb-5 sm:h-[62px] sm:px-5">
      <LockKeyhole
        size={20}
        className="shrink-0 text-[#777] sm:hidden"
      />

      <LockKeyhole
        size={22}
        className="hidden shrink-0 text-[#777] sm:block"
      />

      <input
        type="password"
        inputMode="numeric"
        maxLength={6}
        value={value}
        onChange={(e) =>
          onChange(e.target.value.replace(/\D/g, ""))
        }
        placeholder={placeholder}
        className="ml-3 min-w-0 w-full bg-transparent text-[16px] outline-none placeholder:text-[#aaa] sm:ml-4 sm:text-[18px]"
      />
    </div>
  );
}

export default Pin;