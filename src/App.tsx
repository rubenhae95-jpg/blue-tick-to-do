import { useState, type ChangeEvent } from "react";

type PermissionRole = "Admin" | "Staff";
type TaskStatus = "Pending" | "In progress" | "Completed" | "Cancelled";
type Priority = "High" | "Medium" | "Low";
type Theme = "light" | "dark";
type Tab = "tasks" | "stock" | "meeting" | "maintenance";

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
  "Production", "Delivery", "Cleaning", "Maintenance",
  "Office", "Warehouse", "Administration", "Others",
];
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: TaskStatus[] = ["Pending", "In progress", "Completed", "Cancelled"];
const shifts: string[] = ["Day", "Night"];

const statusStyles: Record<TaskStatus, { bg: string; text: string }> = {
  Pending: { bg: "#eef2f8", text: "#5b6b82" },
  "In progress": { bg: "#dbeafe", text: "#1d4ed8" },
  Completed: { bg: "#dcecff", text: "#0c4a8c" },
  Cancelled: { bg: "#fde8e8", text: "#a12626" },
};

const t = {
  darkMode: "Mode gelap",
  lightMode: "Mode terang",
  totalTasks: "Total tugas",
  completed: "Selesai",
  remaining: "Belum selesai",
  pending: "Pending",
  shareDescription: "Bagikan laporan harian kamu ke WhatsApp.",
  taskFormTitle: "Tambah atau edit task",
  adminStaffNote: "Admin dan staff dapat membuat task. Edit dan hapus hanya untuk admin.",
  titlePlaceholder: "Judul tugas",
  descriptionPlaceholder: "Deskripsi tugas",
  assigneePlaceholder: "Penanggung jawab",
  notesPlaceholder: "Catatan internal",
  reasonPlaceholder: "Alasan jika pending atau in progress",
  saveChanges: "Simpan perubahan",
  addTask: "Tambah task",
  alertTitleRequired: "Judul tugas wajib diisi.",
  alertAssigneeRequired: "Penanggung jawab wajib diisi.",
  taskCreatedByRole: "tugas dibuat oleh",
  limitReached: "Batas tercapai untuk menambah tugas baru.",
  canAddTask: "Peran ini dapat membuat task baru.",
};

const sampleTasks: Task[] = [
  { id: "1", title: "Clean machine", description: "Bersihkan mesin utama agar siap digunakan.", category: "Production", priority: "High", assignee: "Budi", deadline: "2026-07-17", status: "Completed", notes: "Selesai pagi ini.", createdAt: "2026-07-17", startTime: "08:00", endTime: "09:10", createdByRole: "Admin" },
  { id: "2", title: "Wash mold", description: "Cuci cetakan setelah produksi.", category: "Maintenance", priority: "Medium", assignee: "Ani", deadline: "2026-07-17", status: "Completed", notes: "Tidak ada masalah.", createdAt: "2026-07-17" },
  { id: "3", title: "Prepare delivery", description: "Siapkan barang dan dokumen pengiriman.", category: "Delivery", priority: "High", assignee: "Siti", deadline: "2026-07-17", status: "In progress", notes: "Menunggu armada.", startTime: "10:00", endTime: "12:30", reason: "Tim produksi belum siap mengangkut.", createdAt: "2026-07-17" },
  { id: "4", title: "Check water pump", description: "Periksa pompa air area produksi.", category: "Maintenance", priority: "Low", assignee: "Dedi", deadline: "2026-07-18", status: "Pending", notes: "Belum dilakukan.", createdAt: "2026-07-17", createdByRole: "Admin" },
  { id: "5", title: "Maintenance Updated and Planning", description: "Update rencana maintenance mingguan.", category: "Maintenance", priority: "Medium", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Jadwal minggu depan sudah disusun.", createdAt: "2026-07-18", endTime: "13:59" },
  { id: "6", title: "Bike Delivery", description: "Antar pesanan menggunakan motor.", category: "Delivery", priority: "Medium", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Semua pesanan sampai tepat waktu.", createdAt: "2026-07-18", endTime: "12:03" },
  { id: "7", title: "Factory Cleaning", description: "Bersihkan area pabrik.", category: "Cleaning", priority: "Low", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Area produksi dan gudang sudah rapi.", createdAt: "2026-07-18", endTime: "12:03" },
  { id: "8", title: "Cocktails Ice Prep", description: "Siapkan es untuk kebutuhan cocktail.", category: "Production", priority: "High", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Stok es siap untuk shift malam.", createdAt: "2026-07-18", endTime: "13:53" },
  { id: "9", title: "Helping Organize Melting Bags", description: "Bantu menyusun kantong es yang meleleh.", category: "Warehouse", priority: "Low", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Sudah dipisahkan sesuai kondisi.", createdAt: "2026-07-18", endTime: "13:59" },
  { id: "10", title: "Ice Ball Harvest & Production", description: "Panen dan produksi ice ball.", category: "Production", priority: "High", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Pending", notes: "", reason: "Still Watery", createdAt: "2026-07-18" },
];

const sampleStock: StockItem[] = [
  { id: "1", item: "Es batu kristal", unit: "kg", stock: 120, notes: "Stok aman", updatedAt: "2026-07-18" },
  { id: "2", item: "Kantong es", unit: "pcs", stock: 340, notes: "Perlu tambah minggu depan", updatedAt: "2026-07-18" },
  { id: "3", item: "Sirup cocktail", unit: "botol", stock: 18, notes: "", updatedAt: "2026-07-17" },
];

const sampleMeetings: Meeting[] = [
  { id: "1", title: "Briefing produksi harian", date: "2026-07-19", time: "07:30", attendees: "Ruben Hina, Budi, Siti", notes: "Bahas target produksi hari ini." },
];

const sampleMaintenance: MaintenanceItem[] = [
  { id: "1", equipment: "Mesin ice ball", issue: "Suara berisik saat beroperasi", technician: "Dedi", status: "In progress", date: "2026-07-18", notes: "Menunggu spare part." },
];

const formatDate = (dateString: string): string => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
};

const formatDateShort = (date: Date): string =>
  date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const formatTimeRange = (task: Task): string => {
  if (!task.startTime && !task.endTime) return "";
  return `${task.startTime || "-"} - ${task.endTime || "-"}`;
};

const getTaskDuration = (task: Task): string => {
  if (!task.startTime || !task.endTime) return "";
  const [startHour, startMinute] = task.startTime.split(":").map(Number);
  const [endHour, endMinute] = task.endTime.split(":").map(Number);
  const startMinutes = startHour * 60 + startMinute;
  const endMinutes = endHour * 60 + endMinute;
  if (isNaN(startMinutes) || isNaN(endMinutes) || endMinutes < startMinutes) return "";
  const diff = endMinutes - startMinutes;
  const hours = Math.floor(diff / 60);
  const minutes = diff % 60;
  return `${hours ? `${hours}j` : ""}${hours && minutes ? " " : ""}${minutes ? `${minutes}m` : ""}`.trim();
};

const getColors = (theme: Theme): Colors =>
  theme === "light"
    ? {
        page: "#EAF3FC", card: "#FFFFFF", cardMuted: "#F0F7FE", text: "#16324A", muted: "#5B7690",
        border: "rgba(22,50,74,0.10)", borderStrong: "rgba(22,50,74,0.20)", accent: "#2F7FE0", accentBg: "#DCEBFB", danger: "#B33636",
      }
    : {
        page: "#0E1B2B", card: "#152840", cardMuted: "#1B324E", text: "#EAF3FC", muted: "#93AFC9",
        border: "rgba(234,243,252,0.10)", borderStrong: "rgba(234,243,252,0.20)", accent: "#7DD3FC", accentBg: "#1E3A57", danger: "#E8A0A0",
      };

const fieldStyle = (colors: Colors): React.CSSProperties => ({
  width: "100%", borderRadius: 8, border: `0.5px solid ${colors.border}`, padding: "8px 11px",
  background: colors.cardMuted, color: colors.text, fontSize: 13.5, fontFamily: "inherit", boxSizing: "border-box",
});

const secondaryButton = (colors: Colors): React.CSSProperties => ({
  borderRadius: 8, border: `0.5px solid ${colors.borderStrong}`, padding: "8px 13px",
  background: "transparent", color: colors.text, cursor: "pointer", fontSize: 13.5,
});

const primaryButton = (colors: Colors): React.CSSProperties => ({
  borderRadius: 8, border: "none", padding: "9px 15px", background: colors.accent,
  color: "#FFFFFF", cursor: "pointer", fontSize: 13.5,
});

const tabButton = (colors: Colors, active: boolean): React.CSSProperties => ({
  borderRadius: 8, border: active ? "none" : `0.5px solid ${colors.borderStrong}`, padding: "7px 13px",
  background: active ? colors.accent : "transparent", color: active ? "#FFFFFF" : colors.text,
  cursor: "pointer", fontSize: 13.5,
});

function LoginScreen({ colors, onLogin }: { colors: Colors; onLogin: (user: CurrentUser) => void }) {
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [permissionRole, setPermissionRole] = useState<PermissionRole>("Staff");
  const [shift, setShift] = useState("Day");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) { setError("Nama wajib diisi."); return; }
    setError("");
    onLogin({ name: name.trim(), roleTitle: roleTitle.trim() || "Staff", permissionRole, shift });
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, display: "grid", placeItems: "center", padding: 24, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: 320, background: colors.card, borderRadius: 12, border: `0.5px solid ${colors.border}`, padding: 24 }}>
        <div style={{ fontSize: 26, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700, letterSpacing: "0.04em", color: colors.accent, marginBottom: 4 }}>BLUE TICK ICE</div>
        <div style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>Masuk dengan nama kamu untuk mulai</div>
        <div style={{ display: "grid", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nama" style={fieldStyle(colors)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder="Jabatan (contoh: Factory Supervisor)" style={fieldStyle(colors)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={permissionRole} onChange={(e) => setPermissionRole(e.target.value as PermissionRole)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
            <select value={shift} onChange={(e) => setShift(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
              {shifts.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {error && <div style={{ fontSize: 12, color: colors.danger }}>{error}</div>}
          <button onClick={submit} style={primaryButton(colors)}>Masuk</button>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, lineHeight: 1.6 }}>Ini identitas untuk pratinjau saja — tidak ada verifikasi password.</div>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const colors = getColors(theme);
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: "", description: "", category: "Production", priority: "Medium", assignee: "",
    deadline: new Date().toISOString().slice(0, 10), status: "Pending", notes: "",
    startTime: "", endTime: "", reason: "",
  });

  const [stockItems, setStockItems] = useState<StockItem[]>(sampleStock);
  const [stockForm, setStockForm] = useState({ item: "", unit: "", stock: "", notes: "" });

  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [meetingForm, setMeetingForm] = useState({ title: "", date: new Date().toISOString().slice(0, 10), time: "", attendees: "", notes: "" });

  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(sampleMaintenance);
  const [maintenanceForm, setMaintenanceForm] = useState({ equipment: "", issue: "", technician: "", status: "Pending" as TaskStatus, notes: "" });

  if (!currentUser) {
    return (
      <LoginScreen colors={colors} onLogin={(user) => {
        setCurrentUser(user);
        setTaskForm((prev) => ({ ...prev, assignee: user.permissionRole === "Staff" ? user.name : prev.assignee }));
      }} />
    );
  }

  const role = currentUser.permissionRole;

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch = !search || task.title.toLowerCase().includes(search.toLowerCase()) || task.description.toLowerCase().includes(search.toLowerCase()) || task.assignee.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = filterCategory === "All" || task.category === filterCategory;
      const matchesStatus = filterStatus === "All" || task.status === filterStatus;
      const matchesPriority = filterPriority === "All" || task.priority === filterPriority;
      const matchesUser = role === "Admin" || task.assignee === currentUser.name;
      return matchesSearch && matchesCategory && matchesStatus && matchesPriority && matchesUser;
    })
    .sort((a, b) => {
      const order: Record<Priority, number> = { High: 0, Medium: 1, Low: 2 };
      return order[a.priority] - order[b.priority];
    });

  const totalCount = filteredTasks.length;
  const completedCount = filteredTasks.filter((task) => task.status === "Completed").length;
  const pendingCount = filteredTasks.filter((task) => task.status === "Pending").length;
  const remainingCount = filteredTasks.filter((task) => task.status !== "Completed" && task.status !== "Cancelled").length;
  const taskLimit = 50;
  const roleTaskCount = tasks.filter((task) => task.createdByRole === role).length;
  const taskLimitReached = roleTaskCount >= taskLimit;
  const completionPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleFormChange = (field: keyof Task, value: string) => setTaskForm((prev) => ({ ...prev, [field]: value }));

  const handleSaveTask = () => {
    if (!taskForm.title?.trim()) { window.alert(t.alertTitleRequired); return; }
    if (!taskForm.assignee?.trim()) { window.alert(t.alertAssigneeRequired); return; }
    const isNew = !taskForm.id;
    if (isNew && taskLimitReached) { window.alert(`Batas ${taskLimit} tugas untuk peran ${role} telah tercapai.`); return; }
    if (!isNew && role !== "Admin") { window.alert("Edit tugas hanya diperbolehkan oleh admin."); return; }

    const normalizedTask: Task = {
      id: taskForm.id || String(Date.now()),
      title: taskForm.title, description: taskForm.description || "", category: taskForm.category || "Production",
      priority: (taskForm.priority || "Medium") as Priority, assignee: taskForm.assignee,
      deadline: taskForm.deadline || new Date().toISOString().slice(0, 10), status: (taskForm.status || "Pending") as TaskStatus,
      notes: taskForm.notes || "", createdAt: taskForm.createdAt || new Date().toISOString().slice(0, 10),
      createdByRole: taskForm.createdByRole || role, startTime: taskForm.startTime, endTime: taskForm.endTime, reason: taskForm.reason || "",
    };

    setTasks((prev) => {
      const exists = prev.some((item) => item.id === normalizedTask.id);
      if (exists) return prev.map((item) => (item.id === normalizedTask.id ? normalizedTask : item));
      return [normalizedTask, ...prev];
    });

    setTaskForm({
      title: "", description: "", category: "Production", priority: "Medium",
      assignee: role === "Staff" ? currentUser.name : "", deadline: new Date().toISOString().slice(0, 10),
      status: "Pending", notes: "", startTime: "", endTime: "", reason: "",
    });
  };

  const handleEditTask = (task: Task) => setTaskForm(task);
  const handleDeleteTask = (id: string) => setTasks((prev) => prev.filter((task) => task.id !== id));

  const handleStatusToggle = (task: Task) => {
    if (role === "Staff" && task.assignee === currentUser.name) {
      setTasks((prev) => prev.map((item) => item.id === task.id ? { ...item, status: item.status === "Completed" ? "In progress" : "Completed" } : item));
    }
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (typeof reader.result === "string") setLogoUrl(reader.result); };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => setLogoUrl(null);

  const updateStock = (id: string, nextStock: number) => {
    setStockItems((prev) => prev.map((item) => (item.id === id ? { ...item, stock: nextStock, updatedAt: new Date().toISOString().slice(0, 10) } : item)));
  };

  const shareWhatsApp = () => {
    const userTasks = tasks.filter((task) => task.assignee === currentUser.name);
    const completedTasks = userTasks.filter((task) => task.status === "Completed");
    const pendingTasks = userTasks.filter((task) => task.status === "Pending" || task.status === "In progress");
    const assigned = userTasks.length;
    const completed = completedTasks.length;
    const pending = pendingTasks.length;
    const rate = assigned ? Math.round((completed / assigned) * 100) : 0;

    const now = new Date();
    const divider = "━━━━━━━━━━━━━━━━━━";

    const completedLines = completedTasks.flatMap((task, index) => {
      const time = task.endTime || task.startTime || "-";
      const lines = [`${index + 1}. ${task.title} 🕒 ✓ ${time}`];
      if (task.notes) lines.push(`   📝 ${task.notes}`);
      return lines;
    });

    const pendingLines = pendingTasks.flatMap((task) => {
      const lines = [`• ${task.title}`];
      if (task.reason) lines.push(`  Reason: ${task.reason}`);
      return lines;
    });

    const lines = [
      "📋 DAILY TASK REPORT", `👤 Employee : ${currentUser.name.toUpperCase()}`, `💼 Role : ${currentUser.roleTitle}`,
      `🕒 Shift : ${currentUser.shift}`, `📅 Date : ${formatDateShort(now)}`, divider, "📊 TASK SUMMARY",
      `📌 Assigned : ${assigned}`, `✅ Completed : ${completed}`, `⏳ Pending : ${pending}`, `📈 Completion Rate : ${rate}%`,
      divider, "✅ COMPLETED TASKS", ...(completedLines.length ? completedLines : ["-"]), divider,
      "⏳ PENDING TASKS", ...(pendingLines.length ? pendingLines : ["-"]), divider,
      `📤 Submitted by: ${currentUser.name.toUpperCase()}`,
      `🕒 Submitted: ${formatDateShort(now)} | ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    ].join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: 20, transition: "background 0.2s, color 0.2s" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>

      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 16 }}>
        <header style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, background: colors.card, borderRadius: 12, border: `0.5px solid ${colors.border}`, padding: "12px 16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: colors.accentBg, color: colors.accent, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 500, overflow: "hidden" }}>
                {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "✓"}
              </div>
              <label title="Ganti logo" style={{ position: "absolute", bottom: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: colors.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 10, cursor: "pointer", border: `2px solid ${colors.card}` }}>
                +
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </label>
            </div>
            <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700, letterSpacing: "0.04em", color: colors.accent, lineHeight: 1 }}>BLUE TICK ICE</div>
            {logoUrl && <button onClick={handleResetLogo} style={{ ...secondaryButton(colors), padding: "5px 10px", fontSize: 12 }}>Reset logo</button>}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 13, color: colors.muted }}>{currentUser.name} · {currentUser.roleTitle}</div>
            <button onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))} style={secondaryButton(colors)}>
              {theme === "light" ? t.darkMode : t.lightMode}
            </button>
            <button onClick={() => setCurrentUser(null)} style={secondaryButton(colors)}>Keluar</button>
          </div>
        </header>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {([["tasks", "Tasks"], ["stock", "Stok opname"], ["meeting", "Meeting"], ["maintenance", "Maintenance"]] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={tabButton(colors, activeTab === key)}>{label}</button>
          ))}
        </div>

        {activeTab === "tasks" && (
          <>
            <section style={{ display: "grid", gap: 12, gridTemplateColumns: "1.6fr 1fr" }}>
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 24 }}>
                <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div><div style={{ fontSize: 12, color: colors.muted }}>{t.totalTasks}</div><div style={{ fontSize: 18, fontWeight: 500 }}>{totalCount}</div></div>
                  <div><div style={{ fontSize: 12, color: colors.muted }}>{t.completed}</div><div style={{ fontSize: 18, fontWeight: 500 }}>{completedCount}</div></div>
                  <div><div style={{ fontSize: 12, color: colors.muted }}>{t.remaining}</div><div style={{ fontSize: 18, fontWeight: 500 }}>{remainingCount}</div></div>
                  <div><div style={{ fontSize: 12, color: colors.muted }}>{t.pending}</div><div style={{ fontSize: 18, fontWeight: 500 }}>{pendingCount}</div></div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.muted, marginBottom: 4 }}><span>Progress</span><span>{completionPercent}%</span></div>
                  <div style={{ height: 6, background: colors.cardMuted, borderRadius: 999, overflow: "hidden" }}><div style={{ width: `${completionPercent}%`, height: "100%", background: colors.accent }} /></div>
                </div>
              </div>
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontSize: 13, color: colors.muted }}>{t.shareDescription}</div>
                <button onClick={shareWhatsApp} style={primaryButton(colors)}>Share WhatsApp</button>
              </div>
            </section>

            <section style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
                <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginBottom: 14 }}>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari tugas" style={{ ...fieldStyle(colors), gridColumn: "span 2" }} />
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}><option>All</option>{categories.map((c) => <option key={c}>{c}</option>)}</select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}><option>All</option>{statuses.map((s) => <option key={s}>{s}</option>)}</select>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer", gridColumn: "1 / -1" }}><option>All</option>{priorities.map((p) => <option key={p}>{p}</option>)}</select>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {filteredTasks.map((task) => {
                    const badge = statusStyles[task.status];
                    return (
                      <div key={task.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>{task.title}</div>
                            <div style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>{task.category} · {task.priority} · {task.assignee}</div>
                          </div>
                          <span style={{ color: badge.text, background: badge.bg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", height: "fit-content" }}>{task.status}</span>
                        </div>
                        <div style={{ marginTop: 10, color: colors.muted, fontSize: 13 }}>{task.description}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                          <div style={{ fontSize: 12, color: colors.muted }}>Deadline: {formatDate(task.deadline)}</div>
                          <div style={{ fontSize: 12, color: colors.muted }}>Dibuat: {formatDate(task.createdAt)}</div>
                          {(task.startTime || task.endTime) && <div style={{ fontSize: 12, color: colors.muted }}>Waktu: {formatTimeRange(task)}{getTaskDuration(task) ? ` (${getTaskDuration(task)})` : ""}</div>}
                        </div>
                        {(task.status === "Pending" || task.status === "In progress") && task.reason && (
                          <div style={{ marginTop: 10, padding: "8px 10px", color: colors.text, background: colors.card, borderRadius: 8, fontSize: 12, border: `0.5px solid ${colors.border}` }}>Alasan: {task.reason}</div>
                        )}
                        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8 }}>
                          {(role === "Admin" || task.assignee === currentUser.name) && (
                            <button onClick={() => handleStatusToggle(task)} style={primaryButton(colors)} disabled={role !== "Staff"}>{task.status === "Completed" ? "Undo" : "Checklist"}</button>
                          )}
                          {role === "Admin" && (
                            <>
                              <button onClick={() => handleEditTask(task)} style={secondaryButton(colors)}>Edit</button>
                              <button onClick={() => handleDeleteTask(task.id)} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger }}>Hapus</button>
                            </>
                          )}
                        </div>
                        <div style={{ marginTop: 12 }}>
                          <textarea value={task.notes} onChange={(e) => setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, notes: e.target.value } : item)))} placeholder="Catatan tambahan" style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical", background: colors.card }} />
                        </div>
                      </div>
                    );
                  })}
                  {filteredTasks.length === 0 && <div style={{ fontSize: 13, color: colors.muted, padding: "12px 0" }}>Tidak ada task untuk filter ini.</div>}
                </div>
              </div>

              <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: 10, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{t.taskFormTitle}</div>
                <div style={{ color: colors.muted, fontSize: 12, marginTop: -6 }}>{t.adminStaffNote}</div>
                <input value={taskForm.title} onChange={(e) => handleFormChange("title", e.target.value)} placeholder={t.titlePlaceholder} style={fieldStyle(colors)} />
                <textarea value={taskForm.description} onChange={(e) => handleFormChange("description", e.target.value)} placeholder={t.descriptionPlaceholder} style={{ ...fieldStyle(colors), minHeight: 64, resize: "vertical" }} />
                <select value={taskForm.category} onChange={(e) => handleFormChange("category", e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
                <select value={taskForm.priority} onChange={(e) => handleFormChange("priority", e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{priorities.map((p) => <option key={p} value={p}>{p}</option>)}</select>
                <input value={taskForm.assignee} onChange={(e) => handleFormChange("assignee", e.target.value)} placeholder={t.assigneePlaceholder} style={fieldStyle(colors)} disabled={role === "Staff"} />
                <input value={taskForm.deadline} onChange={(e) => handleFormChange("deadline", e.target.value)} type="date" style={{ ...fieldStyle(colors), cursor: "pointer" }} />
                <select value={taskForm.status} onChange={(e) => handleFormChange("status", e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
                <textarea value={taskForm.notes} onChange={(e) => handleFormChange("notes", e.target.value)} placeholder={t.notesPlaceholder} style={{ ...fieldStyle(colors), minHeight: 64, resize: "vertical" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input type="time" value={taskForm.startTime || ""} onChange={(e) => handleFormChange("startTime", e.target.value)} style={fieldStyle(colors)} />
                  <input type="time" value={taskForm.endTime || ""} onChange={(e) => handleFormChange("endTime", e.target.value)} style={fieldStyle(colors)} />
                </div>
                <textarea value={taskForm.reason} onChange={(e) => handleFormChange("reason", e.target.value)} placeholder={t.reasonPlaceholder} style={{ ...fieldStyle(colors), minHeight: 52, resize: "vertical" }} />
                <button type="button" onClick={handleSaveTask} disabled={taskLimitReached && !taskForm.id} style={{ ...primaryButton(colors), cursor: taskLimitReached && !taskForm.id ? "not-allowed" : "pointer", opacity: taskLimitReached && !taskForm.id ? 0.6 : 1 }}>
                  {taskForm.id ? t.saveChanges : t.addTask}
                </button>
                <div style={{ color: colors.muted, fontSize: 11 }}>{roleTaskCount}/{taskLimit} {t.taskCreatedByRole} {role}. {taskLimitReached ? t.limitReached : t.canAddTask}</div>
              </aside>
            </section>
          </>
        )}

        {activeTab === "stock" && (
          <section style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>Stok opname — stok per item</div>
              <div style={{ display: "grid", gap: 10 }}>
                {stockItems.map((sItem) => (
                  <div key={sItem.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{sItem.item}</div>
                        <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>Update terakhir: {formatDate(sItem.updatedAt)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="number" value={sItem.stock} onChange={(e) => updateStock(sItem.id, Number(e.target.value))} style={{ ...fieldStyle(colors), width: 90, textAlign: "right" }} />
                        <span style={{ fontSize: 13, color: colors.muted }}>{sItem.unit}</span>
                      </div>
                    </div>
                    {sItem.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 8 }}>{sItem.notes}</div>}
                    {role === "Admin" && <div style={{ marginTop: 10 }}><button onClick={() => setStockItems((prev) => prev.filter((s) => s.id !== sItem.id))} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger }}>Hapus item</button></div>}
                  </div>
                ))}
                {stockItems.length === 0 && <div style={{ fontSize: 13, color: colors.muted }}>Belum ada item stok.</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 10, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Tambah item baru</div>
              <input value={stockForm.item} onChange={(e) => setStockForm((p) => ({ ...p, item: e.target.value }))} placeholder="Nama item" style={fieldStyle(colors)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={stockForm.stock} onChange={(e) => setStockForm((p) => ({ ...p, stock: e.target.value }))} placeholder="Stok awal" type="number" style={fieldStyle(colors)} />
                <input value={stockForm.unit} onChange={(e) => setStockForm((p) => ({ ...p, unit: e.target.value }))} placeholder="Satuan" style={fieldStyle(colors)} />
              </div>
              <textarea value={stockForm.notes} onChange={(e) => setStockForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Catatan" style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <button onClick={() => { if (!stockForm.item.trim()) { window.alert("Nama item wajib diisi."); return; } setStockItems((prev) => [{ id: String(Date.now()), item: stockForm.item, unit: stockForm.unit, stock: Number(stockForm.stock) || 0, notes: stockForm.notes, updatedAt: new Date().toISOString().slice(0, 10) }, ...prev]); setStockForm({ item: "", unit: "", stock: "", notes: "" }); }} style={primaryButton(colors)}>Tambah item</button>
            </aside>
          </section>
        )}

        {activeTab === "meeting" && (
          <section style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>Meeting</div>
              <div style={{ display: "grid", gap: 10 }}>
                {meetings.map((m) => (
                  <div key={m.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{formatDate(m.date)} · {m.time || "-"}</div>
                    <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>Peserta: {m.attendees || "-"}</div>
                    {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                    <div style={{ marginTop: 10 }}><button onClick={() => setMeetings((prev) => prev.filter((x) => x.id !== m.id))} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger }}>Hapus</button></div>
                  </div>
                ))}
                {meetings.length === 0 && <div style={{ fontSize: 13, color: colors.muted }}>Belum ada jadwal meeting.</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 10, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Jadwalkan meeting</div>
              <input value={meetingForm.title} onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))} placeholder="Judul meeting" style={fieldStyle(colors)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={meetingForm.date} onChange={(e) => setMeetingForm((p) => ({ ...p, date: e.target.value }))} type="date" style={fieldStyle(colors)} />
                <input value={meetingForm.time} onChange={(e) => setMeetingForm((p) => ({ ...p, time: e.target.value }))} type="time" style={fieldStyle(colors)} />
              </div>
              <input value={meetingForm.attendees} onChange={(e) => setMeetingForm((p) => ({ ...p, attendees: e.target.value }))} placeholder="Peserta (pisahkan dengan koma)" style={fieldStyle(colors)} />
              <textarea value={meetingForm.notes} onChange={(e) => setMeetingForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Agenda atau catatan" style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <button onClick={() => { if (!meetingForm.title.trim()) { window.alert("Judul meeting wajib diisi."); return; } setMeetings((prev) => [{ id: String(Date.now()), ...meetingForm }, ...prev]); setMeetingForm({ title: "", date: new Date().toISOString().slice(0, 10), time: "", attendees: "", notes: "" }); }} style={primaryButton(colors)}>Tambah meeting</button>
            </aside>
          </section>
        )}

        {activeTab === "maintenance" && (
          <section style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>Maintenance</div>
              <div style={{ display: "grid", gap: 10 }}>
                {maintenanceItems.map((m) => {
                  const badge = statusStyles[m.status] || statusStyles.Pending;
                  return (
                    <div key={m.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{m.equipment}</div>
                        <span style={{ color: badge.text, background: badge.bg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 500 }}>{m.status}</span>
                      </div>
                      <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.issue}</div>
                      <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>Teknisi: {m.technician || "-"} · {formatDate(m.date)}</div>
                      {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                      <div style={{ marginTop: 10 }}><button onClick={() => setMaintenanceItems((prev) => prev.filter((x) => x.id !== m.id))} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger }}>Hapus</button></div>
                    </div>
                  );
                })}
                {maintenanceItems.length === 0 && <div style={{ fontSize: 13, color: colors.muted }}>Belum ada catatan maintenance.</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 10, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>Tambah maintenance</div>
              <input value={maintenanceForm.equipment} onChange={(e) => setMaintenanceForm((p) => ({ ...p, equipment: e.target.value }))} placeholder="Nama mesin atau alat" style={fieldStyle(colors)} />
              <textarea value={maintenanceForm.issue} onChange={(e) => setMaintenanceForm((p) => ({ ...p, issue: e.target.value }))} placeholder="Deskripsi masalah" style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <input value={maintenanceForm.technician} onChange={(e) => setMaintenanceForm((p) => ({ ...p, technician: e.target.value }))} placeholder="Teknisi" style={fieldStyle(colors)} />
              <select value={maintenanceForm.status} onChange={(e) => setMaintenanceForm((p) => ({ ...p, status: e.target.value as TaskStatus }))} style={{ ...fieldStyle(colors), cursor: "pointer" }}>{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select>
              <textarea value={maintenanceForm.notes} onChange={(e) => setMaintenanceForm((p) => ({ ...p, notes: e.target.value }))} placeholder="Catatan" style={{ ...fieldStyle(colors), minHeight: 52, resize: "vertical" }} />
              <button onClick={() => { if (!maintenanceForm.equipment.trim()) { window.alert("Nama mesin atau alat wajib diisi."); return; } setMaintenanceItems((prev) => [{ id: String(Date.now()), ...maintenanceForm, date: new Date().toISOString().slice(0, 10) }, ...prev]); setMaintenanceForm({ equipment: "", issue: "", technician: "", status: "Pending", notes: "" }); }} style={primaryButton(colors)}>Tambah maintenance</button>
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}