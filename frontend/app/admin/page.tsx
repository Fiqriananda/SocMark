"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";

interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  role: "admin" | "reseller" | "member";
  status: "active" | "inactive";
  apiKey: string;
  color: string;
}

const COLORS = [
  "#52705f",
  "#c65b83",
  "#c28b35",
  "#43815a",
  "#3385a5",
  "#8060a8",
  "#b64a3b",
  "#3f8d83",
];

function genKey(): string {
  return `sk_${Array.from({ length: 28 }, () =>
    Math.random().toString(36)[2]
  ).join("")}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => word[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const INITIAL_USERS: User[] = [
  { id: "USR001", name: "Grace Nakamura", username: "gracemark", email: "grace@socmark.id", role: "admin", status: "active", apiKey: genKey(), color: "#52705f" },
  { id: "USR002", name: "Bima Santoso", username: "bimasnt", email: "bima@socmark.id", role: "reseller", status: "active", apiKey: genKey(), color: "#c28b35" },
  { id: "USR003", name: "Laila Putri", username: "laila_p", email: "laila@socmark.id", role: "member", status: "active", apiKey: genKey(), color: "#43815a" },
  { id: "USR004", name: "Dimas Arief", username: "dimasarief", email: "dimas@socmark.id", role: "reseller", status: "inactive", apiKey: genKey(), color: "#3385a5" },
  { id: "USR005", name: "Sari Wulandari", username: "sariwulan", email: "sari@socmark.id", role: "member", status: "active", apiKey: genKey(), color: "#c65b83" },
  { id: "USR006", name: "Reza Firmansyah", username: "rezafirman", email: "reza@socmark.id", role: "admin", status: "active", apiKey: genKey(), color: "#8060a8" },
  { id: "USR007", name: "Nadia Kusuma", username: "nadiakusuma", email: "nadia@socmark.id", role: "member", status: "inactive", apiKey: genKey(), color: "#b64a3b" },
  { id: "USR008", name: "Fajar Nugroho", username: "fajarnug", email: "fajar@socmark.id", role: "reseller", status: "active", apiKey: genKey(), color: "#3f8d83" },
  { id: "USR009", name: "Citra Ayu", username: "citraayu", email: "citra@socmark.id", role: "member", status: "active", apiKey: genKey(), color: "#c28b35" },
  { id: "USR010", name: "Hendra Wijaya", username: "hendrawj", email: "hendra@socmark.id", role: "reseller", status: "active", apiKey: genKey(), color: "#52705f" },
  { id: "USR011", name: "Putri Rahayu", username: "putrirahay", email: "putri@socmark.id", role: "member", status: "inactive", apiKey: genKey(), color: "#43815a" },
  { id: "USR012", name: "Andi Prasetyo", username: "andipras", email: "andi@socmark.id", role: "admin", status: "active", apiKey: genKey(), color: "#c65b83" },
];

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [nextIdNum, setNextIdNum] = useState(13);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"admin" | "reseller" | "member">("member");
  const [formStatus, setFormStatus] = useState<"active" | "inactive">("active");

  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);

  // Toast
  const [toast, setToast] = useState<{ message: string; type: "success" | "danger" } | null>(null);

  const showToast = (message: string, type: "success" | "danger" = "success") => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 2800);
    return () => clearTimeout(timer);
  }, [toast]);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFormModalOpen(false);
        setDeleteTargetUser(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Stats
  const stats = useMemo(() => {
    return {
      total: users.length,
      admin: users.filter((u) => u.role === "admin").length,
      reseller: users.filter((u) => u.role === "reseller").length,
      member: users.filter((u) => u.role === "member").length,
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return users.filter((u) => {
      const matchesQuery =
        !q ||
        [u.name, u.username, u.email].some((val) => val.toLowerCase().includes(q));
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesQuery && matchesRole && matchesStatus;
    });
  }, [users, searchQuery, roleFilter, statusFilter]);

  // Modal actions
  const handleOpenAddModal = () => {
    setEditingUserId(null);
    setFormName("");
    setFormUsername("");
    setFormEmail("");
    setFormRole("member");
    setFormStatus("active");
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormUsername(user.username);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormStatus(user.status);
    setIsFormModalOpen(true);
  };

  const handleSaveUser = () => {
    const name = formName.trim();
    const username = formUsername.trim();
    const email = formEmail.trim();

    if (!name || !username || !email) {
      showToast("Lengkapi nama, username, dan email terlebih dahulu.", "danger");
      return;
    }

    if (editingUserId) {
      setUsers((prev) =>
        prev.map((u) =>
          u.id === editingUserId
            ? { ...u, name, username, email, role: formRole, status: formStatus }
            : u
        )
      );
      showToast("Data pengguna berhasil diperbarui.");
    } else {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const newId = `USR${String(nextIdNum).padStart(3, "0")}`;
      setNextIdNum((n) => n + 1);
      setUsers((prev) => [
        ...prev,
        {
          id: newId,
          name,
          username,
          email,
          role: formRole,
          status: formStatus,
          apiKey: genKey(),
          color,
        },
      ]);
      showToast("Pengguna berhasil ditambahkan.");
    }

    setIsFormModalOpen(false);
  };

  const handleDeleteUser = () => {
    if (!deleteTargetUser) return;
    setUsers((prev) => prev.filter((u) => u.id !== deleteTargetUser.id));
    setDeleteTargetUser(null);
    showToast("Pengguna berhasil dihapus.");
  };

  const handleCopyApiKey = async (key: string) => {
    try {
      await navigator.clipboard.writeText(key);
      showToast("API key berhasil disalin.");
    } catch {
      showToast("Tidak dapat menyalin API key. Periksa izin clipboard browser.", "danger");
    }
  };

  const handleRegenerateApiKey = (userId: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, apiKey: genKey() } : u))
    );
    showToast("API key berhasil dibuat ulang.");
  };

  return (
    <div className="min-h-screen bg-[#f7f8f6] font-sans text-[#18231e] antialiased">
      {/* Top Admin Header */}
      <header className="border-b border-[#e6e9e4] bg-white">
        <nav
          className="mx-auto flex min-h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8 lg:px-10"
          aria-label="Navigasi utama"
        >
          <Link
            className="inline-flex items-center gap-2.5 text-[1.05rem] font-bold text-[#18231e] no-underline"
            href="/"
            aria-label="SocMark beranda"
          >
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-[#203329] text-sm text-white">
              S
            </span>
            <span>SocMark</span>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <Link
              href="/"
              className="text-xs font-semibold text-[#69736c] hover:text-[#18231e] transition"
            >
              Feed
            </Link>
            <Link
              href="/discover"
              className="text-xs font-semibold text-[#69736c] hover:text-[#18231e] transition"
            >
              Discover
            </Link>
            <span className="rounded-full bg-[#edf1e9] px-3 py-1.5 text-xs font-semibold text-[#355744]">
              Admin
            </span>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl px-5 py-8 sm:px-8 sm:py-10 lg:px-10">
        {/* Title & Badge */}
        <section className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 text-[0.7rem] font-bold tracking-[0.12em] text-[#52705f]">
              PANEL ADMINISTRATOR
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-[#18231e] sm:text-4xl">
              Kelola pengguna
            </h1>
            <p className="mt-2 text-sm text-[#69736c]">
              Atur akses, peran, dan API key komunitas SocMark.
            </p>
          </div>
          <span
            id="total-badge"
            className="w-fit rounded-full border border-[#dce4dc] bg-white px-3.5 py-2 text-sm font-semibold text-[#355744]"
          >
            {stats.total} pengguna
          </span>
        </section>

        {/* Stat Cards */}
        <section
          className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Ringkasan pengguna"
        >
          {/* Total */}
          <article className="flex items-center gap-4 rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_4px_16px_rgba(32,51,41,0.04)]">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf1e9] text-[#355744]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="10" cy="7" r="4" />
                <path d="M20 8v6m3-3h-6" />
              </svg>
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{stats.total}</p>
              <p className="mt-1.5 text-sm text-[#69736c]">Total pengguna</p>
            </div>
          </article>

          {/* Admin */}
          <article className="flex items-center gap-4 rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_4px_16px_rgba(32,51,41,0.04)]">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f1edfa] text-[#7652a3]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M12 3 4 6v5c0 5 3.4 8.2 8 10 4.6-1.8 8-5 8-10V6l-8-3Z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{stats.admin}</p>
              <p className="mt-1.5 text-sm text-[#69736c]">Admin</p>
            </div>
          </article>

          {/* Reseller */}
          <article className="flex items-center gap-4 rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_4px_16px_rgba(32,51,41,0.04)]">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#fbf2df] text-[#a66b19]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M20 7H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2Z" />
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
              </svg>
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{stats.reseller}</p>
              <p className="mt-1.5 text-sm text-[#69736c]">Reseller</p>
            </div>
          </article>

          {/* Member */}
          <article className="flex items-center gap-4 rounded-2xl border border-[#e6e9e4] bg-white p-5 shadow-[0_4px_16px_rgba(32,51,41,0.04)]">
            <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#e8f3ec] text-[#34724b]">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <circle cx="12" cy="8" r="4" />
                <path d="M5 21v-2a7 7 0 0 1 14 0v2" />
              </svg>
            </span>
            <div>
              <p className="text-2xl font-bold leading-none">{stats.member}</p>
              <p className="mt-1.5 text-sm text-[#69736c]">Member</p>
            </div>
          </article>
        </section>

        {/* Table & Controls Section */}
        <section
          className="overflow-hidden rounded-2xl border border-[#e6e9e4] bg-white shadow-[0_8px_24px_rgba(32,51,41,0.05)]"
          aria-label="Daftar pengguna"
        >
          {/* Controls Bar */}
          <div className="flex flex-col gap-3 border-b border-[#e6e9e4] p-4 sm:flex-row sm:items-center sm:p-5">
            <label className="relative min-w-0 flex-1 sm:max-w-md">
              <span className="sr-only">Cari pengguna</span>
              <svg
                className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8a938d]"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input
                className="w-full rounded-xl border border-[#dce4dc] bg-white py-2.5 pl-10 pr-3 text-sm text-[#18231e] outline-none transition placeholder:text-[#9aa39c] focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama, username, email..."
              />
            </label>

            <div className="grid grid-cols-2 gap-3 sm:flex">
              <label>
                <span className="sr-only">Filter peran</span>
                <select
                  className="w-full rounded-xl border border-[#dce4dc] bg-white px-3 py-2.5 text-sm text-[#355744] outline-none focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                >
                  <option value="">Semua peran</option>
                  <option value="admin">Admin</option>
                  <option value="reseller">Reseller</option>
                  <option value="member">Member</option>
                </select>
              </label>

              <label>
                <span className="sr-only">Filter status</span>
                <select
                  className="w-full rounded-xl border border-[#dce4dc] bg-white px-3 py-2.5 text-sm text-[#355744] outline-none focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">Semua status</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </label>
            </div>

            <button
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#203329] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#355744] focus:outline-none focus:ring-2 focus:ring-[#52705f] focus:ring-offset-2"
              type="button"
              onClick={handleOpenAddModal}
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14" />
              </svg>
              Tambah pengguna
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-[#f7f8f6] text-[0.7rem] font-semibold uppercase tracking-[0.08em] text-[#69736c]">
                <tr>
                  <th className="px-5 py-3.5" scope="col">ID</th>
                  <th className="px-5 py-3.5" scope="col">Pengguna</th>
                  <th className="px-5 py-3.5" scope="col">Username</th>
                  <th className="px-5 py-3.5" scope="col">Email</th>
                  <th className="px-5 py-3.5" scope="col">Peran</th>
                  <th className="px-5 py-3.5" scope="col">Status</th>
                  <th className="px-5 py-3.5" scope="col">API key</th>
                  <th className="px-5 py-3.5" scope="col">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#edf0ec]">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td className="px-5 py-12 text-center text-sm text-[#69736c]" colSpan={8}>
                      Tidak ada pengguna yang cocok.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => {
                    const roleClasses =
                      user.role === "admin"
                        ? "bg-[#edf1e9] text-[#355744]"
                        : user.role === "reseller"
                        ? "bg-[#fbf2df] text-[#946019]"
                        : "bg-[#f1f3f0] text-[#59645d]";

                    const statusClasses =
                      user.status === "active"
                        ? "bg-[#e8f3ec] text-[#34724b]"
                        : "bg-[#f1f3f0] text-[#69736c]";

                    return (
                      <tr key={user.id} className="transition hover:bg-[#fafbf9]">
                        <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-[#8a938d]">
                          {user.id}
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <span
                              className="grid h-9 w-9 shrink-0 place-items-center rounded-xl text-xs font-bold text-white"
                              style={{ backgroundColor: user.color }}
                            >
                              {initials(user.name)}
                            </span>
                            <span className="whitespace-nowrap font-semibold text-[#18231e]">
                              {user.name}
                            </span>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[#69736c]">
                          @{user.username}
                        </td>
                        <td className="whitespace-nowrap px-5 py-4 text-[#69736c]">
                          {user.email}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${roleClasses}`}
                          >
                            {user.role}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClasses}`}
                          >
                            {user.status === "active" ? "Aktif" : "Nonaktif"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="max-w-28 truncate font-mono text-xs text-[#69736c]"
                              title={user.apiKey}
                            >
                              {user.apiKey}
                            </span>
                            <button
                              className="rounded-md p-1.5 text-[#8a938d] transition hover:bg-[#edf1e9] hover:text-[#355744]"
                              type="button"
                              onClick={() => handleCopyApiKey(user.apiKey)}
                              aria-label={`Salin API key ${user.id}`}
                              title="Salin API key"
                            >
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                aria-hidden="true"
                              >
                                <rect x="8" y="8" width="13" height="13" rx="2" />
                                <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
                              </svg>
                            </button>
                            <button
                              className="rounded-md p-1.5 text-[#8a938d] transition hover:bg-[#edf1e9] hover:text-[#355744]"
                              type="button"
                              onClick={() => handleRegenerateApiKey(user.id)}
                              aria-label={`Buat ulang API key ${user.id}`}
                              title="Buat ulang API key"
                            >
                              <svg
                                className="h-4 w-4"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                aria-hidden="true"
                              >
                                <path d="M20 7h-5V2" />
                                <path d="M4 17h5v5" />
                                <path d="M5.6 9a7 7 0 0 1 11.6-2L20 9M4 15l2.8 2a7 7 0 0 0 11.6-2" />
                              </svg>
                            </button>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              className="rounded-lg border border-[#dce4dc] px-2.5 py-1.5 text-xs font-semibold text-[#355744] transition hover:bg-[#edf1e9]"
                              type="button"
                              onClick={() => handleOpenEditModal(user)}
                            >
                              Ubah
                            </button>
                            <button
                              className="rounded-lg border border-[#efd5d0] px-2.5 py-1.5 text-xs font-semibold text-[#a43f32] transition hover:bg-[#fbefec]"
                              type="button"
                              onClick={() => setDeleteTargetUser(user)}
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div
            className="border-t border-[#e6e9e4] px-5 py-4 text-xs text-[#69736c]"
            id="showing-label"
            aria-live="polite"
          >
            Menampilkan {filteredUsers.length} dari {users.length} pengguna
          </div>
        </section>
      </main>

      {/* Add / Edit Form Modal */}
      {isFormModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18231e]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFormModalOpen(false);
          }}
        >
          <section className="w-full max-w-lg rounded-2xl border border-[#e6e9e4] bg-white p-6 shadow-2xl sm:p-7">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#52705f]">
                  DATA PENGGUNA
                </p>
                <h2 className="text-xl font-bold text-[#18231e]">
                  {editingUserId ? "Ubah pengguna" : "Tambah pengguna"}
                </h2>
              </div>
              <button
                className="grid h-9 w-9 place-items-center rounded-lg text-[#69736c] transition hover:bg-[#f1f3f0] hover:text-[#18231e]"
                type="button"
                onClick={() => setIsFormModalOpen(false)}
                aria-label="Tutup dialog"
              >
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  aria-hidden="true"
                >
                  <path d="m18 6-12 12M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="space-y-1.5 text-sm font-medium text-[#355744]">
                  Nama lengkap <span className="text-[#b64a3b]">*</span>
                  <input
                    className="block w-full rounded-xl border border-[#dce4dc] px-3 py-2.5 text-sm text-[#18231e] outline-none placeholder:text-[#9aa39c] focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Grace Nakamura"
                    autoComplete="name"
                  />
                </label>
                <label className="space-y-1.5 text-sm font-medium text-[#355744]">
                  Username <span className="text-[#b64a3b]">*</span>
                  <input
                    className="block w-full rounded-xl border border-[#dce4dc] px-3 py-2.5 text-sm text-[#18231e] outline-none placeholder:text-[#9aa39c] focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                    type="text"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value)}
                    placeholder="gracemark"
                    autoComplete="username"
                  />
                </label>
              </div>

              <label className="block space-y-1.5 text-sm font-medium text-[#355744]">
                Email <span className="text-[#b64a3b]">*</span>
                <input
                  className="block w-full rounded-xl border border-[#dce4dc] px-3 py-2.5 text-sm text-[#18231e] outline-none placeholder:text-[#9aa39c] focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="grace@socmark.id"
                  autoComplete="email"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block space-y-1.5 text-sm font-medium text-[#355744]">
                  Peran
                  <select
                    className="block w-full rounded-xl border border-[#dce4dc] bg-white px-3 py-2.5 text-sm text-[#18231e] outline-none focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                    value={formRole}
                    onChange={(e) =>
                      setFormRole(e.target.value as "admin" | "reseller" | "member")
                    }
                  >
                    <option value="member">Member</option>
                    <option value="reseller">Reseller</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="block space-y-1.5 text-sm font-medium text-[#355744]">
                  Status
                  <select
                    className="block w-full rounded-xl border border-[#dce4dc] bg-white px-3 py-2.5 text-sm text-[#18231e] outline-none focus:border-[#52705f] focus:ring-2 focus:ring-[#52705f]/10"
                    value={formStatus}
                    onChange={(e) =>
                      setFormStatus(e.target.value as "active" | "inactive")
                    }
                  >
                    <option value="active">Aktif</option>
                    <option value="inactive">Nonaktif</option>
                  </select>
                </label>
              </div>
            </div>

            <div className="mt-7 flex justify-end gap-3">
              <button
                className="rounded-xl border border-[#dce4dc] px-4 py-2.5 text-sm font-semibold text-[#355744] transition hover:bg-[#f7f8f6]"
                type="button"
                onClick={() => setIsFormModalOpen(false)}
              >
                Batal
              </button>
              <button
                className="rounded-xl bg-[#203329] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#355744] focus:outline-none focus:ring-2 focus:ring-[#52705f] focus:ring-offset-2"
                type="button"
                onClick={handleSaveUser}
              >
                {editingUserId ? "Simpan perubahan" : "Simpan pengguna"}
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTargetUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#18231e]/45 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTargetUser(null);
          }}
        >
          <section className="w-full max-w-sm rounded-2xl border border-[#e6e9e4] bg-white p-6 text-center shadow-2xl">
            <span className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-xl bg-[#fbefec] text-[#b64a3b]">
              <svg
                className="h-6 w-6"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
              >
                <path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m5 4v6m4-6v6" />
              </svg>
            </span>
            <h2 className="text-lg font-bold text-[#18231e]">Hapus pengguna?</h2>
            <p className="mt-2 text-sm leading-relaxed text-[#69736c]">
              Pengguna &quot;{deleteTargetUser.name}&quot; akan dihapus secara permanen.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                className="rounded-xl border border-[#dce4dc] px-4 py-2.5 text-sm font-semibold text-[#355744] transition hover:bg-[#f7f8f6]"
                type="button"
                onClick={() => setDeleteTargetUser(null)}
              >
                Batal
              </button>
              <button
                className="rounded-xl bg-[#b64a3b] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#963b30]"
                type="button"
                onClick={handleDeleteUser}
              >
                Ya, hapus
              </button>
            </div>
          </section>
        </div>
      )}

      {/* Toast Alert */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-[60] max-w-sm rounded-xl border bg-white px-4 py-3 text-sm font-medium text-[#18231e] shadow-lg transition-all duration-200 opacity-100 translate-y-0 ${
            toast.type === "danger" ? "border-[#e6b8b0]" : "border-[#dce4dc]"
          }`}
          role="status"
          aria-live="polite"
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}
