import { useState, useEffect, type ChangeEvent, type CSSProperties } from "react";
import { supabase } from './lib/supabase';

// ==========================================
// TYPES
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
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: TaskStatus[] = ["Pending", "In progress", "Completed", "Cancelled"];
const roles: PermissionRole[] = ["Admin", "Staff"];

// ✅ Fixed positions: raw for DB, display for UI (Capitalize Each Word)
const fixedPositionsRaw = [
  "FACTORY SUPERVISOR",
  "LOGISTIC SUPERVISOR",
  "PRODUCTION",
  "DRIVER",
  "GENERAL SUPPORT",
  "ADMINISTRATION",
  "OTHERS"
];

const fixedPositionsDisplay: string[] = fixedPositionsRaw.map(str =>
  str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
);

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
    progress: "Progress Hari Ini", share: "Share", addTask: "Tambah Task", edit: "Edit", save: "Simpan", cancel: "Batal", delete: "Hapus",
    checklist: "Checklist", undo: "Undo", noTasks: "Tidak ada aktivitas.",
    login: "Masuk", logout: "Keluar", darkMode: "Mode gelap", lightMode: "Mode terang", taskFormTitle: "Tambah Task",
    titlePlaceholder: "Judul tugas", assigneePlaceholder: "Penanggung jawab", notesPlaceholder: "Catatan",
    alertTitleRequired: "Judul wajib diisi.",
    uploadLogo: "Unggah Logo", importCsv: "Import CSV Tasks", resetData: "Reset Data Aplikasi",
    uploadPhoto: "Upload Foto", updateLast: "Update", addNewItem: "Tambah item", itemName: "Nama item", initialStock: "Stok Awal",
    incoming: "Masuk", outgoing: "Keluar", currentStock: "Sisa", deleteItem: "Hapus item", noStock: "Kosong.",
    scheduleMeeting: "Jadwalkan", meetingName: "Judul", date: "Tanggal", timeInput: "Waktu", attendeesInput: "Peserta", agenda: "Agenda", addMeeting: "Tambah meeting", noMeeting: "Kosong.",
    addMaint: "Tambah maintenance", equipName: "Peralatan", issueDesc: "Masalah", techName: "Teknisi", maintNotes: "Catatan", addMaintBtn: "Tambah", noMaint: "Kosong.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operation", loginDesc: "Masuk untuk mulai", loginName: "Nama User", loginPassword: "Password", loginRole: "Jabatan", loginBtn: "Masuk", nameRequired: "Nama wajib.",
    passMismatch: "Password salah atau username tidak ditemukan.", csvSuccess: "tugas berhasil di-parsing!", csvError: "Gagal parse CSV.", noLogs: "Belum ada aktivitas tercatat."
  },
  en: {
    dashboard: "Dashboard", tasks: "Tasks", stock: "Stock Opname", meeting: "Meeting Notes", maintenance: "Maintenance",
    activityLog: "Activity Log", settings: "Settings",
    total: "Total", completed: "Completed", remaining: "Remaining", cancelled: "Cancelled",
    progress: "Today's Progress", share: "Share", addTask: "Add Task", edit: "Edit", save: "Save", cancel: "Cancel", delete: "Delete",
    checklist: "Checklist", undo: "Undo", noTasks: "No activities.",
    login: "Login", logout: "Logout", darkMode: "Dark mode", lightMode: "Light mode", taskFormTitle: "Add Task",
    titlePlaceholder: "Task title", assigneePlaceholder: "Assignee", notesPlaceholder: "Notes",
    alertTitleRequired: "Title required.",
    uploadLogo: "Upload Logo", importCsv: "Import CSV Tasks", resetData: "Reset App Data",
    uploadPhoto: "Upload Photo", updateLast: "Updated", addNewItem: "Add item", itemName: "Item name", initialStock: "Initial Stock",
    incoming: "In", outgoing: "Out", currentStock: "Remaining", deleteItem: "Delete item", noStock: "Empty.",
    scheduleMeeting: "Schedule", meetingName: "Title", date: "Date", timeInput: "Time", attendeesInput: "Attendees", agenda: "Agenda", addMeeting: "Add meeting", noMeeting: "Empty.",
    addMaint: "Add maintenance", equipName: "Equipment", issueDesc: "Issue", techName: "Technician", maintNotes: "Notes", addMaintBtn: "Add", noMaint: "Empty.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operation", loginDesc: "Login to start", loginName: "Username", loginPassword: "Password", loginRole: "Role", loginBtn: "Login", nameRequired: "Name required.",
    passMismatch: "Incorrect password or username not found.", csvSuccess: "tasks parsed successfully!", csvError: "CSV parse failed.", noLogs: "No activity logs yet."
  },
};

const getToday = () => new Date().toISOString().slice(0, 10);
const formatDate = (d: string | Date) => new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const formatTimeRange = (t: any) => t.time_start && t.time_end ? `(${t.time_start}-${t.time_end})` : "";
const formatDateTime = (iso: string) => new Date(iso).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
const getColors = (theme: Theme): Colors => theme === "light"
  ? { page: "#F8FAFC", card: "#FFFFFF", cardMuted: "#F1F5F9", text: "#0F172A", muted: "#64748B", border: "#E2E8F0", accent: "#0EA5E9", accentBg: "#E0F2FE", danger: "#EF4444", success: "#10B981", warning: "#F59E0B" }
  : { page: "#0B1120", card: "#111827", cardMuted: "#1F2937", text: "#F3F4F6", muted: "#9CA3AF", border: "#374151", accent: "#38BDF8", accentBg: "#0C4A6E", danger: "#F87171", success: "#34D399", warning: "#FBBF24" };

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
// LOGIN SCREEN
// ==========================================
function LoginScreen({ colors, onLogin, t }: { colors: Colors; onLogin: (u: CurrentUser) => void; t: typeof translations.id }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [roleTitleDisplay, setRoleTitleDisplay] = useState(fixedPositionsDisplay[0]);
  const [role, setRole] = useState<PermissionRole>("Staff");
  const [shift] = useState("Day");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  const submit = async () => {
    if (!name.trim()) { setErr(t.nameRequired); return; }
    setLoading(true);
    setErr("");

    const idx = fixedPositionsDisplay.indexOf(roleTitleDisplay);
    const actualPosition = idx >= 0 ? fixedPositionsRaw[idx] : roleTitleDisplay;

    try {
      if (isSignUp) {
        const { error } = await supabase.from('users').insert({
          username: name.trim(),
          password: password,
          role: role,
          position: actualPosition,
          shift: shift
        });

        if (error) throw error;
        
        onLogin({
          name: name.trim(),
          roleTitle: actualPosition,
          permissionRole: role,
          shift: shift
        });

      } else {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('username', name.trim())
          .eq('password', password)
          .single();

        if (error || !data) {
          setErr(t.passMismatch);
          setLoading(false);
          return;
        }

        if (!data.role || !data.position) {
          await supabase.from('users').update({
            role,
            position: actualPosition,
            shift
          }).eq('username', name.trim());
        }

        onLogin({
          name: data.username,
          roleTitle: actualPosition,
          permissionRole: data.role as PermissionRole || role,
          shift: data.shift || shift
        });
      }
    } catch (e: any) {
      setErr(isSignUp ? "Gagal mendaftar. Username mungkin sudah digunakan." : t.passMismatch);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${colors.border}`,
    background: colors.cardMuted,
    color: colors.text,
    marginBottom: 12,
    fontSize: 14,
    boxSizing: "border-box"
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, display: "grid", placeItems: "center", padding: 20, fontFamily: "'Inter', sans-serif" }}>
      <div style={{
        width: "100%",
        maxWidth: 360,
        background: colors.card,
        borderRadius: 16,
        border: `1px solid ${colors.border}`,
        padding: 24,
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)"
      }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: colors.text }}>{t.loginTitle}</h1>
          <p style={{ fontSize: 14, color: colors.muted }}>{isSignUp ? "Daftar Akun Baru" : t.loginSubtitle}</p>
        </div>

        <input value={name} onChange={e => setName(e.target.value)} placeholder={t.loginName} style={inputStyle} onKeyDown={e => e.key === "Enter" && submit()} />
        <input value={password} type="password" onChange={e => setPassword(e.target.value)} placeholder={t.loginPassword} style={inputStyle} onKeyDown={e => e.key === "Enter" && submit()} />

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <select value={role} onChange={e => setRole(e.target.value as PermissionRole)} style={{ ...inputStyle, width: "100%" }}>
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={roleTitleDisplay} onChange={e => setRoleTitleDisplay(e.target.value)} style={{ ...inputStyle, width: "100%" }}>
            {fixedPositionsDisplay.map((disp, i) => (
              <option key={i} value={disp}>{disp}</option>
            ))}
          </select>
        </div>

        {err && <div style={{ fontSize: 13, color: colors.danger, marginBottom: 8 }}>{err}</div>}
        
        <button
          onClick={submit}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: colors.accent,
            color: "#FFF",
            fontWeight: 600,
            fontSize: 14,
            cursor: loading ? "wait" : "pointer",
            marginBottom: 12
          }}
        >
          {loading ? "Loading..." : (isSignUp ? "Daftar" : t.loginBtn)}
        </button>

        <div 
          onClick={() => { setIsSignUp(!isSignUp); setErr(""); }} 
          style={{ textAlign: "center", fontSize: 13, color: colors.accent, cursor: "pointer", fontWeight: 500 }}
        >
          {isSignUp ? "Sudah punya akun? Masuk di sini" : "Belum punya akun? Daftar di sini"}
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
  const [taskForm, setTaskForm] = useState<any>({
    title: "",
    category: "Production",
    priority: "High",
    assignee: "",
    deadline: getToday(),
    date: getToday(),
    startTime: "",
    endTime: "",
    status: "Pending",
    notes: ""
  });
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});

  const [stockForm, setStockForm] = useState({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "", date: getToday() });
  const [meetingForm, setMeetingForm] = useState({ title: "", date: getToday(), time: "", attendees: "", notes: "" });
  const [maintForm, setMaintForm] = useState({ equipment: "", issue: "", technician: "", status: "Pending", date: getToday(), notes: "" });

  // Data
  const [tasks, setTasks] = useState<any[]>([]);
  const [stockItems, setStockItems] = useState<any[]>([]);
  const [meetings, setMeetings] = useState<any[]>([]);
  const [maintItems, setMaintItems] = useState<any[]>([]);
  const [activityLogs, setActivityLogs] = useState<any[]>([]);

  // Load session
  useEffect(() => {
    const session = localStorage.getItem('btice_session');
    if (session) {
      try {
        setCurrentUser(JSON.parse(session));
      } catch (e) { console.error("Session parse error"); }
    }
  }, []);

  // Reload data
  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      try {
        const { data: prefs } = await supabase.from('user_prefs').select('*').eq('user_name', currentUser.name).single();
        if (prefs) {
          if (prefs.theme) setTheme(prefs.theme as Theme);
          if (prefs.lang) setLang(prefs.lang as Lang);
          if (prefs.logo) setUserLogo(prefs.logo);
        }

        const [tasksRes, stockRes, meetingsRes, maintRes, logsRes] = await Promise.all([
          supabase.from('task').select('*').eq('user_name', currentUser.name).or(`assignee.eq.${currentUser.name}`),
          supabase.from('stock_items').select('*').eq('user_name', currentUser.name),
          supabase.from('meetings').select('*').eq('user_name', currentUser.name),
          supabase.from('maintenance').select('*').eq('user_name', currentUser.name),
          supabase.from('activity_logs').select('*').eq('user_name', currentUser.name).order('timestamp', { ascending: false })
        ]);

        setTasks(tasksRes.data || []);
        setStockItems(stockRes.data || []);
        setMeetings(meetingsRes.data || []);
        setMaintItems(maintRes.data || []);
        setActivityLogs(logsRes.data || []);
      } catch (e) {
        console.error("Error fetching data:", e);
      }
    };

    fetchData();
  }, [currentUser]);

  // Save prefs
  useEffect(() => {
    if (currentUser) {
      supabase.from('user_prefs').upsert({ user_name: currentUser.name, theme, lang, logo: userLogo }, { onConflict: 'user_name' });
    }
  }, [currentUser, theme, lang, userLogo]);

  useEffect(() => { const timer = setInterval(() => setCurrentTime(new Date()), 1000); return () => clearInterval(timer); }, []);
  useEffect(() => { if (currentUser && !taskForm.assignee) setTaskForm((p: any) => ({ ...p, assignee: currentUser.permissionRole === "Staff" ? currentUser.name : "" })); }, [currentUser, taskForm.assignee]);
  useEffect(() => { setMeetingForm((p: any) => ({ ...p, date: selectedDate })); setStockForm((p: any) => ({ ...p, date: selectedDate })); setMaintForm((p: any) => ({ ...p, date: selectedDate })); }, [selectedDate]);

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

  if (!currentUser) return <LoginScreen colors={colors} onLogin={handleLogin} t={t} />;

  const matchesUser = (assignee: string) => currentUser.permissionRole === "Admin" || assignee === currentUser.name || assignee.trim() === "";
  const priorityOrder: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
  const filteredTasks = tasks.filter(tk =>
    (!search || tk.task?.toLowerCase().includes(search.toLowerCase())) &&
    (filterStat === "All" || tk.status === filterStat) &&
    tk.date === selectedDate &&
    matchesUser(tk.assignee)
  ).sort((a, b) => priorityOrder[a.level] - priorityOrder[b.level]);

  const addLog = async (type: string, action: string) => {
    const entry = { id: String(Date.now()), type, action, timestamp: new Date().toISOString(), user_name: currentUser.name };
    setActivityLogs((p: any) => [entry, ...p].slice(0, 200));
    try {
      await supabase.from('activity_logs').insert(entry);
    } catch (e) {
      console.error("Error saving log:", e);
    }
  };

  const handleLogoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); 
    reader.onload = async (ev) => { 
      const b64 = ev.target?.result as string; 
      setUserLogo(b64); 
      await supabase.from('user_prefs').upsert({ user_name: currentUser.name, logo: b64 }, { onConflict: 'user_name' }); 
    }; 
    reader.readAsDataURL(file);
  };

  const handleCsvUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (lines.length < 2) return window.alert(t.csvError);

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const newTasks: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          if (cols.length < 2) continue;

          const get = (keys: string[]) => {
            for (const k of keys) {
              const idx = headers.indexOf(k);
              if (idx >= 0) return cols[idx] || '';
            }
            return '';
          };

          const rawTitle = get(['task', 'title']);
          if (!rawTitle) continue;

          const rawDate = get(['date', 'deadline']);
          const st = get(['time_start', 'start_time']);
          const et = get(['time_end', 'end_time']);
          const rawRole = get(['role', 'position']);
          const rawLevel = get(['level', 'priority']);

          newTasks.push({
            id: crypto.randomUUID(),
            task: rawTitle.replace(/[.,;:!]+$/, '').trim(),
            date: rawDate,
            time_start: st.replace('.', ':').slice(0, 5),
            time_end: et.replace('.', ':').slice(0, 5),
            role: rawRole,
            level: rawLevel,
            assignee: get(['assignee', 'pic']) || currentUser.name,
            status: (statuses.find(s => s.toLowerCase() === get(['status']).toLowerCase()) || 'Pending'),
            notes: get(['notes', 'catatan']) || '',
            user_name: currentUser.name,
            imageUrl: ""
          });
        }

        if (!newTasks.length) return window.alert("Tidak ada data valid.");

        const { error } = await supabase.from('task').insert(newTasks);
        if (error) {
          console.error("CSV insert error:", error);
          window.alert(`Gagal simpan: ${error.message}`);
          return;
        }

        setTasks((prev: any) => [...newTasks, ...prev]);
        await addLog("CSV", `Imported ${newTasks.length} tasks from CSV`);
        window.alert(`✅ ${newTasks.length} ${t.csvSuccess}`);
      } catch {
        window.alert(t.csvError);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleSaveTask = async () => {
    if (!taskForm.title?.trim()) return window.alert(t.alertTitleRequired);
    const newTask = {
      id: crypto.randomUUID(),
      task: taskForm.title,
      date: taskForm.date || selectedDate,
      time_start: taskForm.startTime || "",
      time_end: taskForm.endTime || "",
      role: taskForm.category,
      level: taskForm.priority,
      assignee: taskForm.assignee || currentUser.name,
      status: taskForm.status || "Pending",
      notes: taskForm.notes || "",
      user_name: currentUser.name,
      imageUrl: ""
    };

    const { error } = await supabase.from('task').insert(newTask);
    if (error) {
      console.error("Task insert failed:", error);
      window.alert(`Gagal simpan: ${error.message}`);
      return;
    }

    setTasks((p: any) => [newTask, ...p]);
    await addLog("TASK", `Created: ${newTask.task}`);
    setTaskForm({
      title: "", category: "Production", priority: "High", assignee: currentUser.permissionRole === "Staff" ? currentUser.name : "",
      deadline: selectedDate, date: selectedDate, startTime: "", endTime: "", status: "Pending", notes: ""
    });
    window.alert("✅ Task saved!");
  };

  const saveEdit = async () => {
    if (!editingTaskId) return;
    const { error } = await supabase.from('task').update(editForm).eq('id', editingTaskId);
    if (error) {
      console.error("Edit failed:", error);
      window.alert(`Gagal update: ${error.message}`);
      return;
    }
    setTasks((p: any) => p.map((tk: any) => tk.id === editingTaskId ? { ...tk, ...editForm } : tk));
    await addLog("TASK", `Updated task: ${editForm.task}`);
    setEditingTaskId(null);
  };
  const toggleStatus = async (id: string) => {
    const t = tasks.find(x => x.id === id);
    if (!t) return;
    const ns = t.status === "Completed" ? "In progress" : "Completed";
    const { error } = await supabase.from('task').update({ status: ns }).eq('id', id);
    if (error) {
      console.error("Status toggle failed:", error);
      window.alert(`Gagal ubah status: ${error.message}`);
      return;
    }
    setTasks((p: any) => p.map((x: any) => x.id === id ? { ...x, status: ns } : x));
    await addLog("TASK", `Status changed for: ${t.task}`);
  };
  const deleteTask = async (id: string) => {
    const { error } = await supabase.from('task').delete().eq('id', id);
    if (error) {
      console.error("Delete failed:", error);
      window.alert(`Gagal hapus task: ${error.message}`);
      return;
    }
    setTasks((p: any) => p.filter((x: any) => x.id !== id));
    await addLog("TASK", `Deleted task with id: ${id}`);
  };
  const handleSaveMeeting = async () => {
    if (!meetingForm.title.trim()) return window.alert(t.alertTitleRequired);
    const m = { id: crypto.randomUUID(), ...meetingForm, user_name: currentUser.name };
    const { error } = await supabase.from('meetings').insert(toSnakeCase(m));
    if (error) {
      console.error("Meeting insert failed:", error);
      window.alert(`Gagal simpan meeting: ${error.message}`);
      return;
    }
    setMeetings((p: any) => [m, ...p]);
    await addLog("MEETING", m.title);
    setMeetingForm({ title: "", date: selectedDate, time: "", attendees: "", notes: "" });
    window.alert("✅ Saved!");
  };

  const shareWhatsApp = () => {
    const todayTasks = tasks.filter(tk => tk.date === selectedDate && matchesUser(tk.assignee));
    const todayStock = stockItems.filter((s: any) => s.date === selectedDate);
    const todayMeetings = meetings.filter((m: any) => m.date === selectedDate);
    const todayMaint = maintItems.filter((m: any) => m.date === selectedDate);

    const completedTasks = todayTasks.filter((tk: any) => tk.status === "Completed").map((tk: any) => `• ${tk.task} [${tk.status}] ${formatTimeRange(tk)}`).join('\n') || '-';
    const pendingTasks = todayTasks.filter((tk: any) => tk.status !== "Completed" && tk.status !== "Cancelled").map((tk: any) => `• ${tk.task} [${tk.status}] ${formatTimeRange(tk)}`).join('\n') || '-';
    const stockItemsText = todayStock.map((s: any) => `• ${s.item} : ${s.stock + s.masuk - s.keluar} ${s.unit}`).join('\n') || '-';
    const maintItemsText = todayMaint.map((m: any) => `• ${m.equipment} : ${m.issue} [${m.status}]`).join('\n') || '-';
    const meetingItemsText = todayMeetings.map((m: any) => `• ${m.title} (${m.time}) - ${m.attendees}`).join('\n') || '-';

    const reportLink = `https://rubenhae95-jpg.github.io/blue-tick-to-do/report/${selectedDate}/${encodeURIComponent(currentUser.name.toLowerCase().replace(/\s+/g, "-"))}`;

    const msg = `📋 DAILY TASK REPORT\n\n👤 Employee : ${currentUser.name.toUpperCase()}\n💼 Role : ${currentUser.roleTitle}\n🕒 Shift : ${currentUser.shift}\n📅 Date : ${formatDate(selectedDate)}\n\n━━━━━━━━━━━━━━━━━━\n\n✅ COMPLETED\n${completedTasks}\n\n⏳ PENDING / IN PROGRESS\n${pendingTasks}\n\n📦 STOCK OPNAME\n${stockItemsText}\n\n🔧 MAINTENANCE\n${maintItemsText}\n\n📝 MEETING\n${meetingItemsText}\n\n📌 NOTES\n-\n\n━━━━━━━━━━━━━━━━━━\n\n📤 Submitted by: ${currentUser.name.toUpperCase()}\n🕒 Submitted: ${formatDate(currentTime)} | ${currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}\n\n🔗 View report: ${reportLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
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
  const btnStyle = (v: "primary" | "secondary" | "danger" = "primary") => ({
    padding: "8px 12px",
    borderRadius: 8,
    border: v === "primary" ? "none" : `1px solid ${colors.border}`,
    background: v === "primary" ? colors.accent : v === "danger" ? `${colors.danger}20` : "transparent",
    color: v === "primary" ? "#FFF" : v === "danger" ? colors.danger : colors.text,
    fontSize: 13,
    cursor: "pointer",
    fontWeight: 500
  });

  return (
    <div style={{ minHeight: "100vh", background: colors.page, color: colors.text, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", position: "relative" }}>
      <style>{`
        .nav-overlay { position: fixed; top: 0; left: 0; bottom: 0; width: 260px; max-width: 75%; background: ${theme === "light" ? "#0F172A" : "#0B1120"}; z-index: 60; transform: translateX(-100%); transition: .3s; display: flex; flex-direction: column; }
        .nav-overlay.open { transform: translateX(0); }
        .nav-item { padding: 14px 24px; color: #94A3B8; cursor: pointer; transition: .2s; border-left: 4px solid transparent; }
        .nav-item.active { background: rgba(14,165,233,0.15); color: #0EA5E9; border-left-color: #0EA5E9; }
        .main-content { flex: 1; padding: 20px; overflow-y: auto; max-width: 1200px; margin: 0 auto; width: 100%; box-sizing: border-box; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(130px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .stat-card { background: ${colors.card}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 14px; }
        .task-card { background: ${colors.card}; border: 1px solid ${colors.border}; border-radius: 12px; padding: 14px; margin-bottom: 12px; }
        .form-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(110px, 1fr)); gap: 10px; margin-bottom: 12px; }
        .split-grid { display: grid; gap: 16px; grid-template-columns: 1.2fr 1fr; }
        @media(max-width:768px){ .main-content{padding:12px} header{flex-direction:column;gap:10px;padding:14px} .header-right{width:100%;justify-content:space-between;flex-wrap:wrap} .stats-grid{grid-template-columns:1fr 1fr} .split-grid{grid-template-columns:1fr} }
        input[type="date"], input[type="time"], select { color-scheme: ${theme}; }
      `}</style>

      <div className={`nav-overlay ${isMenuOpen ? "open" : ""}`}>
        <div style={{ padding: 20, display: "flex", justifyContent: "space-between", borderBottom: "1px solid #334155" }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: "#FFF" }}>Menu</span>
          <button onClick={() => setMenuOpen(false)} style={{ background: "none", border: "none", color: "#94A3B8", fontSize: 28, cursor: "pointer" }}>×</button>
        </div>
        <nav style={{ padding: "16px 0", display: "grid", gap: 6, overflowY: "auto" }}>
          {menuItems.map(i => <div key={i.id} className={`nav-item ${activeTab === i.id ? "active" : ""}`} onClick={() => { setActiveTab(i.id as Tab); setMenuOpen(false); }}>{i.label}</div>)}
        </nav>
        <div style={{ padding: 20, marginTop: "auto", borderTop: "1px solid #334155" }}>
          <div style={{ fontSize: 14, color: "#FFF", fontWeight: 600 }}>{currentUser.name}</div>
          <div style={{ fontSize: 12, color: "#94A3B8", marginBottom: 10 }}>{currentUser.roleTitle} · {currentUser.permissionRole}</div>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setLang(l => l === "id" ? "en" : "id")} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#FFF", cursor: "pointer" }}>{lang === "id" ? "ID" : "EN"}</button>
            <button onClick={() => setTheme(th => th === "light" ? "dark" : "light")} style={{ flex: 1, padding: 10, borderRadius: 8, border: "none", background: "rgba(255,255,255,0.1)", color: "#FFF", cursor: "pointer" }}>{theme === "light" ? "🌙" : "☀️"}</button>
            <button onClick={handleLogout} style={{ padding: 10, borderRadius: 8, border: "none", background: "#EF4444", color: "#FFF", cursor: "pointer" }}>🚪</button>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%" }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: `1px solid ${colors.border}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setMenuOpen(true)} style={{ background: "none", border: "none", fontSize: 26, color: colors.text, cursor: "pointer" }}>☰</button>
            <img src={userLogo || DEFAULT_LOGO} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
          </div>
          <div style={{ textAlign: "center", flex: 1 }}>
            <h1 style={{ fontSize: "1.5rem", color: "#ADD8E6", fontWeight: 700, margin: 0 }}>BLUE TICK ICE</h1>
            <span style={{ fontSize: 11, color: colors.muted, fontWeight: 500, textTransform: "uppercase", letterSpacing: 1 }}>Daily Task Operational</span>
          </div>
          <div className="header-right" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 12, color: colors.muted, fontVariantNumeric: "tabular-nums" }}>{currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} | {formatDate(currentTime)}</span>
            {activeTab !== "settings" && <button onClick={shareWhatsApp} style={btnStyle("primary")}>Share</button>}
          </div>
        </header>

        <main className="main-content">
          {/* Dashboard */}
          {activeTab === "dashboard" && (() => {
            const today = getToday();
            const todayTasks = tasks.filter(tk => tk.date === today && matchesUser(tk.assignee));
            const todayStock = stockItems.filter((s: any) => s.date === today);
            const todayMeetings = meetings.filter((m: any) => m.date === today);
            const todayMaint = maintItems.filter((m: any) => m.date === today);

            return (
              <>
                <div className="stats-grid">
                  {[{ l: t.total, v: todayTasks.length }, { l: t.completed, v: todayTasks.filter((t: any) => t.status === "Completed").length }, { l: t.remaining, v: todayTasks.filter((t: any) => t.status !== "Completed" && t.status !== "Cancelled").length }, { l: t.cancelled, v: todayTasks.filter((t: any) => t.status === "Cancelled").length }].map((s, i) => (
                    <div className="stat-card" key={i}><div style={{ fontSize: 22, fontWeight: 700 }}>{s.v}</div><div style={{ fontSize: 11, color: colors.muted }}>{s.l}</div></div>
                  ))}
                </div>
                <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, marginBottom: 20 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}><span style={{ fontWeight: 600 }}>{t.progress}</span><span style={{ background: colors.accentBg, color: colors.accent, padding: "3px 8px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{todayTasks.length ? Math.round(todayTasks.filter((t: any) => t.status === "Completed").length / todayTasks.length * 100) : 0}%</span></div>
                  <div style={{ height: 6, background: colors.cardMuted, borderRadius: 999, overflow: "hidden" }}><div style={{ height: "100%", width: `${todayTasks.length ? todayTasks.filter((t: any) => t.status === "Completed").length / todayTasks.length * 100 : 0}%`, background: colors.accent, borderRadius: 999 }} /></div>
                </div>
                <div style={{ display: "grid", gap: 12, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
                  {todayTasks.length > 0 && <div className="task-card"><b>Tasks</b>{todayTasks.slice(0, 4).map((tk: any) => <div key={tk.id} style={{ fontSize: 12, marginTop: 6 }}>• {tk.task} [{tk.status}]</div>)}</div>}
                  {todayStock.length > 0 && <div className="task-card"><b>Stock</b>{todayStock.slice(0, 3).map((s: any) => <div key={s.id} style={{ fontSize: 12, marginTop: 6 }}>• {s.item}: {s.stock + s.masuk - s.keluar} {s.unit}</div>)}</div>}
                  {todayMeetings.length > 0 && <div className="task-card"><b>Meetings</b>{todayMeetings.slice(0, 3).map((m: any) => <div key={m.id} style={{ fontSize: 12, marginTop: 6 }}>• {m.title} ({m.time})</div>)}</div>}
                  {todayMaint.length > 0 && <div className="task-card"><b>Maintenance</b>{todayMaint.slice(0, 3).map((m: any) => <div key={m.id} style={{ fontSize: 12, marginTop: 6 }}>• {m.equipment}: {m.status}</div>)}</div>}
                </div>
                {todayTasks.length === 0 && todayStock.length === 0 && todayMeetings.length === 0 && todayMaint.length === 0 && <div style={{ textAlign: "center", padding: 40, color: colors.muted }}>{t.noTasks}</div>}
              </>
            );
          })()}

          {/* Tasks */}
          {activeTab === "tasks" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>{t.tasks}</h2>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, color: colors.muted }}>Date:</span>
                  <input type="date" value={selectedDate} onChange={e => setSelectedDate(e.target.value)} style={{ ...inputStyle, width: "auto" }} />
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input style={{ ...inputStyle, flex: 1 }} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..." />
                <select style={{ ...inputStyle, flex: 1 }} value={filterStat} onChange={e => setFilterStat(e.target.value)}><option value="All">Status</option>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>
              {filteredTasks.length === 0 ? <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noTasks}</div> : filteredTasks.map((tk: any) => {
                const isEd = editingTaskId === tk.id;
                const statusKey = statuses.find(s => s === tk.status);
                const badge = statusKey ? statusColors[statusKey] : { bg: "#E5E7EB", text: "#4B5563" };
                return (
                  <div className="task-card" key={tk.id}>
                    {isEd ? (
                      <div className="form-grid">
                        <input style={inputStyle} value={editForm.task || ""} onChange={e => setEditForm((p: any) => ({ ...p, task: e.target.value }))} />
                        <input style={inputStyle} type="date" value={editForm.date || tk.date} onChange={e => setEditForm((p: any) => ({ ...p, date: e.target.value }))} />
                        <input style={inputStyle} type="time" value={editForm.time_start || ""} onChange={e => setEditForm((p: any) => ({ ...p, time_start: e.target.value }))} />
                        <input style={inputStyle} type="time" value={editForm.time_end || ""} onChange={e => setEditForm((p: any) => ({ ...p, time_end: e.target.value }))} />
                        <select style={inputStyle} value={editForm.status || tk.status} onChange={e => setEditForm((p: any) => ({ ...p, status: e.target.value as TaskStatus }))}>{statuses.map(s => <option key={s} value={s}>{s}</option>)}</select>
                        <div style={{ gridColumn: "1/-1", display: "flex", gap: 8 }}><button style={btnStyle("primary")} onClick={saveEdit}>{t.save}</button><button style={btnStyle("secondary")} onClick={() => setEditingTaskId(null)}>{t.cancel}</button></div>
                      </div>
                    ) : (
                      <>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}><span style={{ fontWeight: 600 }}>{tk.task}</span><span style={{ background: badge.bg, color: badge.text, padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600 }}>{tk.status}</span></div>
                        <div style={{ fontSize: 12, color: colors.muted, marginBottom: 8 }}>{tk.role} · {tk.level} · {tk.assignee} · {formatTimeRange(tk)}</div>
                        
                        {tk.imageUrl && <img src={tk.imageUrl} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginTop: 8 }} alt="Task" />}
                        
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                          <button style={btnStyle(tk.status === "Completed" ? "secondary" : "primary")} onClick={() => toggleStatus(tk.id)}>{tk.status === "Completed" ? t.undo : t.checklist}</button>
                          <button style={btnStyle("secondary")} onClick={() => { setEditingTaskId(tk.id); setEditForm(tk); }}>{t.edit}</button>
                          
                          <label style={{ ...btnStyle("secondary"), cursor: "pointer" }} htmlFor={`upload-task-${tk.id}`}>📷 Foto</label>
                          <input 
                            id={`upload-task-${tk.id}`} 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const b64 = reader.result as string;
                                setTasks((p: any) => p.map((x: any) => x.id === tk.id ? { ...x, imageUrl: b64 } : x));
                                await supabase.from('task').update({ imageUrl: b64 }).eq('id', tk.id);
                              };
                              reader.readAsDataURL(file);
                            }} 
                          />
                          
                          <button style={btnStyle("danger")} onClick={() => deleteTask(tk.id)}>{t.delete}</button>
                        </div>
                        <textarea style={{ ...inputStyle, minHeight: 40, marginTop: 8 }} value={tk.notes} onChange={e => { const v = e.target.value; setTasks((p: any) => p.map((i: any) => i.id === tk.id ? { ...i, notes: v } : i)); supabase.from('task').update({ notes: v }).eq('id', tk.id); }} placeholder={t.notesPlaceholder} />
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
                  <input style={inputStyle} value={taskForm.startTime || ""} onChange={e => setTaskForm((p: any) => ({ ...p, startTime: e.target.value }))} type="time" />
                  <input style={inputStyle} value={taskForm.endTime || ""} onChange={e => setTaskForm((p: any) => ({ ...p, endTime: e.target.value }))} type="time" />
                  <select style={inputStyle} value={taskForm.category || "Production"} onChange={e => setTaskForm((p: any) => ({ ...p, category: e.target.value }))}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select>
                  <select style={inputStyle} value={taskForm.priority || "High"} onChange={e => setTaskForm((p: any) => ({ ...p, priority: e.target.value as Priority }))}>{priorities.map(p => <option key={p} value={p}>{p}</option>)}</select>
                </div>
                <button style={{ ...btnStyle("primary"), width: "100%", padding: "10px 0" }} onClick={handleSaveTask}>{t.addTask}</button>
              </div>
            </div>
          )}

          {/* Stock, Meeting */}
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
                          <button style={{ ...btnStyle("secondary"), flex: 1 }} onClick={async () => { const v = prompt(`Tambah ${t.incoming} (${s.item}):`, "0"); if(v!==null){ const n=Number(v); try { await supabase.from('stock_items').update({ masuk: s.masuk+n, updatedAt:getToday() }).eq('id',s.id); setStockItems((p: any)=>p.map((i: any)=>i.id===s.id?{...i,masuk:i.masuk+n,updatedAt:getToday()}:i)); await addLog("STOCK", `Added ${n} to ${s.item}`); } catch(e){console.error("Error updating stock:", e);} } }}>Masuk</button>
                          <button style={{ ...btnStyle("secondary"), flex: 1 }} onClick={async () => { const v = prompt(`Tambah ${t.outgoing} (${s.item}):`, "0"); if(v!==null){ const n=Number(v); try { await supabase.from('stock_items').update({ keluar: s.keluar+n, updatedAt:getToday() }).eq('id',s.id); setStockItems((p: any)=>p.map((i: any)=>i.id===s.id?{...i,keluar:i.keluar+n,updatedAt:getToday()}:i)); await addLog("STOCK", `Removed ${n} from ${s.item}`); } catch(e){console.error("Error updating stock:", e);} } }}>Keluar</button>
                        </div>
                        {s.notes && <div style={{ fontSize: 12, color: colors.muted }}>{s.notes}</div>}
                        <button style={{ ...btnStyle("danger"), marginTop: 8, fontSize: 12 }} onClick={() => { setStockItems((p: any) => p.filter((i: any) => i.id !== s.id)); try { supabase.from('stock_items').delete().eq('id', s.id); addLog("STOCK", `Deleted item ${s.item}`); } catch(e){console.error("Error deleting stock:", e);} }}>{t.deleteItem}</button>
                      </div>
                    );
                  })}
                  {stockItems.filter((s: any) => s.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noStock}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{t.addNewItem}</div>
                <input style={inputStyle} value={stockForm.date} onChange={e => setStockForm((p: any) => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={stockForm.item} onChange={e => setStockForm((p: any) => ({ ...p, item: e.target.value }))} placeholder={t.itemName} />
                <input style={inputStyle} value={stockForm.unit} onChange={e => setStockForm((p: any) => ({ ...p, unit: e.target.value }))} placeholder="Unit" />
                <input style={inputStyle} value={stockForm.stock} onChange={e => setStockForm((p: any) => ({ ...p, stock: e.target.value }))} placeholder={t.initialStock} type="number" />
                <textarea style={{ ...inputStyle, minHeight: 50, marginTop: 8 }} value={stockForm.notes} onChange={e => setStockForm((p: any) => ({ ...p, notes: e.target.value }))} placeholder={t.notesPlaceholder} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={async () => {
                  if (!stockForm.item.trim()) return window.alert(t.alertTitleRequired);
                  const newItem = { id: crypto.randomUUID(), ...stockForm, stock: Number(stockForm.stock) || 0, masuk: 0, keluar: 0, updatedAt: getToday(), user_name: currentUser.name };
                  setStockItems((p: any) => [newItem, ...p]);
                  try {
                    await supabase.from('stock_items').insert(toSnakeCase(newItem));
                    await addLog("STOCK", `Added new item: ${newItem.item}`);
                  } catch (e) { console.error("Error saving stock item:", e); window.alert("Gagal menyimpan item ke database."); }
                  setStockForm({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "", date: getToday() });
                }}>{t.addNewItem}</button>
              </div>
            </div>
          )}

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
                      <button style={{ ...btnStyle("danger"), marginTop: 8, fontSize: 12 }} onClick={() => { setMeetings((p: any) => p.filter((x: any) => x.id !== m.id)); try { supabase.from('meetings').delete().eq('id', m.id); addLog("MEETING", `Deleted meeting: ${m.title}`); } catch(e){console.error("Error deleting meeting:", e);} }}>{t.delete}</button>
                    </div>
                  ))}
                  {meetings.filter((m: any) => m.date === selectedDate).length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMeeting}</div>}
                </div>
              </div>
              <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16, height: "fit-content" }}>
                <div style={{ fontWeight: 600, marginBottom: 10 }}>{t.scheduleMeeting}</div>
                <input style={inputStyle} value={meetingForm.date} onChange={e => setMeetingForm((p: any) => ({ ...p, date: e.target.value }))} type="date" />
                <input style={inputStyle} value={meetingForm.title} onChange={e => setMeetingForm((p: any) => ({ ...p, title: e.target.value }))} placeholder={t.meetingName} />
                <input style={inputStyle} value={meetingForm.time} onChange={e => setMeetingForm((p: any) => ({ ...p, time: e.target.value }))} type="time" />
                <input style={inputStyle} value={meetingForm.attendees} onChange={e => setMeetingForm((p: any) => ({ ...p, attendees: e.target.value }))} placeholder={t.attendeesInput} />
                <textarea style={{ ...inputStyle, minHeight: 50, marginTop: 8 }} value={meetingForm.notes} onChange={e => setMeetingForm((p: any) => ({ ...p, notes: e.target.value }))} placeholder={t.agenda} />
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={handleSaveMeeting}>{t.addMeeting}</button>
              </div>
            </div>
          )}

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
                        
                        {m.imageUrl && <img src={m.imageUrl} style={{ width: "100%", maxHeight: 200, objectFit: "cover", borderRadius: 8, marginTop: 8 }} alt="Maintenance" />}
                        
                        {m.notes && <div style={{ fontSize: 12, color: colors.muted, marginTop: 4 }}>{m.notes}</div>}
                        
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
                          <label style={{ ...btnStyle("secondary"), cursor: "pointer", fontSize: 12 }} htmlFor={`upload-maint-${m.id}`}>📷 Foto</label>
                          <input 
                            id={`upload-maint-${m.id}`} 
                            type="file" 
                            accept="image/*" 
                            style={{ display: 'none' }} 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = async () => {
                                const b64 = reader.result as string;
                                setMaintItems((p: any) => p.map((x: any) => x.id === m.id ? { ...x, imageUrl: b64 } : x));
                                await supabase.from('maintenance').update({ imageUrl: b64 }).eq('id', m.id);
                              };
                              reader.readAsDataURL(file);
                            }} 
                          />
                          <button style={{ ...btnStyle("danger"), fontSize: 12 }} onClick={() => { setMaintItems((p: any) => p.filter((x: any) => x.id !== m.id)); try { supabase.from('maintenance').delete().eq('id', m.id); addLog("MAINTENANCE", `Deleted maintenance: ${m.equipment}`); } catch(e){console.error("Error deleting maintenance:", e);} }}>{t.delete}</button>
                        </div>
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
                <button style={{ ...btnStyle("primary"), width: "100%", marginTop: 12 }} onClick={async () => {
                  if (!maintForm.equipment.trim()) return window.alert(t.alertTitleRequired);
                  const newItem = { id: crypto.randomUUID(), ...maintForm, user_name: currentUser.name, imageUrl: "" };
                  setMaintItems((p: any) => [newItem, ...p]);
                  try {
                    await supabase.from('maintenance').insert(toSnakeCase(newItem));
                    await addLog("MAINTENANCE", `Added maintenance: ${newItem.equipment}`);
                  } catch (e) { console.error("Error saving maintenance:", e); window.alert("Gagal menyimpan maintenance ke database."); }
                  setMaintForm({ equipment: "", issue: "", technician: "", status: "Pending", date: selectedDate, notes: "" });
                }}>{t.addMaintBtn}</button>
              </div>
            </div>
          )}

          {activeTab === "activity_log" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 16 }}>
              <div style={{ fontWeight: 600, marginBottom: 12 }}>{t.activityLog}</div>
              {activityLogs.length === 0 ? <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noLogs}</div> : (
                <div style={{ display: "grid", gap: 10 }}>
                  {activityLogs.map((log: any) => (
                    <div key={log.id} className="task-card" style={{ padding: 12 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontWeight: 600, color: colors.accent }}>{log.type}</span><span style={{ fontSize: 11, color: colors.muted }}>{formatDateTime(log.timestamp)}</span></div>
                      <div style={{ fontSize: 13 }}>{log.action}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div style={{ background: colors.card, border: `1px solid ${colors.border}`, borderRadius: 12, padding: 20 }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 20px" }}>{t.settings}</h2>
              <div style={{ display: "grid", gap: 16, gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))" }}>
                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🖼️</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.uploadLogo}</div>
                  <input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
                  <label htmlFor="logo" style={{ ...btnStyle("secondary"), cursor: "pointer", display: "inline-block", padding: "8px 14px" }}>Choose</label>
                </div>
                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>📄</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.importCsv}</div>
                  <input id="csv" type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: "none" }} />
                  <label htmlFor="csv" style={{ ...btnStyle("secondary"), cursor: "pointer", display: "inline-block", padding: "8px 14px" }}>Choose CSV</label>
                </div>
                <div className="task-card" style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 36, marginBottom: 8 }}>🗑️</div>
                  <div style={{ fontWeight: 600, marginBottom: 8 }}>{t.resetData}</div>
                  <button style={{ ...btnStyle("danger"), padding: "8px 14px" }} onClick={() => { if(window.confirm("Hapus semua data lokal & logout?")) { localStorage.removeItem('btice_session'); window.location.reload(); } }}>{t.resetData}</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}