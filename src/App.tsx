import { useState, useEffect, type ChangeEvent, type CSSProperties } from "react";
import { collection, doc, getDoc, getDocs, setDoc, updateDoc, deleteDoc, query, where, writeBatch } from "firebase/firestore";
import { db } from './lib/firebase';

// ==========================================
// TYPE DEFINITIONS
// ==========================================
type PermissionRole = "Admin" | "Staff";
type TaskStatus = "Pending" | "In progress" | "Completed" | "Cancelled";
type Priority = "High" | "Medium" | "Low";
type Theme = "light" | "dark";
type Tab = "dashboard" | "tasks" | "stock" | "meeting" | "maintenance" | "activity_log" | "settings";
type Lang = "id" | "en";

interface CurrentUser {
  name: string;
  roleTitle: string;
  permissionRole: PermissionRole;
  shift: string;
}

interface Colors {
  page: string;
  card: string;
  cardMuted: string;
  text: string;
  muted: string;
  border: string;
  accent: string;
  accentBg: string;
  danger: string;
  success: string;
  warning: string;
}

// ==========================================
// CONSTANTS & HELPERS
// ==========================================
const DEFAULT_LOGO = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%230EA5E9'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

const categories = ["Production", "Cleaning", "Logistics", "Supervision", "Office", "Maintenance", "Factory Supervisor", "Other"];
const categoryEmojis: Record<string, string> = {
  "Production": "🏭",
  "Cleaning": "🧹",
  "Logistics": "🚚",
  "Supervision": "🕵️",
  "Office": "🗂️",
  "Maintenance": "🔧",
  "Factory Supervisor": "🏭",
  "Other": "📌"
};
const getCategoryEmoji = (category: string) => categoryEmojis[category] || "T";
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: TaskStatus[] = ["Pending", "In progress", "Completed", "Cancelled"];
const shifts = ["Day", "Night"];

const fixedPositions = [
  "Factory Supervisor",
  "Logistic Supervisor",
  "Production",
  "Driver",
  "General Support",
  "Administration",
  "Others"
];

const roles: PermissionRole[] = ["Admin", "Staff"];

const statusColors: Record<TaskStatus, { bg: string; text: string }> = {
  Pending: { bg: "#FEF3C7", text: "#B45309" },
  "In progress": { bg: "#DBEAFE", text: "#1D4ED8" },
  Completed: { bg: "#DCFCE7", text: "#166534" },
  Cancelled: { bg: "#FEE2E2", text: "#991B1B" },
};

const translations = {
  id: {
    dashboard: "Dashboard", tasks: "Tasks", stock: "Stok Opname", meeting: "Meeting Notes", maintenance: "Maintenance",
    activityLog: "Activity Log", settings: "Pengaturan",
    total: "Total", completed: "Completed", remaining: "Remaining", cancelled: "Cancelled",
    progress: "Total Progress Semua Task", share: "Share", addTask: "Tambah Task", edit: "Edit", save: "Simpan", cancel: "Batal", delete: "Hapus",
    checklist: "Checklist", undo: "Undo", noTasks: "Tidak ada aktivitas.",
    login: "Masuk", logout: "Keluar", darkMode: "Mode Gelap", lightMode: "Mode Terang", taskFormTitle: "Tambah Task",
    titlePlaceholder: "Judul tugas", assigneePlaceholder: "Penanggung jawab", notesPlaceholder: "Catatan",
    alertTitleRequired: "Judul wajib diisi.",
    uploadLogo: "Unggah Logo", importCsv: "Import CSV Tasks",
    uploadPhoto: "Unggah Foto", updateLast: "Update", addNewItem: "Tambah item", itemName: "Nama item", initialStock: "Stok Awal",
    incoming: "Masuk", outgoing: "Keluar", currentStock: "Sisa", deleteItem: "Hapus item", noStock: "Kosong.",
    scheduleMeeting: "Jadwalkan", meetingName: "Judul", date: "Tanggal", timeInput: "Waktu", attendeesInput: "Peserta", agenda: "Agenda", addMeeting: "Tambah meeting", noMeeting: "Kosong.",
    addMaint: "Tambah maintenance", equipName: "Peralatan", issueDesc: "Masalah", techName: "Teknisi", maintNotes: "Catatan", addMaintBtn: "Tambah", noMaint: "Kosong.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operation", loginDesc: "Masuk untuk mulai", loginName: "Username", loginPassword: "Password", loginRole: "Jabatan", loginBtn: "Masuk", nameRequired: "Nama wajib.",
    passMismatch: "Password salah atau user tidak ditemukan.", csvSuccess: "tugas berhasil di-parsing!", csvError: "Gagal parse CSV.", noLogs: "Belum ada aktivitas tercatat.",
    registerBtn: "Daftar Akun", backToLogin: "Kembali ke Masuk", registerSuccess: "Registrasi berhasil! Silakan login.", userExists: "Username sudah terdaftar.", usersList: "Daftar User Terdaftar", chartTitle: "Grafik Ringkasan Status Task",
    menu: "Menu", choose: "Pilih", switchTheme: "Ganti Tema", languageLabel: "Bahasa / Language",
    searchPlaceholder: "Cari...", statusAll: "Semua Status", dateLabel: "Tanggal",
    totalTaskLabel: "Total Task", unit: "Satuan",
    noValidData: "Tidak ada data valid.", taskSavedMsg: "Task berhasil disimpan!", meetingSavedMsg: "Berhasil disimpan!",
    dashTasks: "Tasks", dashStock: "Stok", dashMeetings: "Meeting", dashMaintenance: "Maintenance",
    waReportTitle: "LAPORAN TASK HARIAN", waEmployee: "Karyawan", waRole: "Jabatan", waShift: "Shift", waDate: "Tanggal",
    waCompleted: "SELESAI", waPending: "PENDING / BERLANGSUNG", waStock: "STOK OPNAME", waMaintenance: "MAINTENANCE",
    waMeeting: "MEETING", waNotes: "CATATAN", waSubmittedBy: "Dikirim oleh", waSubmitted: "Dikirim", waViewReport: "Lihat laporan",
    statusPending: "Tertunda", statusInProgress: "Berlangsung", statusCompleted: "Selesai", statusCancelled: "Dibatalkan"
  },
  en: {
    dashboard: "Dashboard", tasks: "Tasks", stock: "Stock Opname", meeting: "Meeting Notes", maintenance: "Maintenance",
    activityLog: "Activity Log", settings: "Settings",
    total: "Total", completed: "Completed", remaining: "Remaining", cancelled: "Cancelled",
    progress: "Overall Task Progress", share: "Share", addTask: "Add Task", edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete",
    checklist: "Checklist", undo: "Undo", noTasks: "No activities.",
    login: "Login", logout: "Logout", darkMode: "Dark Mode", lightMode: "Light Mode", taskFormTitle: "Add Task",
    titlePlaceholder: "Task title", assigneePlaceholder: "Assignee", notesPlaceholder: "Notes",
    alertTitleRequired: "Title required.",
    uploadLogo: "Upload Logo", importCsv: "Import CSV Tasks",
    uploadPhoto: "Upload Photo", updateLast: "Updated", addNewItem: "Add item", itemName: "Item name", initialStock: "Initial Stock",
    incoming: "In", outgoing: "Out", currentStock: "Remaining", deleteItem: "Delete item", noStock: "Empty.",
    scheduleMeeting: "Schedule", meetingName: "Title", date: "Date", timeInput: "Time", attendeesInput: "Attendees", agenda: "Agenda", addMeeting: "Add meeting", noMeeting: "Empty.",
    addMaint: "Add maintenance", equipName: "Equipment", issueDesc: "Issue", techName: "Technician", maintNotes: "Notes", addMaintBtn: "Add", noMaint: "Empty.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operation", loginDesc: "Login to start", loginName: "Username", loginPassword: "Password", loginRole: "Role", loginBtn: "Login", nameRequired: "Name required.",
    passMismatch: "Incorrect password or user not found.", csvSuccess: "tasks parsed successfully!", csvError: "CSV parse failed.", noLogs: "No activity logs yet.",
    registerBtn: "Register Account", backToLogin: "Back to Login", registerSuccess: "Registration successful! Please login.", userExists: "Username already exists.", usersList: "Registered Users List", chartTitle: "Task Status Summary Chart",
    menu: "Menu", choose: "Choose", switchTheme: "Switch Theme", languageLabel: "Bahasa / Language",
    searchPlaceholder: "Search...", statusAll: "All Status", dateLabel: "Date",
    totalTaskLabel: "Total Tasks", unit: "Unit",
    noValidData: "No valid data found.", taskSavedMsg: "Task saved successfully!", meetingSavedMsg: "Saved successfully!",
    dashTasks: "Tasks", dashStock: "Stock", dashMeetings: "Meetings", dashMaintenance: "Maintenance",
    waReportTitle: "DAILY TASK REPORT", waEmployee: "Employee", waRole: "Role", waShift: "Shift", waDate: "Date",
    waCompleted: "COMPLETED", waPending: "PENDING / IN PROGRESS", waStock: "STOCK OPNAME", waMaintenance: "MAINTENANCE",
    waMeeting: "MEETING", waNotes: "NOTES", waSubmittedBy: "Submitted by", waSubmitted: "Submitted", waViewReport: "View report",
    statusPending: "Pending", statusInProgress: "In Progress", statusCompleted: "Completed", statusCancelled: "Cancelled"
  },
};

const getToday = () => new Date().toISOString().slice(0, 10);
const formatDate = (d: string | Date) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const formatTimeRange = (t: any) => t.start_time && t.end_time ? `(${t.start_time}-${t.end_time})` : "";
const formatDateTime = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const getColors = (theme: Theme): Colors => theme === "light"
  ? { page: "#F8FAFC", card: "#FFFFFF", cardMuted: "#F1F5F9", text: "#0F172A", muted: "#64748B", border: "#E2E8F0", accent: "#0EA5E9", accentBg: "#E0F2FE", danger: "#EF4444", success: "#10B981", warning: "#F59E0B" }
  : { page: "#0B1120", card: "#111827", cardMuted: "#1F2937", text: "#F3F4F6", muted: "#9CA3AF", border: "#374151", accent: "#38BDF8", accentBg: "#0C4A6E", danger: "#F87171", success: "#34D399", warning: "#FBBF24" };

const formatDisplayName = (name: string) => {
  if (!name) return "";
  return name.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
};

const toSnakeCase = (obj: Record<string, any>): Record<string, any> => {
  const converted: Record<string, any> = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      converted[snakeKey] = obj[key];
    }
  }
  return converted;
};

// ==========================================
// LOGIN SCREEN & REGISTER
// ==========================================
function LoginScreen({ colors, onLogin, t }: { colors: Colors; onLogin: (u: CurrentUser) => void; t: typeof translations.id }) {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleTitle, setRoleTitle] = useState(fixedPositions[0]);
  const [role, setRole] = useState<PermissionRole>("Staff");
  const [shift, setShift] = useState("Day");
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) { setErr(t.nameRequired); return; }
    setLoading(true);
    setErr("");
    setSuccessMsg("");

    try {
      const trimmedName = name.trim().toLowerCase();
      const userQuery = query(collection(db, "users"), where("username", "==", trimmedName));
      const querySnapshot = await getDocs(userQuery);

      if (isRegister) {
        if (!querySnapshot.empty) {
          setErr(t.userExists);
          setLoading(false);
          return;
        }
        const newUserDoc = {
          username: trimmedName,
          password,
          role,
          position: roleTitle,
          shift
        };
        await setDoc(doc(collection(db, "users"), trimmedName), newUserDoc);
        setSuccessMsg(t.registerSuccess);
        setIsRegister(false);
        setPassword("");
        setLoading(false);
        return;
      }

      // Login Mode
      if (querySnapshot.empty) {
        setErr(t.passMismatch);
        setLoading(false);
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const data = userDoc.data();

      if (data.password !== password) {
        setErr(t.passMismatch);
        setLoading(false);
        return;
      }

      onLogin({
        name: data.username,
        roleTitle: data.position || roleTitle,
        permissionRole: (data.role as PermissionRole) || role,
        shift: data.shift || shift
      });
    } catch (e: any) {
      console.error("Auth error:", e.message || e);
      setErr(t.passMismatch);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: CSSProperties = { width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text, marginBottom: 12, fontSize: 14, boxSizing: "border-box" };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, display: "grid", placeItems: "center", padding: 20, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 380, background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}`, padding: 24, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: 0 }}>{t.loginTitle}</h1>
          <p style={{ fontSize: 14, color: colors.muted, margin: "4px 0 0" }}>{t.loginSubtitle}</p>
        </div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder={t.loginName} style={inputStyle} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        <input value={password} type="password" onChange={e => setPassword(e.target.value)} placeholder={t.loginPassword} style={inputStyle} onKeyDown={e => e.key === "Enter" && handleSubmit()} />
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <select value={role} onChange={e => setRole(e.target.value as PermissionRole)} style={{ ...inputStyle, width: "100%", textTransform: "capitalize" }}>
            {roles.map(r => <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
          </select>
          <select value={roleTitle} onChange={e => setRoleTitle(e.target.value)} style={{ ...inputStyle, width: "100%", textTransform: "capitalize" }}>
            {fixedPositions.map(pos => <option key={pos} value={pos}>{pos.replace(/\b\w/g, l => l.toUpperCase())}</option>)}
          </select>
        </div>

        {isRegister && (
          <select value={shift} onChange={e => setShift(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
            {shifts.map(sh => <option key={sh} value={sh}>{sh}</option>)}
          </select>
        )}

        {err && <div style={{ fontSize: 13, color: colors.danger, marginBottom: 8, textAlign: "center" }}>{err}</div>}
        {successMsg && <div style={{ fontSize: 13, color: colors.success, marginBottom: 8, textAlign: "center" }}>{successMsg}</div>}
        
        <button onClick={handleSubmit} disabled={loading} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: colors.accent, color: "#FFF", fontWeight: 600, fontSize: 14, cursor: loading ? "wait" : "pointer", marginBottom: 10 }}>
          {loading ? "Loading..." : (isRegister ? t.registerBtn : t.loginBtn)}
        </button>

        <div style={{ textAlign: "center", marginTop: 8 }}>
          <button onClick={() => { setIsRegister(!isRegister); setErr(""); setSuccessMsg(""); }} style={{ background: "none", border: "none", color: colors.accent, fontSize: 13, cursor: "pointer", textDecoration: "underline" }}>
            {isRegister ? t.backToLogin : t.registerBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP
// ==========================================
export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("id");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [userLogo, setUserLogo] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState(getToday());
  const [currentTime, setCurrentTime] = useState(new Date());

  const colors = getColors(theme);
  const t = translations[lang];

  // State UI
  const [search, setSearch] = useState("");
  const [filterStat, setFilterStat] = useState("All");
  
  const [taskForm, setTaskForm] = useState<any>({ title: "", category: "Production", priority: "High", assignee: "", deadline: getToday(), date: getToday(), start_time: "", end_time: "", status: "Pending", notes: "", createdAt: getToday(), imageUrl: "" });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const [stockForm, setStockForm] = useState({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "", date: getToday() });
  const [meetingForm, setMeetingForm] = useState({ title: "", date: getToday(), time: "", attendees: "", notes: "" });
  const [maintForm, setMaintForm] = useState({ equipment: "", issue: "", technician: "", status: "Pending", date: getToday(), notes: "", imageUrl: "" });

  const [tasks, setTasks] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [maintItems, setMaintItems] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);
  const [allUsersList, setAllUsersList] = useState<any[]>([]);

  // Load session
  useEffect(() => {
    const session = localStorage.getItem('btice_session');
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch (e) { console.error("Session parse error"); }
    }
  }, []);

  // Reload data from Firebase
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const prefsDoc = await getDoc(doc(db, 'user_prefs', currentUser.name));
        if (prefsDoc.exists()) {
          const prefs = prefsDoc.data();
          console.log("[BlueTick] user_prefs loaded:", prefs);
          if (prefs.theme) setTheme(prefs.theme as Theme);
          if (prefs.lang) setLang(prefs.lang as Lang);
          if (prefs.logo) setUserLogo(prefs.logo);
          if (prefs.active_tab) setActiveTab(prefs.active_tab as Tab);
        } else {
          console.log("[BlueTick] user_prefs document does not exist yet for:", currentUser.name);
        }
      } catch (prefsErr: any) {
        console.error("[BlueTick] Failed to load user_prefs (logo/theme/lang/tab will not restore):", prefsErr);
      }

      try {
        if (currentUser.permissionRole === "Admin") {
          const logsSnap = await getDocs(collection(db, 'activity_logs'));
          const logsData = logsSnap.docs.map(d => d.data()).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setActivityLogs(logsData);

          const usersSnap = await getDocs(collection(db, 'users'));
          setAllUsersList(usersSnap.docs.map(d => d.data()));
        } else {
          const logsQ = query(collection(db, 'activity_logs'), where('user_name', '==', currentUser.name));
          const logsSnap = await getDocs(logsQ);
          const logsData = logsSnap.docs.map(d => d.data()).sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setActivityLogs(logsData);
        }

        const stockQ = query(collection(db, 'stock_items'), where('user_name', '==', currentUser.name));
        const stockSnap = await getDocs(stockQ);
        setStockItems(stockSnap.docs.map(d => d.data()));

        const meetQ = query(collection(db, 'meetings'), where('user_name', '==', currentUser.name));
        const meetSnap = await getDocs(meetQ);
        setMeetings(meetSnap.docs.map(d => d.data()));

        const maintQ = query(collection(db, 'maintenance'), where('user_name', '==', currentUser.name));
        const maintSnap = await getDocs(maintQ);
        setMaintItems(maintSnap.docs.map(d => d.data()));

        let tasksData: any[] = [];
        if (currentUser.permissionRole === "Admin") {
          const taskSnap = await getDocs(collection(db, 'tasks'));
          tasksData = taskSnap.docs.map(d => d.data());
        } else {
          const q1 = query(collection(db, 'tasks'), where('user_name', '==', currentUser.name));
          const q2 = query(collection(db, 'tasks'), where('assignee', '==', currentUser.name));
          
          const snap1 = await getDocs(q1);
          const snap2 = await getDocs(q2);
          
          const uniqueTasks = new Map();
          snap1.docs.forEach(d => uniqueTasks.set(d.id, d.data()));
          snap2.docs.forEach(d => uniqueTasks.set(d.id, d.data()));
          
          tasksData = Array.from(uniqueTasks.values());
        }
        setTasks(tasksData);

      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };

    fetchData();
  }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const payload = { user_name: currentUser.name, theme, lang };
      console.log("[BlueTick] WRITE user_prefs (theme/lang effect):", payload);
      setDoc(doc(db, 'user_prefs', currentUser.name), payload, { merge: true });
    }
  }, [currentUser, theme, lang]);

  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (currentUser && !taskForm.assignee) setTaskForm((p: any) => ({ ...p, assignee: currentUser.permissionRole === "Staff" ? currentUser.name : "" })); }, [currentUser, taskForm.assignee]);
  useEffect(() => { setMeetingForm(p => ({ ...p, date: selectedDate })); setStockForm(p => ({ ...p, date: selectedDate })); setMaintForm((p: any) => ({ ...p, date: selectedDate })); }, [selectedDate]);

  const handleLogin = (user: CurrentUser) => {
    localStorage.setItem('btice_session', JSON.stringify(user));
    setCurrentUser(user);
    setTaskForm((p: any) => ({ ...p, assignee: user.permissionRole === "Staff" ? user.name : "" }));
  };
  
  const handleLogout = () => { 
    localStorage.removeItem('btice_session'); 
    setCurrentUser(null); 
    setActiveTab("dashboard"); 
    setMenuOpen(false); 
  };

  const matchesUser = (assignee: string) => {
    if (currentUser?.permissionRole === "Admin") return true;
    const cleanAssignee = (assignee || "").trim().toLowerCase();
    const cleanCurrent = currentUser?.name.trim().toLowerCase() || "";
    return cleanAssignee === cleanCurrent || cleanAssignee === "";
  };

  const handleImageInput = (e: ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setter(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  const filteredTasks = tasks.filter(tk =>
    (!search || tk.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterStat === "All" || tk.status === filterStat) &&
    tk.date === selectedDate &&
    matchesUser(tk.assignee)
  ).sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const addLog = async (type: string, action: string) => {
    if (!currentUser) return;
    const entry = { id: String(Date.now()), type, action, timestamp: new Date().toISOString(), user_name: currentUser.name };
    try {
      await setDoc(doc(db, 'activity_logs', entry.id), entry);
      setActivityLogs(p => [entry, ...p].slice(0, 200));
    } catch (e: any) {
      console.error("Error saving log:", e.message || e);
    }
  };

  const compressImageFile = (file: File, maxDim = 256, quality = 0.7): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          let width = img.width, height = img.height;
          if (width > height) {
            if (width > maxDim) { height = Math.round(height * (maxDim / width)); width = maxDim; }
          } else {
            if (height > maxDim) { width = Math.round(width * (maxDim / height)); height = maxDim; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (!ctx) { reject(new Error('Canvas not supported')); return; }
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('Gagal memuat gambar'));
        img.src = ev.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Gagal membaca file'));
      reader.readAsDataURL(file);
    });
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !currentUser) return;
    try {
      const b64 = await compressImageFile(file, 256, 0.7);
      console.log("[BlueTick] Compressed logo size (KB):", Math.round(b64.length / 1024));
      setUserLogo(b64);
      await setDoc(doc(db, 'user_prefs', currentUser.name), { user_name: currentUser.name, logo: b64 }, { merge: true });
      console.log("[BlueTick] Logo successfully saved to user_prefs for:", currentUser.name);
    } catch (error: any) {
      console.error("Logo upload error:", error);
      window.alert(`Gagal menyimpan logo: ${error.message || error}`);
    }
  };

  const handleCsvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file || !currentUser) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = (ev.target?.result as string).replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return window.alert(t.csvError);

        // Parsing header
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const newTasks: any[] = [];

        // Fungsi parsing tanggal MM/DD/YYYY -> YYYY-MM-DD
        const parseDate = (str: string): string => {
          if (!str) return getToday();
          const m = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
          if (m) {
            const [_, month, day, year] = m;
            const formattedMonth = parseInt(month).toString().padStart(2, '0');
            const formattedDay = parseInt(day).toString().padStart(2, '0');
            return `${year}-${formattedMonth}-${formattedDay}`;
          }
          return getToday(); // fallback
        };

        // Fungsi format waktu H:MM -> HH:MM
        const formatTime = (timeStr: string): string => {
          if (!timeStr) return "";
          const [hour, minute] = timeStr.split(':').map(Number);
          if (isNaN(hour) || isNaN(minute)) return "";
          return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        };

        // Fungsi untuk mengambil nilai dari baris berdasarkan header
        const getValue = (line: string, headerName: string) => {
          const cols = line.split(',');
          const headerIndex = headers.indexOf(headerName.toLowerCase());
          return headerIndex >= 0 ? cols[headerIndex]?.trim() || '' : '';
        };

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          const rawTitle = getValue(line, 'title');
          if (!rawTitle) continue; // Lewati jika title kosong

          const rawDate = parseDate(getValue(line, 'date'));
          const rawDeadline = parseDate(getValue(line, 'deadline'));
          const st = getValue(line, 'start_time');
          const et = getValue(line, 'end_time');
          const rawCategory = getValue(line, 'category');
          const rawPriority = getValue(line, 'priority');
          const rawStatus = getValue(line, 'status');

          // Format waktu
          const cleanStartTime = formatTime(st);
          const cleanEndTime = formatTime(et);

          newTasks.push({
            id: String(Date.now() + Math.random()),
            title: rawTitle.replace(/[.,;:!]+$/, '').trim(),
            date: rawDate,
            deadline: rawDeadline,
            start_time: cleanStartTime,
            end_time: cleanEndTime,
            category: rawCategory,
            priority: rawPriority,
            status: rawStatus,
            assignee: currentUser.name,
            notes: "",
            createdAt: getToday(),
            user_name: currentUser.name,
            imageUrl: ""
          });
        }

        if (!newTasks.length) return window.alert("Tidak ada data valid.");

        // Simpan ke Firebase
        const batch = writeBatch(db);
        newTasks.forEach(tk => {
          const snaked = toSnakeCase(tk);
          const docRef = doc(collection(db, 'tasks'), snaked.id);
          batch.set(docRef, snaked);
        });

        await batch.commit();

        // Update state lokal
        setTasks(prev => [...newTasks, ...prev]);
        await addLog("CSV", `Imported ${newTasks.length} tasks from CSV`);
        window.alert(`✅ ${newTasks.length} ${t.csvSuccess}`);

      } catch (err: any) {
        console.error("CSV import error:", err);
        window.alert(`${t.csvError} Detail: ${err.message || err}`);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveTask = async () => {
    if (!taskForm.title?.trim() || !currentUser) return window.alert(t.alertTitleRequired);
    const newTask = { id: String(Date.now()), ...taskForm, assignee: taskForm.assignee || currentUser.name, date: taskForm.date || selectedDate, deadline: taskForm.deadline || selectedDate, createdAt: getToday(), user_name: currentUser.name };
    
    try {
      const snaked = toSnakeCase(newTask);
      await setDoc(doc(db, 'tasks', snaked.id), snaked);
      
      setTasks(p => [newTask, ...p]);
      await addLog("TASK", `Created: ${newTask.title}`);
      setTaskForm({ title: "", category: "Production", priority: "High", assignee: currentUser.permissionRole === "Staff" ? currentUser.name : "", deadline: selectedDate, date: selectedDate, start_time: "", end_time: "", status: "Pending", notes: "", createdAt: getToday(), imageUrl: "" });
      window.alert(`✅ ${t.taskSavedMsg}`);
    } catch (e: any) { 
      console.error("Error saving task:", e.message || e); 
      window.alert(`Gagal menyimpan task: ${e.message}`); 
    }
  };

  const saveEdit = async () => { 
    if (!editingTaskId) return; 
    try { 
      const snaked = toSnakeCase(editForm);
      await updateDoc(doc(db, 'tasks', editingTaskId), snaked);
      
      setTasks(p => p.map(tk => tk.id === editingTaskId ? { ...tk, ...editForm } : tk)); 
      await addLog("TASK", `Updated task: ${editForm.title}`); 
    } catch (e: any) { 
      console.error("Error updating task:", e.message || e); 
      window.alert(`Gagal update task: ${e.message}`);
    } 
    setEditingTaskId(null); 
  };

  const toggleStatus = async (id: string) => { 
    const tk = tasks.find(x => x.id === id); 
    if (!tk) return; 
    const ns = tk.status === "Completed" ? "In progress" : "Completed"; 
    try { 
      await updateDoc(doc(db, 'tasks', id), { status: ns });
      
      setTasks(p => p.map(x => x.id === id ? { ...x, status: ns } : x)); 
      await addLog("TASK", `Status changed for: ${tk.title}`); 
    } catch (e: any) { 
      console.error("Error toggling status:", e.message || e); 
      window.alert(`Gagal merubah status: ${e.message}`);
    } 
  };

  const deleteTask = async (id: string) => { 
    try { 
      await deleteDoc(doc(db, 'tasks', id));
      
      setTasks(p => p.filter(x => x.id !== id)); 
      await addLog("TASK", `Deleted task with id: ${id}`); 
    } catch (e: any) { 
      console.error("Error deleting task:", e.message || e); 
      window.alert(`Gagal menghapus task: ${e.message}`);
    } 
  };

  const handleSaveMeeting = async () => { 
    if (!meetingForm.title.trim() || !currentUser) return window.alert(t.alertTitleRequired); 
    const m = { id: String(Date.now()), ...meetingForm, user_name: currentUser.name }; 
    try { 
      const snaked = toSnakeCase(m);
      await setDoc(doc(db, 'meetings', snaked.id), snaked);
      
      setMeetings(p => [m, ...p]);
      await addLog("MEETING", m.title); 
      setMeetingForm({ title: "", date: selectedDate, time: "", attendees: "", notes: "" }); 
      window.alert(`✅ ${t.meetingSavedMsg}`);
    } catch (e: any) { 
      console.error("Error saving meeting:", e.message || e); 
      window.alert(`Gagal menyimpan meeting: ${e.message}`);
    } 
  };

  const shareWhatsApp = () => {
    if (!currentUser) return;
    const ownName = currentUser.name.trim().toLowerCase();
    const isOwnActivity = (assignee: string, userName?: string) => {
      const cleanAssignee = (assignee || "").trim().toLowerCase();
      const cleanUserName = (userName || "").trim().toLowerCase();
      return cleanAssignee === ownName || cleanUserName === ownName;
    };
    const statusLabelMap: Record<string, string> = { Pending: t.statusPending, "In progress": t.statusInProgress, Completed: t.statusCompleted, Cancelled: t.statusCancelled };
    const getStatusLabel = (s: string) => statusLabelMap[s] || s;

    // --- FILTER BY selectedDate ---
    const todayTasks = tasks.filter(tk => tk.date === selectedDate && isOwnActivity(tk.assignee, tk.user_name));
    const todayStock = stockItems.filter((s: any) => s.date === selectedDate);
    const todayMeetings = meetings.filter((m: any) => m.date === selectedDate);
    const todayMaint = maintItems.filter((m: any) => m.date === selectedDate);
    // --- END FILTER ---

    const completedTasks = todayTasks.filter((tk: any) => tk.status === "Completed").map((tk: any) => `• ${tk.title} [${getStatusLabel(tk.status)}] ${formatTimeRange(tk)}`).join('%0D%0A') || '-';
    const pendingTasks = todayTasks.filter((tk: any) => tk.status !== "Completed" && tk.status !== "Cancelled").map((tk: any) => `• ${tk.title} [${getStatusLabel(tk.status)}] ${formatTimeRange(tk)}`).join('%0D%0A') || '-';
    const stockItemsText = todayStock.map((s: any) => `• ${s.item} : ${s.stock + s.masuk - s.keluar} ${s.unit}`).join('%0D%0A') || '-';
    const maintItemsText = todayMaint.map((m: any) => `• ${m.equipment} : ${m.issue} [${getStatusLabel(m.status)}]`).join('%0D%0A') || '-';
    const meetingItemsText = todayMeetings.map((m: any) => `• ${m.title}${m.time ? ` (${m.time})` : ''}${m.attendees ? ` - ${m.attendees}` : ''}`).join('%0D%0A') || '-';

    const reportLink = `https://rubenhae95-jpg.github.io/blue-tick-to-do/`;

    const msg = `📋 ${t.waReportTitle}%0D%0A%0D%0A👤 ${t.waEmployee} : ${currentUser.name.toUpperCase()}%0D%0A💼 ${t.waRole} : ${currentUser.roleTitle}%0D%0A🕒 ${t.waShift} : ${currentUser.shift}%0D%0A📅 ${t.waDate} : ${formatDate(selectedDate)}%0D%0A%0D%0A━━━━━━━━━━━━━━━━━━%0D%0A%0D%0A✅ ${t.waCompleted}%0D%0A${completedTasks}%0D%0A%0D%0A⏳ ${t.waPending}%0D%0A${pendingTasks}%0D%0A%0D%0A📦 ${t.waStock}%0D%0A${stockItemsText}%0D%0A%0D%0A🔧 ${t.waMaintenance}%0D%0A${maintItemsText}%0D%0A%0D%0A📅 ${t.waMeeting}%0D%0A${meetingItemsText}%0D%0A%0D%0A📌 ${t.waNotes}%0D%0A-%0D%0A%0D%0A━━━━━━━━━━━━━━━━━━%0D%0A%0D%0A📤 ${t.waSubmittedBy}: ${currentUser.name.toUpperCase()}%0D%0A🕒 ${t.waSubmitted}: ${formatDate(currentTime)} | ${currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}%0D%0A%0D%0A🔗 ${t.waViewReport}: ${reportLink}`;
    window.open(`https://wa.me/?text=${msg}`, "_blank");
  };

  const menuItems = [
    { id: "dashboard", label: t.dashboard },
    { id: "tasks", label: t.tasks },
    { id: "stock", label: t.stock },
    { id: "meeting", label: t.meeting },
    { id: "maintenance", label: t.maintenance },
    { id: "activity_log", label: t.activityLog },
    { id: "settings", label: t.settings }
  ];
  const inputStyle: CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text, fontSize: 13, boxSizing: "border-box" };
  const btnStyle = (v: "primary" | "secondary" | "danger" = "primary") => ({ padding: "8px 12px", borderRadius: 8, border: v === "primary" ? "none" : `1px solid ${colors.border}`, background: v === "primary" ? colors.accent : v === "danger" ? `${colors.danger}20` : "transparent", color: v === "primary" ? "#FFF" : v === "danger" ? colors.danger : colors.text, fontSize: 13, cursor: "pointer", fontWeight: 500 });

  if (!currentUser) return <LoginScreen colors={colors} onLogin={handleLogin} t={t} />;

  return (
    <div style={{ minHeight: "100vh", background: colors.page, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", position: "relative" }}>
      <style>{`
        .nav-overlay { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; max-width: 75%; background: ${colors.card}; z-index: 60; transform: translateX(-100%); transition: .3s; display: flex; flex-direction: column; border-right: 1px solid ${colors.border}; }
        .nav-overlay.open { transform: translateX(0); }
        .nav-item { padding: 14px 24px; color: ${colors.muted}; cursor: pointer; transition: .2s; border-left: 4px solid transparent; }
        .nav-item.active { background: ${colors.accentBg}; color: ${colors.accent}; border-left-color: ${colors.accent}; }
        .nav-item:hover { background: ${colors.cardMuted}; }
        .main-content { flex: 1; padding: 20px; overflow-y: auto; max-width: 1200px; margin: 0 auto; width: 100%; boxSizing: border-box; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .stat-card { background: ${colors.card}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 14px; }
        .task-card { background: ${colors.card}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .clickable-item { transition: 0.2s; }
        .clickable-item:hover { background: ${colors.cardMuted}; border-color: ${colors.accent}; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-bottom: 12px; }
        .split-grid { display: grid; gap: 16px; grid-template-columns: 1.2fr 1fr; }
        @media(max-width:768px){ .main-content{padding:12px} header{flex-direction:column;gap:10px;padding:14px} .header-right{width:100%;justify-content:space-between;flex-wrap:wrap} .stats-grid{grid-template-columns:1fr 1fr} .split-grid{grid-template-columns:1fr} .form-grid{grid-template-columns:repeat(auto-fit, minmax(140px, 1fr))} }
        @media(max-width:480px){ .main-content{padding:10px} .stat-card{padding:10px} .task-card{padding:12px} .stats-grid{gap:8px} .form-grid{grid-template-columns:1fr;gap:8px} h1{font-size:1.15rem !important} .nav-overlay{width:230px} button{font-size:12px} }
        input[type="date"], input[type="time"], select { color-scheme: ${theme}; }
      `}</style>

      <div className={`nav-overlay ${isMenuOpen ? "open" : ""}`}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", borderBottom: `1px solid ${colors.border}` }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: colors.text }}>{t.menu}</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: colors.muted, fontSize: 28, cursor: "pointer" }}>×</button>
        </div>
        <nav style={{ padding: "16px 0", display: "grid", gap: 6, overflowY: "auto" }}>
          {menuItems.map(i => <div key={i.id} className={`nav-item ${activeTab === i.id ? "active" : ""}`} onClick={() => { setActiveTab(i.id as Tab); setMenuOpen(false); if (currentUser) { const payload = { user_name: currentUser.name, active_tab: i.id }; console.log("[BlueTick] WRITE user_prefs (menu click):", payload); setDoc(doc(db, 'user_prefs', currentUser.name), payload, { merge: true }); } }}>{i.label}</div>)}
        </nav>
        <div style={{ padding: 20, marginTop: "auto", borderTop: `1px solid ${colors.border}` }}>
          <div style={{ fontSize: 14, color: colors.text, fontWeight: 600 }}>{formatDisplayName(currentUser.name)}</div>
          <div style={{ fontSize: 12, color: colors.muted }}>{currentUser.roleTitle} · {currentUser.permissionRole}</div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: colors.card, borderBottom: `1px solid ${colors.border}`, color: colors.text }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", fontSize: 26, color: colors.text, cursor: "pointer" }}>☰</button>
            <img src={userLogo || DEFAULT_LOGO} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <div style={{ fontSize: 10, color: colors.muted, fontWeight: 600, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 2 }}>Daily Operational Task</div>
            <h1 style={{ fontSize: "1.5rem", color: "#1467C8", fontFamily: "'Arial Narrow', 'Oswald', 'Helvetica Neue Condensed', sans-serif", fontWeight: 800, letterSpacing: "-0.01em", margin: 0 }}>BLUE TICK ICE</h1>
            <span style={{ fontSize: 11, color: colors.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>
              {formatDisplayName(currentUser.name)} ({currentUser.permissionRole})
            </span>
          </div>
          <div className="header-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: colors.muted, fontVariantNumeric: "tabular-nums" }}>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} | {formatDate(currentTime)}</span>
            {activeTab !== "settings" && <button onClick={shareWhatsApp} style={btnStyle("primary")}>{t.share}</button>}
          </div>
        </header>

        <main className="main-content">
          {/* Dashboard */}
          {activeTab === "dashboard" && (() => {
            const dashboardTasks = tasks.filter(tk => matchesUser(tk.assignee));
            const dashboardStock = stockItems;
            const dashboardMeetings = meetings;
            const dashboardMaint = maintItems;

            const totalTasks = dashboardTasks.length;
            const completedTasks = dashboardTasks.filter((t: any) => t.status === "Completed").length;
            const inProgressTasks = dashboardTasks.filter((t: any) => t.status === "In progress").length;
            const pendingTasksCount = dashboardTasks.filter((t: any) => t.status === "Pending").length;
            const cancelledTasks = dashboardTasks.filter((t: any) => t.status === "Cancelled").length;
            const progressPercentage = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;

            const maxVal = Math.max(completedTasks, inProgressTasks, pendingTasksCount, cancelledTasks, 1);

            return (
              <>
                <div className="stats-grid">
                  <div className="stat-card"><div style={{ fontSize: 22, fontWeight: 700 }}>{totalTasks}</div><div style={{ fontSize: 11, color: colors.muted }}>{t.totalTaskLabel}</div></div>
                  <div className="stat-card"><div style={{ fontSize: 22, fontWeight: 700, color: colors.success }}>{completedTasks}</div><div style={{ fontSize: 11, color: colors.muted }}>{t.completed}</div></div>
                  <div className="stat-card"><div style={{ fontSize: 22, fontWeight: 700, color: colors.warning }}>{pendingTasksCount + inProgressTasks}</div><div style={{ fontSize: 11, color: colors.muted }}>{t.remaining}</div></div>
                  <div className="stat-card"><div style={{ fontSize: 22, fontWeight: 700, color: colors.danger }}>{cancelledTasks}</div><div style={{ fontSize: 11, color: colors.muted }}>{t.cancelled}</div></div>
                </div>
                
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <span style={{ fontWeight: 600 }}>{t.progress}</span>
                    <span style={{ background: colors.accentBg, color: colors.accent, padding: "3px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{progressPercentage}%</span>
                  </div>
                  <div style={{ height: 6, background: colors.cardMuted, borderRadius: 999, overflow: "hidden" }}><div style={{ height: "100%", width: `${progressPercentage}%`, background: colors.accent, borderRadius: 999, transition: "width 0.5s" }} /></div>
                </div>

                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ fontWeight: 600, marginBottom: 16, fontSize: 14 }}>{t.chartTitle}</div>
                  <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-end", height: 160, paddingBottom: 10, borderBottom: `1px solid ${colors.border}` }}>
                    {[
                      { label: "Pending", count: pendingTasksCount, color: statusColors.Pending.text },
                      { label: "In Progress", count: inProgressTasks, color: statusColors["In progress"].text },
                      { label: "Completed", count: completedTasks, color: statusColors.Completed.text },
                      { label: "Cancelled", count: cancelledTasks, color: statusColors.Cancelled.text },
                    ].map((bar, idx) => {
                      const heightPercent = Math.round((bar.count / maxVal) * 100);
                      return (
                        <div key={idx} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1, height: "100%", justifyContent: "flex-end" }}>
                          <span style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>{bar.count}</span>
                          <div style={{ width: "60%", maxWidth: 40, height: `${Math.max(heightPercent, 8)}%`, background: bar.color, borderRadius: "6px 6px 0 0", transition: "height 0.4s" }} />
                          <span style={{ fontSize: 11, color: colors.muted, marginTop: 6, textAlign: "center" }}>{bar.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                  {dashboardTasks.length > 0 && (
                    <div className="task-card">
                      <b style={{display: 'block', marginBottom: 10}}>{t.dashTasks}</b>
                      <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: 5 }}>
                        {dashboardTasks.map((tk: any) => (
                          <div 
                            key={tk.id} 
                            className="clickable-item"
                            style={{ fontSize: 13, marginTop: 8, padding: 10, background: colors.cardMuted, borderRadius: 8, cursor: "pointer", border: `1px solid transparent`, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onClick={() => { setActiveTab("tasks"); setSearch(tk.title); setSelectedDate(tk.date); setEditingTaskId(tk.id); setEditForm(tk); }}
                          >
                            <div>
                              <div style={{fontWeight: 600}}>{tk.title}</div>
                              <div style={{fontSize: 11, color: colors.muted}}>📅 {tk.date} | ⏰ {tk.start_time && tk.end_time ? `${tk.start_time}-${tk.end_time}` : tk.start_time || tk.end_time || 'N/A'}</div>
                              <div style={{fontSize: 11, color: colors.muted}}>{tk.date} [{tk.status}]</div>
                            </div>
                            {tk.imageUrl && <img src={tk.imageUrl} alt="img" style={{width: 28, height: 28, borderRadius: 4, objectFit: "cover"}} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dashboardStock.length > 0 && (
                    <div className="task-card">
                      <b style={{display: 'block', marginBottom: 10}}>{t.dashStock}</b>
                      <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: 5 }}>
                        {dashboardStock.map((s: any) => (
                          <div 
                            key={s.id} 
                            className="clickable-item"
                            style={{ fontSize: 13, marginTop: 8, padding: 10, background: colors.cardMuted, borderRadius: 8, cursor: "pointer", border: `1px solid transparent` }}
                            onClick={() => { setActiveTab("stock"); setSelectedDate(s.date); }}
                          >
                            <div style={{fontWeight: 600}}>{s.item}: {s.stock + s.masuk - s.keluar} {s.unit}</div>
                            <div style={{fontSize: 11, color: colors.muted}}>{s.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dashboardMeetings.length > 0 && (
                    <div className="task-card">
                      <b style={{display: 'block', marginBottom: 10}}>{t.dashMeetings}</b>
                      <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: 5 }}>
                        {dashboardMeetings.map((m: any) => (
                          <div 
                            key={m.id} 
                            className="clickable-item"
                            style={{ fontSize: 13, marginTop: 8, padding: 10, background: colors.cardMuted, borderRadius: 8, cursor: "pointer", border: `1px solid transparent` }}
                            onClick={() => { setActiveTab("meeting"); setSelectedDate(m.date); }}
                          >
                            <div style={{fontWeight: 600}}>{m.title} ({m.time})</div>
                            <div style={{fontSize: 11, color: colors.muted}}>{m.date}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {dashboardMaint.length > 0 && (
                    <div className="task-card">
                      <b style={{display: 'block', marginBottom: 10}}>{t.dashMaintenance}</b>
                      <div style={{ maxHeight: '250px', overflowY: 'auto', paddingRight: 5 }}>
                        {dashboardMaint.map((m: any) => (
                          <div 
                            key={m.id} 
                            className="clickable-item"
                            style={{ fontSize: 13, marginTop: 8, padding: 10, background: colors.cardMuted, borderRadius: 8, cursor: "pointer", border: `1px solid transparent`, display: "flex", justifyContent: "space-between", alignItems: "center" }}
                            onClick={() => { setActiveTab("maintenance"); setSelectedDate(m.date); }}
                          >
                            <div>
                              <div style={{fontWeight: 600}}>{m.equipment}</div>
                              <div style={{fontSize: 11, color: colors.muted}}>{m.date} - {m.status}</div>
                            </div>
                            {m.imageUrl && <img src={m.imageUrl} alt="img" style={{width: 28, height: 28, borderRadius: 4, objectFit: "cover"}} />}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {totalTasks === 0 && dashboardStock.length === 0 && dashboardMeetings.length === 0 && dashboardMaint.length === 0 && <div style={{ textAlign: "center", padding: 40, color: colors.muted }}>{t.noTasks}</div>}
              </>
            );
          })()}

          {/* Tasks */}
          {activeTab === "tasks" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.tasks}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: colors.muted }}>{t.dateLabel}:</span>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inputStyle, width: "auto" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} />
                <select style={{ ...inputStyle, flex: 1 }} value={filterStat} onChange={e => setFilterStat(e.target.value)}><option value="All">{t.statusAll}</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>
              {filteredTasks.length === 0 ? <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noTasks}</div> : filteredTasks.map((tk: any) => {
                const isEd = editingTaskId === tk.id;
                const statusKey = statuses.find(s => s === tk.status);
                const badge = statusKey ? statusColors[statusKey] : { bg: "#E5E7EB", text: "#4B5563" };
                return (
                  <div className="task-card" key={tk.id}>
                    {isEd ? (
                      <div className="form-grid">
                        <input style={inputStyle} value={editForm.title || ""} onChange={e => setEditForm((p: any) => ({ ...p, title: e.target.value }))} />
                        <input style={inputStyle} type="date" value={editForm.date || tk.date} onChange={e => setEditForm((p: any) => ({ ...p, date: e.target.value, deadline: e.target.value }))} />
                        <input style={inputStyle} type="time" value={editForm.start_time || ""} onChange={e => setEditForm((p: any) => ({ ...p, start_time: e.target.value }))} />
                        <input style={inputStyle} type="time" value={editForm.end_time || ""} onChange={e => setEditForm((p: any) => ({ ...p, end_time: e.target.value }))} />
                        <select style={inputStyle} value={editForm.status || tk.status} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }}>
                          <label style={{...btnStyle("secondary"), cursor: "pointer", display: "flex", alignItems: "center", gap: 5}}>
                            📷 Upload
                            <input type="file" accept="image/*" style={{display: "none"}} onChange={e => handleImageInput(e, val => setEditForm((p: any) => ({...p, imageUrl: val})))} />
                          </label>
                          {editForm.imageUrl && <img src={editForm.imageUrl} alt="preview" style={{width: 32, height: 32, objectFit: "cover", borderRadius: 4}} />}
                        </div>
                        <div style={{ gridColumn: "1/-1", display: "flex", gap: 8, marginTop: 10 }}>
                          <button style={btnStyle("primary")} onClick={saveEdit}>{t.save}</button>
                          <button style={btnStyle("secondary")} onClick={() => setEditingTaskId(null)}>{t.cancel}</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 600 }}>{tk.title}</span><span style={{ background: badge.bg, color: badge.text, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{tk.status}</span></div>
                        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>{tk.category} · {tk.priority} · {formatDisplayName(tk.assignee)} · 📅 {tk.date} | ⏰ {tk.start_time && tk.end_time ? `${tk.start_time}-${tk.end_time}` : tk.start_time || tk.end_time || 'N/A'}</div>
                        {tk.imageUrl && <div style={{marginBottom: 10}}><img src={tk.imageUrl} alt="Task Image" style={{maxHeight: 120, borderRadius: 8, border: `1px solid ${colors.border}`}} /></div>}
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                          <button style={btnStyle(tk.status === "Completed" ? "secondary" : "primary")} onClick={() => toggleStatus(tk.id)}>{tk.status === "Completed" ? t.undo : t.checklist}</button>
                          <button style={btnStyle("secondary")} onClick={() => { setEditingTaskId(tk.id); setEditForm(tk); }}>{t.edit}</button>
                          <button style={btnStyle("danger")} onClick={() => deleteTask(tk.id)}>{t.delete}</button>
                        </div>
                        <textarea style={{ ...inputStyle, minHeight: 40, marginTop: 8 }} value={tk.notes} onChange={async e => { 
                          const v = e.target.value; 
                          try {
                            await updateDoc(doc(db, 'tasks', tk.id), { notes: v });
                            setTasks(p => p.map(i => i.id === tk.id ? { ...i, notes: v } : i)); 
                          } catch (err: any) { console.error("Update notes failed", err.message); }
                        }} placeholder={t.notesPlaceholder} />
                      </>
                    )}
                  </div>
                );
              })}
              <div style={{ marginTop: 20, background: colors.cardMuted, padding: 16, borderRadius: 10 }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{t.taskFormTitle}</div>
                <div className="form-grid">
                  <input style={inputStyle} value={taskForm.title || ""} onChange={e => setTaskForm((p: any) => ({ ...p, title: e.target.value }))} placeholder={t.titlePlaceholder} />
                  <input style={inputStyle} value={taskForm.assignee || ""} onChange={e => setTaskForm((p: any) => ({ ...p, assignee: e.target.value }))} placeholder={t.assigneePlaceholder} disabled={currentUser.permissionRole === "Staff"} />
                  <input style={inputStyle} value={taskForm.date || selectedDate} onChange={e => setTaskForm((p: any) => ({ ...p, date: e.target.value, deadline: e.target.value }))} type="date" />
                  <input style={inputStyle} value={taskForm.start_time || ""} onChange={e => setTaskForm((p: any) => ({ ...p, start_time: e.target.value }))} type="time" />
                  <input style={inputStyle} value={taskForm.end_time || ""} onChange={e => setTaskForm((p: any) => ({ ...p, end_time: e.target.value }))} type="time" />
                  <select style={inputStyle} value={taskForm.category || "Production"} onChange={e => setTaskForm((p: any) => ({ ...p, category: e.target.value }))}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <select style={inputStyle} value={taskForm.priority || "High"} onChange={e => setTaskForm((p: any) => ({ ...p, priority: e.target.value as Priority }))}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select>
                  
                  <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }}>
                    <label style={{...btnStyle("secondary"), cursor: "pointer", display: "flex", alignItems: "center", gap: 5}}>
                      📷 Upload Foto
                      <input type="file" accept="image/*" style={{display: "none"}} onChange={e => handleImageInput(e, val => setTaskForm((p: any) => ({...p, imageUrl: val})))} />
                    </label>
                    {taskForm.imageUrl && <img src={taskForm.imageUrl} alt="preview" style={{width: 32, height: 32, objectFit: "cover", borderRadius: 4}} />}
                  </div>
                </div>
                <button style={{ ...btnStyle("primary"), width: "100%", padding: "10px 0" }} onClick={handleSaveTask}>{t.addTask}</button>
              </div>
            </div>
          )}

          {/* Stock */}
          {activeTab === "stock" && (
            <div className="split-grid">
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{t.stock}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {stockItems.filter((s: any) => s.date === selectedDate).map((s: any) => {
                    const current = s.stock + s.masuk - s.keluar;
                    return (
                      <div key={s.id} className="task-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontWeight: 600 }}>{s.item}</span>
                          <span style={{ fontWeight: 700, color: current <= 0 ? colors.danger : colors.accent }}>{current} {s.unit}</span>
                        </div>
                        <div style={{ display: "flex", gap: 6, marginBottom: 8 }}>
                          <button style={{ ...btnStyle("secondary"), flex: 1 }} onClick={async () => { 
                            const v = prompt(`Tambah ${t.incoming} (${s.item}):`, "0"); 
                            if(v!==null){ 
                              const n=Number(v); 
                              try { 
                                await updateDoc(doc(db, 'stock_items', s.id), { masuk: s.masuk+n, updated_at: getToday() });
                                setStockItems(p=>p.map((i: any)=>i.id===s.id?{...i,masuk:i.masuk+n,updatedAt:getToday()}:i)); 
                                await addLog("STOCK", `Added ${n} to ${s.item}`); 
                              } catch(e: any){console.error("Error updating stock:", e); window.alert(e.message);} 
                            } 
                          }}>{t.incoming}</button>
                          
                          <button style={{ ...btnStyle("secondary"), flex: 1 }} onClick={async () => { 
                            const v = prompt(`Tambah ${t.outgoing} (${s.item}):`, "0"); 
                            if(v!==null){ 
                              const n=Number(v); 
                              try { 
                                await updateDoc(doc(db, 'stock_items', s.id), { keluar: s.keluar+n, updated_at: getToday() });
                                setStockItems(p=>p.map((i: any)=>i.id===s.id?{...i,keluar:i.keluar+n,updatedAt:getToday()}:i)); 
                                await addLog("STOCK", `Removed ${n} from ${s.item}`); 
                              } catch(e: any){console.error("Error updating stock:", e); window.alert(e.message);} 
                            } 
                          }}>{t.outgoing}</button>
                        </div>
                        {s.notes && <div style={{ fontSize: 12, color: colors.muted }}>{s.notes}</div>}
                        <button style={{ ...btnStyle("danger"), marginTop: 8, fontSize: 12 }} onClick={async () => { 
                          try { 
                            await deleteDoc(doc(db, 'stock_items', s.id));
                            setStockItems(p => p.filter((i: any) => i.id !== s.id)); 
                            addLog("STOCK", `Deleted item ${s.item}`); 
                          } catch(e: any){console.error("Error deleting stock:", e); window.alert(e.message);} 
                        }}>{t.deleteItem}</button>
                      </div>
                    );
                  })}
                  {stockItems.filter((s: any) => s.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noStock}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{t.addNewItem}</div>
                <input style={inputStyle} value={stockForm.date} onChange={e => setStockForm(p => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={stockForm.item} onChange={e => setStockForm(p => ({ ...p, item: e.target.value }))} placeholder={t.itemName} />
                <input style={inputStyle} value={stockForm.unit} onChange={e => setStockForm(p => ({ ...p, unit: e.target.value }))} placeholder={t.unit} />
                <input style={inputStyle} value={stockForm.stock} onChange={e => setStockForm(p => ({ ...p, stock: e.target.value }))} placeholder={t.initialStock} type="number" />
                <textarea style={{ ...inputStyle, minHeight: 50, marginTop: 8 }} value={stockForm.notes} onChange={e => setStockForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.notesPlaceholder} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={async () => {
                  if (!stockForm.item.trim() || !currentUser) return window.alert(t.alertTitleRequired);
                  const newItem = { id: String(Date.now()), ...stockForm, stock: Number(stockForm.stock) || 0, masuk: 0, keluar: 0, updatedAt: getToday(), user_name: currentUser.name };
                  
                  try {
                    const snaked = toSnakeCase(newItem);
                    await setDoc(doc(db, 'stock_items', snaked.id), snaked);
                    
                    setStockItems(p => [newItem, ...p]);
                    await addLog("STOCK", `Added new item: ${newItem.item}`);
                    setStockForm({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "", date: getToday() });
                  } catch (e: any) { 
                    console.error("Error saving stock item:", e.message || e); 
                    window.alert(`Gagal menyimpan item: ${e.message}`); 
                  }
                }}>{t.addNewItem}</button>
              </div>
            </div>
          )}

          {/* Meeting */}
          {activeTab === "meeting" && (
            <div className="split-grid">
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{t.meeting}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {meetings.filter((m: any) => m.date === selectedDate).map((m: any) => (
                    <div key={m.id} className="task-card">
                      <div style={{ fontWeight: 600 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{formatDate(m.date)} · {m.time || "-"}</div>
                      <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{t.attendeesInput}: {m.attendees || "-"}</div>
                      {m.notes && <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{m.notes}</div>}
                      <button style={{ ...btnStyle("danger"), marginTop: 8, fontSize: 12 }} onClick={async () => { 
                        try { 
                          await deleteDoc(doc(db, 'meetings', m.id));
                          setMeetings(p => p.filter((x: any) => x.id !== m.id)); 
                          addLog("MEETING", `Deleted meeting: ${m.title}`); 
                        } catch(e: any){console.error("Error deleting meeting:", e); window.alert(e.message);} 
                      }}>{t.delete}</button>
                    </div>
                  ))}
                  {meetings.filter((m: any) => m.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMeeting}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{t.scheduleMeeting}</div>
                <input style={inputStyle} value={meetingForm.date} onChange={e => setMeetingForm(p => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={meetingForm.title} onChange={e => setMeetingForm(p => ({ ...p, title: e.target.value }))} placeholder={t.meetingName} />
                <input style={inputStyle} value={meetingForm.time} onChange={e => setMeetingForm(p => ({ ...p, time: e.target.value }))} type="time" />
                <input style={inputStyle} value={meetingForm.attendees} onChange={e => setMeetingForm(p => ({ ...p, attendees: e.target.value }))} placeholder={t.attendeesInput} />
                <textarea style={{ ...inputStyle, minHeight: 50, marginTop: 8 }} value={meetingForm.notes} onChange={e => setMeetingForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.agenda} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={handleSaveMeeting}>{t.addMeeting}</button>
              </div>
            </div>
          )}

          {/* Maintenance */}
          {activeTab === "maintenance" && (
            <div className="split-grid">
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{t.maintenance}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {maintItems.filter((m: any) => m.date === selectedDate).map((m: any) => {
                    const statusKey = statuses.find(s => s === m.status);
                    const badge = statusKey ? statusColors[statusKey] : { bg: "#E5E7EB", text: "#4B5563" };
                    return (
                      <div key={m.id} className="task-card">
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 600 }}>{m.equipment}</span><span style={{ background: badge.bg, color: badge.text, padding: "2px 8px", borderRadius: 6, fontSize: 11 }}>{m.status}</span></div>
                        <div style={{ fontSize: 12, color: colors.muted }}>{m.issue}</div>
                        <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{t.techName}: {m.technician || "-"} · {formatDate(m.date)}</div>
                        {m.imageUrl && <div style={{marginTop: 8}}><img src={m.imageUrl} alt="Maint Image" style={{maxHeight: 100, borderRadius: 8, border: `1px solid ${colors.border}`}} /></div>}
                        {m.notes && <div style={{ fontSize: 12, color: colors.muted, marginTop: 8 }}>{m.notes}</div>}
                        <button style={{ ...btnStyle("danger"), marginTop: 8, fontSize: 12 }} onClick={async () => { 
                          try { 
                            await deleteDoc(doc(db, 'maintenance', m.id));
                            setMaintItems(p => p.filter((x: any) => x.id !== m.id)); 
                            addLog("MAINTENANCE", `Deleted maintenance: ${m.equipment}`); 
                          } catch(e: any){console.error("Error deleting maintenance:", e); window.alert(e.message);} 
                        }}>{t.delete}</button>
                      </div>
                    );
                  })}
                  {maintItems.filter((m: any) => m.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMaint}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{t.addMaint}</div>
                <input style={inputStyle} value={maintForm.date} onChange={e => setMaintForm((p: any) => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={maintForm.equipment} onChange={e => setMaintForm((p: any) => ({ ...p, equipment: e.target.value }))} placeholder={t.equipName} />
                <textarea style={{ ...inputStyle, minHeight: 50 }} value={maintForm.issue} onChange={e => setMaintForm((p: any) => ({ ...p, issue: e.target.value }))} placeholder={t.issueDesc} />
                <input style={inputStyle} value={maintForm.technician} onChange={e => setMaintForm((p: any) => ({ ...p, technician: e.target.value }))} placeholder={t.techName} />
                <select style={inputStyle} value={maintForm.status} onChange={e => setMaintForm((p: any) => ({ ...p, status: e.target.value as TaskStatus }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <textarea style={{ ...inputStyle, minHeight: 40, marginTop: 8 }} value={maintForm.notes} onChange={e => setMaintForm((p: any) => ({ ...p, notes: e.target.value }))} placeholder={t.maintNotes} />
                
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10 }}>
                  <label style={{...btnStyle("secondary"), cursor: "pointer", display: "flex", alignItems: "center", gap: 5}}>
                    📷 Upload Foto
                    <input type="file" accept="image/*" style={{display: "none"}} onChange={e => handleImageInput(e, val => setMaintForm((p: any) => ({...p, imageUrl: val})))} />
                  </label>
                  {maintForm.imageUrl && <img src={maintForm.imageUrl} alt="preview" style={{width: 32, height: 32, objectFit: "cover", borderRadius: 4}} />}
                </div>

                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={async () => {
                  if (!maintForm.equipment.trim() || !currentUser) return window.alert(t.alertTitleRequired);
                  const newItem = { id: String(Date.now()), ...maintForm, user_name: currentUser.name };
                  
                  try {
                    const snaked = toSnakeCase(newItem);
                    await setDoc(doc(db, 'maintenance', snaked.id), snaked);
                    setMaintItems(p => [newItem, ...p]);
                    await addLog("MAINTENANCE", `Added maintenance: ${newItem.equipment}`);
                    setMaintForm({ equipment: "", issue: "", technician: "", status: "Pending", date: selectedDate, notes: "", imageUrl: "" });
                  } catch (e: any) { 
                    console.error("Error saving maintenance:", e.message || e); 
                    window.alert(`Gagal menyimpan maintenance: ${e.message}`); 
                  }
                }}>{t.addMaintBtn}</button>
              </div>
            </div>
          )}

          {/* Activity Log & Admin User List */}
          {activeTab === "activity_log" && (
            <div style={{ display: "grid", gap: 20 }}>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontWeight: 600, marginBottom: 12 }}>{t.activityLog}</div>
                {activityLogs.length === 0 ? <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noLogs}</div> : (
                  <div style={{ display: "grid", gap: 10 }}>
                    {activityLogs.map((log: any) => (
                      <div key={log.id} className="task-card" style={{ padding: 12, marginBottom: 0 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 600, color: colors.accent }}>{log.type}</span><span style={{ fontSize: 11, color: colors.muted }}>{formatDateTime(log.timestamp)}</span></div>
                        <div style={{ fontSize: 13 }}>{log.action} {currentUser?.permissionRole === "Admin" && <span style={{ fontSize: 11, color: colors.muted }}>({formatDisplayName(log.user_name)})</span>}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {currentUser.permissionRole === "Admin" && allUsersList.length > 0 && (
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                  <div style={{ fontWeight: 600, marginBottom: 12 }}>{t.usersList}</div>
                  <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
                    {allUsersList.map((usr: any, idx: number) => (
                      <div key={idx} style={{ background: colors.cardMuted, padding: 10, borderRadius: 8, border: `1px solid ${colors.border}` }}>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{formatDisplayName(usr.username)}</div>
                        <div style={{ fontSize: 11, color: colors.muted }}>{usr.position} · {usr.role}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === "settings" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>{t.settings}</h2>
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                
                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.uploadLogo}</div>
                  <input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  <label htmlFor="logo" style={{ ...btnStyle("secondary"), cursor: "pointer", display: "inline-block", padding: "8px 14px" }}>{t.choose}</label>
                </div>

                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.importCsv}</div>
                  <input id="csv" type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: "none" }} />
                  <label htmlFor="csv" style={{ ...btnStyle("secondary"), cursor: "pointer", display: "inline-block", padding: "8px 14px" }}>{t.choose} CSV</label>
                </div>

                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>{theme === "light" ? "🌙" : "☀️"}</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{theme === "light" ? t.darkMode : t.lightMode}</div>
                  <button style={{ ...btnStyle("secondary"), padding: "8px 14px" }} onClick={() => setTheme(th => th === "light" ? "dark" : "light")}>
                    {t.switchTheme}
                  </button>
                </div>

                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🌐</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.languageLabel}</div>
                  <button style={{ ...btnStyle("secondary"), padding: "8px 14px" }} onClick={() => setLang(l => l === "id" ? "en" : "id")}>
                    {lang === "id" ? "English (EN)" : "Bahasa Indonesia (ID)"}
                  </button>
                </div>

                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🚪</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.logout}</div>
                  <button style={{ ...btnStyle("danger"), padding: "8px 14px" }} onClick={handleLogout}>
                    {t.logout}
                  </button>
                </div>

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}