import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";

const TaskRewards = ({
  onBack,
  unlocked,
  totalDeposit = 0,
  reward = 300,
  user,
  onBalanceUpdate,
}) => {
  const target = 1000;

  const [claiming, setClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const depositAmount = Number(totalDeposit) || 0;

  const progress = Math.min(depositAmount, target);

  const isUnlocked =
    Boolean(unlocked) || depositAmount >= target;

  const taskAlreadyClaimed =
    Boolean(user?.taskRewardClaimed) || claimed;

  // Claim hone ke baad percentage 1000%
  const progressPercent = taskAlreadyClaimed
    ? 1000
    : (progress / target) * 100;

  // Progress bar ke liye maximum 100%
  const barPercent = Math.min(progressPercent, 100);

  const handleUnlock = async () => {
    if (!isUnlocked) {
      return;
    }

    if (taskAlreadyClaimed) {
      return;
    }

    if (claiming) {
      return;
    }

    const userId =
      user?.id || user?._id;

    if (!userId) {
      alert("User not found. Please login again.");
      return;
    }

    try {
      setClaiming(true);

      const response = await fetch(
        "http://localhost:5000/api/task-reward/unlock",
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

      // Reward successfully claimed
      setClaimed(true);

      // Update balance in parent/Home/Payment
      if (typeof onBalanceUpdate === "function") {
        onBalanceUpdate(
          Number(data.balance || 0)
        );
      }

      alert(
        `₹${Number(
          data.reward || reward
        )} reward added to your balance!`
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
    <div className="min-h-screen bg-[#f3f6fa] pb-6">

      {/* Header */}
      <div className="h-[58px] bg-white flex items-center justify-center relative">

        <button
          onClick={onBack}
          className="absolute left-4 text-green-600"
        >
          <ArrowLeft size={24} />
        </button>

        <h1 className="text-xl font-bold text-green-600">
          Task Rewards
        </h1>

      </div>

      {/* Subtitle */}
      <div className="text-center py-2">

        <p className="text-xs text-gray-400">
          Earn tokens by completing tasks
        </p>

      </div>

      {/* Tabs */}
      <div className="px-5 mt-2">

        <div className="h-8 rounded-full bg-green-50 border border-green-100 flex items-center justify-around text-[10px] font-medium text-green-700">

          <div className="bg-white rounded-full px-5 py-1.5 shadow-sm">
            Newbie Tasks
          </div>

          <div>
            Team Growth
          </div>

          <div>
            Daily Tasks
          </div>

        </div>

      </div>

      {/* Task */}
      <div className="px-5 mt-4">

        <div className="bg-white rounded-xl shadow-sm p-4">

          {/* Title + Progress */}
          <div className="flex items-center justify-between">

            <div>

              <p className="text-[10px] font-bold text-green-500">
                • NEWBIE
              </p>

              <h2 className="text-sm font-bold text-gray-800 mt-1">
                New Member Tasks
              </h2>

            </div>

            <div className="flex items-center gap-2">

              {/* Progress Bar */}
              <div className="w-[88px] h-[7px] bg-gray-200 rounded-full overflow-hidden">

                <div
                  className={`h-full rounded-full ${
                    isUnlocked
                      ? "bg-green-500"
                      : "bg-gray-300"
                  }`}
                  style={{
                    width: `${barPercent}%`,
                  }}
                />

              </div>

              {/* Percentage */}
              <span className="text-[9px] text-gray-500">
                {taskAlreadyClaimed
                  ? "1000%"
                  : `${Math.round(progressPercent)}%`}
              </span>

            </div>

          </div>

          {/* Description */}
          <p className="text-[10px] text-gray-500 mt-1 leading-4">
            Deposit a total of ₹1000 to unlock 300 tokens.
          </p>

          {/* Reward */}
          <div className="flex items-center justify-between mt-3">

            <div className="flex items-center gap-1">

              <div className="w-4 h-4 rounded-full bg-green-600 text-white flex items-center justify-center text-[9px] font-bold">
                +
              </div>

              <span className="text-sm font-bold text-gray-700">
                {reward}
              </span>

            </div>

            {/* BUTTON */}

            {taskAlreadyClaimed ? (

              <button
                type="button"
                disabled
                className="px-5 py-1.5 rounded-full bg-green-600 text-white text-[10px] font-semibold"
              >
                Claimed
              </button>

            ) : isUnlocked ? (

              <button
                type="button"
                onClick={handleUnlock}
                disabled={claiming}
                className={`px-5 py-1.5 rounded-full text-white text-[10px] font-semibold ${
                  claiming
                    ? "bg-green-300"
                    : "bg-green-500"
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
                className="px-5 py-1.5 rounded-full bg-gray-300 text-white text-[10px] font-semibold"
              >
                Locked
              </button>

            )}

          </div>

          {/* Condition */}
          <div className="mt-3 rounded-lg bg-green-50 p-2">

            <p className="text-[10px] text-green-700">

              {taskAlreadyClaimed
                ? "🎉 ₹300 reward has been added to your balance! Progress: 1000%"
                : isUnlocked
                ? "🎉 ₹1000 completed — tap Unlock to claim ₹300!"
                : `Deposit ₹${(
                    target - progress
                  ).toFixed(
                    0
                  )} more to unlock ₹${reward}.`}

            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default TaskRewards;