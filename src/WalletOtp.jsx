import { useEffect, useState } from "react";

function WalletOtp({ phone, onNavigate }) {
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [sent, setSent] = useState(false);
  const [accessToken, setAccessToken] = useState("");

  useEffect(() => {
    const send = () => {
      if (!window.sendOtp) {
        alert("MSG91 OTP service is not loaded. Please refresh.");
        return;
      }

      setSending(true);

      window.sendOtp(
        `91${phone}`,
        (data) => {
          console.log("Wallet OTP sent:", data);
          setSent(true);
          setSending(false);
          alert("OTP sent successfully to your mobile number");
        },
        (error) => {
          console.error("Wallet OTP error:", error);
          setSending(false);
          alert("Failed to send OTP");
        }
      );
    };

    send();
  }, [phone]);

  const handleVerify = () => {
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    if (otp.length !== 4) {
      alert("OTP must be 4 digits");
      return;
    }

    if (!window.verifyOtp) {
      alert("MSG91 OTP service is not loaded");
      return;
    }

    setVerifying(true);

    window.verifyOtp(
      otp,
      (data) => {
        console.log("Wallet OTP verified:", data);

        const token =
          data?.message ||
          data?.accessToken ||
          data?.access_token ||
          data?.token ||
          data?.["access-token"] ||
          data?.data?.accessToken ||
          data?.data?.access_token ||
          data?.data?.token ||
          data?.data?.["access-token"] ||
          (typeof data === "string" ? data : "");

        if (!token) {
          setVerifying(false);
          alert("OTP verified but verification token was not received");
          return;
        }

        setAccessToken(token);
        setVerifying(false);

        onNavigate("wallet-finish", {
          phone,
          msg91Token: token,
        });
      },
      (error) => {
        console.error("Wallet OTP verification error:", error);
        setVerifying(false);
        alert("Invalid OTP");
      }
    );
  };

  return (
    <div className="min-h-screen bg-[#f5f7fc]">
      {/* Header */}
      <div className="relative flex h-[92px] items-end justify-center bg-white pb-3 sm:h-[168px] sm:pb-6">
        <button
          type="button"
          onClick={() => onNavigate("tool")}
          className="absolute bottom-3 left-3 text-[#15916c] sm:bottom-7 sm:left-7"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M19 12H5" />
            <path d="M12 5l-7 7 7 7" />
          </svg>
        </button>

        <h1 className="text-[25px] font-bold text-[#129267] sm:text-[40px]">
          Wallet
        </h1>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-[720px] px-4 pt-5 sm:px-8 sm:pt-10">
        <div className="rounded-[18px] bg-gradient-to-r from-[#eafaf3] to-[#159464] p-4 sm:rounded-[28px] sm:p-8">
          <h2 className="text-[20px] font-bold text-[#106d4f] sm:text-[32px]">
            Mobikwik OTP Verification
          </h2>

          <div className="mt-4 rounded-[18px] bg-white p-4 sm:mt-7 sm:rounded-[25px] sm:p-8">
            <p className="text-[14px] leading-6 text-[#465160] sm:text-[21px] sm:leading-9">
              1. Please send the OTP code to your phone first.
              <br />
              2. Enter the OTP code after receiving it.
            </p>

            <h3 className="mt-4 text-[18px] font-bold text-[#159464] sm:mt-6 sm:text-[28px]">
              Phone Number
            </h3>

            <div className="mt-2 flex h-[56px] rounded-xl border-2 border-[#cce7df] sm:h-[80px] sm:rounded-2xl">
              <div className="flex w-[62px] items-center justify-center border-r-2 border-[#cce7df] text-[16px] font-bold text-[#106d4f] sm:w-[95px] sm:text-[26px]">
                +91
              </div>

              <div className="flex min-w-0 flex-1 items-center px-3 text-[16px] sm:px-5 sm:text-[25px]">
                <span className="truncate">{phone}</span>
              </div>
            </div>

            <h3 className="mt-4 text-[18px] font-bold text-[#159464] sm:mt-6 sm:text-[28px]">
              OTP Code
            </h3>

            <div className="mt-2 flex h-[56px] items-center rounded-xl border-2 border-[#cce7df] px-3 sm:h-[80px] sm:rounded-2xl sm:px-5">
              <input
                type="text"
                value={otp}
                maxLength={4}
                inputMode="numeric"
                onChange={(e) =>
                  setOtp(e.target.value.replace(/\D/g, ""))
                }
                placeholder="Enter OTP"
                className="min-w-0 flex-1 text-[16px] outline-none sm:text-[25px]"
              />

              <span className="shrink-0 rounded-lg bg-[#70bda6] px-3 py-2 text-[13px] font-bold text-white sm:rounded-xl sm:px-5 sm:py-3 sm:text-[20px]">
                {sending ? "..." : sent ? "Sent" : "Send"}
              </span>
            </div>

            {sent && (
              <p className="mt-2 text-[13px] text-[#27ad76] sm:mt-3 sm:text-[20px]">
                OTP has been sent successfully.
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          onClick={handleVerify}
          disabled={verifying}
          className="mt-5 w-full rounded-full bg-[#159464] py-3.5 text-[18px] font-bold text-white shadow-lg disabled:opacity-60 sm:mt-7 sm:py-5 sm:text-[30px]"
        >
          {verifying ? "Verifying..." : "Next"}
        </button>
      </div>
    </div>
  );
}

export default WalletOtp;
