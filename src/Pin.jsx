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
    <div className="min-h-screen bg-[#f5f7fc]">

      {/* HEADER */}
      <div className="flex items-center px-5 pt-8 pb-5">
        <button
          onClick={() => onNavigate("my")}
          className="text-[30px] text-[#333]"
        >
          ←
        </button>

        <h1 className="ml-5 text-[25px] font-bold text-[#222]">
          Pin Code
        </h1>
      </div>

      {/* FORM */}
      <div className="mx-5 mt-5 rounded-[20px] bg-white px-5 py-8 shadow-sm">

        <div className="mb-8 flex justify-center">
          <div className="flex h-[75px] w-[75px] items-center justify-center rounded-full bg-[#dff3ed]">
            <LockKeyhole
              size={38}
              strokeWidth={1.7}
              className="text-[#129267]"
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
        <div className="mt-8 flex gap-4">

          <button
            onClick={() => onNavigate("my")}
            className="h-[58px] flex-1 rounded-full border border-[#129267] bg-white text-[19px] font-semibold text-[#129267]"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirm}
            className="h-[58px] flex-1 rounded-full bg-[#129267] text-[19px] font-semibold text-white shadow-sm"
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
    <div className="mb-5 flex h-[60px] items-center rounded-full border border-[#d7e9e3] bg-[#f9fbfa] px-5">

      <LockKeyhole
        size={22}
        className="text-[#777]"
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
        className="ml-4 w-full bg-transparent text-[18px] outline-none placeholder:text-[#aaa]"
      />

    </div>
  );
}

export default Pin;