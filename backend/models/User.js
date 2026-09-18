import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema(
  {
    orderNo: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      default: "Order",
    },

    status: {
      type: String,
      enum: ["Processing", "Completed", "Cancelled"],
      default: "Processing",
    },

    utr: {
      type: String,
      default: "",
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    cancelledAt: {
      type: Date,
      default: null,
    },

    withdrawalAvailableAt: {
      type: Date,
      default: null,
    },
  },
  {
    _id: true,
  }
);

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      default: "",
      trim: true,
    },

    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    inviteCode: {
      type: String,
      default: "",
    },

    referralCode: {
      type: String,
      default: "",
    },

    balance: {
      type: Number,
      default: 0,
    },

    bonus: {
      type: Number,
      default: 0,
    },

    // Total actual deposit amount
    totalDeposit: {
      type: Number,
      default: 0,
    },

    // Total withdrawal amount
    totalWithdrawal: {
      type: Number,
      default: 0,
    },

    // Task Reward ₹300 unlock status
    taskRewardUnlocked: {
      type: Boolean,
      default: false,
    },

    // Task Reward ₹300 sirf ek baar milega
    taskRewardClaimed: {
      type: Boolean,
      default: false,
    },

    // Task Reward amount
    taskReward: {
      type: Number,
      default: 300,
    },

    // Withdrawal 2 minutes ke baad available hoga
    withdrawalAvailableAt: {
      type: Date,
      default: null,
    },

    transactions: {
      type: [transactionSchema],
      default: [],
    },

    mobikwikWallet: {
      type: Boolean,
      default: false,
    },

    mobikwikPhone: {
      type: String,
      default: "",
    },

    mobikwikUpi: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;