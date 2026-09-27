import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import User from "./models/User.js";
import adminRoutes from "./adminRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;

// =====================================================
// TASK REWARD SETTINGS
// =====================================================

const TASK_TARGET = 500;
const TASK_REWARD = 100;

// =====================================================
// BASIC TEST
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "OK Pay server is running",
    taskTarget: TASK_TARGET,
    taskReward: TASK_REWARD,
  });
});

// =====================================================
// REGISTER
// =====================================================

// =====================================================
// REGISTER
// =====================================================

app.post("/api/register", async (req, res) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      referralCode,
    } = req.body;

    if (!username || !phone || !password) {
      return res.status(400).json({
        message: "Username, phone and password are required",
      });
    }

    const existingUser = await User.findOne({
      $or: [
        { phone },
        ...(email ? [{ email }] : []),
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email: email || "",
      phone,
      password: hashedPassword,

      referralCode: referralCode || "",

      // ==============================
      // NEW USER STARTING VALUES
      // ==============================
      balance: 150,
      bonus: 0,

      totalDeposit: 0,
      totalWithdrawal: 0,

      // ==============================
      // TASK VALUES
      // ==============================
      taskReward: 100,
      taskRewardUnlocked: false,
      taskRewardClaimed: false,
    });

    await newUser.save();

    res.status(201).json({
      success: true,
      message: "Registration successful",

      user: {
        id: newUser._id,
        _id: newUser._id,

        username: newUser.username,
        email: newUser.email || "",
        phone: newUser.phone,

        balance: Number(newUser.balance || 150),
        bonus: Number(newUser.bonus || 0),

        totalDeposit: Number(
          newUser.totalDeposit || 0
        ),

        totalWithdrawal: Number(
          newUser.totalWithdrawal || 0
        ),

        taskRewardUnlocked: Boolean(
          newUser.taskRewardUnlocked
        ),

        taskRewardClaimed: Boolean(
          newUser.taskRewardClaimed
        ),

        taskUnlocked: false,

        taskTarget: TASK_TARGET,

        taskReward: Number(
          newUser.taskReward || TASK_REWARD
        ),

        withdrawalAvailableAt:
          newUser.withdrawalAvailableAt || null,
      },
    });
  } catch (error) {
    console.error("Register error:", error);

    res.status(500).json({
      message: "Registration failed",
      error: error.message,
    });
  }
});
// =====================================================
// LOGIN
// =====================================================

app.post("/api/login", async (req, res) => {
  try {
    const {
      phone,
      password,
    } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message: "Phone and password are required",
      });
    }

    const user = await User.findOne({
      phone,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid phone or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid phone or password",
      });
    }

    const token = jwt.sign(
      {
        userId: user._id,
      },
      process.env.JWT_SECRET || "okpay-secret",
      {
        expiresIn: "7d",
      }
    );

    const now = new Date();

    const withdrawalAvailable = Boolean(
      user.withdrawalAvailableAt &&
      now >= new Date(
        user.withdrawalAvailableAt
      )
    );

    const totalDeposit = Number(
      user.totalDeposit || 0
    );

    const taskUnlocked = Boolean(
      user.taskRewardUnlocked ||
      totalDeposit >= TASK_TARGET
    );

    res.json({
      success: true,
      message: "Login successful",

      token,

      user: {
        id: user._id,
        _id: user._id,
        username: user.username,
        email: user.email || "",
        phone: user.phone,

        balance: Number(
          user.balance || 0
        ),

        bonus: Number(
          user.bonus || 0
        ),

        totalDeposit,

        totalWithdrawal: Number(
          user.totalWithdrawal || 0
        ),

        taskRewardUnlocked: Boolean(
          user.taskRewardUnlocked
        ),

        taskRewardClaimed: Boolean(
          user.taskRewardClaimed
        ),

        taskUnlocked,

        taskTarget: TASK_TARGET,

        taskReward: Number(
          user.taskReward || TASK_REWARD
        ),

        withdrawalAvailable,

        withdrawalAvailableAt:
          user.withdrawalAvailableAt || null,

        mobikwikWallet: Boolean(
          user.mobikwikWallet
        ),

        mobikwikPhone:
          user.mobikwikPhone || "",

        mobikwikUpi:
          user.mobikwikUpi || "",
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
      error: error.message,
    });
  }
});

// =====================================================
// RESET PASSWORD
// =====================================================

app.post("/api/reset-password", async (req, res) => {
  try {
    const {
      phone,
      password,
    } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        message:
          "Phone and new password are required",
      });
    }

    const user = await User.findOne({
      phone,
    });

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    user.password =
      await bcrypt.hash(password, 10);

    await user.save();

    res.json({
      success: true,
      message:
        "Password reset successfully",
    });
  } catch (error) {
    console.error(
      "Reset password error:",
      error
    );

    res.status(500).json({
      message:
        "Password reset failed",
    });
  }
});

// =====================================================
// GET USER BALANCE
// =====================================================

app.get(
  "/api/user/:userId/balance",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          message: "Invalid user ID",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const now = new Date();

      const withdrawalAvailable =
        Boolean(
          user.withdrawalAvailableAt &&
          now >= new Date(
            user.withdrawalAvailableAt
          )
        );

      const totalDeposit =
        Number(user.totalDeposit || 0);

      // ==============================
      // TASK UNLOCK = ₹500
      // ==============================

      const taskUnlocked =
        Boolean(
          user.taskRewardUnlocked ||
          totalDeposit >= TASK_TARGET
        );

      res.json({
        success: true,

        balance: Number(
          user.balance || 0
        ),

        bonus: Number(
          user.bonus || 0
        ),

        totalDeposit,

        totalWithdrawal: Number(
          user.totalWithdrawal || 0
        ),

        taskUnlocked,

        taskRewardUnlocked:
          Boolean(
            user.taskRewardUnlocked
          ),

        taskTarget: TASK_TARGET,

        taskReward:
          Number(
            user.taskReward || TASK_REWARD
          ),

        taskRewardClaimed:
          Boolean(
            user.taskRewardClaimed
          ),

        withdrawalAvailable,

        withdrawalAvailableAt:
          user.withdrawalAvailableAt || null,

        transactions:
          user.transactions || [],
      });
    } catch (error) {
      console.error(
        "Balance error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to get balance",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// DIRECT DEPOSIT
// =====================================================

app.post(
  "/api/deposit",
  async (req, res) => {
    try {
      const {
        userId,
        amount,
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          message:
            "User ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid user ID",
        });
      }

      const depositAmount =
        Number(amount);

      if (
        !Number.isFinite(
          depositAmount
        ) ||
        depositAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Enter a valid deposit amount",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const depositCommission =
        Number(
          (
            depositAmount * 0.045
          ).toFixed(2)
        );

      const previousTotalDeposit =
        Number(
          user.totalDeposit || 0
        );

      const newTotalDeposit =
        previousTotalDeposit +
        depositAmount;

      const depositTime =
        new Date();

      const withdrawalAvailableAt =
        new Date(
          depositTime.getTime() +
          2 * 60 * 1000
        );

      user.balance =
        Number(
          user.balance || 0
        ) +
        depositAmount +
        depositCommission;

      user.bonus =
        Number(
          user.bonus || 0
        ) +
        depositCommission;

      user.totalDeposit =
        newTotalDeposit;

      // ==============================
      // TASK UNLOCK AT ₹500
      // ==============================

      if (
        newTotalDeposit >=
        TASK_TARGET
      ) {
        user.taskRewardUnlocked = true;
      }

      // Always keep reward ₹100
      user.taskReward =
        TASK_REWARD;

      user.withdrawalAvailableAt =
        withdrawalAvailableAt;

      const depositOrderNo =
        `DEP${Date.now()}`;

      user.transactions.push({
        orderNo:
          depositOrderNo,

        amount:
          depositAmount,

        type:
          "Deposit",

        status:
          "Completed",

        utr:
          "",

        createdAt:
          depositTime,

        completedAt:
          depositTime,

        withdrawalAvailableAt:
          withdrawalAvailableAt,
      });

      await user.save();

      res.json({
        success: true,

        message:
          "Deposit successful. 4.5% commission added.",

        deposit:
          depositAmount,

        commission:
          depositCommission,

        bonus:
          depositCommission,

        totalCredit:
          depositAmount +
          depositCommission,

        taskTarget:
          TASK_TARGET,

        taskReward:
          TASK_REWARD,

        taskRewardAdded:
          false,

        taskUnlocked:
          Boolean(
            user.taskRewardUnlocked ||
            Number(
              user.totalDeposit || 0
            ) >= TASK_TARGET
          ),

        taskRewardUnlocked:
          Boolean(
            user.taskRewardUnlocked
          ),

        taskRewardClaimed:
          Boolean(
            user.taskRewardClaimed
          ),

        balance:
          Number(
            user.balance || 0
          ),

        totalDeposit:
          Number(
            user.totalDeposit || 0
          ),

        totalWithdrawal:
          Number(
            user.totalWithdrawal || 0
          ),

        withdrawalAvailable:
          false,

        withdrawalAvailableAt,

        transactionId:
          depositOrderNo,
      });
    } catch (error) {
      console.error(
        "Deposit error:",
        error
      );

      res.status(500).json({
        message:
          "Deposit failed",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// UNLOCK TASK REWARD
// =====================================================

app.post(
  "/api/task-reward/unlock",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "User ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const totalDeposit =
        Number(
          user.totalDeposit || 0
        );

      // =================================================
      // IMPORTANT:
      // ₹500 TOTAL DEPOSIT REQUIRED
      // =================================================

      if (
        totalDeposit <
        TASK_TARGET
      ) {
        return res.status(400).json({
          success: false,

          message:
            `Complete ₹${TASK_TARGET} total deposit first`,

          totalDeposit,

          taskTarget:
            TASK_TARGET,

          taskReward:
            TASK_REWARD,
        });
      }

      // Already claimed
      if (
        user.taskRewardClaimed
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Task reward has already been claimed",

          balance:
            Number(
              user.balance || 0
            ),

          taskTarget:
            TASK_TARGET,

          taskReward:
            TASK_REWARD,
        });
      }

      // =================================================
      // ADD ₹100 REWARD
      // =================================================

      const reward =
        TASK_REWARD;

      user.balance =
        Number(
          user.balance || 0
        ) +
        reward;

      user.taskReward =
        reward;

      user.taskRewardUnlocked =
        true;

      user.taskRewardClaimed =
        true;

      const rewardTime =
        new Date();

      const taskOrderNo =
        `TASK${Date.now()}`;

      user.transactions.push({
        orderNo:
          taskOrderNo,

        amount:
          reward,

        type:
          "Task Reward",

        status:
          "Completed",

        utr:
          "",

        createdAt:
          rewardTime,

        completedAt:
          rewardTime,
      });

      await user.save();

      res.json({
        success: true,

        message:
          `₹${reward} task reward added to balance`,

        reward,

        taskTarget:
          TASK_TARGET,

        taskReward:
          reward,

        taskRewardUnlocked:
          true,

        taskRewardClaimed:
          true,

        taskUnlocked:
          true,

        balance:
          Number(
            user.balance || 0
          ),

        totalDeposit:
          Number(
            user.totalDeposit || 0
          ),

        transactionId:
          taskOrderNo,
      });
    } catch (error) {
      console.error(
        "Task reward unlock error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to unlock task reward",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// WITHDRAWAL STATUS
// =====================================================

app.get(
  "/api/withdraw/status/:userId",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid user ID",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const now =
        new Date();

      const availableAt =
        user.withdrawalAvailableAt
          ? new Date(
              user.withdrawalAvailableAt
            )
          : null;

      const withdrawalAvailable =
        Boolean(
          availableAt &&
          now >= availableAt
        );

      let remainingSeconds = 0;

      if (
        availableAt &&
        now < availableAt
      ) {
        remainingSeconds =
          Math.ceil(
            (
              availableAt.getTime() -
              now.getTime()
            ) / 1000
          );
      }

      res.json({
        success: true,

        withdrawalAvailable,

        withdrawalAvailableAt:
          availableAt,

        remainingSeconds,

        balance:
          Number(
            user.balance || 0
          ),

        totalDeposit:
          Number(
            user.totalDeposit || 0
          ),

        totalWithdrawal:
          Number(
            user.totalWithdrawal || 0
          ),
      });
    } catch (error) {
      console.error(
        "Withdrawal status error:",
        error
      );

      res.status(500).json({
        message:
          "Unable to check withdrawal status",
      });
    }
  }
);

// =====================================================
// WITHDRAW
// =====================================================

app.post(
  "/api/withdraw",
  async (req, res) => {
    try {
      const {
        userId,
        amount,
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          message:
            "User ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          message:
            "Invalid user ID",
        });
      }

      const withdrawAmount =
        Number(amount);

      if (
        !Number.isFinite(
          withdrawAmount
        ) ||
        withdrawAmount <= 0
      ) {
        return res.status(400).json({
          message:
            "Enter a valid withdrawal amount",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          message:
            "User not found",
        });
      }

      const now =
        new Date();

      const availableAt =
        user.withdrawalAvailableAt
          ? new Date(
              user.withdrawalAvailableAt
            )
          : null;

      if (
        !availableAt ||
        now < availableAt
      ) {
        let remainingSeconds = 0;

        if (availableAt) {
          remainingSeconds =
            Math.ceil(
              (
                availableAt.getTime() -
                now.getTime()
              ) / 1000
            );
        }

        return res.status(400).json({
          message:
            "Withdrawal is not available yet",

          withdrawalAvailable:
            false,

          remainingSeconds,

          withdrawalAvailableAt:
            availableAt,
        });
      }

      const currentBalance =
        Number(
          user.balance || 0
        );

      if (
        currentBalance <
        withdrawAmount
      ) {
        return res.status(400).json({
          message:
            "Insufficient balance",
        });
      }

      user.balance =
        currentBalance -
        withdrawAmount;

      user.totalWithdrawal =
        Number(
          user.totalWithdrawal || 0
        ) +
        withdrawAmount;

      const withdrawOrderNo =
        `WD${Date.now()}`;

      user.transactions.push({
        orderNo:
          withdrawOrderNo,

        amount:
          withdrawAmount,

        type:
          "Withdrawal",

        status:
          "Completed",

        utr:
          "",

        createdAt:
          now,

        completedAt:
          now,
      });

      await user.save();

      res.json({
        success: true,

        message:
          "Withdrawal successful",

        amount:
          withdrawAmount,

        balance:
          Number(
            user.balance || 0
          ),

        totalDeposit:
          Number(
            user.totalDeposit || 0
          ),

        totalWithdrawal:
          Number(
            user.totalWithdrawal || 0
          ),

        orderNo:
          withdrawOrderNo,

        status:
          "Completed",
      });
    } catch (error) {
      console.error(
        "Withdrawal error:",
        error
      );

      res.status(500).json({
        message:
          "Withdrawal failed",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// ADD MOBIKWIK WALLET
// =====================================================

app.post(
  "/api/add-mobikwik-wallet",
  async (req, res) => {
    try {
      const {
        userId,
        phone,
        mobikwikPhone,
        upi,
        mobikwikUpi,
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "User ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const walletPhone =
        mobikwikPhone ||
        phone ||
        user.mobikwikPhone ||
        user.phone ||
        "";

      const walletUpi =
        mobikwikUpi ||
        upi ||
        user.mobikwikUpi ||
        `${walletPhone}@mbk`;

      user.mobikwikWallet =
        true;

      user.mobikwikPhone =
        walletPhone;

      user.mobikwikUpi =
        walletUpi;

      await user.save();

      console.log(
        "MOBIKWIK WALLET SAVED:",
        {
          userId:
            user._id.toString(),

          mobikwikWallet:
            user.mobikwikWallet,

          mobikwikPhone:
            user.mobikwikPhone,

          mobikwikUpi:
            user.mobikwikUpi,
        }
      );

      res.json({
        success: true,

        message:
          "Mobikwik wallet added successfully",

        wallet: {
          name: "Mobikwik",

          phone:
            user.mobikwikPhone,

          upi:
            user.mobikwikUpi,

          enabled: true,
        },

        mobikwikWallet:
          true,

        mobikwikPhone:
          user.mobikwikPhone,

        mobikwikUpi:
          user.mobikwikUpi,
      });
    } catch (error) {
      console.error(
        "Add Mobikwik wallet error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to add Mobikwik wallet",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// GET MOBIKWIK WALLET
// =====================================================

app.get(
  "/api/mobikwik-wallet/:userId",
  async (req, res) => {
    try {
      const {
        userId,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      if (!user.mobikwikWallet) {
        return res.json({
          success: true,

          wallet: null,

          mobikwikWallet:
            false,

          mobikwikPhone:
            "",

          mobikwikUpi:
            "",
        });
      }

      const walletPhone =
        user.mobikwikPhone ||
        user.phone ||
        "";

      const walletUpi =
        user.mobikwikUpi ||
        `${walletPhone}@mbk`;

      res.json({
        success: true,

        wallet: {
          name: "Mobikwik",

          phone:
            walletPhone,

          upi:
            walletUpi,

          enabled: true,
        },

        mobikwikWallet:
          true,

        mobikwikPhone:
          walletPhone,

        mobikwikUpi:
          walletUpi,
      });
    } catch (error) {
      console.error(
        "Get Mobikwik wallet error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to get wallet",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// SUBMIT PAYMENT / CREATE ORDER
// =====================================================

app.post(
  "/api/order/submit-payment",
  async (req, res) => {
    try {
      const {
        userId,
        orderNo,
        amount,
        utr,
      } = req.body;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message:
            "User ID is required",
        });
      }

      if (!orderNo) {
        return res.status(400).json({
          success: false,
          message:
            "Order number is required",
        });
      }

      if (!utr || !utr.trim()) {
        return res.status(400).json({
          success: false,
          message:
            "UTR / Transaction ID is required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }

      const orderAmount =
        Number(amount);

      if (
        !Number.isFinite(
          orderAmount
        ) ||
        orderAmount <= 0
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid amount",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const existingOrder =
        user.transactions.find(
          (tx) =>
            tx.orderNo === orderNo &&
            tx.type === "Payment"
        );

      if (existingOrder) {
        if (
          existingOrder.status ===
          "Completed"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This order has already been completed",
          });
        }

        if (
          existingOrder.status ===
          "Cancelled"
        ) {
          return res.status(400).json({
            success: false,
            message:
              "This order has already been cancelled",
          });
        }

        return res.status(400).json({
          success: false,
          message:
            "Payment for this order has already been submitted",
        });
      }

      const submitTime =
        new Date();

      user.transactions.push({
        orderNo,

        amount:
          orderAmount,

        type:
          "Payment",

        status:
          "Processing",

        utr:
          utr.trim(),

        createdAt:
          submitTime,
      });

      await user.save();

      res.json({
        success: true,

        message:
          "Payment submitted successfully",

        orderNo,

        amount:
          orderAmount,

        status:
          "Processing",

        remainingSeconds:
          30,
      });
    } catch (error) {
      console.error(
        "Submit payment error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Payment submission failed",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// ORDER STATUS
// =====================================================

app.get(
  "/api/order/status/:userId/:orderNo",
  async (req, res) => {
    try {
      const {
        userId,
        orderNo,
      } = req.params;

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid user ID",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      const transaction =
        user.transactions.find(
          (tx) =>
            tx.orderNo === orderNo &&
            tx.type === "Payment"
        );

      if (!transaction) {
        return res.json({
          success: true,

          status:
            "Pending",

          balance:
            Number(
              user.balance || 0
            ),
        });
      }

      if (
        transaction.status ===
        "Cancelled"
      ) {
        return res.json({
          success: true,

          status:
            "Cancelled",

          balance:
            Number(
              user.balance || 0
            ),
        });
      }

      if (
        transaction.status ===
        "Completed"
      ) {
        const totalDeposit =
          Number(
            user.totalDeposit || 0
          );

        return res.json({
          success: true,

          status:
            "Completed",

          amount:
            Number(
              transaction.amount || 0
            ),

          balance:
            Number(
              user.balance || 0
            ),

          totalDeposit,

          bonus:
            Number(
              user.bonus || 0
            ),

          taskTarget:
            TASK_TARGET,

          taskUnlocked:
            Boolean(
              user.taskRewardUnlocked ||
              totalDeposit >= TASK_TARGET
            ),

          taskRewardUnlocked:
            Boolean(
              user.taskRewardUnlocked
            ),

          taskRewardClaimed:
            Boolean(
              user.taskRewardClaimed
            ),

          taskReward:
            Number(
              user.taskReward || TASK_REWARD
            ),
        });
      }

      const createdAt =
        transaction.createdAt
          ? new Date(
              transaction.createdAt
            )
          : new Date();

      const elapsed =
        Date.now() -
        createdAt.getTime();

      const processingDuration =
        30 * 1000;

      if (
        elapsed <
        processingDuration
      ) {
        const remainingSeconds =
          Math.ceil(
            (
              processingDuration -
              elapsed
            ) / 1000
          );

        return res.json({
          success: true,

          status:
            "Processing",

          remainingSeconds,

          balance:
            Number(
              user.balance || 0
            ),
        });
      }

      // =================================================
      // COMPLETE ORDER AFTER 30 SECONDS
      // =================================================

      const orderAmount =
        Number(
          transaction.amount || 0
        );

      const commission =
        Number(
          (
            orderAmount *
            0.045
          ).toFixed(2)
        );

      user.balance =
        Number(
          user.balance || 0
        ) +
        orderAmount +
        commission;

      user.bonus =
        Number(
          user.bonus || 0
        ) +
        commission;

      user.totalDeposit =
        Number(
          user.totalDeposit || 0
        ) +
        orderAmount;

      // =================================================
      // TASK UNLOCK AT ₹500
      // =================================================

      if (
        Number(
          user.totalDeposit || 0
        ) >= TASK_TARGET
      ) {
        user.taskRewardUnlocked =
          true;
      }

      // Always keep reward ₹100
      user.taskReward =
        TASK_REWARD;

      transaction.status =
        "Completed";

      transaction.completedAt =
        new Date();

      await user.save();

      res.json({
        success: true,

        status:
          "Completed",

        amount:
          orderAmount,

        commission,

        totalCredit:
          orderAmount +
          commission,

        balance:
          Number(
            user.balance || 0
          ),

        bonus:
          Number(
            user.bonus || 0
          ),

        totalDeposit:
          Number(
            user.totalDeposit || 0
          ),

        taskTarget:
          TASK_TARGET,

        taskUnlocked:
          Boolean(
            user.taskRewardUnlocked ||
            Number(
              user.totalDeposit || 0
            ) >= TASK_TARGET
          ),

        taskRewardUnlocked:
          Boolean(
            user.taskRewardUnlocked
          ),

        taskRewardClaimed:
          Boolean(
            user.taskRewardClaimed
          ),

        taskReward:
          Number(
            user.taskReward || TASK_REWARD
          ),
      });
    } catch (error) {
      console.error(
        "Order status error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Unable to get order status",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// CANCEL ORDER
// =====================================================

app.post(
  "/api/order/cancel",
  async (req, res) => {
    try {
      const {
        userId,
        orderNo,
      } = req.body;

      if (!userId || !orderNo) {
        return res.status(400).json({
          success: false,

          message:
            "User ID and order number are required",
        });
      }

      if (
        !mongoose.Types.ObjectId.isValid(
          userId
        )
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Invalid user ID",
        });
      }

      const user =
        await User.findById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,

          message:
            "User not found",
        });
      }

      const transaction =
        user.transactions.find(
          (tx) =>
            tx.orderNo === orderNo &&
            tx.type === "Payment"
        );

      if (!transaction) {
        return res.status(400).json({
          success: false,

          message:
            "Payment has not been submitted yet",
        });
      }

      if (
        transaction.status ===
        "Cancelled"
      ) {
        return res.json({
          success: true,

          message:
            "Order already cancelled",

          orderNo,

          status:
            "Cancelled",
        });
      }

      if (
        transaction.status ===
        "Completed"
      ) {
        return res.status(400).json({
          success: false,

          message:
            "Completed order cannot be cancelled",
        });
      }

      transaction.status =
        "Cancelled";

      transaction.cancelledAt =
        new Date();

      await user.save();

      res.json({
        success: true,

        message:
          "Order cancelled successfully",

        orderNo,

        status:
          "Cancelled",
      });
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          "Order cancellation failed",

        error:
          error.message,
      });
    }
  }
);

// =====================================================
// START SERVER AFTER MONGODB CONNECTS
// =====================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB connected");

    console.log(
      `Task Reward Target: ₹${TASK_TARGET}`
    );

    console.log(
      `Task Reward Amount: ₹${TASK_REWARD}`
    );

    app.listen(
      PORT,
      () => {
        console.log(
          `OK Pay server running on http://localhost:${PORT}`
        );
      }
    );
  })
  .catch((error) => {
    console.error(
      "MongoDB connection error:",
      error
    );

    process.exit(1);
  });