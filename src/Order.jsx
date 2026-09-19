import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Copy,
  Upload,
  X,
} from "lucide-react";

function Order({ user, order, onNavigate }) {
  const [utr, setUtr] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  // Pending / Processing / Completed / Cancelled
  const [status, setStatus] = useState("Pending");

  // 30 second processing timer
  const [processingTime, setProcessingTime] = useState(0);

  // ================= 7 MINUTE PAYMENT TIMER =================

  const [timeLeft, setTimeLeft] = useState(7 * 60);

  useEffect(() => {
    if (status !== "Pending") return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const minutes = Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0");

  const seconds = (timeLeft % 60)
    .toString()
    .padStart(2, "0");

  // ================= ORDER DATA =================

  const amount = Number(order?.amount ?? 200);

  const payeeAccount = "7879000100050157";
  const payeeName = "Nikhil"; 
  const ifsc = "PUNB0787900";
  const type = "IMPS";

  const payoutAccount =
    user?.phone ||
    user?.mobile ||
    user?.phoneNumber ||
    "";

  const payoutUpi = payoutAccount
    ? `${payoutAccount}@mbk`
    : "";

  // ================= STABLE ORDER NUMBER =================

  const orderNoRef = useRef(
    order?.orderNo || `R${Date.now()}`
  );

  const orderNo = orderNoRef.current;

  // ================= USER ID =================

  const userId =
    user?._id ||
    user?.id ||
    user?.userId;

  // ================= POLL ORDER STATUS =================
  // Sirf payment submit hone ke baad status check hoga.

  useEffect(() => {
    if (status !== "Processing") {
      return;
    }

    if (!userId || !orderNo) {
      return;
    }

    let stopped = false;

    const checkStatus = async () => {
      try {
        const response = await fetch(
          `https://joshpay.onrender.com/api/order/status/${userId}/${orderNo}`
        );

        const data = await response.json();

        console.log("Order status:", data);

        if (stopped) return;

        if (data.status === "Processing") {
          setProcessingTime(
            Number(data.remainingSeconds || 0)
          );
        }

        if (data.status === "Completed") {
          setProcessingTime(0);
          setStatus("Completed");

          // Parent/local user balance update ke liye
          window.dispatchEvent(
            new Event("balanceUpdated")
          );
        }

        if (data.status === "Cancelled") {
          setProcessingTime(0);
          setStatus("Cancelled");
        }
      } catch (error) {
        console.error(
          "Order status error:",
          error
        );
      }
    };

    checkStatus();

    const interval = setInterval(
      checkStatus,
      1000
    );

    return () => {
      stopped = true;
      clearInterval(interval);
    };
  }, [status, userId, orderNo]);

  // ================= PROCESSING TIMER =================

  const processingMinutes = Math.floor(
    processingTime / 60
  )
    .toString()
    .padStart(2, "0");

  const processingSeconds = (
    processingTime % 60
  )
    .toString()
    .padStart(2, "0");

  // ================= COPY =================

  const copyText = async (text) => {
    if (!text) {
      alert("No data available");
      return;
    }

    try {
      await navigator.clipboard.writeText(text);
      alert("Copied");
    } catch {
      alert("Copy failed");
    }
  };

  // ================= SCREENSHOT =================

  const handleScreenshot = (e) => {
    const file = e.target.files?.[0];

    if (file) {
      setScreenshot(file);
    }
  };

  // ================= SUBMIT PAYMENT =================

  const handleSubmit = async () => {
    if (!userId) {
      alert(
        "User ID not found. Please login again."
      );
      return;
    }

    if (!utr.trim()) {
      alert(
        "Please enter UTR / Transaction ID"
      );
      return;
    }

    if (!screenshot) {
      alert(
        "Please upload payment screenshot"
      );
      return;
    }

    if (status !== "Pending") {
      return;
    }

    // 7 minute timer expire
    if (timeLeft <= 0) {
      alert(
        "Payment time has expired."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://joshpay.onrender.com/api/order/submit-payment",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            orderNo,
            amount,
            utr: utr.trim(),
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Submit payment response:",
        data
      );

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Payment submission failed"
        );
        return;
      }

      // IMPORTANT:
      // Abhi pehli baar Processing start hoga.
      setStatus("Processing");

      setProcessingTime(
        Number(data.remainingSeconds || 30)
      );

      alert(
        "Payment submitted successfully!\n\nOrder is now Processing for 30 seconds."
      );
    } catch (error) {
      console.error(
        "Submit payment error:",
        error
      );

      alert(
        "Cannot connect to server. Please make sure backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // ================= CANCEL =================

  const handleCancel = async () => {
    if (!userId) {
      alert("User ID not found");
      return;
    }

    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) {
      return;
    }

    // Agar payment submit hi nahi hua,
    // to database me order hai hi nahi.
    // Sirf screen par cancel kar do.
    if (status === "Pending") {
      setStatus("Cancelled");
      return;
    }

    // Processing order ko backend se cancel karna
    if (status !== "Processing") {
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        "https://joshpay.onrender.com/api/order/cancel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId,
            orderNo,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Cancel response:",
        data
      );

      if (!response.ok || !data.success) {
        alert(
          data.message ||
            "Order cancellation failed"
        );
        return;
      }

      setStatus("Cancelled");
      setProcessingTime(0);

      alert(
        "Order cancelled successfully"
      );
    } catch (error) {
      console.error(
        "Cancel order error:",
        error
      );

      alert(
        "Cannot connect to server."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f7fb] pb-10">

      {/* ================= HEADER ================= */}

      <div className="relative flex items-center justify-center bg-white px-5 pt-7 pb-6">

        <button
          type="button"
          onClick={() =>
            onNavigate("payment")
          }
          className="absolute left-6 top-7"
        >
          <ArrowLeft
            size={42}
            strokeWidth={2}
            className="text-[#15936d]"
          />
        </button>

        <h1 className="text-[38px] font-bold text-[#129267]">
          Order
        </h1>

      </div>

      {/* ================= 7 MINUTE TIMER ================= */}

      {status === "Pending" && (
        <div className="mx-12 mt-5 rounded-[20px] bg-white px-5 py-4 text-center shadow-sm">

          <p className="text-[17px] font-semibold text-[#68788b]">
            Payment Time Remaining
          </p>

          <div className="mt-1 text-[38px] font-bold text-[#15936d]">
            {minutes}:{seconds}
          </div>

          {timeLeft === 0 && (
            <p className="text-[15px] font-semibold text-red-500">
              Time expired
            </p>
          )}

        </div>
      )}

      {/* ================= 30 SECOND PROCESSING ================= */}

      {status === "Processing" && (
        <div className="mx-12 mt-5 rounded-[20px] bg-white px-5 py-5 text-center shadow-sm">

          <p className="text-[18px] font-semibold text-[#68788b]">
            Order Processing
          </p>

          <div className="mt-1 text-[38px] font-bold text-[#15936d]">
            {processingMinutes}:{processingSeconds}
          </div>

          <p className="mt-1 text-[15px] text-gray-500">
            Please wait while your payment is being processed.
          </p>

        </div>
      )}

      {/* ================= SUCCESS ================= */}

      {status === "Completed" && (
        <div className="mx-12 mt-5 rounded-[20px] bg-white px-5 py-5 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eaf8f2]">
            <span className="text-[38px] font-bold text-[#15936d]">
              ✓
            </span>
          </div>

          <h2 className="mt-3 text-[26px] font-bold text-[#15936d]">
            Order Successful
          </h2>

          <p className="mt-1 text-[16px] text-gray-500">
            Payment has been completed successfully.
          </p>

        </div>
      )}

      {/* ================= ORDER CARD ================= */}

      <div className="mx-12 mt-7 overflow-hidden rounded-[28px] bg-white shadow-sm">

        {/* AMOUNT */}

        <div className="bg-[#eaf8f2] py-2 text-center">

          <span className="text-[56px] font-bold text-[#128f68]">
            INR
          </span>

          <span className="ml-2 text-[56px] font-extrabold text-[#111827]">
            {amount.toFixed(2)}
          </span>

        </div>

        <div className="px-9 py-5">

          <CopyRow
            label="PayeeAccount:"
            value={payeeAccount}
            onCopy={() =>
              copyText(payeeAccount)
            }
          />

          <CopyRow
            label="PayeeName:"
            value={payeeName}
            onCopy={() =>
              copyText(payeeName)
            }
          />

          {/* IFSC */}

          <div className="border-b border-[#d9eee7] py-3">

            <div className="flex items-center justify-between">

              <span className="text-[24px] text-[#68788b]">
                IFSC:
              </span>

              <div className="flex items-center gap-4">

                <span className="text-[23px] text-[#202633]">
                  {ifsc}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    copyText(ifsc)
                  }
                  className="text-[#15936d]"
                >
                  <Copy size={26} />
                </button>

              </div>

            </div>

            <p className="mt-2 text-right text-[17px] font-semibold text-[#c6a875]">
              Note : IF IFSC Mismatched , Do Not Pay
            </p>

          </div>

          <CopyRow
            label="Type:"
            value={type}
            onCopy={() =>
              copyText(type)
            }
          />

          {/* PAYOUT WALLET */}

          <div className="border-b border-[#d9eee7] py-3">

            <div className="flex items-center justify-between">

              <span className="text-[24px] text-[#68788b]">
                Payout Wallet:
              </span>

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-md bg-[#1d5ce8] text-white">
                  M
                </div>

                <span className="text-[23px] text-[#202633]">
                  Mobikwik
                </span>

                <button
                  type="button"
                  className="rounded-full border-2 border-[#b8e2d5] bg-[#eaf8f2] px-4 py-2 text-[18px] font-bold text-[#188d68]"
                >
                  Change
                </button>

              </div>

            </div>

          </div>

          <CopyRow
            label="Payout Account:"
            value={payoutAccount}
            onCopy={() =>
              copyText(payoutAccount)
            }
          />

          <CopyRow
            label="Payout UPI:"
            value={payoutUpi}
            onCopy={() =>
              copyText(payoutUpi)
            }
          />

          {/* STATUS */}

          <div className="flex items-center justify-between border-b border-[#d9eee7] py-3">

            <span className="text-[24px] text-[#68788b]">
              Status:
            </span>

            <div className="flex items-center gap-3">

              <span className="text-[23px] font-medium text-[#202633]">
                {status === "Pending" &&
                  "Pending"}

                {status === "Processing" &&
                  "Processing"}

                {status === "Completed" &&
                  "Success"}

                {status === "Cancelled" &&
                  "Cancelled"}
              </span>

              {(status === "Pending" ||
                status === "Processing") && (
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className={`flex items-center gap-1 rounded-full border-2 px-4 py-2 text-[17px] font-bold ${
                    loading
                      ? "border-gray-200 bg-gray-100 text-gray-400"
                      : "border-red-200 bg-red-50 text-red-500"
                  }`}
                >
                  <X size={18} />

                  {loading
                    ? "Please wait..."
                    : "Cancel"}
                </button>
              )}

            </div>

          </div>

          {/* ORDER NUMBER */}

          <CopyRow
            label="NO:"
            value={orderNo}
            onCopy={() =>
              copyText(orderNo)
            }
          />

          <button
            type="button"
            className="mt-5 flex w-full items-center justify-center rounded-full border-2 border-[#cce9df] py-4 text-[26px] font-bold text-[#2a9572]"
          >
            View Voucher
            <span className="ml-3 text-[32px]">
              ›
            </span>
          </button>

        </div>
      </div>

      {/* ================= PAYMENT DETAILS ================= */}

      {status === "Pending" && (
        <div className="mx-12 mt-7 rounded-[25px] bg-white p-6 shadow-sm">

          <h2 className="text-[26px] font-bold text-[#15936d]">
            Payment Details
          </h2>

          <p className="mt-2 text-[16px] text-gray-500">
            After making the payment, enter your
            UTR / transaction details below.
          </p>

          {/* UTR */}

          <div className="mt-5">

            <label className="text-[18px] font-semibold text-gray-700">
              UTR / Transaction ID
            </label>

            <input
              type="text"
              value={utr}
              onChange={(e) =>
                setUtr(e.target.value)
              }
              placeholder="Enter UTR / Transaction ID"
              className="mt-2 h-[55px] w-full rounded-xl border border-gray-300 px-4 text-[17px] outline-none focus:border-[#15936d]"
            />

          </div>

          {/* SCREENSHOT */}

          <div className="mt-5">

            <label className="text-[18px] font-semibold text-gray-700">
              Payment Screenshot
            </label>

            <label className="mt-2 flex h-[100px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#b9dfd2] bg-[#f4fbf8]">

              <div className="text-center">

                <Upload
                  size={30}
                  className="mx-auto text-[#15936d]"
                />

                <p className="mt-1 text-[15px] text-gray-600">
                  {screenshot
                    ? screenshot.name
                    : "Upload payment screenshot"}
                </p>

              </div>

              <input
                type="file"
                accept="image/*"
                onChange={handleScreenshot}
                className="hidden"
              />

            </label>

          </div>

          {/* SUBMIT */}

          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              loading ||
              status !== "Pending" ||
              timeLeft <= 0
            }
            className={`mt-6 h-[58px] w-full rounded-full text-[20px] font-bold text-white shadow-md ${
              loading ||
              status !== "Pending" ||
              timeLeft <= 0
                ? "bg-gray-400"
                : "bg-[#129267]"
            }`}
          >
            {loading
              ? "Submitting..."
              : timeLeft <= 0
              ? "Time Expired"
              : "Submit Payment"}
          </button>

        </div>
      )}

      {/* ================= PROCESSING MESSAGE ================= */}

      {status === "Processing" && (
        <div className="mx-12 mt-7 rounded-[25px] bg-white p-6 text-center shadow-sm">

          <h2 className="text-[24px] font-bold text-[#15936d]">
            Payment Submitted
          </h2>

          <p className="mt-2 text-[16px] text-gray-500">
            Your payment has been submitted.
            Please wait for processing to complete.
          </p>

        </div>
      )}

      {/* ================= CANCELLED ================= */}

      {status === "Cancelled" && (
        <div className="mx-12 mt-7 rounded-[25px] bg-white p-6 text-center shadow-sm">

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">

            <X
              size={35}
              className="text-red-500"
            />

          </div>

          <h2 className="mt-4 text-[24px] font-bold text-red-500">
            Order Cancelled
          </h2>

          <p className="mt-2 text-[16px] text-gray-500">
            This order has been cancelled.
          </p>

        </div>
      )}

    </div>
  );
}


/* ================= COPY ROW ================= */

function CopyRow({
  label,
  value,
  onCopy,
}) {
  return (
    <div className="flex items-center justify-between border-b border-[#d9eee7] py-3">

      <span className="text-[24px] text-[#68788b]">
        {label}
      </span>

      <div className="flex items-center gap-4">

        <span className="max-w-[300px] break-all text-right text-[23px] text-[#202633]">
          {value || "-"}
        </span>

        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 text-[#15936d]"
        >
          <Copy size={26} />
        </button>

      </div>

    </div>
  );
}

export default Order;
