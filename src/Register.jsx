import { useEffect, useState } from "react";

function UserIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#15916c"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="8" r="3" />
      <path d="M5 21c0-4 3-6 7-6s7 2 7 6" />
      <circle cx="12" cy="12" r="9" />
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
      <path d="M6.5 3.5l3 1.5-1.8 3.7c1.2 2.4 3.1 4.3 5.5 5.5l3.7-1.8 1.5 3c.4.8.1 1.7-.6 2.1-1.7 1-4.2.4-6.7-1.3-2.2-1.5-4.2-3.5-.9-6.7.4-.7 1.3-1 .2-.3z" />
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

function LinkIcon() {
  return (
    <svg
      width="40"
      height="40"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#15916c"
      strokeWidth="1.7"
    >
      <path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.2 1.2" />
      <path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 7 20l1.2-1.2" />
    </svg>
  );
}

function Register({ onBack }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [inviteCode, setInviteCode] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);

  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [loading, setLoading] = useState(false);

  const [msg91AccessToken, setMsg91AccessToken] = useState("");

  // ==========================================
  // LOAD MSG91 SDK
  // ==========================================

  useEffect(() => {
    const tokenAuth = import.meta.env.VITE_MSG91_WIDGET_TOKEN;

    if (!tokenAuth) {
      console.error("MSG91 widget token is missing");
      return;
    }

    if (window.initSendOTP) {
      initializeMSG91();
      return;
    }

    const script = document.createElement("script");

    script.src = "https://verify.msg91.com/otp-provider.js";
    script.async = true;

    script.onload = () => {
      initializeMSG91();
    };

    script.onerror = () => {
      console.error("MSG91 SDK failed to load");
    };

    document.body.appendChild(script);

    function initializeMSG91() {
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
          console.log("MSG91 success:", data);
        },

        failure: (error) => {
          console.error("MSG91 failure:", error);
        },
      });
    }

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
    if (!phone) {
      alert("Please enter phone number first");
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter valid 10 digit phone number");
      return;
    }

    if (!window.sendOtp) {
      alert("MSG91 OTP service is not loaded. Please refresh the page.");
      return;
    }

    setSendingOtp(true);
    setOtpVerified(false);
    setMsg91AccessToken("");

    const identifier = `91${phone}`;

    window.sendOtp(
      identifier,

      (data) => {
        console.log("OTP sent successfully:", data);

        setOtpSent(true);
        setSendingOtp(false);

        alert("OTP sent successfully to your mobile number");
      },

      (error) => {
        console.error("Send OTP Error:", error);

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
      alert("MSG91 OTP service is not loaded. Please refresh the page.");
      return;
    }

    setVerifyingOtp(true);

    window.verifyOtp(
      otp,

      (data) => {
        console.log("OTP verification success:", data);

        // IMPORTANT:
        // MSG91 is returning the access token inside data.message
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

        console.log("MSG91 TOKEN DATA:", data);

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

        console.log("MSG91 Access Token received");

        setMsg91AccessToken(accessToken);
        setOtpVerified(true);
        setVerifyingOtp(false);

        alert("OTP verified successfully!");
      },

      (error) => {
        console.error("OTP verification error:", error);

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
      alert("MSG91 OTP service is not loaded. Please refresh the page.");
      return;
    }

    // MSG91 requires a retry channel.
    // SMS is the configured primary channel.
    window.retryOtp(
      "SMS",

      (data) => {
        console.log("OTP resend successful:", data);

        setOtp("");
        setOtpVerified(false);
        setMsg91AccessToken("");

        alert("OTP resent successfully");
      },

      (error) => {
        console.error("OTP resend error:", error);

        alert("Failed to resend OTP");
      }
    );
  };

  // ==========================================
  // SIGN UP
  // ==========================================

  const handleSignUp = async (e) => {
    e.preventDefault();

    if (!name || !password || !phone) {
      alert("Please fill all required fields");
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

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/api/register",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            username: name,
            phone: phone,
            password: password,
            inviteCode: inviteCode,
            msg91Token: msg91AccessToken,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Registration successful!");

        setName("");
        setPassword("");
        setPhone("");
        setOtp("");
        setInviteCode("");

        setOtpSent(false);
        setOtpVerified(false);
        setMsg91AccessToken("");

        onBack();
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Register Error:", error);

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
          Register
        </h1>
      </div>

      {/* Form */}

      <div className="mx-auto w-full max-w-[720px] px-8 pt-6">

        <form onSubmit={handleSignUp}>

          {/* User Name */}

          <div className="flex h-[91px] items-center rounded-[27px] border-2 border-[#cce7df] bg-white px-10">

            <UserIcon />

            <input
              type="text"
              placeholder="User Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="ml-7 w-full text-[29px] outline-none placeholder:text-[#98a8bb]"
            />

          </div>

          {/* Password */}

          <div className="mt-6 flex h-[91px] items-center rounded-[27px] border-2 border-[#cce7df] bg-white px-10">

            <LockIcon />

            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ml-7 w-full text-[29px] outline-none placeholder:text-[#98a8bb]"
            />

          </div>

          {/* Phone */}

          <div className="mt-6 flex h-[91px] items-center rounded-[27px] border-2 border-[#cce7df] bg-white px-10">

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
              onChange={(e) => {
                setPhone(
                  e.target.value.replace(/\D/g, "")
                );

                setOtpSent(false);
                setOtpVerified(false);
                setMsg91AccessToken("");
              }}
              className="w-full text-[29px] outline-none placeholder:text-[#98a8bb]"
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
              className="ml-7 min-w-0 flex-1 text-[29px] outline-none placeholder:text-[#98a8bb]"
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
            ) : (
              <button
                type="button"
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otpVerified}
                className="h-[56px] rounded-[11px] bg-[#129267] px-6 text-[24px] font-bold text-white disabled:opacity-60"
              >
                {otpVerified
                  ? "Verified"
                  : verifyingOtp
                  ? "Checking..."
                  : "Verify"}
              </button>
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

          {/* Invite Code */}

          <div className="mt-6 flex h-[91px] items-center rounded-[27px] border-2 border-[#cce7df] bg-white px-10">

            <LinkIcon />

            <input
              type="text"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) =>
                setInviteCode(e.target.value)
              }
              className="ml-7 w-full text-[29px] outline-none placeholder:text-[#98a8bb]"
            />

          </div>

          {/* Sign Up */}

          <button
            type="submit"
            disabled={loading}
            className="mt-9 h-[91px] w-full rounded-full bg-[#129267] text-[34px] font-bold text-white shadow-md disabled:opacity-60"
          >
            {loading
              ? "Creating Account..."
              : "Sign Up"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default Register;