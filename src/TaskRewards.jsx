import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

const TaskRewards = ({
  onBack,
  unlocked,
  totalDeposit = 0,
  user,
  onBalanceUpdate,
}) => {
  // =========================================
  // FIXED TASK SETTINGS
  // =========================================
  const target = 500;
  const taskReward = 100;

  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(
    Boolean(user?.taskRewardClaimed)
  );

  const depositAmount = Number(totalDeposit) || 0;

  // =========================================
  // PROGRESS
  // =========================================
  const progress = Math.min(depositAmount, target);

  const isUnlocked =
    Boolean(unlocked) || depositAmount >= target;

  const taskAlreadyClaimed =
    Boolean(user?.taskRewardClaimed) || claimed;

  const progressPercent = taskAlreadyClaimed
    ? 100
    : Math.min((progress / target) * 100, 100);

  const barPercent = Math.min(progressPercent, 100);

  // =========================================
  // UNLOCK / CLAIM REWARD
  // =========================================
  const handleUnlock = async () => {
    if (!isUnlocked) {
      alert("Complete ₹500 total deposit first.");
      return;
    }

    if (taskAlreadyClaimed) {
      return;
    }

    if (claiming) {
      return;
    }

    const userId = user?.id || user?._id;

    if (!userId) {
      alert("User not found. Please login again.");
      return;
    }

    try {
      setClaiming(true);

      const response = await fetch(
        "https://joshpay.onrender.com/api/task-reward/unlock",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to unlock reward"
        );
      }

      // Reward claimed
      setClaimed(true);

      // Update balance
      if (typeof onBalanceUpdate === "function") {
        onBalanceUpdate(Number(data.balance || 0));
      }

      alert(
        `₹${Number(data.reward || taskReward)} reward added to your balance!`
      );
    } catch (error) {
      console.error(
        "Task reward unlock error:",
        error
      );

      alert(
        error.message ||
          "Unable to unlock task reward"
      );
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f3f6fa] pb-5 sm:pb-6">

      {/* ================= HEADER ================= */}

      <div className="h-[58px] sm:h-[70px] bg-white flex items-center justify-center relative shadow-sm">

        <button
          type="button"
          onClick={onBack}
          className="absolute left-3 sm:left-5 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full text-green-600 active:bg-green-50"
        >
          <ArrowLeft
            size={22}
            className="sm:hidden"
          />

          <ArrowLeft
            size={25}
            className="hidden sm:block"
          />
        </button>

        <h1 className="text-[19px] sm:text-[22px] font-bold text-green-600">
          Task Rewards
        </h1>

      </div>

      {/* ================= SUBTITLE ================= */}

      <div className="text-center px-4 py-2 sm:py-3">

        <p className="text-[11px] sm:text-xs text-gray-400">
          Earn tokens by completing tasks
        </p>

      </div>

      {/* ================= TABS ================= */}

      <div className="px-4 sm:px-5 mt-1 sm:mt-2">

        <div className="min-h-[34px] sm:h-9 rounded-full bg-green-50 border border-green-100 flex items-center justify-around gap-1 px-1 text-[9px] sm:text-[11px] font-medium text-green-700">

          <div className="bg-white rounded-full px-3 sm:px-5 py-1.5 shadow-sm whitespace-nowrap">
            Newbie Tasks
          </div>

          <div className="whitespace-nowrap px-1">
            Team Growth
          </div>

          <div className="whitespace-nowrap px-1">
            Daily Tasks
          </div>

        </div>

      </div>

      {/* ================= TASK ================= */}

      <div className="px-4 sm:px-5 mt-3 sm:mt-4">

        <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm p-4 sm:p-5">

          {/* TITLE + PROGRESS */}

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-[9px] sm:text-[10px] font-bold text-green-500">
                • NEWBIE
              </p>

              <h2 className="text-[14px] sm:text-[16px] font-bold text-gray-800 mt-1">
                New Member Tasks
              </h2>

            </div>

            <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 pt-1">

              {/* PROGRESS BAR */}

              <div className="w-[70px] sm:w-[100px] h-[6px] sm:h-[7px] bg-gray-200 rounded-full overflow-hidden">

                <div
                  className="h-full rounded-full transition-all duration-300 bg-green-500"
                  style={{
                    width: `${barPercent}%`,
                  }}
                />

              </div>

              {/* PERCENTAGE */}

              <span className="text-[8px] sm:text-[10px] text-gray-500 min-w-[25px] text-right">
                {Math.round(progressPercent)}%
              </span>

            </div>

          </div>

          {/* DESCRIPTION */}

          <p className="text-[10px] sm:text-[11px] text-gray-500 mt-1.5 leading-4">
            Deposit a total of ₹500 to unlock ₹100.
          </p>

          {/* REWARD + BUTTON */}

          <div className="flex items-center justify-between mt-3 sm:mt-4">

            <div className="flex items-center gap-1.5">

              <div className="w-5 h-5 sm:w-[22px] sm:h-[22px] rounded-full bg-green-600 text-white flex items-center justify-center text-[10px] sm:text-[11px] font-bold">
                +
              </div>

              {/* ALWAYS ₹100 */}
              <span className="text-[15px] sm:text-[17px] font-bold text-gray-700">
                {taskReward}
              </span>

            </div>

            {/* BUTTON */}

            {taskAlreadyClaimed ? (

              <button
                type="button"
                disabled
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-green-600 text-white text-[10px] sm:text-[11px] font-semibold"
              >
                Claimed
              </button>

            ) : isUnlocked ? (

              <button
                type="button"
                onClick={handleUnlock}
                disabled={claiming}
                className={`px-4 sm:px-5 py-1.5 sm:py-2 rounded-full text-white text-[10px] sm:text-[11px] font-semibold transition ${
                  claiming
                    ? "bg-green-300"
                    : "bg-green-500 active:bg-green-600"
                }`}
              >
                {claiming
                  ? "Unlocking..."
                  : "Unlock"}
              </button>

            ) : (

              <button
                type="button"
                disabled
                className="px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-gray-300 text-white text-[10px] sm:text-[11px] font-semibold"
              >
                Locked
              </button>

            )}

          </div>

          {/* CONDITION */}

          <div className="mt-3 sm:mt-4 rounded-lg sm:rounded-xl bg-green-50 p-2.5 sm:p-3">

            <p className="text-[10px] sm:text-[11px] leading-4 text-green-700">

              {taskAlreadyClaimed
                ? "🎉 ₹100 reward has been added to your balance! Progress: 100%"
                : isUnlocked
                ? "🎉 ₹500 completed — tap Unlock to claim ₹100!"
                : `Deposit ₹${Math.max(
                    target - progress,
                    0
                  ).toFixed(0)} more to unlock ₹100.`}

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default TaskRewards;