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

    totalDeposit: {
      type: Number,
      default: 0,
    },

    totalWithdrawal: {
      type: Number,
      default: 0,
    },

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