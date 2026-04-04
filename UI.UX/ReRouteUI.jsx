import React, { useState } from "react";
import {
  Package,
  Truck,
  BarChart3,
  Store,
  Settings,
  LogIn,
  CheckCircle2,
  Map,
  UploadCloud,
  ChevronRight,
  Activity,
  Search,
  Bell,
  ArrowRightLeft,
  CreditCard,
  Sparkles,
  Bot,
  Send,
  Zap,
  User,
  MonitorSmartphone,
  Mail,
  Lock,
  ShieldCheck,
  Network,
  Repeat,
  Smartphone,
  ShoppingBag,
  Music,
  Heart,
  MessageCircle,
  MessageSquare,
  MoreVertical,
  Paperclip,
  Image as ImageIcon,
  PieChart,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  PackageX,
  Calendar,
  Download,
} from "lucide-react";

// --- Ikon Kustom untuk Google ---
const GoogleIcon = () => (
  <svg
    viewBox="0 0 24 24"
    width="18"
    height="18"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      fill="#4285F4"
    />
    <path
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      fill="#34A853"
    />
    <path
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      fill="#FBBC05"
    />
    <path
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      fill="#EA4335"
    />
  </svg>
);

// --- Komponen Layar 1: Dashboard Login ---
const ScreenLogin = () => {
  const [role, setRole] = useState("admin");
  return (
    <div className="flex h-full w-full bg-[#0a0f18] relative overflow-hidden">
      {/* Background Glow Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-[#1DA1F2]/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[40%] h-[50%] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="flex w-full h-full relative z-10">
        {/* Left Panel - Branding & Value Proposition */}
        <div className="hidden md:flex w-[55%] flex-col justify-between p-10 lg:p-12 border-r border-slate-800/60 bg-slate-900/30 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[12px] bg-gradient-to-br from-[#1DA1F2] to-blue-600 flex items-center justify-center shadow-[0_0_20px_rgba(29,161,242,0.4)]">
              <Repeat
                className="text-white scale-x-[-1]"
                size={22}
                strokeWidth={2.5}
              />
            </div>
            <span className="text-white font-bold text-2xl tracking-wide">
              Re-Route
            </span>
          </div>

          <div className="space-y-6 max-w-lg">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              <Sparkles size={14} /> Platform Manajemen Retur Pintar
            </div>
            <h1 className="text-4xl lg:text-5xl text-white leading-[1.2] tracking-tight font-bold">
              Ubah Retur Menjadi <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DA1F2] to-indigo-400">
                Peluang Baru.
              </span>
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed">
              Ekosistem terpadu yang menghubungkan UMKM, pembeli, dan logistik
              untuk memproses retur secara otomatis dengan bantuan AI.
            </p>

            {/* Visual Stats */}
            <div className="flex gap-4 pt-4">
              <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex-1 transform transition hover:-translate-y-1">
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mb-2">
                  <ShieldCheck size={16} className="text-emerald-400" />
                </div>
                <p className="text-white font-bold text-lg">99.9%</p>
                <p className="text-slate-500 text-xs">Akurasi Analisis AI</p>
              </div>
              <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-4 rounded-2xl flex-1 transform transition hover:-translate-y-1">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center mb-2">
                  <Zap size={16} className="text-amber-400" />
                </div>
                <p className="text-white font-bold text-lg">3x Cepat</p>
                <p className="text-slate-500 text-xs">Resolusi Sengketa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Login Form */}
        <div className="w-full md:w-[45%] flex items-center justify-center p-6 lg:p-10 relative">
          <div className="w-full max-w-[360px] bg-slate-900/60 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-[2rem] shadow-2xl relative z-20">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">
                Selamat Datang
              </h2>
              <p className="text-slate-400 text-sm">
                Masuk untuk melanjutkan akses
              </p>
            </div>

            {/* Role Toggle */}
            <div className="flex p-1.5 bg-slate-950/50 rounded-xl mb-8 border border-slate-800">
              <button
                onClick={() => setRole("admin")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${role === "admin" ? "bg-[#1DA1F2] text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >
                <Store size={16} /> UMKM
              </button>
              <button
                onClick={() => setRole("customer")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${role === "customer" ? "bg-indigo-500 text-white shadow-lg" : "text-slate-500 hover:text-slate-300"}`}
              >
                <User size={16} /> Pembeli
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              {role === "admin" ? (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                      Email Toko
                    </label>
                    <div className="relative group">
                      <Mail
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#1DA1F2] transition-colors"
                      />
                      <input
                        type="email"
                        placeholder="admin@tokosaya.com"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-1.5 ml-1 pr-1">
                      <label className="block text-xs font-medium text-slate-400">
                        Kata Sandi
                      </label>
                      <a
                        href="#"
                        className="text-[10px] text-[#1DA1F2] hover:underline"
                      >
                        Lupa sandi?
                      </a>
                    </div>
                    <div className="relative group">
                      <Lock
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#1DA1F2] transition-colors"
                      />
                      <input
                        type="password"
                        placeholder="••••••••"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:border-[#1DA1F2] focus:ring-1 focus:ring-[#1DA1F2] outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                      Nomor Resi / ID Retur
                    </label>
                    <div className="relative group">
                      <Package
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors"
                      />
                      <input
                        type="text"
                        placeholder="RET-XXXXXXXX"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">
                      Nomor HP (Verifikasi)
                    </label>
                    <div className="relative group">
                      <Smartphone
                        size={16}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-500 transition-colors"
                      />
                      <input
                        type="tel"
                        placeholder="0812-XXXX-XXXX"
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all placeholder:text-slate-600"
                      />
                    </div>
                  </div>
                </>
              )}

              <button
                className={`w-full font-bold py-3.5 mt-2 rounded-xl text-white transition-all transform hover:scale-[1.02] shadow-lg flex items-center justify-center gap-2 ${role === "admin" ? "bg-[#1DA1F2] hover:bg-blue-500 shadow-blue-500/20" : "bg-indigo-500 hover:bg-indigo-400 shadow-indigo-500/20"}`}
              >
                {role === "admin" ? "Masuk Dashboard" : "Lacak Resi Sekarang"}{" "}
                <ChevronRight size={16} />
              </button>

              {/* Opsi Login Alternatif (SSO/Sosial) */}
              <div className="pt-2">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div className="h-px bg-slate-800 flex-1"></div>
                  <span className="text-xs text-slate-500 font-medium px-1">
                    Atau masuk dengan
                  </span>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                <div className="flex gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-sm text-slate-300 transition-all duration-300">
                    <GoogleIcon /> Google
                  </button>
                  {role === "admin" ? (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-sm text-slate-300 transition-all duration-300">
                      <Smartphone size={16} className="text-slate-400" /> No. HP
                    </button>
                  ) : (
                    <button className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-950/40 hover:bg-slate-800 border border-slate-800 hover:border-emerald-900/50 rounded-xl text-sm text-slate-300 transition-all duration-300 group">
                      <MessageCircle
                        size={16}
                        className="text-slate-400 group-hover:text-emerald-500 transition-colors"
                      />{" "}
                      WhatsApp
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Komponen Layar 2: Dashboard UMKM ---
const ScreenDashboard = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 p-6">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl text-white font-bold">Dashboard UMKM</h2>
        <p className="text-slate-400 text-sm">
          Ringkasan aktivitas dan performa retur toko Anda.
        </p>
      </div>
      <button className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium border border-slate-700 flex items-center gap-2">
        <Calendar size={16} /> Bulan Ini
      </button>
    </div>
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-slate-800/40 p-5 rounded-xl border border-slate-700/50 transition-colors hover:bg-slate-800">
        <p className="text-slate-400 text-xs mb-1">Total Pengajuan Retur</p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-white">24</h3>
          <span className="text-emerald-400 text-xs flex items-center">
            <TrendingUp size={14} className="mr-1" /> 12%
          </span>
        </div>
      </div>
      <div className="bg-[#1DA1F2]/10 p-5 rounded-xl border border-[#1DA1F2]/20 transition-colors hover:bg-[#1DA1F2]/20">
        <p className="text-[#1DA1F2] text-xs mb-1 opacity-80">
          Disetujui Otomatis (AI)
        </p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-[#1DA1F2]">18</h3>
          <span className="text-[#1DA1F2] text-xs flex items-center">
            75% Resolusi
          </span>
        </div>
      </div>
      <div className="bg-amber-400/10 p-5 rounded-xl border border-amber-400/20 transition-colors hover:bg-amber-400/20">
        <p className="text-amber-400 text-xs mb-1 opacity-80">
          Menunggu Tindakan
        </p>
        <div className="flex items-end justify-between">
          <h3 className="text-3xl font-bold text-amber-400">3</h3>
          <span className="text-amber-400 text-xs flex items-center">
            <AlertTriangle size={14} className="mr-1" /> Perlu Tinjauan
          </span>
        </div>
      </div>
    </div>
    <div className="flex-1 bg-slate-800/20 rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
      <Activity size={48} className="text-[#1DA1F2] mb-4 opacity-80" />
      <h3 className="text-white font-medium mb-1">
        Grafik Performa Terintegrasi
      </h3>
      <p className="text-slate-400 text-xs">
        Aktivitas retur harian akan divisualisasikan secara real-time di area
        ini.
      </p>
    </div>
  </div>
);

// --- Komponen Layar 3: FORM PENGAJUAN (PEMBELI) ---
const ScreenReturnForm = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 p-6">
    <div className="mb-6">
      <h2 className="text-2xl text-white font-bold flex items-center gap-2">
        <UploadCloud className="text-[#1DA1F2]" /> Form Pengajuan Retur
      </h2>
      <p className="text-slate-400 text-sm mt-1">
        Portal pembeli untuk mengunggah bukti foto dan video unboxing.
      </p>
    </div>

    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800 space-y-4">
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
        <label className="text-slate-400 text-xs mb-1.5 block">
          Nomor Pesanan / Resi
        </label>
        <input
          type="text"
          value="INV-20260330-001"
          disabled
          className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-4 py-2.5 text-slate-300 text-sm opacity-70"
        />
      </div>

      {/* Kolom Alasan Pengembalian Diubah menjadi Textarea */}
      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
        <label className="text-slate-400 text-xs mb-1.5 block">
          Alasan Pengembalian
        </label>
        <textarea
          placeholder="Jelaskan secara detail alasan pengembalian barang (misal: terdapat cacat jahitan di bagian kerah, ukuran terlalu kecil dari deskripsi, dll)..."
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white text-sm outline-none focus:border-[#1DA1F2] resize-y min-h-[100px]"
        ></textarea>
      </div>

      <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/50">
        <div className="flex justify-between items-end mb-2">
          <label className="text-slate-400 text-xs block">
            Unggah Bukti Foto/Video <span className="text-rose-400">*</span>
          </label>
          <span className="text-[10px] text-[#1DA1F2] bg-[#1DA1F2]/10 px-2 py-0.5 rounded border border-[#1DA1F2]/20">
            Wajib Video Unboxing
          </span>
        </div>

        <div className="border-2 border-dashed border-slate-600 rounded-xl p-6 flex flex-col items-center justify-center bg-slate-900/50 hover:bg-slate-800/80 hover:border-[#1DA1F2]/50 transition-all cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center mb-3 group-hover:scale-110 group-hover:bg-[#1DA1F2]/20 transition-all">
            <UploadCloud className="text-[#1DA1F2]" size={24} />
          </div>
          <p className="text-sm text-white font-medium mb-1">
            Klik atau seret file ke sini
          </p>
          <p className="text-[10px] text-slate-500">
            Format: JPG, PNG, MP4 (Maks. 50MB)
          </p>
        </div>

        {/* Mockup Preview File */}
        <div className="flex gap-3 mt-4">
          <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center relative overflow-hidden group">
            <ImageIcon size={20} className="text-slate-500" />
            <div className="absolute inset-0 bg-black/40 hidden group-hover:flex items-center justify-center backdrop-blur-sm transition-all cursor-pointer">
              <PackageX size={16} className="text-rose-400" />
            </div>
          </div>
          <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center relative overflow-hidden group border-[#1DA1F2]/40">
            <div className="w-full h-full bg-slate-800 animate-pulse flex items-center justify-center">
              <div className="w-4 h-4 border-2 border-[#1DA1F2] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        </div>
      </div>

      <button className="w-full bg-[#1DA1F2] text-white font-bold py-3.5 rounded-xl hover:bg-blue-500 transition-all shadow-[0_4px_20px_rgba(29,161,242,0.3)] hover:shadow-[0_4px_25px_rgba(29,161,242,0.5)] flex items-center justify-center gap-2 mt-2">
        <Send size={16} /> Kirim Pengajuan Retur
      </button>
    </div>
  </div>
);

// --- Komponen Layar 4: MANAJEMEN RETUR ---
const ScreenReturnManagement = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 p-6">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl text-white font-bold">Manajemen Retur</h2>
        <p className="text-slate-400 text-sm">
          Daftar pengajuan pengembalian barang dari pembeli.
        </p>
      </div>
      <button className="bg-[#1DA1F2] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
        <Download size={16} /> Ekspor Data
      </button>
    </div>
    <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
      <div className="space-y-3">
        {[
          {
            id: "RET-001",
            user: "Andi Pratama",
            item: "Sepatu Sneakers (42)",
            status: "Menunggu Persetujuan",
            statusColor: "text-amber-400",
            bg: "bg-amber-400/10",
            border: "border-amber-400/20",
          },
          {
            id: "RET-002",
            user: "Siti Aminah",
            item: "Kemeja Flannel (M)",
            status: "Sedang Dijemput",
            statusColor: "text-[#1DA1F2]",
            bg: "bg-[#1DA1F2]/10",
            border: "border-[#1DA1F2]/20",
          },
          {
            id: "RET-003",
            user: "Budi Santoso",
            item: "Jaket Denim",
            status: "Selesai",
            statusColor: "text-emerald-400",
            bg: "bg-emerald-400/10",
            border: "border-emerald-400/20",
          },
          {
            id: "RET-004",
            user: "Dewi Lestari",
            item: "Topi Baseball",
            status: "Ditolak",
            statusColor: "text-rose-400",
            bg: "bg-rose-400/10",
            border: "border-rose-400/20",
          },
        ].map((ret, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-slate-800/40 rounded-xl border border-slate-700/50 hover:bg-slate-800 transition-colors"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <Package size={18} className="text-slate-300" />
              </div>
              <div>
                <p className="text-white font-medium text-sm">
                  {ret.id}{" "}
                  <span className="text-slate-500 font-normal mx-2">•</span>{" "}
                  {ret.user}
                </p>
                <p className="text-slate-400 text-xs mt-0.5">{ret.item}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-medium border ${ret.bg} ${ret.statusColor} ${ret.border}`}
              >
                {ret.status}
              </span>
              <button className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// --- Komponen Layar 5: LOGISTIK & TRACKING ---
const ScreenLogistics = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 p-6">
    <div className="flex justify-between items-center mb-8">
      <div>
        <h2 className="text-2xl text-white font-bold">Integrasi Logistik</h2>
        <p className="text-slate-400 text-sm">
          Lacak pergerakan kurir secara real-time.
        </p>
      </div>
    </div>
    <div className="flex gap-6 h-[calc(100%-80px)]">
      <div className="w-1/3 bg-slate-800/40 rounded-xl border border-slate-700/50 p-5 flex flex-col">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2">
          <Truck size={16} className="text-[#1DA1F2]" /> Resi Aktif
        </h3>
        <div className="space-y-3 overflow-y-auto flex-1">
          <div className="p-3 bg-[#1DA1F2]/10 border border-[#1DA1F2]/30 rounded-lg cursor-pointer">
            <p className="text-white text-sm font-medium">RET-002</p>
            <p className="text-[#1DA1F2] text-xs">
              J&T Express - Sedang Dijemput
            </p>
          </div>
          <div className="p-3 bg-slate-800 border border-slate-700 rounded-lg cursor-pointer opacity-60">
            <p className="text-white text-sm font-medium">RET-005</p>
            <p className="text-slate-400 text-xs">SiCepat - Menunggu Kurir</p>
          </div>
        </div>
      </div>
      <div className="w-2/3 bg-slate-800/20 rounded-xl border border-slate-700/50 p-6 relative flex flex-col items-center justify-center overflow-hidden">
        {/* Peta Mockup */}
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]"></div>
        <Map size={120} className="text-slate-700 mb-6" strokeWidth={1} />

        <div className="w-full max-w-md relative z-10">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-700 -z-10 transform -translate-y-1/2"></div>
            <div className="absolute top-1/2 left-0 w-1/2 h-1 bg-[#1DA1F2] -z-10 transform -translate-y-1/2"></div>

            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center shadow-[0_0_10px_#1DA1F2]">
                <Package size={14} className="text-white" />
              </div>
              <span className="text-[10px] text-white">Pembeli</span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#1DA1F2] flex items-center justify-center shadow-[0_0_10px_#1DA1F2]">
                <Truck size={14} className="text-white" />
              </div>
              <span className="text-[10px] text-[#1DA1F2] font-bold">
                Kurir (Aktif)
              </span>
            </div>
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-600 flex items-center justify-center">
                <Store size={14} className="text-slate-500" />
              </div>
              <span className="text-[10px] text-slate-400">Toko Anda</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// --- Komponen Layar 6: INBOX TERPUSAT ---
const ScreenInbox = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 flex-row">
    <div className="w-[35%] border-r border-slate-700/50 p-4 overflow-y-auto bg-slate-900/50">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white text-lg font-bold">Pesan Masuk</h3>
        <Search size={16} className="text-slate-400" />
      </div>
      <div className="space-y-2">
        <div className="p-3 bg-slate-800 rounded-xl border border-slate-700 cursor-pointer relative">
          <div className="absolute top-3 right-3 w-2 h-2 bg-[#1DA1F2] rounded-full"></div>
          <p className="text-white text-sm font-medium">Budi Santoso</p>
          <p className="text-slate-400 text-xs truncate mt-0.5">
            Terkait retur RET-003, apakah dana sudah...
          </p>
        </div>
        <div className="p-3 rounded-xl border border-transparent cursor-pointer opacity-70 hover:bg-slate-800/50 transition-colors">
          <p className="text-white text-sm font-medium">Siti Aminah</p>
          <p className="text-slate-400 text-xs truncate mt-0.5">
            Terima kasih, kurir sudah jemput barangnya.
          </p>
        </div>
      </div>
    </div>
    <div className="w-[65%] p-6 flex flex-col relative bg-slate-900">
      <div className="border-b border-slate-700/50 pb-4 mb-4 flex justify-between items-center">
        <div>
          <h3 className="text-white font-medium">Budi Santoso</h3>
          <p className="text-[#1DA1F2] text-xs">
            ID Retur: RET-003 • Jaket Denim
          </p>
        </div>
        <MoreVertical size={18} className="text-slate-500" />
      </div>
      <div className="flex-1 flex flex-col justify-end space-y-4 overflow-y-auto pb-2">
        <div className="bg-slate-800 p-3 rounded-2xl rounded-bl-none self-start max-w-[80%] border border-slate-700/50">
          <p className="text-white text-sm">
            Permisi admin, apakah retur saya sudah diproses?
          </p>
          <span className="text-[9px] text-slate-500 mt-1 block">09:41 AM</span>
        </div>
        <div className="bg-[#1DA1F2]/20 border border-[#1DA1F2]/30 p-3 rounded-2xl rounded-br-none self-end max-w-[80%]">
          <p className="text-white text-sm">
            Halo Kak Budi, retur Anda sudah selesai diverifikasi AI dan dana
            telah otomatis diteruskan kembali ke saldo Anda. Terima kasih!
          </p>
          <span className="text-[9px] text-[#1DA1F2]/70 mt-1 block text-right">
            09:45 AM
          </span>
        </div>
      </div>
      <div className="mt-4 relative flex items-center gap-3">
        <button className="text-slate-400 hover:text-white transition-colors">
          <Paperclip size={20} />
        </button>
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Ketik pesan..."
            className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-4 pr-12 py-3 text-sm text-white focus:border-[#1DA1F2] outline-none"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-[#1DA1F2] rounded-lg flex items-center justify-center text-white hover:bg-blue-500 transition-colors">
            <Send size={14} />
          </button>
        </div>
      </div>
    </div>
  </div>
);

// --- Komponen Layar 7: NOTIFIKASI REAL-TIME ---
const ScreenNotifications = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 p-6">
    <div className="flex justify-between items-center mb-6">
      <div>
        <h2 className="text-2xl text-white font-bold">Notifikasi Sistem</h2>
        <p className="text-slate-400 text-sm">
          Pembaruan aktivitas dan status retur otomatis.
        </p>
      </div>
      <button className="text-[#1DA1F2] text-sm hover:underline">
        Tandai semua dibaca
      </button>
    </div>
    <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
      {[
        {
          icon: <CheckCircle2 size={18} className="text-emerald-500" />,
          title: "Retur RET-003 Selesai",
          desc: "Dana Rp 250.000 telah diteruskan kembali ke saldo Anda.",
          time: "2 menit yang lalu",
          unread: true,
        },
        {
          icon: <Truck size={18} className="text-[#1DA1F2]" />,
          title: "Kurir Menjemput Paket",
          desc: "J&T Express sedang menuju lokasi pembeli untuk resi RET-002.",
          time: "1 jam yang lalu",
          unread: true,
        },
        {
          icon: <Zap size={18} className="text-amber-500" />,
          title: "AI Mendeteksi Anomali",
          desc: "Pembeli Budi S. melakukan 3x retur bulan ini. Silakan tinjau.",
          time: "3 jam yang lalu",
          unread: false,
        },
        {
          icon: <PackageX size={18} className="text-rose-500" />,
          title: "Pengajuan Retur Baru",
          desc: "Produk: Sepatu Sneakers (42). Alasan: Cacat Produksi.",
          time: "1 hari yang lalu",
          unread: false,
        },
      ].map((notif, i) => (
        <div
          key={i}
          className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${notif.unread ? "bg-slate-800 border-slate-700" : "bg-transparent border-slate-800/50"}`}
        >
          <div className="mt-1">{notif.icon}</div>
          <div className="flex-1">
            <h4 className="text-white text-sm font-medium">{notif.title}</h4>
            <p className="text-slate-400 text-xs mt-1">{notif.desc}</p>
          </div>
          <span className="text-[10px] text-slate-500">{notif.time}</span>
        </div>
      ))}
    </div>
  </div>
);

// --- Komponen Layar 8: PANEL ANALYTICS ---
const ScreenAnalytics = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 p-6">
    <div className="mb-6">
      <h2 className="text-2xl text-white font-bold">Panel Analytics</h2>
      <p className="text-slate-400 text-sm">
        Laporan mendalam terkait tren pengembalian barang dari AI.
      </p>
    </div>
    <div className="grid grid-cols-2 gap-4 flex-1">
      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center relative group overflow-hidden">
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#1DA1F2]/10 rounded-full blur-xl group-hover:bg-[#1DA1F2]/20 transition-all"></div>
        <PieChart
          size={56}
          className="text-[#1DA1F2] mb-4 drop-shadow-[0_0_10px_rgba(29,161,242,0.4)]"
          strokeWidth={1.5}
        />
        <h4 className="text-white font-medium mb-1 text-lg">
          Alasan Retur Utama
        </h4>
        <p className="text-slate-400 text-sm text-center">
          45% karena cacat produksi,
          <br />
          30% akibat salah ukuran.
        </p>
      </div>
      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-6 flex flex-col items-center justify-center relative group overflow-hidden">
        <div className="absolute -left-4 -bottom-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:bg-emerald-500/20 transition-all"></div>
        <TrendingDown
          size={56}
          className="text-emerald-500 mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]"
          strokeWidth={1.5}
        />
        <h4 className="text-white font-medium mb-1 text-lg">
          Tingkat Retur Menurun
        </h4>
        <p className="text-slate-400 text-sm text-center">
          Berkurang 12% dibandingkan
          <br />
          data di bulan sebelumnya.
        </p>
      </div>
    </div>
  </div>
);

// --- Komponen Layar 9: PENGATURAN KEBIJAKAN ---
const ScreenSettings = () => (
  <div className="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden border border-white/10 p-6">
    <div className="flex items-center gap-3 mb-8">
      <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700">
        <Settings className="text-white" size={20} />
      </div>
      <div>
        <h2 className="text-xl text-white font-bold">
          Pengaturan Kebijakan Retur
        </h2>
        <p className="text-slate-400 text-xs mt-0.5">
          Konfigurasi otomatisasi dan aturan toko Anda.
        </p>
      </div>
    </div>

    <div className="space-y-6 flex-1 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
          <Bot size={16} className="text-[#1DA1F2]" /> AI Auto-Approval
        </h3>
        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-white text-sm">Wajib Video Unboxing</p>
            <p className="text-slate-500 text-xs">
              Tolak otomatis jika pembeli tidak melampirkan video.
            </p>
          </div>
          <div className="w-11 h-6 bg-[#1DA1F2] rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(29,161,242,0.4)]">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
        <div className="flex items-center justify-between py-2 border-t border-slate-700/50 mt-2 pt-4">
          <div>
            <p className="text-white text-sm">
              Approve Otomatis Alasan Tertentu
            </p>
            <p className="text-slate-500 text-xs">
              Setujui instan untuk "Salah Ukuran" agar proses cepat.
            </p>
          </div>
          <div className="w-11 h-6 bg-slate-700 rounded-full relative cursor-pointer">
            <div className="absolute left-1 top-1 w-4 h-4 bg-slate-400 rounded-full"></div>
          </div>
        </div>
      </div>

      <div className="bg-slate-800/40 rounded-xl border border-slate-700/50 p-5">
        <h3 className="text-white text-sm font-medium mb-4 flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-500" /> Batasan Waktu &
          Ongkir
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              Batas Waktu Retur (Hari)
            </label>
            <input
              type="number"
              defaultValue={7}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#1DA1F2]"
            />
          </div>
          <div>
            <label className="text-slate-400 text-xs mb-1 block">
              Penanggung Ongkir Retur
            </label>
            <select className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm outline-none focus:border-[#1DA1F2] appearance-none">
              <option>Ditanggung Pembeli</option>
              <option>Ditanggung UMKM</option>
              <option>Bagi Dua (50/50)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ======================================================================
// --- KOMPONEN UTAMA PRESENTASI ---
// ======================================================================
export default function ReRouteUI() {
  const [activeTab, setActiveTab] = useState(0);

  const presentationScreens = [
    {
      title: "Halaman Login",
      desc: "Portal Masuk UMKM & Pembeli",
      icon: <LogIn size={14} />,
      component: <ScreenLogin />,
    },
    {
      title: "Dashboard UMKM",
      desc: "Ringkasan Retur Toko",
      icon: <Store size={14} />,
      component: <ScreenDashboard />,
    },
    {
      title: "Form Pengajuan",
      desc: "Upload Bukti Retur",
      icon: <UploadCloud size={14} />,
      component: <ScreenReturnForm />,
    },
    {
      title: "Manajemen Retur",
      desc: "Daftar Pengajuan",
      icon: <Package size={14} />,
      component: <ScreenReturnManagement />,
    },
    {
      title: "Logistik & Lacak",
      desc: "Status Kurir",
      icon: <Truck size={14} />,
      component: <ScreenLogistics />,
    },
    {
      title: "Inbox Terpusat",
      desc: "Chat Omnichannel",
      icon: <MessageSquare size={14} />,
      component: <ScreenInbox />,
    },
    {
      title: "Notifikasi",
      desc: "Pembaruan Real-time",
      icon: <Bell size={14} />,
      component: <ScreenNotifications />,
    },
    {
      title: "Panel Analytics",
      desc: "Laporan & Tren",
      icon: <BarChart3 size={14} />,
      component: <ScreenAnalytics />,
    },
    {
      title: "Pengaturan",
      desc: "Kebijakan Toko",
      icon: <Settings size={14} />,
      component: <ScreenSettings />,
    },
  ];

  return (
    <div className="min-h-screen bg-[#05080f] text-slate-300 p-4 md:p-8">
      {/* Menginjeksi CSS untuk mengimpor dan menerapkan Font Gelasio */}
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Gelasio:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
          
          /* Menerapkan font Gelasio ke semua elemen di dalam komponen ini */
          * {
            font-family: 'Gelasio', serif !important;
          }
        `}
      </style>

      {/* Header */}
      <div className="max-w-6xl mx-auto mb-10 text-center flex flex-col items-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-[14px] bg-[#1DA1F2] flex items-center justify-center shadow-[0_0_30px_rgba(29,161,242,0.5)]">
            <Repeat
              className="text-white scale-x-[-1]"
              size={28}
              strokeWidth={2.5}
            />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wide">
            Re-Route <span className="text-slate-600 mx-2 font-light">|</span>{" "}
            <span className="text-[#1DA1F2] text-2xl md:text-3xl font-semibold">
              UI/UX Showcase
            </span>
          </h1>
        </div>
      </div>

      {/* Controller / Tab Navigation */}
      <div className="max-w-6xl mx-auto mb-8 flex flex-wrap justify-center gap-2 md:gap-3 bg-slate-800/30 p-2 rounded-2xl border border-slate-700/50">
        {presentationScreens.map((screen, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 border flex items-center gap-2 ${
              activeTab === index
                ? "bg-[#1DA1F2]/20 border-[#1DA1F2]/50 text-[#1DA1F2] shadow-[0_0_15px_rgba(29,161,242,0.2)]"
                : "bg-transparent border-transparent text-slate-400 hover:bg-slate-800 hover:text-white"
            }`}
          >
            {screen.icon} {screen.title}
          </button>
        ))}
      </div>

      {/* Frame Preview */}
      <div className="max-w-5xl mx-auto">
        <div className="bg-slate-800 p-2 rounded-[1.5rem] shadow-2xl border border-slate-700/50 mx-auto transition-all duration-500">
          <div className="bg-[#0B1120] rounded-[1rem] h-[550px] md:h-[600px] overflow-hidden shadow-inner relative">
            {presentationScreens[activeTab].component}
          </div>
        </div>

        {/* Caption Bawah */}
        <div className="text-center mt-6">
          <h3 className="text-xl text-white font-medium">
            {presentationScreens[activeTab].title}
          </h3>
          <p className="text-slate-500 mt-1 max-w-lg mx-auto">
            {presentationScreens[activeTab].desc}
          </p>
        </div>
      </div>
    </div>
  );
}
