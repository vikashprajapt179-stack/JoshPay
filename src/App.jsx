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
      width="26"
      height="26"
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
      width="26"
      height="26"
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
      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 text-sm font-bold sm:h-7 sm:w-7 sm:text-lg ${
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
  // CONSTANTS
  // ==================================================

 const TASK_TARGET = 500;
const TASK_REWARD = 100;
const SIGNUP_BALANCE = 150;

  // ==================================================
  // ADMIN PANEL
  // ==================================================

  const isAdminPage =
    window.location.pathname === "/admin";

  // ==================================================
  // SAVED LOGIN
  // ==================================================

  const savedUser =
    localStorage.getItem("okpayUser");

  const savedToken =
    localStorage.getItem("okpayToken");

  const savedRemember =
    localStorage.getItem("okpayRemember");

  // ==================================================
  // PAGE
  // ==================================================

  const [page, setPage] = useState(
    savedUser &&
      savedToken &&
      savedRemember === "true"
      ? "home"
      : "login"
  );

  // ==================================================
  // USER
  // ==================================================

  const [user, setUser] = useState(() => {
    if (
      savedUser &&
      savedRemember === "true"
    ) {
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
  const savedWallet = localStorage.getItem("okpayWallet");

  if (savedWallet !== null) {
    return Number(savedWallet);
  }

  return Number(user?.balance ?? SIGNUP_BALANCE);
});
  // ==================================================
  // TASK
  // ==================================================

  const [taskUnlocked, setTaskUnlocked] =
    useState(
      localStorage.getItem(
        "taskUnlocked"
      ) === "true"
    );

  // ==================================================
  // SELECTED ORDER
  // ==================================================

  const [selectedOrder, setSelectedOrder] =
    useState(null);

  // ==================================================
  // LOGIN STATES
  // ==================================================

  const [phone, setPhone] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [remember, setRemember] =
    useState(true);

  const [privacy, setPrivacy] =
    useState(true);

  const [loading, setLoading] =
    useState(false);

  // ==================================================
  // LOGIN
  // ==================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!phone || !password) {
      alert(
        "Please enter Phone and Password"
      );
      return;
    }

    if (phone.length !== 10) {
      alert(
        "Please enter valid 10 digit phone number"
      );
      return;
    }

    if (!privacy) {
      alert(
        "Please agree to User Privacy Agreement"
      );
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        "https://joshpay.onrender.com/api/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            phone: phone,
            password: password,
          }),
        }
      );

      const data =
        await response.json();

      console.log(
        "Login Response:",
        data
      );

      if (!response.ok) {
        alert(
          data.message ||
            "Invalid phone or password"
        );
        return;
      }

      // SAVE USER + BALANCE
     if (data.user) {
  const serverBalance = Number(
    data.user.balance ?? SIGNUP_BALANCE
  );

  const updatedUser = {
    ...data.user,

    taskReward:
      data.user.taskReward ?? TASK_REWARD,

    taskTarget:
      data.user.taskTarget ?? TASK_TARGET,
  };

  setUser(updatedUser);
  setWallet(serverBalance);

  localStorage.setItem(
    "okpayUser",
    JSON.stringify(updatedUser)
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
  } else {
    setTaskUnlocked(false);

    localStorage.removeItem(
      "taskUnlocked"
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
        remember
          ? "true"
          : "false"
      );

      alert(
        "Login successful!"
      );

      setPage("home");
    } catch (error) {
      console.error(
        "Login Error:",
        error
      );

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
    localStorage.removeItem(
      "okpayUser"
    );

    localStorage.removeItem(
      "okpayToken"
    );

    localStorage.removeItem(
      "okpayRemember"
    );

    localStorage.removeItem(
      "okpayWallet"
    );

    localStorage.removeItem(
      "taskUnlocked"
    );

    setUser(null);

    setPhone("");

    setPassword("");

    setWallet(
      SIGNUP_BALANCE
    );

    setTaskUnlocked(false);

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
    if (
      destination === "order"
    ) {
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
          mobikwikPhone:
            data.mobikwikPhone,
          mobikwikUpi:
            data.mobikwikUpi,
        };

        localStorage.setItem(
          "okpayUser",
          JSON.stringify(
            updatedUser
          )
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

  /*
    Task requirement:
    Total deposit target = ₹500

    Backend totalDeposit ko track karta hai.
    Frontend sirf state sync karta hai.
  */

  if (orderAmount >= TASK_TARGET) {
    setTaskUnlocked(true);

    localStorage.setItem(
      "taskUnlocked",
      "true"
    );

    setUser((prev) => {
      if (!prev) return prev;

      const updatedUser = {
        ...prev,

        taskReward:
          prev.taskReward ?? TASK_REWARD,

        taskTarget:
          prev.taskTarget ?? TASK_TARGET,

        taskRewardUnlocked: true,
      };

      localStorage.setItem(
        "okpayUser",
        JSON.stringify(updatedUser)
      );

      return updatedUser;
    });

    alert(
      `🎉 ₹${TASK_TARGET} deposit completed!\n\nTask Unlocked!\n₹${TASK_REWARD} reward available.`
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
              className="h-[200px] w-[200px] object-contain sm:h-[300px] sm:w-[300px]"
            />
          </div>

          {/* LOGIN FORM */}
          <form
            onSubmit={handleLogin}
            className="mt-8 sm:mt-24"
          >

            {/* PHONE */}
            <div className="flex h-[56px] items-center rounded-full border-2 border-[#d8eee7] bg-white px-4 sm:h-[85px] sm:px-8">

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
                className="ml-3 min-w-0 w-full bg-transparent text-[16px] outline-none placeholder:text-[#cecece] sm:ml-6 sm:text-[36px]"
              />

            </div>

            {/* PASSWORD */}
            <div className="mt-4 flex h-[56px] items-center rounded-full border-2 border-[#d8eee7] bg-white px-4 sm:mt-7 sm:h-[85px] sm:px-8">

              <LockIcon />

              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) =>
                  setPassword(
                    e.target.value
                  )
                }
                className="ml-3 min-w-0 w-full bg-transparent text-[16px] outline-none placeholder:text-[#cecece] sm:ml-6 sm:text-[36px]"
              />

            </div>

            {/* REGISTER / REMEMBER */}
            <div className="mt-5 flex items-center justify-between px-1 text-[15px] text-[#168c6b] sm:mt-7 sm:px-2 sm:text-[24px]">

              <button
                type="button"
                className="underline"
                onClick={() =>
                  setPage(
                    "register"
                  )
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
            <div className="mt-8 flex justify-center sm:mt-16">

              <label className="flex cursor-pointer items-center text-[14px] text-[#168c6b] sm:text-[23px]">

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
              className="mt-5 h-[54px] w-full rounded-full bg-[#129267] text-[19px] font-bold text-white shadow-md disabled:opacity-70 sm:h-[88px] sm:text-[35px]"
            >
              {loading
                ? "Signing In..."
                : "Sign In"}
            </button>

            {/* FORGOT PASSWORD */}
            <div className="mt-24 text-center">

              <button
                type="button"
                className="text-[16px] text-[#168c6b] underline sm:text-[24px]"
                onClick={() =>
                  setPage(
                    "reset"
                  )
                }
              >
                Forget Password
              </button>

            </div>

          </form>

          <div className="mt-16 pb-5 text-right text-[13px] text-[#8793a5] sm:mt-48 sm:text-[20px]">
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
        onNavigate={
          handleNavigation
        }
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
        onNavigate={
          handleNavigation
        }
        onPaymentSuccess={
          handlePaymentSuccess
        }
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
        onNavigate={
          handleNavigation
        }
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
  unlocked={
    Boolean(taskUnlocked) ||
    Boolean(user?.taskRewardUnlocked)
  }
  totalDeposit={
    Number(user?.totalDeposit || 0)
  }
  reward={
    Number(
      user?.taskReward ?? TASK_REWARD
    )
  }
  onBalanceUpdate={(newBalance) => {
    const balance = Number(newBalance || 0);

    setWallet(balance);

    setUser((prev) => {
      if (!prev) return prev;

      const updatedUser = {
        ...prev,
        balance: balance,

        taskReward:
          Number(
            prev.taskReward ?? TASK_REWARD
          ),

        taskTarget:
          Number(
            prev.taskTarget ?? TASK_TARGET
          ),

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
      String(balance)
    );

    setTaskUnlocked(true);

    localStorage.setItem(
      "taskUnlocked",
      "true"
    );
  }}
  onBack={() => setPage("home")}
/>
    );
  }

  // ==================================================
  // PIN
  // ==================================================

  if (page === "pin") {
    return (
      <Pin
        onNavigate={
          handleNavigation
        }
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
        onNavigate={
          handleNavigation
        }
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
        onNavigate={
          handleNavigation
        }
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
        onNavigate={
          handleNavigation
        }
      />
    );
  }

  // ==================================================
  // TEAM
  // ==================================================

  if (page === "team") {
    return (
      <Team
        onNavigate={
          handleNavigation
        }
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
        onNavigate={
          handleNavigation
        }
      />
    );
  }

  // ==================================================
  // SERVICE
  // ==================================================

  if (page === "service") {
    return (
      <Service
        onNavigate={
          handleNavigation
        }
      />
    );
  }

  return null;
}

export default App;