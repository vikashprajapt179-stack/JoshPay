import express from "express";
import jwt from "jsonwebtoken";
import User from "./models/User.js";

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET || "joshpay-secret-change-this";

function adminAuth(req, res, next) {
  try {
    const header = req.headers.authorization || "";

    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Admin token required",
      });
    }

    const token = header.slice(7);
    const decoded = jwt.verify(token, JWT_SECRET);

    if (decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    req.admin = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
}

// ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    const adminPhone = process.env.ADMIN_PHONE;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPhone || !adminPassword) {
      return res.status(500).json({
        success: false,
        message: "ADMIN_PHONE / ADMIN_PASSWORD are missing in .env",
      });
    }

    if (
      String(phone || "").trim() !== String(adminPhone).trim() ||
      String(password || "") !== String(adminPassword)
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin credentials",
      });
    }

    const token = jwt.sign(
      {
        role: "admin",
        phone: adminPhone,
      },
      JWT_SECRET,
      { expiresIn: "12h" }
    );

    res.json({
      success: true,
      token,
      admin: {
        phone: adminPhone,
        role: "admin",
      },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({
      success: false,
      message: "Admin login failed",
    });
  }
});

// DASHBOARD
router.get("/dashboard", adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select(
        "balance bonus totalDeposit totalWithdrawal taskRewardClaimed transactions"
      )
      .lean();

    let totalDeposit = 0;
    let totalWithdrawal = 0;
    let commission = 0;
    let processingOrders = 0;
    let completedOrders = 0;
    let taskRewardClaims = 0;

    for (const user of users) {
      totalDeposit += Number(user.totalDeposit || 0);
      totalWithdrawal += Number(user.totalWithdrawal || 0);
      commission += Number(user.bonus || 0);

      if (user.taskRewardClaimed) {
        taskRewardClaims += 1;
      }

      for (const tx of user.transactions || []) {
        if (tx.type === "Payment") {
          if (tx.status === "Processing") processingOrders += 1;
          if (tx.status === "Completed") completedOrders += 1;
        }
      }
    }

    res.json({
      success: true,
      dashboard: {
        totalUsers: users.length,
        totalDeposit,
        totalWithdrawal,
        commission,
        processingOrders,
        completedOrders,
        taskRewardClaims,
      },
    });
  } catch (error) {
    console.error("Admin dashboard error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load dashboard",
    });
  }
});

// USERS
router.get("/users", adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select(
        "_id username phone balance bonus totalDeposit totalWithdrawal taskRewardClaimed taskReward taskRewardUnlocked mobikwikWallet mobikwikPhone mobikwikUpi transactions createdAt"
      )
      .sort({ createdAt: -1 })
      .lean();

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Admin users error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load users",
    });
  }
});

// ALL PAYMENT ORDERS
router.get("/orders", adminAuth, async (req, res) => {
  try {
    const users = await User.find({})
      .select("_id username phone transactions")
      .lean();

    const orders = [];

    for (const user of users) {
      for (const tx of user.transactions || []) {
        if (tx.type !== "Payment") continue;

        orders.push({
          _id: tx._id,
          orderNo: tx.orderNo,
          amount: Number(tx.amount || 0),
          utr: tx.utr || "",
          status: tx.status || "",
          createdAt: tx.createdAt || null,
          completedAt: tx.completedAt || null,
          cancelledAt: tx.cancelledAt || null,
          userId: user._id,
          username: user.username || "",
          phone: user.phone || "",
        });
      }
    }

    orders.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    res.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("Admin orders error:", error);
    res.status(500).json({
      success: false,
      message: "Unable to load orders",
    });
  }
});

export default router;
