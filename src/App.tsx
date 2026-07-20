import { useState, useEffect, type ChangeEvent, type CSSProperties } from "react";

// ==========================================
// TYPE DEFINITIONS (STRICT TYPESCRIPT)
// ==========================================

type PermissionRole = "Admin" | "Staff";
type TaskStatus = "Pending" | "In progress" | "Completed" | "Cancelled";
type Priority = "High" | "Medium" | "Low";
type Theme = "light" | "dark";
type Tab = "dashboard" | "tasks" | "stock" | "meeting" | "maintenance" | "schedule" | "activity_log" | "settings";
type Lang = "id" | "en";

interface UserSession {
  id: string;
  username: string;
  role?: string;
  isLoggedIn: boolean;
}

interface UserCredentials {
  username: string;
  password: string;
}

interface CurrentUser {
  name: string;
  roleTitle: string;
  permissionRole: PermissionRole;
  shift: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  assignee: string;
  deadline: string;
  date: string;
  startTime: string;
  endTime: string;
  status: TaskStatus;
  notes: string;
  createdAt: string;
  createdByRole?: PermissionRole;
  reason?: string;
  imageUrl?: string;
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

interface StockItem {
  id: string;
  item: string;
  unit: string;
  stock: number;
  masuk: number;
  keluar: number;
  notes: string;
  updatedAt: string;
  date: string;
  minStock: number;
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string;
  notes: string;
}

interface MaintenanceItem {
  id: string;
  equipment: string;
  issue: string;
  technician: string;
  status: TaskStatus;
  date: string;
  notes: string;
}

interface ScheduleEntry {
  id: string;
  equipment: string;
  date: string;
  status: TaskStatus;
  responsible: string;
  notes: string;
}

interface LogEntry {
  id: string;
  type: string;
  action: string;
  timestamp: string;
}

// ==========================================
// CONSTANTS & HELPERS
// ==========================================

const DEFAULT_LOGO = "https://via.placeholder.com/48/0EA5E9/FFFFFF?text=BT";
const categories: string[] = ["Production", "Cleaning", "Logistics", "Supervision", "Office", "Maintenance", "Factory Supervisor", "Other"];
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: TaskStatus[] = ["Pending", "In progress", "Completed", "Cancelled"];
const shifts: string[] = ["Day", "Night"];

const statusColors: Record<TaskStatus, { bg: string; text: string }> = {
  Pending: { bg: "#FEF3C7", text: "#B45309" },
  "In progress": { bg: "#DBEAFE", text: "#1D4ED8" },
  Completed: { bg: "#DCFCE7", text: "#166534" },
  Cancelled: { bg: "#FEE2E2", text: "#991B1B" },
};

const translations = {
  id: {
    dashboard: "Dashboard", tasks: "Tasks", stock: "Stok Opname", meeting: "Meeting Notes", maintenance: "Maintenance", 
    schedule: "Maintenance Schedule", activityLog: "Activity Log", settings: "Pengaturan",
    total: "Total Tasks", completed: "Completed", remaining: "Remaining", cancelled: "Cancelled",
    progress: "Today's Progress", share: "Share Report", addTask: "Tambah Task", edit: "Edit", save: "Simpan", cancel: "Batal", delete: "Hapus",
    checklist: "Checklist", undo: "Undo", noTasks: "Tidak ada aktivitas untuk tanggal ini.", login: "Masuk", logout: "Keluar",
    darkMode: "Mode gelap", lightMode: "Mode terang", taskFormTitle: "Tambah Task", adminStaffNote: "Admin & Staff bisa buat task.",
    titlePlaceholder: "Judul tugas", descriptionPlaceholder: "Deskripsi tugas", assigneePlaceholder: "Penanggung jawab", notesPlaceholder: "Catatan internal",
    reasonPlaceholder: "Alasan pending/progress", alertTitleRequired: "Judul wajib diisi.", alertAssigneeRequired: "Assignee wajib diisi.",
    uploadLogo: "Unggah Logo", importCsv: "Import CSV Tasks", resetData: "Reset Data Aplikasi",
    uploadPhoto: "Upload Foto", updateLast: "Update", addNewItem: "Tambah item", itemName: "Nama item", initialStock: "Stok awal",
    incoming: "Masuk", outgoing: "Keluar", currentStock: "Sisa", deleteItem: "Hapus item", noStock: "Kosong.", scheduleMeeting: "Jadwalkan",
    meetingName: "Judul", date: "Tanggal", timeInput: "Waktu", attendeesInput: "Peserta", agenda: "Agenda", addMeeting: "Tambah meeting", noMeeting: "Kosong.",
    addMaint: "Tambah maintenance", equipName: "Peralatan", issueDesc: "Masalah", techName: "Teknisi", maintNotes: "Catatan", addMaintBtn: "Tambah", noMaint: "Kosong.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operation", loginDesc: "Masuk untuk mulai", loginName: "Nama", loginPassword: "Password", loginRole: "Jabatan", loginBtn: "Masuk", nameRequired: "Nama wajib.", passMismatch: "Password salah.",
    csvSuccess: "tugas berhasil diimport!", csvError: "Gagal parse CSV.", pendingTasks: "Pending", inProgress: "In Progress", completionRate: "Completion Rate",
    lowStock: "Stok Menipis!", minStock: "Batas Minimal", addSchedule: "Tambah Jadwal", responsible: "Penanggung Jawab", noLogs: "Belum ada aktivitas tercatat."
  },
  en: {
    dashboard: "Dashboard", tasks: "Tasks", stock: "Stock Opname", meeting: "Meeting Notes", maintenance: "Maintenance",
    schedule: "Maintenance Schedule", activityLog: "Activity Log", settings: "Settings",
    total: "Total Tasks", completed: "Completed", remaining: "Remaining", cancelled: "Cancelled",
    progress: "Today's Progress", share: "Share Report", addTask: "Add Task", edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete",
    checklist: "Checklist", undo: "Undo", noTasks: "No activities for this date.", login: "Login", logout: "Logout",
    darkMode: "Dark mode", lightMode: "Light mode", taskFormTitle: "Add Task", adminStaffNote: "Admin & Staff can create tasks.",
    titlePlaceholder: "Task title", descriptionPlaceholder: "Description", assigneePlaceholder: "Assignee", notesPlaceholder: "Notes",
    reasonPlaceholder: "Reason if pending/progress", alertTitleRequired: "Title required.", alertAssigneeRequired: "Assignee required.",
    uploadLogo: "Upload Logo", importCsv: "Import CSV Tasks", resetData: "Reset App Data",
    uploadPhoto: "Upload Photo", updateLast: "Updated", addNewItem: "Add item", itemName: "Item name", initialStock: "Initial Stock",
    incoming: "In", outgoing: "Out", currentStock: "Remaining", deleteItem: "Delete item", noStock: "Empty.", scheduleMeeting: "Schedule",
    meetingName: "Title", date: "Date", timeInput: "Time", attendeesInput: "Attendees", agenda: "Agenda", addMeeting: "Add meeting", noMeeting: "Empty.",
    addMaint: "Add maintenance", equipName: "Equipment", issueDesc: "Issue", techName: "Technician", maintNotes: "Notes", addMaintBtn: "Add", noMaint: "Empty.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operation", loginDesc: "Login to start", loginName: "Name", loginPassword: "Password", loginRole: "Role", loginBtn: "Login", nameRequired: "Name required.", passMismatch: "Incorrect password.",
    csvSuccess: "tasks imported successfully!", csvError: "CSV parse failed.", pendingTasks: "Pending", inProgress: "In Progress", completionRate: "Completion Rate",
    lowStock: "Low Stock!", minStock: "Min Threshold", addSchedule: "Add Schedule", responsible: "Responsible", noLogs: "No activity logs yet."
  },
};

const sampleTasks: Task[] = [
  { id: "1", title: "Check LP & HP Pressure", description: "Verifikasi tekanan sistem.", category: "Maintenance", priority: "High", assignee: "Ilham", deadline: "2026-07-18", date: "2026-07-18", startTime: "07:00", endTime: "07:08", status: "Completed", notes: "", createdAt: "2026-07-18" },
];

const sampleStock: StockItem[] = [
  { id: "1", item: "Es kristal", unit: "kg", stock: 150, masuk: 20, keluar: 50, notes: "Aman", updatedAt: "2026-07-18", date: "2026-07-18", minStock: 100 },
];

const sampleMeetings: Meeting[] = [{ id: "1", title: "Briefing", date: "2026-07-19", time: "07:30", attendees: "Budi, Siti", notes: "Target harian" }];
const sampleMaintenance: MaintenanceItem[] = [{ id: "1", equipment: "Ice Ball Machine", issue: "Noise", technician: "Dedi", status: "In progress", date: "2026-07-18", notes: "Wait part" }];

const getToday = () => new Date().toISOString().slice(0, 10);

const normalizeDate = (dateStr: string): string => {
  if (!dateStr) return getToday();
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(dateStr)) return dateStr; 
  const clean = dateStr.replace(/\./g, "/");
  const p = clean.split("/");
  if (p.length === 3) {
    const y = p[2];
    const a = parseInt(p[0], 10);
    const b = parseInt(p[1], 10);
    if (a > 12) return `${y}-${b.toString().padStart(2,'0')}-${a.toString().padStart(2,'0')}`;
    if (b > 12) return `${y}-${a.toString().padStart(2,'0')}-${b.toString().padStart(2,'0')}`;
    return `${y}-${a.toString().padStart(2,'0')}-${b.toString().padStart(2,'0')}`;
  }
  return dateStr;
};

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const formatTimeRange = (t: Task) => t.startTime && t.endTime ? `${t.startTime} – ${t.endTime}` : "-";
const formatDateTime = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

const getColors = (theme: Theme): Colors => theme === "light"
  ? { page: "#F8FAFC", card: "#FFFFFF", cardMuted: "#F1F5F9", text: "#0F172A", muted: "#64748B", border: "#E2E8F0", accent: "#0EA5E9", accentBg: "#E0F2FE", danger: "#EF4444", success: "#10B981", warning: "#F59E0B" }
  : { page: "#0B1120", card: "#111827", cardMuted: "#1F2937", text: "#F3F4F6", muted: "#9CA3AF", border: "#374151", accent: "#38BDF8", accentBg: "#0C4A6E", danger: "#F87171", success: "#34D399", warning: "#FBBF24" };

// ==========================================
// COMPONENTS
// ==========================================

function LoginScreen({ colors, onLogin, t }: { colors: Colors; onLogin: (u: CurrentUser) => void; t: typeof translations.id }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [role, setRole] = useState<PermissionRole>("Staff");
  const [shift, setShift] = useState("Day");
  const [err, setErr] = useState("");

  const submit = () => {
    if (!name.trim()) { setErr(t.nameRequired); return; }
    const storedCreds = localStorage.getItem("btice_credentials");
    const creds: UserCredentials = storedCreds ? JSON.parse(storedCreds) : { username: "", password: "" };
    if (!creds.username) {
      localStorage.setItem("btice_credentials", JSON.stringify({ username: name.trim(), password: password }));
    } else if (creds.username !== name.trim() || creds.password !== password) {
      setErr(t.passMismatch);
      return;
    }
    setErr("");
    onLogin({ name: name.trim(), roleTitle: roleTitle.trim() || "Staff", permissionRole: role, shift });
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, display: "grid", placeItems: "center", padding: 20, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 360, background: colors.card, borderRadius: 16, border: `1px solid ${colors.border}`, padding: 24, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text, margin: 0 }}>{t.loginTitle}</h1>
          <p style={{ fontSize: 14, color: colors.muted, margin: "4px 0 0" }}>{t.loginSubtitle}</p>
        </div>
        <input value={name} onChange={e => setName(e.target.value)} placeholder={t.loginName} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text, marginBottom: 12, fontSize: 14, boxSizing: "border-box" }} onKeyDown={e => e.key === "Enter" && submit()} />
        <input value={password} type="password" onChange={e => setPassword(e.target.value)} placeholder={t.loginPassword} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text, marginBottom: 12, fontSize: 14, boxSizing: "border-box" }} onKeyDown={e => e.key === "Enter" && submit()} />
        <input value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder={t.loginRole} style={{ width: "100%", padding: "12px 14px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text, marginBottom: 12, fontSize: 14, boxSizing: "border-box" }} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <select value={role} onChange={e => setRole(e.target.value as PermissionRole)} style={{ padding: "10px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text }}><option>Staff</option><option>Admin</option></select>
          <select value={shift} onChange={e => setShift(e.target.value)} style={{ padding: "10px", borderRadius: 10, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text }}>{shifts.map(s => <option key={s}>{s}</option>)}</select>
        </div>
        {err && <div style={{ fontSize: 13, color: colors.danger, marginBottom: 8 }}>{err}</div>}
        <button onClick={submit} style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: colors.accent, color: "#FFF", fontWeight: 600, fontSize: 14, cursor: "pointer" }}>{t.loginBtn}</button>
      </div>
    </div>
  );
}

// ==========================================
// MAIN APP COMPONENT
// ==========================================

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("id");
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [userLogo, setUserLogo] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(getToday());

  const colors = getColors(theme);
  const t = translations[lang];

  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [search, setSearch] = useState("");
  const [filterStat, setFilterStat] = useState("All");
  
  const [taskForm, setTaskForm] = useState<Partial<Task>>({ 
    title: "", description: "", category: "Production", priority: "High", assignee: "", 
    deadline: getToday(), date: getToday(), startTime: "", endTime: "", 
    status: "Pending", notes: "", createdAt: getToday(), reason: "", imageUrl: "" 
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Task>>({});

  const [stockItems, setStockItems] = useState<StockItem[]>(sampleStock);
  const [stockForm, setStockForm] = useState({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "", minStock: "", date: getToday() });
  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [meetingForm, setMeetingForm] = useState({ title: "", date: getToday(), time: "", attendees: "", notes: "" });
  const [maintItems, setMaintItems] = useState<MaintenanceItem[]>(sampleMaintenance);
  const [maintForm, setMaintForm] = useState({ equipment: "", issue: "", technician: "", status: "Pending" as TaskStatus, date: getToday(), notes: "" });

  const [scheduleItems, setScheduleItems] = useState<ScheduleEntry[]>([]);
  const [scheduleForm, setScheduleForm] = useState({ equipment: "", date: getToday(), responsible: "", status: "Pending" as TaskStatus, notes: "" });
  const [activityLogs, setActivityLogs] = useState<LogEntry[]>([]);

  const addLog = (type: string, action: string) => {
    const entry: LogEntry = { id: String(Date.now()), type, action, timestamp: new Date().toISOString() };
    setActivityLogs(prev => [entry, ...prev].slice(0, 200));
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          const base64 = ev.target.result as string;
          setUserLogo(base64);
          localStorage.setItem('btice_app_logo', base64);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // ✅ ULTRA-ROBUST CSV PARSER
  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let text = (ev.target?.result as string).replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (lines.length < 2) { window.alert(t.csvError); return; }

        const parseLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') inQuotes = !inQuotes;
            else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
            else current += char;
          }
          result.push(current.trim());
          return result;
        };

        const headers = parseLine(lines[0]).map(h => h.toLowerCase().trim());
        const newTasks: Task[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]);
          if (cols.length < 2) continue;

          const get = (keys: string[]) => {
            for (const key of keys) {
              const idx = headers.indexOf(key.toLowerCase().trim());
              if (idx >= 0) return (cols[idx] || '').trim();
            }
            return '';
          };

          const rawTitle = get(['title', 'task', 'nama_task']);
          const rawDate = get(['deadline', 'date', 'tanggal']);
          const rawStart = get(['start_time', 'waktu_mulai', 'jam_mulai']);
          const rawEnd = get(['end_time', 'waktu_selesai', 'jam_selesai']);
          const rawCat = get(['category', 'kategori', 'role', 'jabatan']);
          const rawPri = get(['priority', 'prioritas', 'level']);
          const rawStatus = get(['status', 'status_task']);
          const rawAssignee = get(['assignee', 'penanggung_jawab', 'pic', 'karyawan']);

          let startTime = rawStart;
          let endTime = rawEnd;
          if (!startTime && !endTime) {
            const timeIndices = headers.reduce((acc: number[], val, idx) => val === 'time' ? [...acc, idx] : acc, []);
            if (timeIndices.length >= 2) {
              startTime = cols[timeIndices[0]].trim();
              endTime = cols[timeIndices[1]].trim();
            } else if (timeIndices.length === 1) {
              startTime = cols[timeIndices[0]].trim();
            }
          }

          const cleanTitle = rawTitle.replace(/[.,;:!]+$/, '').trim() || `Task ${i}`;
          const normalizedDate = normalizeDate(rawDate);
          const category = categories.find(c => c.toLowerCase() === rawCat.toLowerCase()) || rawCat || 'Other';
          const priority = (priorities.find(p => p.toLowerCase() === rawPri.toLowerCase()) || 'High') as Priority;
          const status = (statuses.find(s => s.toLowerCase() === rawStatus.toLowerCase()) || 'Pending') as TaskStatus;

          newTasks.push({
            id: String(Date.now() + Math.random()),
            title: cleanTitle,
            description: get(['description', 'deskripsi', 'keterangan']) || '',
            category,
            priority,
            // Use optional chaining here for safety if user is null (though unlikely)
            assignee: rawAssignee || currentUser?.name || "Unknown", 
            deadline: normalizedDate,
            date: normalizedDate,
            startTime,
            endTime,
            status,
            notes: get(['notes', 'catatan']) || '',
            createdAt: getToday(),
            createdByRole: 'Staff',
            reason: ''
          });
        }

        if (newTasks.length === 0) {
          window.alert("Tidak ada data valid ditemukan.");
          return;
        }

        setTasks(prev => [...newTasks, ...prev]);
        if(newTasks.length > 0) setSelectedDate(newTasks[0].date);
        addLog("TASK", `Imported ${newTasks.length} tasks via CSV`);
        window.alert(`✅ ${newTasks.length} ${t.csvSuccess}`);
      } catch (err) {
        console.error("CSV Parse Error:", err);
        window.alert(t.csvError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  useEffect(() => {
    try {
      const savedLogo = localStorage.getItem('btice_app_logo');
      if (savedLogo) setUserLogo(savedLogo);
      const storedSession = localStorage.getItem("userSession");
      if (storedSession) {
        const session: UserSession = JSON.parse(storedSession);
        if (session.isLoggedIn && session.username) {
          const savedUser = localStorage.getItem(`btice_user_${session.username}`);
          if (savedUser) {
            setCurrentUser(JSON.parse(savedUser));
            const savedTheme = localStorage.getItem(`btice_theme_${session.username}`);
            if (savedTheme) setTheme(JSON.parse(savedTheme));
            const savedLang = localStorage.getItem(`btice_lang_${session.username}`);
            if (savedLang) setLang(JSON.parse(savedLang));
            const savedData = localStorage.getItem(`btice_data_${session.username}`);
            if (savedData) {
              const d = JSON.parse(savedData);
              setTasks(d.tasks || sampleTasks);
              setStockItems(d.stock || sampleStock);
              setMeetings(d.meetings || sampleMeetings);
              setMaintItems(d.maintenance || sampleMaintenance);
              setScheduleItems(d.schedule || []);
              setActivityLogs(d.logs || []);
            }
          }
        }
      }
    } catch (error) {
      console.error("Session validation failed", error);
      localStorage.removeItem("userSession");
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`btice_theme_${currentUser.name}`, JSON.stringify(theme));
      localStorage.setItem(`btice_lang_${currentUser.name}`, JSON.stringify(lang));
      localStorage.setItem(`btice_data_${currentUser.name}`, JSON.stringify({ tasks, stock: stockItems, meetings, maintenance: maintItems, schedule: scheduleItems, logs: activityLogs }));
    }
  }, [currentUser, theme, lang, tasks, stockItems, meetings, maintItems, scheduleItems, activityLogs]);

  const handleLogin = (user: CurrentUser) => {
    const session: UserSession = { id: String(Date.now()), username: user.name, role: user.roleTitle, isLoggedIn: true };
    localStorage.setItem("userSession", JSON.stringify(session));
    localStorage.setItem(`btice_user_${user.name}`, JSON.stringify(user));
    setCurrentUser(user);
    setTaskForm((prev) => ({ ...prev, assignee: user.permissionRole === "Staff" ? user.name : prev.assignee }));
  };

  const handleLogout = () => {
    localStorage.removeItem("userSession");
    setCurrentUser(null);
    setTheme("light");
    setLang("id");
    setActiveTab("dashboard");
    setMenuOpen(false);
  };

  if (!currentUser) {
    return <LoginScreen colors={colors} t={t} onLogin={handleLogin} />;
  }

  const matchesUser = (assignee: string) => currentUser.permissionRole === "Admin" || assignee === currentUser.name || assignee.trim() === "";
  const filteredTasks = tasks.filter(tk => 
    (!search || tk.title.toLowerCase().includes(search.toLowerCase())) &&
    (filterStat === "All" || tk.status === filterStat) &&
    tk.date === selectedDate && matchesUser(tk.assignee)
  ).sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority]));

  const stats = { 
    total: filteredTasks.length, 
    completed: filteredTasks.filter(tk => tk.status === "Completed").length, 
    inProgress: filteredTasks.filter(tk => tk.status === "In progress").length, 
    pending: filteredTasks.filter(tk => tk.status === "Pending").length, 
    cancelled: filteredTasks.filter(tk => tk.status === "Cancelled").length 
  };
  // ✅ ERROR FIX: Removed unused 'pct' variable that caused the build error

  const handleTaskPhotoUpload = (e: ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => { const url = reader.result as string; if (url) setTasks(prev => prev.map(tk => tk.id === taskId ? { ...tk, imageUrl: url } : tk)); }; reader.readAsDataURL(file);
  };

  const handleSaveTask = () => {
    if (!taskForm.title?.trim() || !taskForm.assignee?.trim()) return;
    setTasks(prev => [{ id: String(Date.now()), ...taskForm, createdAt: getToday(), createdByRole: currentUser.permissionRole } as Task, ...prev]);
    addLog("TASK", `Created task: ${taskForm.title}`);
    setTaskForm({ title: "", description: "", category: "Production", priority: "High", assignee: currentUser.permissionRole === "Staff" ? currentUser.name : "", deadline: getToday(), date: getToday(), status: "Pending", notes: "", startTime: "", endTime: "", reason: "", imageUrl: "" });
  };

  const handleInlineEdit = (taskId: string) => { const task = tasks.find(tk => tk.id === taskId); if (task) { setEditingTaskId(taskId); setEditForm(task); } };
  const saveEdit = () => { 
    if (editingTaskId) { 
      setTasks(prev => prev.map(tk => tk.id === editingTaskId ? { ...tk, ...editForm } : tk)); 
      addLog("TASK", `Updated task: ${editForm.title || tasks.find(t=>t.id===editingTaskId)?.title}`);
      setEditingTaskId(null); 
    } 
  };
  const toggleStatus = (taskId: string) => { 
    setTasks(prev => prev.map(tk => tk.id === taskId ? { ...tk, status: tk.status === "Completed" ? "In progress" : "Completed" } : tk)); 
    addLog("TASK", `Status changed`);
  };

  const shareWhatsApp = () => {
    // ✅ ERROR FIX: Use non-null assertion (!) since we return early if currentUser is null
    const dateStr = formatDate(selectedDate);
    const timeStr = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    const tasksList = filteredTasks.map(tk => `• ${tk.title} [${tk.status}] ${tk.startTime && tk.endTime ? `(${tk.startTime}-${tk.endTime})` : ""}`).join("\n") || "-";
    const stockList = stockItems.filter(s => s.date === selectedDate).map(s => `• ${s.item}: ${s.stock - s.keluar + s.masuk} ${s.unit}`).join("\n") || "-";
    const maintList = maintItems.filter(m => m.date === selectedDate).map(m => `• ${m.equipment}: ${m.issue} [${m.status}]`).join("\n") || "-";
    const meetingList = meetings.filter(m => m.date === selectedDate).map(m => `• ${m.title} (${m.time}) - ${m.attendees}`).join("\n") || "-";
    const notes = "Overall performance is good. All critical tasks completed on schedule.";
    const reportLink = `https://your-domain.com/report/${selectedDate}/${encodeURIComponent(currentUser!.name.toLowerCase().replace(/\s+/g, "-"))}`;
    const message = `📋 DAILY TASK REPORT\n\n👤 Employee : ${currentUser!.name.toUpperCase()}\n💼 Role : ${currentUser!.roleTitle}\n🕒 Shift : ${currentUser!.shift}\n📅 Date : ${dateStr}\n\n━━━━━━━━━━━━━━━━━━\n\n✅ TASKS\n${tasksList}\n\n📦 STOCK OPNAME\n${stockList}\n\n🔧 MAINTENANCE\n${maintList}\n\n📝 MEETING\n${meetingList}\n\n📌 NOTES\n${notes}\n\n━━━━━━━━━━━━━━━━━━\n\n📤 Submitted by: ${currentUser!.name.toUpperCase()}\n🕒 Submitted: ${dateStr} | ${timeStr}\n\n🔗 View report: ${reportLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank");
  };

  const menuItems = [
    { id: "dashboard" as Tab, label: t.dashboard },
    { id: "tasks" as Tab, label: t.tasks },
    { id: "schedule" as Tab, label: t.schedule },
    { id: "stock" as Tab, label: t.stock },
    { id: "meeting" as Tab, label: t.meeting },
    { id: "maintenance" as Tab, label: t.maintenance },
    { id: "activity_log" as Tab, label: t.activityLog },
    { id: "settings" as Tab, label: t.settings },
  ];

  const inputStyle: CSSProperties = { width: "100%", padding: "10px 12px", borderRadius: 8, border: `1px solid ${colors.border}`, background: colors.cardMuted, color: colors.text, fontSize: 13, boxSizing: "border-box", touchAction: "manipulation" };
  const btnStyle = (variant: "primary" | "secondary" | "danger" = "primary"): CSSProperties => ({ padding: "8px 12px", borderRadius: 8, border: variant === "primary" ? "none" : `1px solid ${colors.border}`, background: variant === "primary" ? colors.accent : variant === "danger" ? `${colors.danger}20` : "transparent", color: variant === "primary" ? "#FFF" : variant === "danger" ? colors.danger : colors.text, fontSize: 13, cursor: "pointer", fontWeight: 500, touchAction: "manipulation" });

  return (
    <div style={{ minHeight: "100vh", background: colors.page, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", display: "flex", position: "relative" }}>
      <style>{`
        .hamburger-btn { background: none; border: none; font-size: 28px; color: ${colors.text}; cursor: pointer; padding: 8px; display: flex; align-items: center; justify-content: center; }
        .nav-overlay { position: fixed; top: 0; left: 0; bottom: 0; width: 280px; max-width: 75%; background: ${theme === "light" ? "#0F172A" : "#0B1120"}; z-index: 60; transform: translateX(-100%); transition: transform 0.3s ease; display: flex; flex-direction: column; box-shadow: 2px 0 15px rgba(0,0,0,0.3); }
        .nav-overlay.open { transform: translateX(0); }
        .nav-header { padding: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); display: flex; justify-content: space-between; align-items: center; }
        .nav-list { padding: 20px 0; display: grid; gap: 8px; overflow-y: auto; }
        .nav-item { padding: 14px 24px; color: #94A3B8; cursor: pointer; font-size: 16px; font-weight: 500; transition: all 0.2s; border-left: 4px solid transparent; }
        .nav-item:hover { background: rgba(255,255,255,0.05); color: #E2E8F0; }
        .nav-item.active { background: rgba(14,165,233,0.15); color: #0EA5E9; border-left-color: #0EA5E9; }
        .nav-footer { padding: 20px; margin-top: auto; border-top: 1px solid rgba(255,255,255,0.1); }
        .main-content { flex: 1; padding: 20px; overflow-y: auto; min-height: 100vh; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat-card { background: ${colors.card}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 16px; display: flex; flex-direction: column; gap: 6px; }
        .stat-value { font-size: 24px; font-weight: 700; color: ${colors.text}; }
        .stat-label { font-size: 12px; color: ${colors.muted}; }
        .progress-card { background: ${colors.card}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
        .progress-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .progress-title { font-size: 16px; font-weight: 600; }
        .progress-pct { background: ${colors.accentBg}; color: ${colors.accent}; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .progress-bar { height: 8px; background: ${colors.cardMuted}; border-radius: 999px; overflow: hidden; }
        .progress-fill { height: 100%; background: linear-gradient(90deg, ${colors.accent}, ${colors.accent}80); border-radius: 999px; transition: width 0.5s ease; }
        .progress-text { font-size: 12px; color: ${colors.muted}; margin-top: 8px; }
        .task-card { background: ${colors.card}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 14px; margin-bottom: 12px; transition: border-color 0.2s; }
        .task-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 10px; margin-bottom: 8px; }
        .task-title { font-size: 15px; font-weight: 600; color: ${colors.text}; word-break: break-word; }
        .task-badge { padding: 3px 8px; border-radius: 6px; font-size: 11px; font-weight: 600; white-space: nowrap; }
        .task-meta { font-size: 12px; color: ${colors.muted}; margin-bottom: 10px; word-break: break-word; }
        .task-actions { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 10px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 10px; margin-bottom: 12px; }
        .filter-bar { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 16px; }
        @media (max-width: 768px) {
          .main-content { padding: 12px; }
          .stats-grid { grid-template-columns: 1fr 1fr; gap: 10px; }
          .task-card { padding: 12px; }
          .task-header { flex-direction: column; gap: 6px; }
          .task-actions { flex-direction: column; }
          .task-actions button, .task-actions label { width: 100%; text-align: center; }
          .form-grid { grid-template-columns: 1fr; }
          .filter-bar { flex-direction: column; }
          .filter-bar input, .filter-bar select { width: 100%; }
          header { flex-direction: column; gap: 12px; padding: 16px; }
          header > div:nth-child(1) { width: 100%; justify-content: space-between; }
          header > div:nth-child(2) { position: static; transform: none; margin-top: 10px; align-items: center; }
        }
        input[type="date"], input[type="time"], select, input[type="password"] { color-scheme: ${theme}; }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <div className={`nav-overlay ${isMenuOpen ? "open" : ""}`}>
        <div className="nav-header">
          <div style={{ fontSize: 18, fontWeight: 700, color: "#FFF" }}>Menu</div>
          <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 28, cursor: "pointer" }}>×</button>
        </div>
        <nav className="nav-list">
          {menuItems.map(item => (
            <div key={item.id} className={`nav-item ${activeTab === item.id ? "active" : ""}`} onClick={() => { setActiveTab(item.id); setMenuOpen(false); }}>
              {item.label}
            </div>
          ))}
        </nav>
        <div className="nav-footer">
          <div style={{ fontSize: 14, color: "#FFF", fontWeight: 600 }}>{currentUser.name}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 12 }}>{currentUser.roleTitle}</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setLang(l => l === "id" ? "en" : "id")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#FFF", cursor: "pointer" }}>{lang === "id" ? "Bahasa Indonesia" : "English"}</button>
            <button onClick={() => setTheme(th => th === "light" ? "dark" : "light")} style={{ flex: 1, padding: "10px", borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#FFF", cursor: "pointer" }}>{theme === "light" ? t.darkMode : t.lightMode}</button>
            <button onClick={handleLogout} style={{ padding: "10px", borderRadius: 8, border: "none", background: "#EF4444", color: "#FFF", cursor: "pointer", width: "40px" }}>{t.logout}</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%" }}>
        <header style={{ display: "flex", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${colors.border}`, position: "relative", width: "100%", boxSizing: "border-box" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button className="hamburger-btn" onClick={() => setMenuOpen(true)}>☰</button>
            <img src={userLogo || DEFAULT_LOGO} alt="Logo" style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          </div>
          <div style={{ position: "absolute", left: "50%", transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none", zIndex: 10 }}>
            <h1 style={{ fontSize: "1.8rem", color: "#ADD8E6", fontWeight: 700, margin: 0, lineHeight: 1, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>BLUE TICK ICE</h1>
            <span style={{ fontSize: "0.75rem", color: colors.muted, fontWeight: 500, marginTop: 2, textTransform: "uppercase", letterSpacing: "1px" }}>Daily Task Operational</span>
          </div>
          {activeTab !== "settings" && <button onClick={shareWhatsApp} style={{ ...btnStyle("primary"), marginLeft: "auto", whiteSpace: "nowrap" }}>Share</button>}
        </header>

        <main className="main-content">
          {activeTab === "dashboard" && (() => {
            const today = getToday();
            const todayTasks = tasks.filter(tk => tk.date === today && matchesUser(tk.assignee));
            const todayStock = stockItems.filter(s => s.date === today);
            const todayMeetings = meetings.filter(m => m.date === today);
            const todayMaint = maintItems.filter(m => m.date === today);
            const todaySchedule = scheduleItems.filter(s => s.date === today);
            return (
              <>
                <div className="stats-grid">
                  {[
                    { label: t.total, value: todayTasks.length, color: colors.accent },
                    { label: t.completed, value: todayTasks.filter(t => t.status === "Completed").length, color: colors.success },
                    { label: t.remaining, value: todayTasks.filter(t => t.status !== "Completed" && t.status !== "Cancelled").length, color: colors.warning },
                    { label: t.cancelled, value: todayTasks.filter(t => t.status === "Cancelled").length, color: colors.danger },
                  ].map((s, i) => (
                    <div className="stat-card" key={i}>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-label">{s.label}</div>
                    </div>
                  ))}
                </div>
                <div className="progress-card">
                  <div className="progress-header">
                    <div className="progress-title">{t.progress}</div>
                    <div className="progress-pct">{todayTasks.length ? Math.round((todayTasks.filter(t => t.status === "Completed").length / todayTasks.length) * 100) : 0}%</div>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${todayTasks.length ? (todayTasks.filter(t => t.status === "Completed").length / todayTasks.length) * 100 : 0}%` }} /></div>
                  <div className="progress-text">Activities for {formatDate(today)}</div>
                </div>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}>
                  {todayTasks.length > 0 && <div className="task-card"><div style={{fontWeight:600, marginBottom:8}}>Tasks</div>{todayTasks.slice(0,3).map(tk=><div key={tk.id} style={{fontSize:13, marginBottom:4}}>• {tk.title} [{tk.status}]</div>)}</div>}
                  {todayStock.length > 0 && <div className="task-card"><div style={{fontWeight:600, marginBottom:8}}>Stock</div>{todayStock.slice(0,3).map(s=><div key={s.id} style={{fontSize:13, marginBottom:4}}>• {s.item}: {s.stock-s.keluar+s.masuk} {s.unit}</div>)}</div>}
                  {todayMeetings.length > 0 && <div className="task-card"><div style={{fontWeight:600, marginBottom:8}}>Meetings</div>{todayMeetings.slice(0,3).map(m=><div key={m.id} style={{fontSize:13, marginBottom:4}}>• {m.title} ({m.time})</div>)}</div>}
                  {todayMaint.length > 0 && <div className="task-card"><div style={{fontWeight:600, marginBottom:8}}>Maintenance</div>{todayMaint.slice(0,3).map(m=><div key={m.id} style={{fontSize:13, marginBottom:4}}>• {m.equipment}: {m.status}</div>)}</div>}
                  {todaySchedule.length > 0 && <div className="task-card"><div style={{fontWeight:600, marginBottom:8}}>Schedule</div>{todaySchedule.slice(0,3).map(s=><div key={s.id} style={{fontSize:13, marginBottom:4}}>• {s.equipment}</div>)}</div>}
                </div>
                {(todayTasks.length===0 && todayStock.length===0 && todayMeetings.length===0 && todayMaint.length===0 && todaySchedule.length===0) && <div style={{textAlign:"center", padding:40, color:colors.muted}}>No activities recorded for today.</div>}
              </>
            );
          })()}

          {activeTab === "tasks" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.tasks}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: colors.muted }}>Filter Date:</span>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inputStyle, width: "auto" }} />
                </div>
              </div>
              <div className="filter-bar">
                <input style={{ ...inputStyle, flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
                <select style={{ ...inputStyle, width: "auto", flex: 1 }} value={filterStat} onChange={e => setFilterStat(e.target.value)}><option value="All">Status</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>
              </div>
              {filteredTasks.length === 0 ? <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noTasks}</div> : (
                filteredTasks.map(tk => {
                  const isEditing = editingTaskId === tk.id;
                  const badge = statusColors[tk.status];
                  return (
                    <div className="task-card" key={tk.id}>
                      {isEditing ? (
                        <div className="form-grid">
                          <input style={inputStyle} value={editForm.title || ""} onChange={e => setEditForm(p => ({ ...p, title: e.target.value }))} placeholder={t.titlePlaceholder} />
                          <input style={inputStyle} type="date" value={editForm.date || tk.date} onChange={e => setEditForm(p => ({ ...p, date: e.target.value, deadline: e.target.value }))} />
                          <input style={inputStyle} type="time" value={editForm.startTime || ""} onChange={e => setEditForm(p => ({ ...p, startTime: e.target.value }))} />
                          <input style={inputStyle} type="time" value={editForm.endTime || ""} onChange={e => setEditForm(p => ({ ...p, endTime: e.target.value }))} />
                          <select style={inputStyle} value={editForm.status || tk.status} onChange={e => setEditForm(p => ({ ...p, status: e.target.value as TaskStatus }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}><button style={btnStyle("primary")} onClick={saveEdit}>{t.save}</button><button style={btnStyle("secondary")} onClick={() => setEditingTaskId(null)}>{t.cancel}</button></div>
                        </div>
                      ) : (
                        <>
                          <div className="task-header">
                            <div className="task-title">{tk.title}</div>
                            <span className="task-badge" style={{ background: badge.bg, color: badge.text }}>{tk.status}</span>
                          </div>
                          <div className="task-meta">{tk.category} · {tk.priority} · {tk.assignee} · {formatTimeRange(tk)}</div>
                          <div className="task-actions">
                            <button style={btnStyle(tk.status === "Completed" ? "secondary" : "primary")} onClick={() => toggleStatus(tk.id)}>{tk.status === "Completed" ? t.undo : t.checklist}</button>
                            <button style={btnStyle("secondary")} onClick={() => handleInlineEdit(tk.id)}>{t.edit}</button>
                            <input id={`file-${tk.id}`} type="file" accept="image/*" onChange={e => handleTaskPhotoUpload(e, tk.id)} style={{ display: "none" }} />
                            <button style={btnStyle("secondary")} onClick={() => (document.getElementById(`file-${tk.id}`) as HTMLInputElement)?.click()}>{t.uploadPhoto}</button>
                            <button style={btnStyle("danger")} onClick={() => setTasks(p => p.filter(i => i.id !== tk.id))}>{t.delete}</button>
                          </div>
                          <textarea style={{ ...inputStyle, minHeight: 50, marginTop: 10 }} value={tk.notes} onChange={e => setTasks(p => p.map(i => i.id === tk.id ? { ...i, notes: e.target.value } : i))} placeholder={t.notesPlaceholder} />
                        </>
                      )}
                    </div>
                  );
                })
              )}
              <div style={{ marginTop: 20, background: colors.cardMuted, padding: 16, borderRadius: 10 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t.taskFormTitle}</div>
                <div className="form-grid">
                  <input style={inputStyle} value={taskForm.title || ""} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} placeholder={t.titlePlaceholder} />
                  <input style={inputStyle} value={taskForm.assignee || ""} onChange={e => setTaskForm(p => ({ ...p, assignee: e.target.value }))} placeholder={t.assigneePlaceholder} disabled={currentUser.permissionRole === "Staff"} />
                  <input style={inputStyle} value={taskForm.date || ""} onChange={e => setTaskForm(p => ({ ...p, date: e.target.value, deadline: e.target.value }))} type="date" />
                  <input style={inputStyle} value={taskForm.startTime || ""} onChange={e => setTaskForm(p => ({ ...p, startTime: e.target.value }))} type="time" />
                  <input style={inputStyle} value={taskForm.endTime || ""} onChange={e => setTaskForm(p => ({ ...p, endTime: e.target.value }))} type="time" />
                  <select style={inputStyle} value={taskForm.category || "Production"} onChange={e => setTaskForm(p => ({ ...p, category: e.target.value }))}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <select style={inputStyle} value={taskForm.priority || "High"} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value as Priority }))}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>
                <button style={{ ...btnStyle("primary"), width: "100%", padding: "10px 0", fontSize: 14 }} onClick={handleSaveTask}>{t.addTask}</button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>{t.settings}</h2>
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🖼️</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.uploadLogo}</div>
                  <input id="settings-logo" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  <label htmlFor="settings-logo" style={{ ...btnStyle("secondary"), cursor: "pointer", display: "inline-block", padding: "8px 16px" }}>Choose Image</label>
                </div>
                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>📄</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.importCsv}</div>
                  <input id="settings-csv" type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: "none" }} />
                  <label htmlFor="settings-csv" style={{ ...btnStyle("secondary"), cursor: "pointer", display: "inline-block", padding: "8px 16px" }}>Choose CSV</label>
                </div>
                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 40, marginBottom: 10 }}>🗑️</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.resetData}</div>
                  <button style={{ ...btnStyle("danger"), padding: "8px 16px" }} onClick={() => { if(window.confirm("Hapus semua data lokal?")) { localStorage.clear(); window.location.reload(); } }}>{t.resetData}</button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "stock" && (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.stock}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {stockItems.filter(s => s.date === selectedDate).map(s => {
                    const current = s.stock - s.keluar + s.masuk;
                    const isLow = current <= (s.minStock || 0);
                    return (
                      <div key={s.id} className="task-card" style={{ borderColor: isLow ? colors.danger : colors.border, background: isLow ? `${colors.danger}10` : colors.cardMuted }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                              <span style={{ fontSize: 15, fontWeight: 600 }}>{s.item}</span>
                              {isLow && <span style={{ background: colors.danger, color: "#FFF", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{t.lowStock}</span>}
                            </div>
                            <div style={{ fontSize: 12, color: colors.muted }}>{t.updateLast}: {formatDate(s.updatedAt)}</div>
                          </div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: isLow ? colors.danger : colors.accent }}>{t.currentStock}: {current} {s.unit}</div>
                        </div>
                        {s.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 8 }}>{s.notes}</div>}
                        <button style={{ ...btnStyle("danger"), marginTop: 12 }} onClick={() => { setStockItems(p => p.filter(i => i.id !== s.id)); addLog("STOCK", `Deleted item: ${s.item}`); }}>{t.deleteItem}</button>
                      </div>
                    );
                  })}
                  {stockItems.filter(s => s.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noStock}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t.addNewItem}</div>
                <input style={inputStyle} value={stockForm.date} onChange={e => setStockForm(p => ({ ...p, date: e.target.value }))} type="date" />
                <div className="form-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                  <input style={inputStyle} value={stockForm.stock} onChange={e => setStockForm(p => ({ ...p, stock: e.target.value }))} placeholder={t.initialStock} type="number" />
                  <input style={inputStyle} value={stockForm.masuk} onChange={e => setStockForm(p => ({ ...p, masuk: e.target.value }))} placeholder={t.incoming} type="number" />
                  <input style={inputStyle} value={stockForm.keluar} onChange={e => setStockForm(p => ({ ...p, keluar: e.target.value }))} placeholder={t.outgoing} type="number" />
                </div>
                <input style={inputStyle} value={stockForm.minStock} onChange={e => setStockForm(p => ({ ...p, minStock: e.target.value }))} placeholder={t.minStock} type="number" />
                <input style={inputStyle} value={stockForm.item} onChange={e => setStockForm(p => ({ ...p, item: e.target.value }))} placeholder={t.itemName} />
                <input style={inputStyle} value={stockForm.unit} onChange={e => setStockForm(p => ({ ...p, unit: e.target.value }))} placeholder="Unit" />
                <textarea style={{ ...inputStyle, minHeight: 60, marginTop: 10 }} value={stockForm.notes} onChange={e => setStockForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.notesPlaceholder} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={() => { 
                  if (!stockForm.item.trim()) { window.alert(t.alertTitleRequired); return; } 
                  setStockItems(p => [{ id: String(Date.now()), item: stockForm.item, unit: stockForm.unit, stock: Number(stockForm.stock) || 0, masuk: Number(stockForm.masuk) || 0, keluar: Number(stockForm.keluar) || 0, notes: stockForm.notes, updatedAt: getToday(), date: stockForm.date || getToday(), minStock: Number(stockForm.minStock) || 0 }, ...p]); 
                  addLog("STOCK", `Added item: ${stockForm.item}`);
                  setStockForm({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "", minStock: "", date: getToday() }); 
                }}>{t.addNewItem}</button>
              </div>
            </div>
          )}

          {activeTab === "meeting" && (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
               <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.meeting}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {meetings.filter(m => m.date === selectedDate).map(m => (
                    <div key={m.id} className="task-card">
                      <div style={{ fontSize: 15, fontWeight: 600 }}>{m.title}</div>
                      <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{formatDate(m.date)} · {m.time || "-"}</div>
                      <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{t.attendeesInput}: {m.attendees || "-"}</div>
                      {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                      <button style={{ ...btnStyle("danger"), marginTop: 10 }} onClick={() => { setMeetings(p => p.filter(x => x.id !== m.id)); addLog("MEETING", `Deleted meeting: ${m.title}`); }}>{t.delete}</button>
                    </div>
                  ))}
                  {meetings.filter(m => m.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMeeting}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t.scheduleMeeting}</div>
                <input style={inputStyle} value={meetingForm.date} onChange={e => setMeetingForm(p => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={meetingForm.title} onChange={e => setMeetingForm(p => ({ ...p, title: e.target.value }))} placeholder={t.meetingName} />
                <input style={inputStyle} value={meetingForm.time} onChange={e => setMeetingForm(p => ({ ...p, time: e.target.value }))} type="time" />
                <input style={inputStyle} value={meetingForm.attendees} onChange={e => setMeetingForm(p => ({ ...p, attendees: e.target.value }))} placeholder={t.attendeesInput} />
                <textarea style={{ ...inputStyle, minHeight: 60, marginTop: 10 }} value={meetingForm.notes} onChange={e => setMeetingForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.agenda} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={() => { if (!meetingForm.title.trim()) { window.alert(t.alertTitleRequired); return; } setMeetings(p => [{ id: String(Date.now()), ...meetingForm }, ...p]); addLog("MEETING", `Created meeting: ${meetingForm.title}`); setMeetingForm({ title: "", date: getToday(), time: "", attendees: "", notes: "" }); }}>{t.addMeeting}</button>
              </div>
            </div>
          )}

          {activeTab === "maintenance" && (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.maintenance}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {maintItems.filter(m => m.date === selectedDate).map(m => {
                    const badge = statusColors[m.status];
                    return (
                      <div key={m.id} className="task-card">
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{m.equipment}</div>
                          <span className="task-badge" style={{ background: badge.bg, color: badge.text }}>{m.status}</span>
                        </div>
                        <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.issue}</div>
                        <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{t.techName}: {m.technician || "-"} · {formatDate(m.date)}</div>
                        {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                        <button style={{ ...btnStyle("danger"), marginTop: 10 }} onClick={() => { setMaintItems(p => p.filter(x => x.id !== m.id)); addLog("MAINTENANCE", `Deleted maintenance: ${m.equipment}`); }}>{t.delete}</button>
                      </div>
                    );
                  })}
                  {maintItems.filter(m => m.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMaint}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t.addMaint}</div>
                <input style={inputStyle} value={maintForm.date} onChange={e => setMaintForm(p => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={maintForm.equipment} onChange={e => setMaintForm(p => ({ ...p, equipment: e.target.value }))} placeholder={t.equipName} />
                <textarea style={{ ...inputStyle, minHeight: 60 }} value={maintForm.issue} onChange={e => setMaintForm(p => ({ ...p, issue: e.target.value }))} placeholder={t.issueDesc} />
                <input style={inputStyle} value={maintForm.technician} onChange={e => setMaintForm(p => ({ ...p, technician: e.target.value }))} placeholder={t.techName} />
                <select style={inputStyle} value={maintForm.status} onChange={e => setMaintForm(p => ({ ...p, status: e.target.value as TaskStatus }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <textarea style={{ ...inputStyle, minHeight: 50, marginTop: 10 }} value={maintForm.notes} onChange={e => setMaintForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.maintNotes} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={() => { if (!maintForm.equipment.trim()) { window.alert(t.alertTitleRequired); return; } setMaintItems(p => [{ id: String(Date.now()), ...maintForm }, ...p]); addLog("MAINTENANCE", `Created maintenance: ${maintForm.equipment}`); setMaintForm({ equipment: "", issue: "", technician: "", status: "Pending", date: getToday(), notes: "" }); }}>{t.addMaintBtn}</button>
              </div>
            </div>
          )}

          {activeTab === "schedule" && (
            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.schedule}</div>
                <div style={{ display: "grid", gap: 12 }}>
                  {scheduleItems.filter(s => s.date === selectedDate).map(s => {
                    const badge = statusColors[s.status];
                    return (
                      <div key={s.id} className="task-card">
                        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                          <div style={{ fontSize: 15, fontWeight: 600 }}>{s.equipment}</div>
                          <span className="task-badge" style={{ background: badge.bg, color: badge.text }}>{s.status}</span>
                        </div>
                        <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{formatDate(s.date)} · {t.responsible}: {s.responsible}</div>
                        {s.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{s.notes}</div>}
                        <button style={{ ...btnStyle("danger"), marginTop: 10 }} onClick={() => { setScheduleItems(p => p.filter(x => x.id !== s.id)); addLog("SCHEDULE", `Deleted schedule: ${s.equipment}`); }}>{t.delete}</button>
                      </div>
                    );
                  })}
                  {scheduleItems.filter(s => s.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMaint}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t.addSchedule}</div>
                <input style={inputStyle} value={scheduleForm.date} onChange={e => setScheduleForm(p => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={scheduleForm.equipment} onChange={e => setScheduleForm(p => ({ ...p, equipment: e.target.value }))} placeholder={t.equipName} />
                <input style={inputStyle} value={scheduleForm.responsible} onChange={e => setScheduleForm(p => ({ ...p, responsible: e.target.value }))} placeholder={t.responsible} />
                <select style={inputStyle} value={scheduleForm.status} onChange={e => setScheduleForm(p => ({ ...p, status: e.target.value as TaskStatus }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                <textarea style={{ ...inputStyle, minHeight: 50, marginTop: 10 }} value={scheduleForm.notes} onChange={e => setScheduleForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.maintNotes} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={() => { 
                  if (!scheduleForm.equipment.trim() || !scheduleForm.responsible.trim()) { window.alert(t.alertTitleRequired); return; }
                  setScheduleItems(p => [{ id: String(Date.now()), ...scheduleForm }, ...p]);
                  addLog("SCHEDULE", `Created schedule: ${scheduleForm.equipment}`);
                  setScheduleForm({ equipment: "", date: getToday(), responsible: "", status: "Pending", notes: "" });
                }}>{t.addSchedule}</button>
              </div>
            </div>
          )}

          {activeTab === "activity_log" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.activityLog}</div>
              {activityLogs.length === 0 ? <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noLogs}</div> : (
                <div style={{ display: "grid", gap: 10 }}>
                  {activityLogs.map(log => (
                    <div key={log.id} className="task-card" style={{ padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ fontWeight: 600, color: colors.accent }}>{log.type}</span>
                        <span style={{ fontSize: 11, color: colors.muted }}>{formatDateTime(log.timestamp)}</span>
                      </div>
                      <div style={{ fontSize: 13, color: colors.text }}>{log.action}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}