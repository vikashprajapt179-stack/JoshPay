import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, Mail } from "lucide-react";

function AddTool({ user, onNavigate }) {
  const [phone, setPhone] = useState(user?.phone || "");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);

  // ==========================================
  // LOAD MSG91
  // ==========================================

  useEffect(() => {
    const tokenAuth = import.meta.env.VITE_MSG91_WIDGET_TOKEN;

    if (!tokenAuth) {
      console.error("MSG91 widget token is missing");
      return;
    }

    const initializeMSG91 = () => {
      if (!window.initSendOTP) {
        console.error("MSG91 initSendOTP not available");
        return;
      }

      window.initSendOTP({
        widgetId: "36697071436d333031313434",
        tokenAuth: tokenAuth,
        identifier: "",
        exposeMethods: true,

        success: (data) => {
          console.log("MSG91 initialized:", data);
        },

        failure: (error) => {
          console.error("MSG91 initialization error:", error);
        },
      });
    };

    if (window.initSendOTP) {
      initializeMSG91();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://verify.msg91.com/otp-provider.js";
    script.async = true;

    script.onload = initializeMSG91;

    script.onerror = () => {
      console.error("MSG91 SDK failed to load");
    };

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  // ==========================================
  // SEND OTP
  // ==========================================

  const handleSendOtp = () => {
    if (!user?.phone) {
      alert("User phone number not found");
      return;
    }

    const registeredPhone = String(user.phone);

    setPhone(registeredPhone);

    if (registeredPhone.length !== 10) {
      alert("Invalid registered phone number");
      return;
    }

    if (!window.sendOtp) {
      alert(
        "MSG91 OTP service is not loaded. Please refresh the page."
      );
      return;
    }

    setSendingOtp(true);
    setOtpSent(false);
    setOtpVerified(false);

    const identifier = `91${registeredPhone}`;

    window.sendOtp(
      identifier,

      (data) => {
        console.log("Mobikwik OTP sent:", data);

        setOtpSent(true);
        setSendingOtp(false);

        alert(`OTP sent to ${registeredPhone}`);
      },

      (error) => {
        console.error("Mobikwik OTP Error:", error);

        setSendingOtp(false);

        alert("Failed to send OTP. Please try again.");
      }
    );
  };

  // ==========================================
  // SAVE WALLET
  // ==========================================

  const saveWallet = async (accessToken) => {
    if (!user?.id) {
      alert("User ID not found. Please login again.");
      return null;
    }

    try {
      const response = await fetch(
        "http://localhost:5000/api/add-mobikwik-wallet",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: user.id,
            phone: phone,
            msg91Token: accessToken,
          }),
        }
      );

      const data = await response.json();

      console.log("Add Mobikwik Response:", data);

      if (!response.ok) {
        alert(
          data.message ||
            "Unable to add Mobikwik wallet"
        );

        return null;
      }

      // IMPORTANT
      // Return wallet received from backend
      return data.wallet || null;

    } catch (error) {
      console.error("Add Mobikwik Error:", error);

      alert(
        "Cannot connect to server. Please make sure backend is running."
      );

      return null;
    }
  };

  // ==========================================
  // VERIFY OTP
  // ==========================================

  const handleVerifyOtp = () => {
    if (!otp) {
      alert("Please enter OTP");
      return;
    }

    if (otp.length !== 4) {
      alert("OTP must be 4 digits");
      return;
    }

    if (!window.verifyOtp) {
      alert(
        "MSG91 OTP service is not loaded. Please refresh the page."
      );
      return;
    }

    setVerifyingOtp(true);

    window.verifyOtp(
      otp,

      async (data) => {
        console.log(
          "Mobikwik OTP verification:",
          data
        );

        // ======================================
        // GET MSG91 ACCESS TOKEN
        // ======================================

        const accessToken =
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

        if (!accessToken) {
          console.error(
            "MSG91 access token not found:",
            data
          );

          setVerifyingOtp(false);

          alert(
            "OTP verified, but verification token was not received."
          );

          return;
        }

        // ======================================
        // SAVE WALLET
        // ======================================

        const wallet = await saveWallet(accessToken);

        if (!wallet) {
          setVerifyingOtp(false);
          return;
        }

        console.log(
          "Wallet saved successfully:",
          wallet
        );

        // ======================================
        // SUCCESS
        // ======================================

        setOtpVerified(true);
        setVerifyingOtp(false);

        alert(
          "Mobikwik wallet added successfully!"
        );

        // IMPORTANT:
        // Send wallet directly to Tool
        onNavigate("tool", {
          mobikwikWallet: true,
          mobikwikPhone:
            wallet.phone || phone,
          mobikwikUpi:
            wallet.upi ||
            `${phone}@mbk`,
        });
      },

      (error) => {
        console.error(
          "Mobikwik OTP verification error:",
          error
        );

        setVerifyingOtp(false);
        setOtpVerified(false);

        alert("Invalid OTP. Please try again.");
      }
    );
  };

  // ==========================================
  // UI
  // ==========================================

  return (
    <div className="min-h-screen bg-[#f5f7fc]">

      {/* HEADER */}

      <div className="relative flex h-[150px] items-end justify-center bg-white pb-6">

        <button
          type="button"
          onClick={() => onNavigate("tool")}
          className="absolute bottom-7 left-6 text-[#15916c]"
        >
          <ArrowLeft
            size={42}
            strokeWidth={1.8}
          />
        </button>

        <h1 className="text-[36px] font-bold text-[#129267]">
          Add Wallet
        </h1>

      </div>

      <div className="mx-auto w-full max-w-[650px] px-6 pt-8">

        <div className="rounded-[25px] bg-white p-6 shadow-sm">

          {/* MOBIKWIK */}

          <div className="flex items-center gap-4">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e7f0ff]">

              <span className="text-[32px] font-extrabold text-[#1857df]">
                M
              </span>

            </div>

            <div>

              <h2 className="text-[27px] font-bold text-[#222]">
                Mobikwik
              </h2>

              <p className="text-[16px] text-gray-500">
                Verify your registered mobile number
              </p>

            </div>

          </div>

          {/* PHONE */}

          <div className="mt-7">

            <label className="text-[18px] font-semibold text-gray-700">
              Mobile Number
            </label>

            <div className="mt-2 flex h-[58px] items-center rounded-xl border border-[#cce7df] bg-[#f7fbf9] px-4">

              <span className="text-[18px] font-bold text-[#15916c]">
                +91
              </span>

              <div className="mx-3 h-7 w-px bg-gray-300" />

              <input
                type="tel"
                value={phone}
                readOnly
                className="w-full bg-transparent text-[19px] font-semibold text-gray-700 outline-none"
              />

            </div>

          </div>

          {/* SEND OTP */}

          {!otpSent && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="mt-5 h-[58px] w-full rounded-full bg-[#129267] text-[20px] font-bold text-white disabled:opacity-60"
            >
              {sendingOtp
                ? "Sending OTP..."
                : "Send OTP"}
            </button>
          )}

          {/* OTP */}

          {otpSent && (
            <>
              <div className="mt-6">

                <label className="text-[18px] font-semibold text-gray-700">
                  OTP Code
                </label>

                <div className="mt-2 flex h-[58px] items-center rounded-xl border border-[#cce7df] bg-white px-4">

                  <Mail
                    size={25}
                    className="text-[#15916c]"
                  />

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => {
                      setOtp(
                        e.target.value.replace(
                          /\D/g,
                          ""
                        )
                      );
                      setOtpVerified(false);
                    }}
                    placeholder="Enter OTP"
                    className="ml-3 w-full text-[19px] outline-none"
                  />

                </div>

              </div>

              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={
                  verifyingOtp ||
                  otpVerified
                }
                className="mt-5 h-[58px] w-full rounded-full bg-[#129267] text-[20px] font-bold text-white disabled:opacity-60"
              >
                {otpVerified
                  ? "✓ OTP Verified"
                  : verifyingOtp
                  ? "Verifying & Adding..."
                  : "Verify OTP"}
              </button>
            </>
          )}

          {/* VERIFIED */}

          {otpVerified && (
            <div className="mt-5 rounded-2xl bg-[#e8f8f1] p-4">

              <div className="flex items-center gap-3">

                <CheckCircle
                  size={30}
                  className="text-[#129267]"
                />

                <div>

                  <p className="font-bold text-[#129267]">
                    Mobikwik Added
                  </p>

                  <p className="text-[15px] text-gray-600">
                    {phone}@mbk
                  </p>

                </div>

              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default AddTool;