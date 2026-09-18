import React, { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Users,
  ReceiptText,
  Wallet,
  ArrowDownToLine,
  Search,
  RefreshCw,
  LogOut,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const API = "https://joshpay.onrender.com/api";

function money(value) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function statusClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "completed" || s === "approved") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (s === "processing" || s === "pending") {
    return "bg-amber-50 text-amber-700";
  }
  if (s === "cancelled" || s === "rejected" || s === "failed") {
    return "bg-red-50 text-red-700";
  }
  return "bg-slate-100 text-slate-600";
}

function StatCard({ title, value, icon: Icon, sub }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-2xl font-extrabold text-slate-900">{value}</p>
          {sub ? <p className="mt-1 text-xs text-slate-400">{sub}</p> : null}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

function AdminLogin({ onLogin }) {
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    if (!phone || !password) {
      setError("Admin phone and password are required.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success || !data.token) {
        throw new Error(data.message || "Admin login failed");
      }

      localStorage.setItem("joshPayAdminToken", data.token);
      onLogin(data);
    } catch (err) {
      setError(err.message || "Cannot connect to server.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] px-5 py-10">
      <div className="mx-auto flex min-h-[80vh] max-w-md items-center justify-center">
        <form
          onSubmit={submit}
          className="w-full rounded-3xl bg-white p-7 shadow-xl ring-1 ring-slate-100"
        >
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-700 text-3xl font-black text-white shadow-lg">
            JP
          </div>

          <h1 className="mt-5 text-center text-3xl font-extrabold text-slate-900">
            Josh Pay
          </h1>
          <p className="mt-1 text-center text-sm text-slate-500">
            Admin Panel
          </p>

          {error ? (
            <div className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <label className="mt-6 block text-sm font-semibold text-slate-700">
            Admin Phone
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500"
            placeholder="Enter admin phone"
          />

          <label className="mt-4 block text-sm font-semibold text-slate-700">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 h-12 w-full rounded-xl border border-slate-200 px-4 outline-none focus:border-emerald-500"
            placeholder="Enter admin password"
          />

          <button
            disabled={loading}
            className="mt-6 h-12 w-full rounded-xl bg-[#129267] font-bold text-white shadow-md transition hover:bg-[#0e7e59] disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Admin Sign In"}
          </button>

          <p className="mt-5 text-center text-xs text-slate-400">
            Authorized admin access only
          </p>
        </form>
      </div>
    </div>
  );
}

function AdminPanel({ onLogout }) {
  const [section, setSection] = useState("dashboard");
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("joshPayAdminToken");

  async function api(path, options = {}) {
    const res = await fetch(`${API}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers || {}),
      },
    });

    const data = await res.json();

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("joshPayAdminToken");
      onLogout();
      throw new Error("Admin session expired.");
    }

    if (!res.ok || data.success === false) {
      throw new Error(data.message || "Request failed");
    }

    return data;
  }

  async function loadDashboard() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/admin/dashboard");
      setDashboard(data.dashboard);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadUsers() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/admin/users");
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadOrders() {
    setLoading(true);
    setError("");
    try {
      const data = await api("/admin/orders");
      setOrders(data.orders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadSection(target = section) {
    if (target === "dashboard") return loadDashboard();
    if (target === "users") return loadUsers();
    if (target === "orders") return loadOrders();
  }

  useEffect(() => {
    loadSection(section);
  }, [section]);

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;

    return users.filter((u) =>
      [
        u.phone,
        u.username,
        u._id,
        u.id,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [users, query]);

  const filteredOrders = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter((o) =>
      [
        o.orderNo,
        o.phone,
        o.username,
        o.utr,
        o.status,
      ]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [orders, query]);

  const pageSize = 10;
  const currentUsers = filteredUsers.slice((page - 1) * pageSize, page * pageSize);
  const currentOrders = filteredOrders.slice((page - 1) * pageSize, page * pageSize);

  function changeSection(target) {
    setSection(target);
    setQuery("");
    setPage(1);
    setSelectedUser(null);
  }

  function logout() {
    localStorage.removeItem("joshPayAdminToken");
    onLogout();
  }

  return (
    <div className="min-h-screen bg-[#f4f7f6] text-slate-900">
      <div className="flex min-h-screen">
        {/* SIDEBAR */}
        <aside className="hidden w-64 shrink-0 bg-[#103c2d] text-white md:flex md:flex-col">
          <div className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-lg font-black text-[#129267]">
              JP
            </div>
            <div>
              <p className="text-lg font-extrabold">Josh Pay</p>
              <p className="text-xs text-emerald-100/70">Admin Panel</p>
            </div>
          </div>

          <nav className="px-3">
            {[
              ["dashboard", "Dashboard", LayoutDashboard],
              ["users", "Users", Users],
              ["orders", "Orders", ReceiptText],
            ].map(([key, label, Icon]) => (
              <button
                key={key}
                onClick={() => changeSection(key)}
                className={`mb-2 flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                  section === key
                    ? "bg-white text-[#103c2d]"
                    : "text-emerald-50 hover:bg-white/10"
                }`}
              >
                <Icon size={19} />
                {label}
              </button>
            ))}
          </nav>

          <div className="mt-auto px-3 pb-5">
            <button
              onClick={logout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-emerald-50 hover:bg-white/10"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </aside>

        {/* MAIN */}
        <main className="min-w-0 flex-1">
          <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/95 px-4 py-4 backdrop-blur md:px-7">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-extrabold md:text-2xl">
                  {section === "dashboard"
                    ? "Dashboard"
                    : section === "users"
                    ? "Users"
                    : "Orders"}
                </h1>
                <p className="text-xs text-slate-400">
                  Manage Josh Pay data
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => loadSection(section)}
                  className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
                >
                  <RefreshCw size={16} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>

                <button
                  onClick={logout}
                  className="flex h-10 items-center gap-2 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700 md:hidden"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>

            <div className="mt-4 flex gap-2 overflow-x-auto md:hidden">
              {[
                ["dashboard", "Dashboard"],
                ["users", "Users"],
                ["orders", "Orders"],
              ].map(([key, label]) => (
                <button
                  key={key}
                  onClick={() => changeSection(key)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
                    section === key
                      ? "bg-[#129267] text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </header>

          <div className="p-4 md:p-7">
            {error ? (
              <div className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            {section === "dashboard" ? (
              loading ? (
                <div className="rounded-2xl bg-white p-10 text-center text-slate-400">
                  Loading dashboard...
                </div>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                      title="Total Users"
                      value={dashboard?.totalUsers ?? 0}
                      icon={Users}
                    />
                    <StatCard
                      title="Total Deposits"
                      value={money(dashboard?.totalDeposit)}
                      icon={Wallet}
                    />
                    <StatCard
                      title="Total Withdrawals"
                      value={money(dashboard?.totalWithdrawal)}
                      icon={ArrowDownToLine}
                    />
                    <StatCard
                      title="Commission"
                      value={money(dashboard?.commission)}
                      icon={ShieldCheck}
                    />
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-3">
                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                      <p className="text-sm font-semibold text-slate-500">
                        Processing Orders
                      </p>
                      <p className="mt-2 text-3xl font-extrabold">
                        {dashboard?.processingOrders ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                      <p className="text-sm font-semibold text-slate-500">
                        Completed Orders
                      </p>
                      <p className="mt-2 text-3xl font-extrabold">
                        {dashboard?.completedOrders ?? 0}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                      <p className="text-sm font-semibold text-slate-500">
                        Task Reward Claims
                      </p>
                      <p className="mt-2 text-3xl font-extrabold">
                        {dashboard?.taskRewardClaims ?? 0}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="font-extrabold">Quick Access</h2>
                        <p className="mt-1 text-sm text-slate-400">
                          Open a management section.
                        </p>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <button
                        onClick={() => changeSection("users")}
                        className="rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/40"
                      >
                        <Users className="text-emerald-600" size={22} />
                        <p className="mt-3 font-bold">Manage Users</p>
                        <p className="mt-1 text-xs text-slate-400">
                          View users, balances and deposits.
                        </p>
                      </button>

                      <button
                        onClick={() => changeSection("orders")}
                        className="rounded-xl border border-slate-200 p-4 text-left hover:border-emerald-300 hover:bg-emerald-50/40"
                      >
                        <ReceiptText className="text-emerald-600" size={22} />
                        <p className="mt-3 font-bold">View Orders</p>
                        <p className="mt-1 text-xs text-slate-400">
                          Track payment and order status.
                        </p>
                      </button>
                    </div>
                  </div>
                </>
              )
            ) : null}

            {section === "users" ? (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-extrabold">All Users</h2>
                    <p className="text-xs text-slate-400">
                      {filteredUsers.length} users found
                    </p>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search phone, username or ID"
                      className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="p-10 text-center text-slate-400">
                    Loading users...
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                          <tr>
                            <th className="px-5 py-3">User</th>
                            <th className="px-5 py-3">Phone</th>
                            <th className="px-5 py-3">Balance</th>
                            <th className="px-5 py-3">Deposit</th>
                            <th className="px-5 py-3">Withdraw</th>
                            <th className="px-5 py-3">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentUsers.map((u) => (
                            <tr key={u._id || u.id} className="border-t border-slate-100">
                              <td className="px-5 py-4">
                                <div className="font-bold">{u.username || "User"}</div>
                                <div className="max-w-[180px] truncate text-xs text-slate-400">
                                  {u._id || u.id}
                                </div>
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {u.phone || "-"}
                              </td>
                              <td className="px-5 py-4 font-bold">
                                {money(u.balance)}
                              </td>
                              <td className="px-5 py-4">
                                {money(u.totalDeposit)}
                              </td>
                              <td className="px-5 py-4">
                                {money(u.totalWithdrawal)}
                              </td>
                              <td className="px-5 py-4">
                                <button
                                  onClick={() => setSelectedUser(u)}
                                  className="rounded-lg bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-100"
                                >
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}

                          {!currentUsers.length ? (
                            <tr>
                              <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                                No users found.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      page={page}
                      total={filteredUsers.length}
                      pageSize={pageSize}
                      onPage={setPage}
                    />
                  </>
                )}
              </div>
            ) : null}

            {section === "orders" ? (
              <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
                <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="font-extrabold">Orders</h2>
                    <p className="text-xs text-slate-400">
                      {filteredOrders.length} orders found
                    </p>
                  </div>

                  <div className="relative w-full sm:w-80">
                    <Search
                      size={17}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setPage(1);
                      }}
                      placeholder="Search order, UTR or phone"
                      className="h-11 w-full rounded-xl border border-slate-200 pl-10 pr-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="p-10 text-center text-slate-400">
                    Loading orders...
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[900px] text-left text-sm">
                        <thead className="bg-slate-50 text-xs uppercase text-slate-400">
                          <tr>
                            <th className="px-5 py-3">Order</th>
                            <th className="px-5 py-3">User</th>
                            <th className="px-5 py-3">Amount</th>
                            <th className="px-5 py-3">UTR</th>
                            <th className="px-5 py-3">Status</th>
                            <th className="px-5 py-3">Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {currentOrders.map((o, index) => (
                            <tr
                              key={`${o.orderNo || "order"}-${index}`}
                              className="border-t border-slate-100"
                            >
                              <td className="px-5 py-4 font-bold">
                                {o.orderNo || "-"}
                              </td>
                              <td className="px-5 py-4">
                                <div className="font-semibold">{o.username || "User"}</div>
                                <div className="text-xs text-slate-400">{o.phone || "-"}</div>
                              </td>
                              <td className="px-5 py-4 font-bold">
                                {money(o.amount)}
                              </td>
                              <td className="px-5 py-4 text-slate-600">
                                {o.utr || "-"}
                              </td>
                              <td className="px-5 py-4">
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-bold ${statusClass(
                                    o.status
                                  )}`}
                                >
                                  {o.status || "Unknown"}
                                </span>
                              </td>
                              <td className="px-5 py-4 text-xs text-slate-500">
                                {o.createdAt
                                  ? new Date(o.createdAt).toLocaleString("en-IN")
                                  : "-"}
                              </td>
                            </tr>
                          ))}

                          {!currentOrders.length ? (
                            <tr>
                              <td colSpan="6" className="px-5 py-10 text-center text-slate-400">
                                No orders found.
                              </td>
                            </tr>
                          ) : null}
                        </tbody>
                      </table>
                    </div>

                    <Pagination
                      page={page}
                      total={filteredOrders.length}
                      pageSize={pageSize}
                      onPage={setPage}
                    />
                  </>
                )}
              </div>
            ) : null}
          </div>
        </main>
      </div>

      {/* USER DETAILS */}
      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-5">
          <div className="max-h-[90vh] w-full max-w-lg overflow-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                  User Details
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">
                  {selectedUser.username || "User"}
                </h2>
              </div>

              <button
                onClick={() => setSelectedUser(null)}
                className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-bold"
              >
                Close
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <Detail label="Phone" value={selectedUser.phone || "-"} />
              <Detail label="Balance" value={money(selectedUser.balance)} />
              <Detail label="Deposit" value={money(selectedUser.totalDeposit)} />
              <Detail label="Withdrawal" value={money(selectedUser.totalWithdrawal)} />
              <Detail label="Commission" value={money(selectedUser.bonus)} />
              <Detail
                label="Task Reward"
                value={selectedUser.taskRewardClaimed ? "Claimed" : "Not claimed"}
              />
            </div>

            <div className="mt-4 rounded-xl bg-slate-50 p-4">
              <p className="text-xs font-bold uppercase text-slate-400">User ID</p>
              <p className="mt-1 break-all text-sm font-semibold text-slate-700">
                {selectedUser._id || selectedUser.id || "-"}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 break-words font-bold text-slate-800">{value}</p>
    </div>
  );
}

function Pagination({ page, total, pageSize, onPage }) {
  const pages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
      <p className="text-xs text-slate-400">
        Page {page} of {pages}
      </p>

      <div className="flex gap-2">
        <button
          disabled={page <= 1}
          onClick={() => onPage(page - 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
        >
          <ChevronLeft size={17} />
        </button>

        <button
          disabled={page >= pages}
          onClick={() => onPage(page + 1)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 disabled:opacity-40"
        >
          <ChevronRight size={17} />
        </button>
      </div>
    </div>
  );
}

export default function AdminApp() {
  const [loggedIn, setLoggedIn] = useState(
    Boolean(localStorage.getItem("joshPayAdminToken"))
  );

  if (!loggedIn) {
    return <AdminLogin onLogin={() => setLoggedIn(true)} />;
  }

  return (
    <AdminPanel
      onLogout={() => setLoggedIn(false)}
    />
  );
}

