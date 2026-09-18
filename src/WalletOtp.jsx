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
      <div className="relative flex h-[168px] items-end justify-center bg-white pb-6">
        <button
          onClick={() => onNavigate("tool")}
          className="absolute bottom-7 left-7 text-[#15916c]"
        >
          <svg
            width="55"
            height="55"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M19 12H5" />
            <path d="M12 5l-7 7 7 7" />
          </svg>
        </button>

        <h1 className="text-[40px] font-bold text-[#129267]">
          Wallet
        </h1>
      </div>

      <div className="mx-auto max-w-[720px] px-8 pt-10">

        <div className="rounded-[28px] bg-gradient-to-r from-[#eafaf3] to-[#159464] p-8">

          <h2 className="text-[32px] font-bold text-[#106d4f]">
            Mobikwik OTP Verification
          </h2>

          <div className="mt-7 rounded-[25px] bg-white p-8">

            <p className="text-[21px] leading-9 text-[#465160]">
              1. Please send the OTP code to your phone first.
              <br />
              2. Enter the OTP code after receiving it.
            </p>

            <h3 className="mt-6 text-[28px] font-bold text-[#159464]">
              Phone Number
            </h3>

            <div className="mt-2 flex h-[80px] rounded-2xl border-2 border-[#cce7df]">
              <div className="flex w-[95px] items-center justify-center border-r-2 border-[#cce7df] text-[26px] font-bold text-[#106d4f]">
                +91
              </div>

              <div className="flex flex-1 items-center px-5 text-[25px]">
                {phone}
              </div>
            </div>

            <h3 className="mt-6 text-[28px] font-bold text-[#159464]">
              OTP Code
            </h3>

            <div className="mt-2 flex h-[80px] items-center rounded-2xl border-2 border-[#cce7df] px-5">
              <input
                type="text"
                value={otp}
                maxLength={4}
                onChange={(e) =>
                  setOtp(
                    e.target.value.replace(/\D/g, "")
                  )
                }
                placeholder="Enter OTP"
                className="w-full text-[25px] outline-none"
              />

              <span className="rounded-xl bg-[#70bda6] px-5 py-3 text-[20px] font-bold text-white">
                {sending ? "..." : sent ? "Sent" : "Send"}
              </span>
            </div>

            {sent && (
              <p className="mt-3 text-[20px] text-[#27ad76]">
                OTP has been sent successfully.
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleVerify}
          disabled={verifying}
          className="mt-7 w-full rounded-full bg-[#159464] py-5 text-[30px] font-bold text-white shadow-lg disabled:opacity-60"
        >
          {verifying ? "Verifying..." : "Next"}
        </button>
      </div>
    </div>
  );
}

export default WalletOtp;
