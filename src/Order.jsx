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

  const amount = Number(
    order?.amount ?? 200
  );

  const payeeAccount = " 002821713552123";
  const payeeName = "Divyansh";
  const ifsc = "JIOP0000001";
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
            Number(
              data.remainingSeconds || 0
            )
          );
        }

        if (data.status === "Completed") {
          setProcessingTime(0);
          setStatus("Completed");

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

    if (timeLeft <= 0) {
      alert("Payment time has expired.");
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

    if (status === "Pending") {
      setStatus("Cancelled");
      return;
    }

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
    <div className="min-h-screen w-full overflow-x-hidden bg-[#f5f7fb] pb-8">

      {/* ================= HEADER ================= */}

      <div className="relative flex items-center justify-center bg-white px-4 sm:px-5 pt-4 sm:pt-7 pb-4 sm:pb-6">

        <button
          type="button"
          onClick={() =>
            onNavigate("payment")
          }
          className="absolute left-3 sm:left-6 top-4 sm:top-7 flex h-9 w-9 sm:h-auto sm:w-auto items-center justify-center"
        >
          <ArrowLeft
            size={30}
            className="sm:hidden text-[#15936d]"
            strokeWidth={2}
          />

          <ArrowLeft
            size={42}
            className="hidden sm:block text-[#15936d]"
            strokeWidth={2}
          />
        </button>

        <h1 className="text-[25px] sm:text-[38px] font-bold text-[#129267]">
          Order
        </h1>

      </div>

      {/* ================= 7 MINUTE TIMER ================= */}

      {status === "Pending" && (
        <div className="mx-4 sm:mx-12 mt-4 sm:mt-5 rounded-[17px] sm:rounded-[20px] bg-white px-4 sm:px-5 py-3 sm:py-4 text-center shadow-sm">

          <p className="text-[13px] sm:text-[17px] font-semibold text-[#68788b]">
            Payment Time Remaining
          </p>

          <div className="mt-1 text-[32px] sm:text-[38px] font-bold text-[#15936d]">
            {minutes}:{seconds}
          </div>

          {timeLeft === 0 && (
            <p className="text-[13px] sm:text-[15px] font-semibold text-red-500">
              Time expired
            </p>
          )}

        </div>
      )}

      {/* ================= PROCESSING ================= */}

      {status === "Processing" && (
        <div className="mx-4 sm:mx-12 mt-4 sm:mt-5 rounded-[17px] sm:rounded-[20px] bg-white px-4 sm:px-5 py-4 sm:py-5 text-center shadow-sm">

          <p className="text-[15px] sm:text-[18px] font-semibold text-[#68788b]">
            Order Processing
          </p>

          <div className="mt-1 text-[32px] sm:text-[38px] font-bold text-[#15936d]">
            {processingMinutes}:
            {processingSeconds}
          </div>

          <p className="mt-1 text-[13px] sm:text-[15px] text-gray-500">
            Please wait while your payment is being processed.
          </p>

        </div>
      )}

      {/* ================= SUCCESS ================= */}

      {status === "Completed" && (
        <div className="mx-4 sm:mx-12 mt-4 sm:mt-5 rounded-[17px] sm:rounded-[20px] bg-white px-4 sm:px-5 py-4 sm:py-5 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-[#eaf8f2]">
            <span className="text-[32px] sm:text-[38px] font-bold text-[#15936d]">
              ✓
            </span>
          </div>

          <h2 className="mt-3 text-[21px] sm:text-[26px] font-bold text-[#15936d]">
            Order Successful
          </h2>

          <p className="mt-1 text-[13px] sm:text-[16px] text-gray-500">
            Payment has been completed successfully.
          </p>

        </div>
      )}

      {/* ================= ORDER CARD ================= */}

      <div className="mx-4 sm:mx-12 mt-5 sm:mt-7 overflow-hidden rounded-[20px] sm:rounded-[28px] bg-white shadow-sm">

        {/* AMOUNT */}

        <div className="bg-[#eaf8f2] py-3 sm:py-2 text-center">

          <span className="text-[30px] sm:text-[56px] font-bold text-[#128f68]">
            INR
          </span>

          <span className="ml-1.5 sm:ml-2 text-[30px] sm:text-[56px] font-extrabold text-[#111827]">
            {amount.toFixed(2)}
          </span>

        </div>

        <div className="px-4 sm:px-9 py-4 sm:py-5">

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

            <div className="flex items-start justify-between gap-3">

              <span className="text-[14px] sm:text-[24px] text-[#68788b]">
                IFSC:
              </span>

              <div className="flex min-w-0 items-center gap-2 sm:gap-4">

                <span className="break-all text-right text-[14px] sm:text-[23px] text-[#202633]">
                  {ifsc}
                </span>

                <button
                  type="button"
                  onClick={() =>
                    copyText(ifsc)
                  }
                  className="shrink-0 text-[#15936d]"
                >
                  <Copy
                    size={19}
                    className="sm:hidden"
                  />

                  <Copy
                    size={26}
                    className="hidden sm:block"
                  />
                </button>

              </div>

            </div>

            <p className="mt-2 text-right text-[11px] sm:text-[17px] font-semibold text-[#c6a875]">
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

            <div className="flex items-center justify-between gap-3">

              <span className="text-[14px] sm:text-[24px] text-[#68788b]">
                Payout Wallet:
              </span>

              <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">

                <div className="flex h-7 w-7 sm:h-9 sm:w-9 items-center justify-center rounded-md bg-[#1d5ce8] text-sm sm:text-base text-white">
                  M
                </div>

                <span className="text-[13px] sm:text-[23px] text-[#202633]">
                  Mobikwik
                </span>

                <button
                  type="button"
                  className="rounded-full border sm:border-2 border-[#b8e2d5] bg-[#eaf8f2] px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[18px] font-bold text-[#188d68]"
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

          <div className="flex items-center justify-between gap-3 border-b border-[#d9eee7] py-3">

            <span className="text-[14px] sm:text-[24px] text-[#68788b]">
              Status:
            </span>

            <div className="flex min-w-0 items-center gap-2 sm:gap-3">

              <span className="text-right text-[14px] sm:text-[23px] font-medium text-[#202633]">
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
                  className={`flex shrink-0 items-center gap-1 rounded-full border px-2.5 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-[17px] font-bold ${
                    loading
                      ? "border-gray-200 bg-gray-100 text-gray-400"
                      : "border-red-200 bg-red-50 text-red-500"
                  }`}
                >
                  <X
                    size={14}
                    className="sm:hidden"
                  />

                  <X
                    size={18}
                    className="hidden sm:block"
                  />

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
            className="mt-4 sm:mt-5 flex w-full items-center justify-center rounded-full border-2 border-[#cce9df] py-3 sm:py-4 text-[17px] sm:text-[26px] font-bold text-[#2a9572]"
          >
            View Voucher

            <span className="ml-2 sm:ml-3 text-[25px] sm:text-[32px]">
              ›
            </span>
          </button>

        </div>
      </div>

      {/* ================= PAYMENT DETAILS ================= */}

      {status === "Pending" && (
        <div className="mx-4 sm:mx-12 mt-5 sm:mt-7 rounded-[20px] sm:rounded-[25px] bg-white p-4 sm:p-6 shadow-sm">

          <h2 className="text-[21px] sm:text-[26px] font-bold text-[#15936d]">
            Payment Details
          </h2>

          <p className="mt-2 text-[13px] sm:text-[16px] text-gray-500">
            After making the payment, enter your
            UTR / transaction details below.
          </p>

          {/* UTR */}

          <div className="mt-4 sm:mt-5">

            <label className="text-[15px] sm:text-[18px] font-semibold text-gray-700">
              UTR / Transaction ID
            </label>

            <input
              type="text"
              value={utr}
              onChange={(e) =>
                setUtr(e.target.value)
              }
              placeholder="Enter UTR / Transaction ID"
              className="mt-2 h-[50px] sm:h-[55px] w-full rounded-xl border border-gray-300 px-3 sm:px-4 text-[14px] sm:text-[17px] outline-none focus:border-[#15936d]"
            />

          </div>

          {/* SCREENSHOT */}

          <div className="mt-4 sm:mt-5">

            <label className="text-[15px] sm:text-[18px] font-semibold text-gray-700">
              Payment Screenshot
            </label>

            <label className="mt-2 flex h-[90px] sm:h-[100px] cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-[#b9dfd2] bg-[#f4fbf8]">

              <div className="max-w-full px-3 text-center">

                <Upload
                  size={25}
                  className="mx-auto text-[#15936d] sm:hidden"
                />

                <Upload
                  size={30}
                  className="mx-auto hidden text-[#15936d] sm:block"
                />

                <p className="mt-1 truncate text-[12px] sm:text-[15px] text-gray-600">
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
            className={`mt-5 sm:mt-6 h-[52px] sm:h-[58px] w-full rounded-full text-[17px] sm:text-[20px] font-bold text-white shadow-md ${
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
        <div className="mx-4 sm:mx-12 mt-5 sm:mt-7 rounded-[20px] sm:rounded-[25px] bg-white p-5 sm:p-6 text-center shadow-sm">

          <h2 className="text-[21px] sm:text-[24px] font-bold text-[#15936d]">
            Payment Submitted
          </h2>

          <p className="mt-2 text-[13px] sm:text-[16px] text-gray-500">
            Your payment has been submitted.
            Please wait for processing to complete.
          </p>

        </div>
      )}

      {/* ================= CANCELLED ================= */}

      {status === "Cancelled" && (
        <div className="mx-4 sm:mx-12 mt-5 sm:mt-7 rounded-[20px] sm:rounded-[25px] bg-white p-5 sm:p-6 text-center shadow-sm">

          <div className="mx-auto flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-full bg-red-50">

            <X
              size={30}
              className="text-red-500 sm:hidden"
            />

            <X
              size={35}
              className="hidden text-red-500 sm:block"
            />

          </div>

          <h2 className="mt-4 text-[21px] sm:text-[24px] font-bold text-red-500">
            Order Cancelled
          </h2>

          <p className="mt-2 text-[13px] sm:text-[16px] text-gray-500">
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
    <div className="flex items-start justify-between gap-3 border-b border-[#d9eee7] py-3">

      <span className="shrink-0 text-[14px] sm:text-[24px] text-[#68788b]">
        {label}
      </span>

      <div className="flex min-w-0 items-center gap-2 sm:gap-4">

        <span className="max-w-[170px] sm:max-w-[300px] break-all text-right text-[14px] sm:text-[23px] text-[#202633]">
          {value || "-"}
        </span>

        <button
          type="button"
          onClick={onCopy}
          className="shrink-0 text-[#15936d]"
        >
          <Copy
            size={19}
            className="sm:hidden"
          />

          <Copy
            size={26}
            className="hidden sm:block"
          />
        </button>

      </div>

    </div>
  );
}

export default Order;