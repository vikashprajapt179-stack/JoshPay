
import { useEffect, useState } from "react";

function PhoneIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#15916c"
      strokeWidth="1.7"
    >
      <path d="M6.5 3.5l3 1.5-1.8 3.7c1.2 2.4 3.1 4.3 5.5 5.5l3.7-1.8 1.5 3c.4.8.1 1.7-.6 2.1-1.3 2.4-4.2.4-6.7-1.3-2.2-1.5-2.3-5-.9-6.7.4-.7 1.3-1 .2-.3z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#15916c"
      strokeWidth="1.7"
    >
      <rect x="5" y="10" width="14" height="10" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#15916c"
      strokeWidth="1.7"
    >
      <rect x="3" y="5" width="18" height="14" />
      <path d="M3 6l9 7 9-7" />
    </svg>
  );
}

function ResetPassword({ onBack }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [msg91AccessToken, setMsg91AccessToken] = useState("");
  const [msg91Loaded, setMsg91Loaded] = useState(false);

  // ==========================================
  // LOAD MSG91 SDK
  // ==========================================
  useEffect(() => {
    const tokenAuth = import.meta.env.VITE_MSG91_WIDGET_TOKEN;

    if (!tokenAuth) {
      console.error("MSG91 widget token is missing");
      return;
    }

    const initializeMSG91 = () => {
      if (!window.initSendOTP) {
        console.error("MSG91 initSendOTP is not available");
        setMsg91Loaded(false);
        return;
      }

      try {
        window.initSendOTP({
          widgetId: "36697071436d333031313434",
          tokenAuth: tokenAuth,
          identifier: "",
          exposeMethods: true,

          success: (data) => {
            console.log("MSG91 initialized successfully:", data);
          },

          failure: (error) => {
            console.error("MSG91 initialization failure:", error);
          },
        });

        setMsg91Loaded(true);

        console.log("MSG91 OTP service initialized");
        console.log("sendOtp available:", !!window.sendOtp);
        console.log("verifyOtp available:", !!window.verifyOtp);
        console.log("retryOtp available:", !!window.retryOtp);
      } catch (error) {
        console.error("MSG91 initialization error:", error);
        setMsg91Loaded(false);
      }
    };

    // SDK already loaded
    if (window.initSendOTP) {
      initializeMSG91();
      return;
    }

    // Check if script already exists
    const existingScript = document.querySelector(
      'script[src="https://verify.msg91.com/otp-provider.js"]'
    );

    if (existingScript) {
      existingScript.addEventListener("load", initializeMSG91);

      return () => {
        existingScript.removeEventListener("load", initializeMSG91);
      };
    }

    // Load MSG91 SDK
    const script = document.createElement("script");

    script.src = "https://verify.msg91.com/otp-provider.js";
    script.async = true;

    script.onload = () => {
      console.log("MSG91 SDK loaded");
      initializeMSG91();
    };

    script.onerror = (error) => {
      console.error("MSG91 SDK failed to load:", error);
      setMsg91Loaded(false);
    };

    document.body.appendChild(script);

    return () => {
      // Don't remove the SDK script.
      // Keeping it loaded prevents problems when React remounts this page.
    };
  }, []);

  // ==========================================
  // SEND OTP
  // ==========================================
  const handleSendOtp = () => {
    if (!phone) {
      alert("Please enter phone number first");
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter valid 10 digit phone number");
      return;
    }

    if (!window.sendOtp) {
      console.error("MSG91 sendOtp is not available");
      alert("MSG91 OTP service is still loading. Please wait a moment and try again.");
      return;
    }

    setSendingOtp(true);
    setOtpVerified(false);
    setMsg91AccessToken("");

    const identifier = `91${phone}`;

    console.log("Sending Reset OTP to:", identifier);

    window.sendOtp(
      identifier,

      (data) => {
        console.log("Reset OTP sent successfully:", data);

        setOtpSent(true);
        setSendingOtp(false);

        alert("OTP sent successfully to your mobile number");
      },

      (error) => {
        console.error("Reset Send OTP Error:", error);

        setSendingOtp(false);

        alert("Failed to send OTP. Please try again.");
      }
    );
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
      console.error("MSG91 verifyOtp is not available");
      alert("MSG91 OTP service is not loaded. Please refresh the page.");
      return;
    }

    setVerifyingOtp(true);

    window.verifyOtp(
      otp,

      (data) => {
        console.log("Reset OTP verification success:", data);

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

        console.log("MSG91 Reset verification response:", data);

        if (!accessToken) {
          console.error(
            "MSG91 verification token not found:",
            data
          );

          setOtpVerified(false);
          setMsg91AccessToken("");
          setVerifyingOtp(false);

          alert(
            "OTP verified, but MSG91 token was not received."
          );

          return;
        }

        setMsg91AccessToken(accessToken);
        setOtpVerified(true);
        setVerifyingOtp(false);

        alert("OTP verified successfully!");
      },

      (error) => {
        console.error("Reset OTP verification error:", error);

        setVerifyingOtp(false);
        setOtpVerified(false);
        setMsg91AccessToken("");

        alert("Invalid OTP. Please try again.");
      }
    );
  };

  // ==========================================
  // RESEND OTP
  // ==========================================
  const handleResendOtp = () => {
    if (!window.retryOtp) {
      console.error("MSG91 retryOtp is not available");
      alert("MSG91 OTP service is not loaded. Please refresh the page.");
      return;
    }

    window.retryOtp(
      11,

      (data) => {
        console.log("Reset OTP resend successful:", data);

        setOtp("");
        setOtpVerified(false);
        setMsg91AccessToken("");

        alert("OTP resent successfully");
      },

      (error) => {
        console.error("Reset OTP resend error:", error);

        alert("Failed to resend OTP");
      }
    );
  };

  // ==========================================
  // RESET PASSWORD
  // ==========================================
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!phone || !password || !otp) {
      alert("Please fill all fields");
      return;
    }

    if (!otpSent) {
      alert("Please send OTP first");
      return;
    }

    if (!otpVerified) {
      alert("Please verify OTP first");
      return;
    }

    if (!msg91AccessToken) {
      alert(
        "OTP verification token is missing. Please verify OTP again."
      );
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/reset-password",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            phone: phone,
            password: password,
            msg91Token: msg91AccessToken,
          }),
        }
      );

      const data = await response.json();

      console.log("Reset Password Response:", data);

      if (!response.ok) {
        alert(data.message || "Password reset failed");
        return;
      }

      alert(
        "Password Reset Successful! Please login with your new password."
      );

      setPhone("");
      setPassword("");
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setMsg91AccessToken("");

      onBack();
    } catch (error) {
      console.error("Reset Password Error:", error);

      alert("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // UI
  // ==========================================
  return (
    <div className="min-h-screen bg-[#f5f7fc]">

      {/* Header */}
      <div className="relative flex h-[168px] items-end justify-center bg-white pb-6">
        <button
          type="button"
          onClick={onBack}
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
          Reset Password
        </h1>
      </div>

      {/* Form */}
      <div className="mx-auto w-full max-w-[720px] px-8 pt-9">
        <form onSubmit={handleResetPassword}>

          {/* Phone */}
          <div className="flex h-[91px] items-center rounded-[27px] border-2 border-[#cce7df] bg-white px-10">
            <PhoneIcon />

            <span className="ml-7 text-[29px] font-bold text-[#15916c]">
              +91
            </span>

            <div className="mx-4 h-9 w-[2px] bg-[#d2d9df]" />

            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              maxLength={10}
              disabled={otpSent}
              onChange={(e) => {
                setPhone(
                  e.target.value.replace(/\D/g, "")
                );

                setOtpSent(false);
                setOtpVerified(false);
                setMsg91AccessToken("");
              }}
              className="w-full text-[29px] text-[#15916c] outline-none placeholder:text-[#15916c] disabled:bg-transparent"
            />
          </div>

          {/* New Password */}
          <div className="mt-6 flex h-[91px] items-center rounded-[27px] border-2 border-[#cce7df] bg-white px-10">
            <LockIcon />

            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ml-7 w-full text-[29px] text-[#15916c] outline-none placeholder:text-[#15916c]"
            />
          </div>

          {/* OTP */}
          <div className="mt-6 flex h-[91px] items-center rounded-[27px] border-2 border-[#cce7df] bg-white px-10">
            <MailIcon />

            <input
              type="text"
              placeholder="OTP Code"
              value={otp}
              maxLength={4}
              onChange={(e) => {
                setOtp(
                  e.target.value.replace(/\D/g, "")
                );

                setOtpVerified(false);
                setMsg91AccessToken("");
              }}
              className="ml-7 min-w-0 flex-1 text-[29px] text-[#15916c] outline-none placeholder:text-[#15916c]"
            />

            {!otpSent ? (
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="h-[56px] rounded-[11px] bg-[#7abfa9] px-6 text-[24px] font-bold text-white disabled:opacity-60"
              >
                {sendingOtp ? "Sending..." : "Send"}
              </button>
            ) : !otpVerified ? (
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={
                  verifyingOtp ||
                  otp.length !== 4
                }
                className="h-[56px] rounded-[11px] bg-[#129267] px-6 text-[24px] font-bold text-white disabled:opacity-60"
              >
                {verifyingOtp ? "Checking..." : "Verify"}
              </button>
            ) : (
              <span className="text-[22px] font-bold text-[#129267]">
                ✓ Verified
              </span>
            )}
          </div>

          {/* Resend */}
          {otpSent && !otpVerified && (
            <div className="mt-3 text-right">
              <button
                type="button"
                onClick={handleResendOtp}
                className="text-[20px] font-semibold text-[#129267]"
              >
                Resend OTP
              </button>
            </div>
          )}

          {/* Reset Password */}
          <button
            type="submit"
            disabled={loading}
            className="mt-14 h-[91px] w-full rounded-full bg-[#129267] text-[34px] font-bold text-white shadow-md disabled:opacity-60"
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

        </form>
      </div>
    </div>
  );
}

export default ResetPassword;
