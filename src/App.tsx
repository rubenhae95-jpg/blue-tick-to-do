import { useState, useEffect, type ChangeEvent } from "react";

type PermissionRole = "Admin" | "Staff";
type TaskStatus = "Pending" | "In progress" | "Completed" | "Cancelled";
type Priority = "High" | "Medium" | "Low";
type Theme = "light" | "dark";
type Tab = "tasks" | "stock" | "meeting" | "maintenance";
type Lang = "id" | "en";

type CurrentUser = {
  name: string;
  roleTitle: string;
  permissionRole: PermissionRole;
  shift: string;
};

type Task = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: Priority;
  assignee: string;
  deadline: string;
  status: TaskStatus;
  notes: string;
  createdAt: string;
  createdByRole?: PermissionRole;
  startTime?: string;
  endTime?: string;
  reason?: string;
  imageUrl?: string;
};

type Colors = {
  page: string;
  card: string;
  cardMuted: string;
  text: string;
  muted: string;
  border: string;
  borderStrong: string;
  accent: string;
  accentBg: string;
  danger: string;
};

type StockItem = {
  id: string;
  item: string;
  unit: string;
  stock: number;
  masuk: number;
  keluar: number;
  notes: string;
  updatedAt: string;
};

type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  attendees: string;
  notes: string;
};

type MaintenanceItem = {
  id: string;
  equipment: string;
  issue: string;
  technician: string;
  status: TaskStatus;
  date: string;
  notes: string;
};

const categories: string[] = [
  "Factory Supervisor", "Factory Logistik", "Driver", "Production", "Cleaning", "Office", "Maintenance", "Quality Control", "Administration", "Others",
];
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: TaskStatus[] = ["Pending", "In progress", "Completed", "Cancelled"];
const shifts: string[] = ["Day", "Night"];

const statusStyles: Record<TaskStatus, { bg: string; text: string }> = {
  Pending: { bg: "#eef2f8", text: "#5b6b82" }, "In progress": { bg: "#dbeafe", text: "#1d4ed8" },
  Completed: { bg: "#dcecff", text: "#0c4a8c" }, Cancelled: { bg: "#fde8e8", text: "#a12626" },
};

const translations = {
  id: {
    darkMode: "Mode gelap", lightMode: "Mode terang", totalTasks: "Total tugas", completed: "Selesai", remaining: "Belum selesai", pending: "Pending",
    shareDescription: "Bagikan laporan harian ke WhatsApp.", taskFormTitle: "Tambah / Edit Task", adminStaffNote: "Admin & Staff bisa buat task. Edit/Hapus bebas.",
    titlePlaceholder: "Judul tugas", descriptionPlaceholder: "Deskripsi tugas", assigneePlaceholder: "Penanggung jawab", notesPlaceholder: "Catatan internal",
    reasonPlaceholder: "Alasan pending/progress", saveChanges: "Simpan", addTask: "Tambah task", alertTitleRequired: "Judul wajib diisi.", alertAssigneeRequired: "Assignee wajib diisi.",
    taskCreatedByRole: "tugas oleh", limitReached: "Batas task tercapai.", canAddTask: "Dapat menambah task.", subtitle: "Daily Task Operations", logoUpload: "Ganti logo", logout: "Keluar",
    tasks: "Tasks", stock: "Stok Opname", meeting: "Meeting", maintenance: "Maintenance", progress: "Progress Detail", checklist: "Checklist", undo: "Undo", edit: "Edit", delete: "Hapus",
    addNote: "Catatan tambahan", noTasks: "Tidak ada task.", searchPlaceholder: "Cari tugas", all: "Semua", deadline: "Deadline", created: "Dibuat", time: "Waktu", reason: "Alasan",
    importCsv: "Import CSV Bulk", uploadPhoto: "📷 Foto", stockTitle: "Stok Opname", updateLast: "Update", addNewItem: "Tambah item", itemName: "Nama item", initialStock: "Stok awal",
    incoming: "Masuk", outgoing: "Keluar", currentStock: "Sisa", deleteItem: "Hapus item", noStock: "Kosong.", meetingTitle: "Meeting", attendees: "Peserta", scheduleMeeting: "Jadwalkan",
    meetingName: "Judul", date: "Tanggal", timeInput: "Waktu", attendeesInput: "Peserta", agenda: "Agenda", addMeeting: "Tambah meeting", noMeeting: "Kosong.",
    maintTitle: "Maintenance", addMaint: "Tambah maintenance", equipName: "Peralatan", issueDesc: "Masalah", techName: "Teknisi", maintNotes: "Catatan", addMaintBtn: "Tambah", noMaint: "Kosong.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operations", loginDesc: "Masuk untuk mulai", loginName: "Nama", loginRole: "Jabatan", loginBtn: "Masuk", nameRequired: "Nama wajib.",
    pendingTasks: "Pending", inProgress: "In Progress", cancelled: "Cancelled", completionRate: "Completion Rate",
    csvSuccess: "tugas berhasil diimport!", csvError: "Gagal parse CSV. Pastikan header: title,description,category,priority,assignee,deadline,status",
  },
  en: {
    darkMode: "Dark mode", lightMode: "Light mode", totalTasks: "Total tasks", completed: "Completed", remaining: "Remaining", pending: "Pending",
    shareDescription: "Share daily report to WhatsApp.", taskFormTitle: "Add / Edit Task", adminStaffNote: "Admin & Staff can create. Edit/Delete open.",
    titlePlaceholder: "Task title", descriptionPlaceholder: "Description", assigneePlaceholder: "Assignee", notesPlaceholder: "Notes",
    reasonPlaceholder: "Reason if pending/progress", saveChanges: "Save", addTask: "Add task", alertTitleRequired: "Title required.", alertAssigneeRequired: "Assignee required.",
    taskCreatedByRole: "tasks by", limitReached: "Limit reached.", canAddTask: "Can add tasks.", subtitle: "Daily Task Operations", logoUpload: "Change logo", logout: "Logout",
    tasks: "Tasks", stock: "Stock Opname", meeting: "Meeting", maintenance: "Maintenance", progress: "Detailed Progress", checklist: "Checklist", undo: "Undo", edit: "Edit", delete: "Delete",
    addNote: "Add note", noTasks: "No tasks.", searchPlaceholder: "Search", all: "All", deadline: "Deadline", created: "Created", time: "Time", reason: "Reason",
    importCsv: "Bulk Import CSV", uploadPhoto: "📷 Photo", stockTitle: "Stock Opname", updateLast: "Updated", addNewItem: "Add item", itemName: "Item name", initialStock: "Initial Stock",
    incoming: "In", outgoing: "Out", currentStock: "Remaining", deleteItem: "Delete item", noStock: "Empty.", meetingTitle: "Meeting", attendees: "Attendees", scheduleMeeting: "Schedule",
    meetingName: "Title", date: "Date", timeInput: "Time", attendeesInput: "Attendees", agenda: "Agenda", addMeeting: "Add meeting", noMeeting: "Empty.",
    maintTitle: "Maintenance", addMaint: "Add maintenance", equipName: "Equipment", issueDesc: "Issue", techName: "Technician", maintNotes: "Notes", addMaintBtn: "Add", noMaint: "Empty.",
    loginTitle: "BLUE TICK ICE", loginSubtitle: "Daily Task Operations", loginDesc: "Login to start", loginName: "Name", loginRole: "Role", loginBtn: "Login", nameRequired: "Name required.",
    pendingTasks: "Pending", inProgress: "In Progress", cancelled: "Cancelled", completionRate: "Completion Rate",
    csvSuccess: "tasks imported successfully!", csvError: "CSV parse failed. Ensure headers: title,description,category,priority,assignee,deadline,status",
  },
};

const sampleTasks: Task[] = [
  { id: "1", title: "Clean machine", description: "Bersihkan mesin utama.", category: "Cleaning", priority: "High", assignee: "Budi", deadline: "2026-07-17", status: "Completed", notes: "Selesai.", createdAt: "2026-07-17", startTime: "08:00", endTime: "09:10", createdByRole: "Admin" },
  { id: "2", title: "Wash mold", description: "Cuci cetakan.", category: "Factory Supervisor", priority: "Medium", assignee: "Ani", deadline: "2026-07-17", status: "Completed", notes: "OK.", createdAt: "2026-07-17" },
];

const sampleStock: StockItem[] = [
  { id: "1", item: "Es kristal", unit: "kg", stock: 150, masuk: 20, keluar: 50, notes: "Aman", updatedAt: "2026-07-18" },
  { id: "2", item: "Kantong", unit: "pcs", stock: 400, masuk: 0, keluar: 60, notes: "Low", updatedAt: "2026-07-18" },
];

const sampleMeetings: Meeting[] = [{ id: "1", title: "Briefing", date: "2026-07-19", time: "07:30", attendees: "Budi, Siti", notes: "Target harian" }];
const sampleMaintenance: MaintenanceItem[] = [{ id: "1", equipment: "Ice Ball Machine", issue: "Noise", technician: "Dedi", status: "In progress", date: "2026-07-18", notes: "Wait part" }];

const formatDate = (d: string) => d ? new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-";
const formatTimeRange = (t: Task) => t.startTime && t.endTime ? `${t.startTime} - ${t.endTime}` : "-";

const getColors = (theme: Theme): Colors => theme === "light"
  ? { page: "#EAF3FC", card: "#FFFFFF", cardMuted: "#F0F7FE", text: "#16324A", muted: "#5B7690", border: "rgba(22,50,74,0.10)", borderStrong: "rgba(22,50,74,0.20)", accent: "#2F7FE0", accentBg: "#DCEBFB", danger: "#B33636" }
  : { page: "#0E1B2B", card: "#152840", cardMuted: "#1B324E", text: "#EAF3FC", muted: "#93AFC9", border: "rgba(234,243,252,0.10)", borderStrong: "rgba(234,243,252,0.20)", accent: "#7DD3FC", accentBg: "#1E3A57", danger: "#E8A0A0" };

const fieldStyle = (c: Colors) => ({ width: "100%", borderRadius: 8, border: `0.5px solid ${c.border}`, padding: "10px 12px", background: c.cardMuted, color: c.text, fontSize: 14, fontFamily: "inherit", boxSizing: "border-box" as const, touchAction: "manipulation" });
const secondaryBtn = (c: Colors) => ({ borderRadius: 8, border: `0.5px solid ${c.borderStrong}`, padding: "10px 14px", background: "transparent", color: c.text, cursor: "pointer", fontSize: 14, touchAction: "manipulation" });
const primaryBtn = (c: Colors) => ({ borderRadius: 8, border: "none", padding: "11px 16px", background: c.accent, color: "#FFFFFF", cursor: "pointer", fontSize: 14, fontWeight: 500, touchAction: "manipulation" });

function LoginScreen({ colors, onLogin, t }: { colors: Colors; onLogin: (u: CurrentUser) => void; t: typeof translations.id }) {
  const [name, setName] = useState(""); const [roleTitle, setRoleTitle] = useState(""); const [role, setRole] = useState<PermissionRole>("Staff"); const [shift, setShift] = useState("Day"); const [err, setErr] = useState("");
  const submit = () => { if (!name.trim()) { setErr(t.nameRequired); return; } setErr(""); onLogin({ name: name.trim(), roleTitle: roleTitle.trim() || "Staff", permissionRole: role, shift }); };
  return (
    <div style={{ minHeight: "100vh", background: colors.page, display: "grid", placeItems: "center", padding: 24, fontFamily: "'Inter', sans-serif" }}>
      <div style={{ width: "100%", maxWidth: 340, background: colors.card, borderRadius: 12, border: `0.5px solid ${colors.border}`, padding: 24 }}>
        <div style={{ fontSize: 12, color: colors.muted }}>{t.loginSubtitle}</div>
        <div style={{ fontSize: 28, fontFamily: "'Bebas Neue', sans-serif", color: colors.accent, marginBottom: 4 }}>{t.loginTitle}</div>
        <div style={{ fontSize: 14, color: colors.muted, marginBottom: 20 }}>{t.loginDesc}</div>
        <div style={{ display: "grid", gap: 12 }}>
          <input value={name} onChange={e => setName(e.target.value)} placeholder={t.loginName} style={fieldStyle(colors)} onKeyDown={e => e.key === "Enter" && submit()} />
          <input value={roleTitle} onChange={e => setRoleTitle(e.target.value)} placeholder={t.loginRole} style={fieldStyle(colors)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <select value={role} onChange={e => setRole(e.target.value as PermissionRole)} style={{ ...fieldStyle(colors), cursor: "pointer" }}><option>Staff</option><option>Admin</option></select>
            <select value={shift} onChange={e => setShift(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{shifts.map(s => <option key={s}>{s}</option>)}</select>
          </div>
          {err && <div style={{ fontSize: 13, color: colors.danger }}>{err}</div>}
          <button onClick={submit} style={primaryBtn(colors)}>{t.loginBtn}</button>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("id");
  const colors = getColors(theme);
  const t = translations[lang];
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [search, setSearch] = useState("");
  const [filterCat, setFilterCat] = useState("All"); const [filterStat, setFilterStat] = useState("All"); const [filterPri, setFilterPri] = useState("All");
  const [taskForm, setTaskForm] = useState<Partial<Task>>({ title: "", description: "", category: "Production", priority: "Medium", assignee: "", deadline: new Date().toISOString().slice(0, 10), status: "Pending", notes: "", startTime: "", endTime: "", reason: "", imageUrl: "" });
  
  const [stockItems, setStockItems] = useState<StockItem[]>(sampleStock);
  const [stockForm, setStockForm] = useState({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "" });
  
  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [meetingForm, setMeetingForm] = useState({ title: "", date: new Date().toISOString().slice(0, 10), time: "", attendees: "", notes: "" });
  const [maintItems, setMaintItems] = useState<MaintenanceItem[]>(sampleMaintenance);
  const [maintForm, setMaintForm] = useState({ equipment: "", issue: "", technician: "", status: "Pending" as TaskStatus, notes: "" });

  // ✅ PERSISTENCE: Load session & data per user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('btice_user');
    if (savedUser) {
      const user = JSON.parse(savedUser);
      setCurrentUser(user);
      setTheme(JSON.parse(localStorage.getItem('btice_theme') || '"light"'));
      setLang(JSON.parse(localStorage.getItem('btice_lang') || '"id"'));
      const savedLogo = localStorage.getItem(`btice_logo_${user.name}`);
      if (savedLogo) setLogoUrl(savedLogo);

      const dataKey = `btice_data_${user.name}`;
      const savedData = localStorage.getItem(dataKey);
      if (savedData) {
        const d = JSON.parse(savedData);
        setTasks(d.tasks || sampleTasks);
        setStockItems(d.stock || sampleStock);
        setMeetings(d.meetings || sampleMeetings);
        setMaintItems(d.maintenance || sampleMaintenance);
      }
    }
  }, []);

  // ✅ PERSISTENCE: Save session & data whenever changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('btice_user', JSON.stringify(currentUser));
      localStorage.setItem('btice_theme', JSON.stringify(theme));
      localStorage.setItem('btice_lang', JSON.stringify(lang));
      if (logoUrl) localStorage.setItem(`btice_logo_${currentUser.name}`, logoUrl);
      const dataKey = `btice_data_${currentUser.name}`;
      localStorage.setItem(dataKey, JSON.stringify({ tasks, stock: stockItems, meetings, maintenance: maintItems }));
    }
  }, [currentUser, theme, lang, logoUrl, tasks, stockItems, meetings, maintItems]);

  const handleLogout = () => {
    localStorage.removeItem('btice_user');
    setCurrentUser(null);
  };

  if (!currentUser) return <LoginScreen colors={colors} t={t} onLogin={u => { setCurrentUser(u); setTaskForm(p => ({ ...p, assignee: u.permissionRole === "Staff" ? u.name : p.assignee })); }} />;

  const filtered = tasks.filter(tk => {
    const s = !search || tk.title.toLowerCase().includes(search.toLowerCase()) || tk.assignee.toLowerCase().includes(search.toLowerCase());
    const c = filterCat === "All" || tk.category === filterCat;
    const st = filterStat === "All" || tk.status === filterStat;
    const p = filterPri === "All" || tk.priority === filterPri;
    const matchesUser = currentUser.permissionRole === "Admin" || tk.assignee === currentUser.name || tk.assignee.trim() === "";
    return s && c && st && p && matchesUser;
  }).sort((a, b) => ({ High: 0, Medium: 1, Low: 2 }[a.priority] - { High: 0, Medium: 1, Low: 2 }[b.priority]));

  const stats = {
    total: filtered.length, completed: filtered.filter(tk => tk.status === "Completed").length,
    inProgress: filtered.filter(tk => tk.status === "In progress").length, pending: filtered.filter(tk => tk.status === "Pending").length,
    cancelled: filtered.filter(tk => tk.status === "Cancelled").length,
  };
  const pct = stats.total ? Math.round((stats.completed / stats.total) * 100) : 0;

  const handleCsvUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        let text = (ev.target?.result as string).replace(/^\uFEFF/, '');
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(l => l);
        if (lines.length < 2) { window.alert("CSV harus memiliki header dan minimal 1 baris data."); return; }
        const parseLine = (line: string): string[] => { const r: string[] = []; let c = ''; let q = false; for (let i = 0; i < line.length; i++) { const ch = line[i]; if (ch === '"') q = !q; else if (ch === ',' && !q) { r.push(c.trim()); c = ''; } else c += ch; } r.push(c.trim()); return r; };
        const headers = parseLine(lines[0]).map(h => h.toLowerCase().replace(/\s+/g, '_'));
        const newTasks: Task[] = [];
        const parseDate = (d: string) => { if (!d) return new Date().toISOString().slice(0, 10); const p = d.split(/[\/\-\.]/); return p.length === 3 ? `${p[2]}-${p[0].padStart(2, '0')}-${p[1].padStart(2, '0')}` : d; };
        for (let i = 1; i < lines.length; i++) {
          const cols = parseLine(lines[i]); if (cols.length < 2) continue;
          const get = (k: string) => { const idx = headers.indexOf(k.toLowerCase().replace(/\s+/g, '_')); return idx >= 0 ? (cols[idx] || '').trim() : ''; };
          newTasks.push({
            id: String(Date.now() + Math.random()), title: (get('title') || `Task ${i}`).replace(/\.$/, '').trim(), description: get('description') || '',
            category: categories.find(c => c.toLowerCase() === get('category').toLowerCase()) || get('category') || 'Others',
            priority: (priorities.find(p => p.toLowerCase() === get('priority').toLowerCase()) || 'High') as Priority,
            assignee: get('assignee') || currentUser.name, deadline: parseDate(get('deadline') || ''),
            status: (statuses.find(s => s.toLowerCase() === get('status').toLowerCase()) || 'Pending') as TaskStatus,
            notes: get('notes') || '', createdAt: new Date().toISOString().slice(0, 10), createdByRole: 'Staff',
            startTime: get('start_time') || '', endTime: get('end_time') || ''
          });
        }
        if (newTasks.length === 0) { window.alert("Tidak ada data valid ditemukan."); return; }
        setTasks(prev => [...newTasks, ...prev]); setSearch(''); setFilterCat('All'); setFilterStat('All'); setFilterPri('All');
        window.alert(`✅ ${newTasks.length} ${t.csvSuccess}`);
      } catch { window.alert(t.csvError); }
    };
    reader.readAsText(file); e.target.value = '';
  };

  const handleTaskPhotoUpload = (e: ChangeEvent<HTMLInputElement>, taskId: string) => {
    const file = e.target.files?.[0]; if (!file) return;
    const reader = new FileReader(); reader.onload = () => { const url = reader.result as string; if (url) setTasks(prev => prev.map(tk => tk.id === taskId ? { ...tk, imageUrl: url } : tk)); }; reader.readAsDataURL(file);
  };

  const handleSaveTask = () => {
    if (!taskForm.title?.trim()) { window.alert(t.alertTitleRequired); return; }
    if (!taskForm.assignee?.trim()) { window.alert(t.alertAssigneeRequired); return; }
    const norm: Task = { id: taskForm.id || String(Date.now()), title: taskForm.title, description: taskForm.description || "", category: taskForm.category || "Production", priority: (taskForm.priority || "Medium") as Priority, assignee: taskForm.assignee, deadline: taskForm.deadline || new Date().toISOString().slice(0, 10), status: (taskForm.status || "Pending") as TaskStatus, notes: taskForm.notes || "", createdAt: taskForm.createdAt || new Date().toISOString().slice(0, 10), createdByRole: taskForm.createdByRole || currentUser.permissionRole, startTime: taskForm.startTime, endTime: taskForm.endTime, reason: taskForm.reason || "", imageUrl: taskForm.imageUrl || "" };
    setTasks(prev => { const exists = prev.some(i => i.id === norm.id); return exists ? prev.map(i => i.id === norm.id ? norm : i) : [norm, ...prev]; });
    setTaskForm({ title: "", description: "", category: "Production", priority: "Medium", assignee: currentUser.permissionRole === "Staff" ? currentUser.name : "", deadline: new Date().toISOString().slice(0, 10), status: "Pending", notes: "", startTime: "", endTime: "", reason: "", imageUrl: "" });
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: 16, transition: "background 0.2s, color 0.2s" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');
        .grid-main { display: grid; gap: 16px; }
        @media (max-width: 768px) {
          .grid-main { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .header-row { flex-direction: column; align-items: flex-start !important; gap: 12px !important; }
          .nav-select { width: 100% !important; max-width: 100% !important; }
          .task-actions { flex-direction: column !important; width: 100%; }
          .form-grid { grid-template-columns: 1fr !important; }
          .stock-form-grid { grid-template-columns: 1fr !important; }
        }
        input[type="number"] { -moz-appearance: textfield; }
        input[type="number"]::-webkit-outer-spin-button, input[type="number"]::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
      `}</style>

      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, background: colors.card, borderRadius: 12, border: `0.5px solid ${colors.border}`, padding: "14px 16px" }} className="header-row">
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: colors.accentBg, color: colors.accent, display: "grid", placeItems: "center", fontSize: 18, fontWeight: 600, overflow: "hidden" }}>
                {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "🧊"}
              </div>
              <label title={t.logoUpload} style={{ position: "absolute", bottom: -3, right: -3, width: 18, height: 18, borderRadius: "50%", background: colors.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 11, cursor: "pointer", border: `2px solid ${colors.card}` }}>
                + <input type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){const r=new FileReader();r.onload=()=>setLogoUrl(r.result as string);r.readAsDataURL(f)}}} style={{ display: "none" }} />
              </label>
            </div>
            <div>
              <div style={{ fontSize: 11, color: colors.muted, letterSpacing: 0.5 }}>{t.subtitle}</div>
              <div style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", color: colors.accent, lineHeight: 1 }}>{t.loginTitle}</div>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: colors.muted, fontWeight: 500 }}>{currentUser.name} · {currentUser.roleTitle}</span>
            <button onClick={() => setLang(l => l === "id" ? "en" : "id")} style={secondaryBtn(colors)}>{lang === "id" ? "EN" : "ID"}</button>
            <button onClick={() => setTheme(th => th === "light" ? "dark" : "light")} style={secondaryBtn(colors)}>{theme === "light" ? t.darkMode : t.lightMode}</button>
            <button onClick={handleLogout} style={secondaryBtn(colors)}>{t.logout}</button>
          </div>
        </header>

        <div className="nav-select">
          <select value={activeTab} onChange={(e) => setActiveTab(e.target.value as Tab)} style={{ ...fieldStyle(colors), maxWidth: 280, cursor: "pointer", fontWeight: 500 }}>
            <option value="tasks">{t.tasks}</option><option value="stock">{t.stock}</option><option value="meeting">{t.meeting}</option><option value="maintenance">{t.maintenance}</option>
          </select>
        </div>

        <main className="grid-main">
          {activeTab === "tasks" && <>
            <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1.6fr 1fr" }} className="grid-main">
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
                <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 12 }}>{t.progress}</div>
                <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(100px, 1fr))", gap: 10, marginBottom: 16 }}>
                  {[{ l: t.completed, v: stats.completed, c: "#0c4a8c" }, { l: t.inProgress, v: stats.inProgress, c: "#1d4ed8" }, { l: t.pendingTasks, v: stats.pending, c: "#5b6b82" }, { l: t.cancelled, v: stats.cancelled, c: "#a12626" }].map(s => (
                    <div key={s.l} style={{ background: colors.cardMuted, padding: 10, borderRadius: 8, textAlign: "center" }}>
                      <div style={{ fontSize: 12, color: colors.muted }}>{s.l}</div><div style={{ fontSize: 20, fontWeight: 600, color: s.c }}>{s.v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 8, background: colors.cardMuted, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${pct}%`, height: "100%", background: `linear-gradient(90deg, ${colors.accent}, ${colors.accent}90)` }} />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{t.completionRate}: {pct}%</div>
                </div>
              </div>
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <span style={{ fontSize: 13, color: colors.muted }}>{t.shareDescription}</span>
                <button onClick={() => {
                  const lines = ["📋 DAILY REPORT", `👤 ${currentUser.name}`, `📊 Done: ${stats.completed}/${stats.total} (${pct}%)`, "━━━━━━━━━", ...filtered.filter(tk => tk.status === "Completed").map(tk => `✅ ${tk.title}`), ...filtered.filter(tk => tk.status !== "Completed").map(tk => `⏳ ${tk.title}`)].join("\n");
                  window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
                }} style={primaryBtn(colors)}>Share WA</button>
              </div>
            </div>

            <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }} className="grid-main">
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
                <div className="form-grid" style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", marginBottom: 14 }}>
                  <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t.searchPlaceholder} style={{ ...fieldStyle(colors), gridColumn: "span 2" }} />
                  <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}><option>{t.all}</option>{categories.map(c => <option key={c}>{c}</option>)}</select>
                  <select value={filterStat} onChange={e => setFilterStat(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}><option>{t.all}</option>{statuses.map(s => <option key={s}>{s}</option>)}</select>
                  <select value={filterPri} onChange={e => setFilterPri(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}><option>{t.all}</option>{priorities.map(p => <option key={p}>{p}</option>)}</select>
                </div>
                <div style={{ display: "grid", gap: 12 }}>
                  {filtered.map(tk => {
                    const badge = statusStyles[tk.status];
                    return (
                      <div key={tk.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                          <div><div style={{ fontSize: 15, fontWeight: 600 }}>{tk.title}</div><div style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>{tk.category} · {tk.priority} · {tk.assignee}</div></div>
                          <span style={{ color: badge.text, background: badge.bg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 500, height: "fit-content" }}>{tk.status}</span>
                        </div>
                        {tk.imageUrl && <img src={tk.imageUrl} alt="Task" style={{ maxWidth: 120, marginTop: 10, borderRadius: 6, objectFit: "cover" }} />}
                        <div style={{ marginTop: 10, color: colors.muted, fontSize: 13 }}>{tk.description}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10, fontSize: 12, color: colors.muted }}>
                          <span>{t.deadline}: {formatDate(tk.deadline)}</span><span>{t.time}: {formatTimeRange(tk)}</span>
                        </div>
                        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }} className="task-actions">
                          <button onClick={() => setTasks(p => p.map(i => i.id === tk.id ? { ...i, status: i.status === "Completed" ? "In progress" : "Completed" } : i))} style={primaryBtn(colors)}>{tk.status === "Completed" ? t.undo : t.checklist}</button>
                          <button onClick={() => setTaskForm(tk)} style={secondaryBtn(colors)}>{t.edit}</button>
                          <input id={`file-upload-${tk.id}`} type="file" accept="image/*" onChange={(e) => handleTaskPhotoUpload(e, tk.id)} style={{ display: "none" }} />
                          <button onClick={() => (document.getElementById(`file-upload-${tk.id}`) as HTMLInputElement)?.click()} style={secondaryBtn(colors)}>{t.uploadPhoto}</button>
                          <button onClick={() => setTasks(p => p.filter(i => i.id !== tk.id))} style={{ ...secondaryBtn(colors), color: colors.danger, borderColor: colors.danger }}>{t.delete}</button>
                        </div>
                        <textarea value={tk.notes} onChange={e => setTasks(p => p.map(i => i.id === tk.id ? { ...i, notes: e.target.value } : i))} placeholder={t.addNote} style={{ ...fieldStyle(colors), minHeight: 50, resize: "vertical", marginTop: 10, background: colors.card }} />
                      </div>
                    );
                  })}
                  {filtered.length === 0 && <div style={{ padding: "20px 0", color: colors.muted, textAlign: "center" }}>{t.noTasks}</div>}
                </div>
              </div>

              <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 12, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 600 }}>{t.taskFormTitle}</div>
                <div style={{ color: colors.muted, fontSize: 12, marginTop: -8 }}>{t.adminStaffNote}</div>
                <input value={taskForm.title} onChange={e => setTaskForm(p => ({ ...p, title: e.target.value }))} placeholder={t.titlePlaceholder} style={fieldStyle(colors)} />
                <textarea value={taskForm.description} onChange={e => setTaskForm(p => ({ ...p, description: e.target.value }))} placeholder={t.descriptionPlaceholder} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
                <select value={taskForm.category} onChange={e => setTaskForm(p => ({ ...p, category: e.target.value }))} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{categories.map(c => <option key={c}>{c}</option>)}</select>
                <select value={taskForm.priority} onChange={e => setTaskForm(p => ({ ...p, priority: e.target.value as Priority }))} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{priorities.map(p => <option key={p}>{p}</option>)}</select>
                <input value={taskForm.assignee} onChange={e => setTaskForm(p => ({ ...p, assignee: e.target.value }))} placeholder={t.assigneePlaceholder} style={fieldStyle(colors)} disabled={currentUser.permissionRole === "Staff"} />
                <input value={taskForm.deadline} onChange={e => setTaskForm(p => ({ ...p, deadline: e.target.value }))} type="date" style={{ ...fieldStyle(colors), cursor: "pointer" }} />
                <select value={taskForm.status} onChange={e => setTaskForm(p => ({ ...p, status: e.target.value as TaskStatus }))} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{statuses.map(s => <option key={s}>{s}</option>)}</select>
                <textarea value={taskForm.notes} onChange={e => setTaskForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.notesPlaceholder} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
                <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <input type="time" value={taskForm.startTime || ""} onChange={e => setTaskForm(p => ({ ...p, startTime: e.target.value }))} style={fieldStyle(colors)} />
                  <input type="time" value={taskForm.endTime || ""} onChange={e => setTaskForm(p => ({ ...p, endTime: e.target.value }))} style={fieldStyle(colors)} />
                </div>
                <textarea value={taskForm.reason} onChange={e => setTaskForm(p => ({ ...p, reason: e.target.value }))} placeholder={t.reasonPlaceholder} style={{ ...fieldStyle(colors), minHeight: 50, resize: "vertical" }} />
                <div style={{ display: "flex", gap: 10 }}>
                  <input id="upload-task-form" type="file" accept="image/*" onChange={e => { const f = e.target.files?.[0]; if(f){const r=new FileReader();r.onload=()=>setTaskForm(p=>({...p,imageUrl:r.result as string}));r.readAsDataURL(f)}}} style={{ display: "none" }} />
                  <label style={{ ...secondaryBtn(colors), cursor: "pointer", flex: 1, display: "grid", placeItems: "center" }}><span onClick={() => (document.getElementById("upload-task-form") as HTMLInputElement)?.click()}>{t.uploadPhoto}</span></label>
                  <label style={{ ...secondaryBtn(colors), cursor: "pointer", flex: 1, display: "grid", placeItems: "center" }}><input type="file" accept=".csv" onChange={handleCsvUpload} style={{ display: "none" }} />{t.importCsv}</label>
                </div>
                <button onClick={handleSaveTask} style={primaryBtn(colors)}>{taskForm.id ? t.saveChanges : t.addTask}</button>
              </aside>
            </div>
          </>}

          {activeTab === "stock" && <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }} className="grid-main">
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.stockTitle}</div>
              <div style={{ display: "grid", gap: 12 }}>
                {stockItems.map(s => {
                  const remain = s.stock - s.keluar + s.masuk;
                  return (
                    <div key={s.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                        <div><div style={{ fontSize: 15, fontWeight: 600 }}>{s.item}</div><div style={{ fontSize: 12, color: colors.muted }}>{t.updateLast}: {formatDate(s.updatedAt)}</div></div>
                        <div style={{ fontSize: 16, fontWeight: 700, color: colors.accent }}>{t.currentStock}: {remain} {s.unit}</div>
                      </div>
                      {s.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 8 }}>{s.notes}</div>}
                      <button onClick={() => setStockItems(p => p.filter(i => i.id !== s.id))} style={{ ...secondaryBtn(colors), color: colors.danger, borderColor: colors.danger, marginTop: 12 }}>{t.deleteItem}</button>
                    </div>
                  );
                })}
                {stockItems.length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noStock}</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 12, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.addNewItem}</div>
              <input value={stockForm.item} onChange={e => setStockForm(p => ({ ...p, item: e.target.value }))} placeholder={t.itemName} style={fieldStyle(colors)} />
              <div className="stock-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
                <input value={stockForm.stock} onChange={e => setStockForm(p => ({ ...p, stock: e.target.value }))} placeholder={t.initialStock} type="number" inputMode="numeric" style={fieldStyle(colors)} />
                <input value={stockForm.masuk} onChange={e => setStockForm(p => ({ ...p, masuk: e.target.value }))} placeholder={t.incoming} type="number" inputMode="numeric" style={fieldStyle(colors)} />
                <input value={stockForm.keluar} onChange={e => setStockForm(p => ({ ...p, keluar: e.target.value }))} placeholder={t.outgoing} type="number" inputMode="numeric" style={fieldStyle(colors)} />
              </div>
              <input value={stockForm.unit} onChange={e => setStockForm(p => ({ ...p, unit: e.target.value }))} placeholder="Unit (pcs/kg/dll)" style={fieldStyle(colors)} />
              <textarea value={stockForm.notes} onChange={e => setStockForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.notesPlaceholder} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <button onClick={() => {
                if (!stockForm.item.trim()) { window.alert(t.alertTitleRequired); return; }
                setStockItems(p => [{ id: String(Date.now()), item: stockForm.item, unit: stockForm.unit, stock: Number(stockForm.stock) || 0, masuk: Number(stockForm.masuk) || 0, keluar: Number(stockForm.keluar) || 0, notes: stockForm.notes, updatedAt: new Date().toISOString().slice(0, 10) }, ...p]);
                setStockForm({ item: "", unit: "", stock: "", masuk: "", keluar: "", notes: "" });
              }} style={primaryBtn(colors)}>{t.addNewItem}</button>
            </aside>
          </div>}

          {activeTab === "meeting" && <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }} className="grid-main">
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.meetingTitle}</div>
              <div style={{ display: "grid", gap: 12 }}>
                {meetings.map(m => (
                  <div key={m.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{formatDate(m.date)} · {m.time || "-"}</div>
                    <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{t.attendees}: {m.attendees || "-"}</div>
                    {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                    <button onClick={() => setMeetings(p => p.filter(x => x.id !== m.id))} style={{ ...secondaryBtn(colors), color: colors.danger, borderColor: colors.danger, marginTop: 10 }}>{t.delete}</button>
                  </div>
                ))}
                {meetings.length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMeeting}</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 12, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.scheduleMeeting}</div>
              <input value={meetingForm.title} onChange={e => setMeetingForm(p => ({ ...p, title: e.target.value }))} placeholder={t.meetingName} style={fieldStyle(colors)} />
              <div className="form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <input value={meetingForm.date} onChange={e => setMeetingForm(p => ({ ...p, date: e.target.value }))} type="date" style={fieldStyle(colors)} />
                <input value={meetingForm.time} onChange={e => setMeetingForm(p => ({ ...p, time: e.target.value }))} type="time" style={fieldStyle(colors)} />
              </div>
              <input value={meetingForm.attendees} onChange={e => setMeetingForm(p => ({ ...p, attendees: e.target.value }))} placeholder={t.attendeesInput} style={fieldStyle(colors)} />
              <textarea value={meetingForm.notes} onChange={e => setMeetingForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.agenda} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <button onClick={() => { if (!meetingForm.title.trim()) { window.alert(t.alertTitleRequired); return; } setMeetings(p => [{ id: String(Date.now()), ...meetingForm }, ...p]); setMeetingForm({ title: "", date: new Date().toISOString().slice(0, 10), time: "", attendees: "", notes: "" }); }} style={primaryBtn(colors)}>{t.addMeeting}</button>
            </aside>
          </div>}

          {activeTab === "maintenance" && <div style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }} className="grid-main">
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 14 }}>{t.maintTitle}</div>
              <div style={{ display: "grid", gap: 12 }}>
                {maintItems.map(m => {
                  const badge = statusStyles[m.status];
                  return (
                    <div key={m.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                      <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{m.equipment}</div>
                        <span style={{ color: badge.text, background: badge.bg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 500 }}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.issue}</div>
                      <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{t.techName}: {m.technician || "-"} · {formatDate(m.date)}</div>
                      {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                      <button onClick={() => setMaintItems(p => p.filter(x => x.id !== m.id))} style={{ ...secondaryBtn(colors), color: colors.danger, borderColor: colors.danger, marginTop: 10 }}>{t.delete}</button>
                    </div>
                  );
                })}
                {maintItems.length === 0 && <div style={{ color: colors.muted, textAlign: "center", padding: 20 }}>{t.noMaint}</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 12, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>{t.addMaint}</div>
              <input value={maintForm.equipment} onChange={e => setMaintForm(p => ({ ...p, equipment: e.target.value }))} placeholder={t.equipName} style={fieldStyle(colors)} />
              <textarea value={maintForm.issue} onChange={e => setMaintForm(p => ({ ...p, issue: e.target.value }))} placeholder={t.issueDesc} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <input value={maintForm.technician} onChange={e => setMaintForm(p => ({ ...p, technician: e.target.value }))} placeholder={t.techName} style={fieldStyle(colors)} />
              <select value={maintForm.status} onChange={e => setMaintForm(p => ({ ...p, status: e.target.value as TaskStatus }))} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{statuses.map(s => <option key={s}>{s}</option>)}</select>
              <textarea value={maintForm.notes} onChange={e => setMaintForm(p => ({ ...p, notes: e.target.value }))} placeholder={t.maintNotes} style={{ ...fieldStyle(colors), minHeight: 50, resize: "vertical" }} />
              <button onClick={() => { if (!maintForm.equipment.trim()) { window.alert(t.alertTitleRequired); return; } setMaintItems(p => [{ id: String(Date.now()), ...maintForm, date: new Date().toISOString().slice(0, 10) }, ...p]); setMaintForm({ equipment: "", issue: "", technician: "", status: "Pending", notes: "" }); }} style={primaryBtn(colors)}>{t.addMaintBtn}</button>
            </aside>
          </div>}
        </main>
      </div>
    </div>
  );
}