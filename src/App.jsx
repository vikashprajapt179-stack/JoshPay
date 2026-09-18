import { useState } from "react";

import Register from "./Register";
import ResetPassword from "./ResetPassword";
import Home from "./home";
import Payment from "./Payment";
import My from "./My";
import Pin from "./Pin";
import Statistics from "./Statistics";
import Tool from "./Tool";
import Team from "./Team";
import TaskRewards from "./TaskRewards";
import Order from "./Order";
import AddTool from "./AddTool";
import Service from "./Service";
import AdminPanel from "./AdminPanel";

function UserIcon() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#333"
      strokeWidth="1.8"
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
      width="38"
      height="38"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#333"
      strokeWidth="1.8"
    >
      <rect x="5" y="10" width="14" height="10" rx="1" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function CheckIcon({ checked }) {
  return (
    <span
      className={`flex h-7 w-7 items-center justify-center rounded-full border-2 text-lg font-bold ${
        checked
          ? "border-[#7acb61] bg-[#7acb61] text-white"
          : "border-[#999] bg-white text-transparent"
      }`}
    >
      ✓
    </span>
  );
}

function App() {
  // ==================================================
  // ADMIN PANEL
  // ==================================================

  const isAdminPage = window.location.pathname === "/admin";

  // ==================================================
  // SAVED LOGIN
  // ==================================================

  const savedUser = localStorage.getItem("okpayUser");
  const savedToken = localStorage.getItem("okpayToken");
  const savedRemember = localStorage.getItem("okpayRemember");

  const [page, setPage] = useState(
    savedUser &&
      savedToken &&
      savedRemember === "true"
      ? "home"
      : "login"
  );

  const [user, setUser] = useState(() => {
    if (savedUser && savedRemember === "true") {
      try {
        return JSON.parse(savedUser);
      } catch {
        return null;
      }
    }
    return null;
  });

  // ==================================================
  // WALLET
  // ==================================================

  const [wallet, setWallet] = useState(() => {
    const savedWallet =
      localStorage.getItem("okpayWallet");

    if (savedWallet !== null) {
      return Number(savedWallet);
    }

    return Number(user?.balance ?? 200);
  });

  // ==================================================
  // TASK
  // ==================================================

  const [taskUnlocked, setTaskUnlocked] = useState(
    localStorage.getItem("taskUnlocked") === "true"
  );

  // ==================================================
  // SELECTED ORDER
  // ==================================================

  const [selectedOrder, setSelectedOrder] = useState(null);

  // ==================================================
  // LOGIN STATES
  // ==================================================

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [privacy, setPrivacy] = useState(true);
  const [loading, setLoading] = useState(false);

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      alert("Please enter Phone and Password");
      return;
    }

    if (phone.length !== 10) {
      alert("Please enter valid 10 digit phone number");
      return;
    }

    if (!privacy) {
      alert("Please agree to User Privacy Agreement");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            phone: phone,
            password: password,
          }),
        }
      );

      const data = await response.json();

      console.log("Login Response:", data);

      if (!response.ok) {
        alert(
          data.message ||
            "Invalid phone or password"
        );
        return;
      }

      // SAVE USER + BALANCE
      if (data.user) {
        setUser(data.user);

        const serverBalance = Number(
          data.user.balance ?? 200
        );

        setWallet(serverBalance);

        localStorage.setItem(
          "okpayUser",
          JSON.stringify(data.user)
        );

        localStorage.setItem(
          "okpayWallet",
          String(serverBalance)
        );

        if (data.user.taskRewardUnlocked) {
          setTaskUnlocked(true);

          localStorage.setItem(
            "taskUnlocked",
            "true"
          );
        }
      }

      // SAVE TOKEN
      if (data.token) {
        localStorage.setItem(
          "okpayToken",
          data.token
        );
      }

      // REMEMBER LOGIN
      localStorage.setItem(
        "okpayRemember",
        remember ? "true" : "false"
      );

      alert("Login successful!");

      setPage("home");
    } catch (error) {
      console.error("Login Error:", error);

      alert(
        "Cannot connect to server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==================================================
  // LOGOUT
  // ==================================================

  const handleLogout = () => {
    localStorage.removeItem("okpayUser");
    localStorage.removeItem("okpayToken");
    localStorage.removeItem("okpayRemember");

    setUser(null);
    setPhone("");
    setPassword("");
    setPage("login");
  };

  // ==================================================
  // NAVIGATION
  // ==================================================

  const handleNavigation = (
    destination,
    data = null
  ) => {
    // ORDER
    if (destination === "order") {
      setSelectedOrder(data);
    }

    // TOOL / MOBIKWIK WALLET
    if (
      destination === "tool" &&
      data?.mobikwikWallet
    ) {
      setUser((prev) => {
        const updatedUser = {
          ...prev,
          mobikwikWallet: true,
          mobikwikPhone: data.mobikwikPhone,
          mobikwikUpi: data.mobikwikUpi,
        };

        localStorage.setItem(
          "okpayUser",
          JSON.stringify(updatedUser)
        );

        return updatedUser;
      });
    }

    setPage(destination);
  };

  // ==================================================
  // PAYMENT SUCCESS
  // ==================================================

  const handlePaymentSuccess = (amount) => {
    const orderAmount = Number(amount);

    if (orderAmount === 2000) {
      setTaskUnlocked(true);

      localStorage.setItem(
        "taskUnlocked",
        "true"
      );

      alert(
        "🎉 ₹2000 single order completed!\n\nTask Unlocked!\n300 Tokens unlocked."
      );

      setPage("home");
    }
  };

  // ==================================================
  // ADMIN PANEL
  // ==================================================

  if (isAdminPage) {
    return <AdminPanel />;
  }

  // ==================================================
  // LOGIN PAGE
  // ==================================================

  if (page === "login") {
    return (
      <div className="min-h-screen bg-[#f5f7fc]">
        <div className="mx-auto min-h-screen w-full max-w-[720px] px-8">

          {/* LOGO */}
          <div className="flex justify-center pt-9">
            <img
              src="/logo.png"
              alt="Josh pay"
              className="h-[345px] w-[345px] object-contain"
            />
          </div>

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-24"
          >

            {/* PHONE */}
            <div className="flex h-[85px] items-center rounded-full border-2 border-[#d8eee7] bg-white px-8">

              <UserIcon />

              <input
                type="tel"
                placeholder="Phone"
                value={phone}
                maxLength={10}
                onChange={(e) =>
                  setPhone(
                    e.target.value.replace(
                      /\D/g,
                      ""
                    )
                  )
                }
                className="ml-6 w-full bg-transparent text-[36px] outline-none placeholder:text-[#cecece]"
              />

            </div>

            {/* PASSWORD */}
            <div className="mt-7 flex h-[85px] items-center rounded-full border-2 border-[#d8eee7] bg-white px-8">

              <LockIcon />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                className="ml-6 w-full bg-transparent text-[36px] outline-none placeholder:text-[#cecece]"
              />

            </div>

            {/* REGISTER / REMEMBER */}
            <div className="mt-7 flex items-center justify-between px-2 text-[24px] text-[#168c6b]">

              <button
                type="button"
                className="underline"
                onClick={() =>
                  setPage("register")
                }
              >
                Register
              </button>

              <label className="flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) =>
                    setRemember(
                      e.target.checked
                    )
                  }
                  className="sr-only"
                />

                <CheckIcon
                  checked={remember}
                />

                <span>
                  Remember Me
                </span>

              </label>

            </div>

            {/* PRIVACY */}
            <div className="mt-16 flex justify-center">

              <label className="flex cursor-pointer items-center text-[23px] text-[#168c6b]">

                <input
                  type="checkbox"
                  checked={privacy}
                  onChange={(e) =>
                    setPrivacy(
                      e.target.checked
                    )
                  }
                  className="sr-only"
                />

                <CheckIcon
                  checked={privacy}
                />

                <span className="ml-3">
                  Agree "
                  <span className="underline">
                    User Privacy Agreement
                  </span>
                  "
                </span>

              </label>

            </div>

            {/* LOGIN BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 h-[88px] w-full rounded-full bg-[#129267] text-[35px] font-bold text-white shadow-md disabled:opacity-70"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

            {/* FORGOT PASSWORD */}
            <div className="mt-24 text-center">

              <button
                type="button"
                className="text-[24px] text-[#168c6b] underline"
                onClick={() =>
                  setPage("reset")
                }
              >
                Forget Password
              </button>

            </div>

          </form>

          <div className="mt-48 pb-5 text-right text-[20px] text-[#8793a5]">
            v1.0.2
          </div>

        </div>
      </div>
    );
  }

  // ==================================================
  // REGISTER
  // ==================================================

  if (page === "register") {
    return (
      <Register
        onBack={() =>
          setPage("login")
        }
      />
    );
  }

  // ==================================================
  // RESET PASSWORD
  // ==================================================

  if (page === "reset") {
    return (
      <ResetPassword
        onBack={() =>
          setPage("login")
        }
      />
    );
  }

  // ==================================================
  // HOME
  // ==================================================

  if (page === "home") {
    return (
      <Home
        user={user}
        wallet={wallet}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // PAYMENT
  // ==================================================

  if (page === "payment") {
    return (
      <Payment
        user={user}
        wallet={wallet}
        onNavigate={handleNavigation}
        onPaymentSuccess={handlePaymentSuccess}
        onOpenOrder={(order) => {
          setSelectedOrder(order);
          setPage("order");
        }}
      />
    );
  }

  // ==================================================
  // ORDER
  // ==================================================

  if (page === "order") {
    return (
      <Order
        user={user}
        order={selectedOrder}
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // TASK
  // ==================================================

  if (page === "task") {
    return (
      <TaskRewards
        user={user}
        unlocked={taskUnlocked}
        totalDeposit={user?.totalDeposit || 0}
        reward={user?.taskReward || 300}
        onBalanceUpdate={(newBalance) => {

          setWallet(newBalance);

          setUser((prev) => {
            const updatedUser = {
              ...prev,
              balance: newBalance,
              taskRewardClaimed: true,
              taskRewardUnlocked: true,
            };

            localStorage.setItem(
              "okpayUser",
              JSON.stringify(updatedUser)
            );

            return updatedUser;
          });

          localStorage.setItem(
            "okpayWallet",
            String(newBalance)
          );

          setTaskUnlocked(true);

          localStorage.setItem(
            "taskUnlocked",
            "true"
          );
        }}
        onBack={() =>
          setPage("home")
        }
      />
    );
  }

  // ==================================================
  // PIN
  // ==================================================

  if (page === "pin") {
    return (
      <Pin
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // MY
  // ==================================================

  if (page === "my") {
    return (
      <My
        user={user}
        onLogout={handleLogout}
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // TOOL
  // ==================================================

  if (page === "tool") {
    return (
      <Tool
        user={user}
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // STATISTICS
  // ==================================================

  if (page === "statistics") {
    return (
      <Statistics
        user={user}
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // TEAM
  // ==================================================

  if (page === "team") {
    return (
      <Team
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // ADD TOOL
  // ==================================================

  if (page === "add-tool") {
    return (
      <AddTool
        user={user}
        onNavigate={handleNavigation}
      />
    );
  }

  // ==================================================
  // SERVICE
  // ==================================================

  if (page === "service") {
    return (
      <Service
        onNavigate={handleNavigation}
      />
    );
  }

  return null;
}

export default App;