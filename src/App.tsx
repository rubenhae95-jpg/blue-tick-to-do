import { useState, type ChangeEvent } from "react";

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
  photo?: string;
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
  total: number;
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
  "Factory Supervisor",
  "Factory Logistik",
  "Driver",
  "Production Cleaning",
  "Office",
  "Others",
];
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: TaskStatus[] = ["Pending", "In progress", "Completed", "Cancelled"];

const statusStyles: Record<TaskStatus, { bg: string; text: string }> = {
  Pending: { bg: "#eef2f8", text: "#5b6b82" },
  "In progress": { bg: "#dbeafe", text: "#1d4ed8" },
  Completed: { bg: "#dcecff", text: "#0c4a8c" },
  Cancelled: { bg: "#fde8e8", text: "#a12626" },
};

const statusLabels: Record<Lang, Record<TaskStatus, string>> = {
  id: { Pending: "Pending", "In progress": "Sedang berjalan", Completed: "Selesai", Cancelled: "Dibatalkan" },
  en: { Pending: "Pending", "In progress": "In progress", Completed: "Completed", Cancelled: "Cancelled" },
};
const priorityLabels: Record<Lang, Record<Priority, string>> = {
  id: { High: "Tinggi", Medium: "Sedang", Low: "Rendah" },
  en: { High: "High", Medium: "Medium", Low: "Low" },
};
const shiftLabels: Record<Lang, Record<string, string>> = {
  id: { Day: "Siang", Night: "Malam" },
  en: { Day: "Day", Night: "Night" },
};

const translations = {
  id: {
    tagline: "Daily Task Operations",
    loginSubtitle: "Masuk dengan nama kamu untuk mulai",
    namePlaceholder: "Nama",
    roleTitlePlaceholder: "Jabatan (contoh: Factory Supervisor)",
    loginButton: "Masuk",
    loginNote: "Ini identitas untuk pratinjau saja — tidak ada verifikasi password.",
    nameRequired: "Nama wajib diisi.",
    darkMode: "Mode gelap",
    lightMode: "Mode terang",
    logout: "Keluar",
    tabTasks: "Tasks",
    tabStock: "Stok opname",
    tabMeeting: "Meeting",
    tabMaintenance: "Maintenance",
    totalTasks: "Total tugas",
    completed: "Selesai",
    remaining: "Belum selesai",
    pending: "Pending",
    progress: "Progress",
    shareDescription: "Bagikan laporan harian kamu ke WhatsApp.",
    shareButton: "Share WhatsApp",
    searchPlaceholder: "Cari tugas",
    allOption: "Semua",
    importCsv: "Import CSV",
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
    deadlineLabel: "Deadline",
    createdLabel: "Dibuat",
    timeLabel: "Waktu",
    reasonLabel: "Alasan",
    uploadPhoto: "Upload foto",
    changePhoto: "Ganti foto",
    checklist: "Checklist",
    undo: "Undo",
    edit: "Edit",
    delete: "Hapus",
    noTasksFilter: "Tidak ada task untuk filter ini.",
    resetLogo: "Reset logo",
    stockSectionTitle: "Stok opname",
    addItemTitle: "Tambah item baru",
    itemNamePlaceholder: "Nama item",
    initialStockPlaceholder: "Stok awal",
    unitPlaceholder: "Satuan",
    notesGeneric: "Catatan",
    addItem: "Tambah item",
    total: "Total",
    masuk: "Barang masuk",
    keluar: "Barang keluar",
    qtyPlaceholder: "Jumlah",
    recordMasuk: "Catat masuk",
    recordKeluar: "Catat keluar",
    lastUpdated: "Update terakhir",
    deleteItem: "Hapus item",
    noStockItems: "Belum ada item stok.",
    meetingSectionTitle: "Meeting",
    scheduleMeeting: "Jadwalkan meeting",
    meetingTitlePlaceholder: "Judul meeting",
    attendeesPlaceholder: "Peserta (pisahkan dengan koma)",
    agendaPlaceholder: "Agenda atau catatan",
    addMeeting: "Tambah meeting",
    noMeetings: "Belum ada jadwal meeting.",
    maintenanceSectionTitle: "Maintenance",
    addMaintenance: "Tambah maintenance",
    equipmentPlaceholder: "Nama mesin atau alat",
    issuePlaceholder: "Deskripsi masalah",
    technicianPlaceholder: "Teknisi",
    noMaintenance: "Belum ada catatan maintenance.",
    itemNameRequired: "Nama item wajib diisi.",
    meetingTitleRequired: "Judul meeting wajib diisi.",
    equipmentRequired: "Nama mesin atau alat wajib diisi.",
    editAdminOnly: "Edit tugas hanya diperbolehkan oleh admin.",
    csvImported: (n: number) => `${n} task berhasil diimpor.`,
    csvEmpty: "File CSV tidak berisi data yang bisa diimpor.",
    chooseUserFirst: "Pilih satu user terlebih dahulu untuk membuat laporan.",
  },
  en: {
    tagline: "Daily Task Operations",
    loginSubtitle: "Sign in with your name to get started",
    namePlaceholder: "Name",
    roleTitlePlaceholder: "Job title (e.g. Factory Supervisor)",
    loginButton: "Sign in",
    loginNote: "This is a preview identity only — no password verification.",
    nameRequired: "Name is required.",
    darkMode: "Dark mode",
    lightMode: "Light mode",
    logout: "Log out",
    tabTasks: "Tasks",
    tabStock: "Stock opname",
    tabMeeting: "Meeting",
    tabMaintenance: "Maintenance",
    totalTasks: "Total tasks",
    completed: "Completed",
    remaining: "Remaining",
    pending: "Pending",
    progress: "Progress",
    shareDescription: "Share your daily report to WhatsApp.",
    shareButton: "Share WhatsApp",
    searchPlaceholder: "Search tasks",
    allOption: "All",
    importCsv: "Import CSV",
    taskFormTitle: "Add or edit task",
    adminStaffNote: "Admin and staff can create tasks. Edit and delete only by admin.",
    titlePlaceholder: "Task title",
    descriptionPlaceholder: "Task description",
    assigneePlaceholder: "Assignee",
    notesPlaceholder: "Internal notes",
    reasonPlaceholder: "Reason if pending or in progress",
    saveChanges: "Save changes",
    addTask: "Add task",
    alertTitleRequired: "Task title is required.",
    alertAssigneeRequired: "Assignee is required.",
    taskCreatedByRole: "tasks created by",
    limitReached: "Limit reached for adding new tasks.",
    canAddTask: "This role can add new tasks.",
    deadlineLabel: "Deadline",
    createdLabel: "Created",
    timeLabel: "Time",
    reasonLabel: "Reason",
    uploadPhoto: "Upload photo",
    changePhoto: "Change photo",
    checklist: "Checklist",
    undo: "Undo",
    edit: "Edit",
    delete: "Delete",
    noTasksFilter: "No tasks match this filter.",
    resetLogo: "Reset logo",
    stockSectionTitle: "Stock opname",
    addItemTitle: "Add new item",
    itemNamePlaceholder: "Item name",
    initialStockPlaceholder: "Initial stock",
    unitPlaceholder: "Unit",
    notesGeneric: "Notes",
    addItem: "Add item",
    total: "Total",
    masuk: "Stock in",
    keluar: "Stock out",
    qtyPlaceholder: "Quantity",
    recordMasuk: "Record in",
    recordKeluar: "Record out",
    lastUpdated: "Last updated",
    deleteItem: "Delete item",
    noStockItems: "No stock items yet.",
    meetingSectionTitle: "Meeting",
    scheduleMeeting: "Schedule meeting",
    meetingTitlePlaceholder: "Meeting title",
    attendeesPlaceholder: "Attendees (comma separated)",
    agendaPlaceholder: "Agenda or notes",
    addMeeting: "Add meeting",
    noMeetings: "No meetings scheduled yet.",
    maintenanceSectionTitle: "Maintenance",
    addMaintenance: "Add maintenance",
    equipmentPlaceholder: "Equipment name",
    issuePlaceholder: "Issue description",
    technicianPlaceholder: "Technician",
    noMaintenance: "No maintenance records yet.",
    itemNameRequired: "Item name is required.",
    meetingTitleRequired: "Meeting title is required.",
    equipmentRequired: "Equipment name is required.",
    editAdminOnly: "Editing is only allowed for admin.",
    csvImported: (n: number) => `${n} task(s) imported successfully.`,
    csvEmpty: "The CSV file has no importable rows.",
    chooseUserFirst: "Choose a single user first to build the report.",
  },
} as const;

const sampleTasks: Task[] = [
  { id: "1", title: "Clean machine", description: "Bersihkan mesin utama agar siap digunakan.", category: "Production Cleaning", priority: "High", assignee: "Budi", deadline: "2026-07-17", status: "Completed", notes: "Selesai pagi ini.", createdAt: "2026-07-17", startTime: "08:00", endTime: "09:10", createdByRole: "Admin" },
  { id: "2", title: "Wash mold", description: "Cuci cetakan setelah produksi.", category: "Production Cleaning", priority: "Medium", assignee: "Ani", deadline: "2026-07-17", status: "Completed", notes: "Tidak ada masalah.", createdAt: "2026-07-17" },
  { id: "3", title: "Prepare delivery", description: "Siapkan barang dan dokumen pengiriman.", category: "Driver", priority: "High", assignee: "Siti", deadline: "2026-07-17", status: "In progress", notes: "Menunggu armada.", startTime: "10:00", endTime: "12:30", reason: "Tim produksi belum siap mengangkut.", createdAt: "2026-07-17" },
  { id: "4", title: "Check water pump", description: "Periksa pompa air area produksi.", category: "Factory Logistik", priority: "Low", assignee: "Dedi", deadline: "2026-07-18", status: "Pending", notes: "Belum dilakukan.", createdAt: "2026-07-17", createdByRole: "Admin" },
  { id: "5", title: "Maintenance Updated and Planning", description: "Update rencana maintenance mingguan.", category: "Factory Supervisor", priority: "Medium", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Jadwal minggu depan sudah disusun.", createdAt: "2026-07-18", endTime: "13:59" },
  { id: "6", title: "Bike Delivery", description: "Antar pesanan menggunakan motor.", category: "Driver", priority: "Medium", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Semua pesanan sampai tepat waktu.", createdAt: "2026-07-18", endTime: "12:03" },
  { id: "7", title: "Factory Cleaning", description: "Bersihkan area pabrik.", category: "Production Cleaning", priority: "Low", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Area produksi dan gudang sudah rapi.", createdAt: "2026-07-18", endTime: "12:03" },
  { id: "8", title: "Cocktails Ice Prep", description: "Siapkan es untuk kebutuhan cocktail.", category: "Factory Supervisor", priority: "High", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Stok es siap untuk shift malam.", createdAt: "2026-07-18", endTime: "13:53" },
  { id: "9", title: "Helping Organize Melting Bags", description: "Bantu menyusun kantong es yang meleleh.", category: "Factory Logistik", priority: "Low", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Completed", notes: "Sudah dipisahkan sesuai kondisi.", createdAt: "2026-07-18", endTime: "13:59" },
  { id: "10", title: "Ice Ball Harvest & Production", description: "Panen dan produksi ice ball.", category: "Factory Supervisor", priority: "High", assignee: "Ruben Hina", deadline: "2026-07-18", status: "Pending", notes: "", reason: "Still Watery", createdAt: "2026-07-18" },
];

const sampleStock: StockItem[] = [
  { id: "1", item: "Es batu kristal", unit: "kg", total: 120, masuk: 200, keluar: 80, notes: "Stok aman", updatedAt: "2026-07-18" },
  { id: "2", item: "Kantong es", unit: "pcs", total: 340, masuk: 500, keluar: 160, notes: "Perlu tambah minggu depan", updatedAt: "2026-07-18" },
  { id: "3", item: "Sirup cocktail", unit: "botol", total: 18, masuk: 24, keluar: 6, notes: "", updatedAt: "2026-07-17" },
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
        page: "#EAF3FC",
        card: "#FFFFFF",
        cardMuted: "#F0F7FE",
        text: "#16324A",
        muted: "#5B7690",
        border: "rgba(22,50,74,0.10)",
        borderStrong: "rgba(22,50,74,0.20)",
        accent: "#2F7FE0",
        accentBg: "#DCEBFB",
        danger: "#B33636",
      }
    : {
        page: "#0E1B2B",
        card: "#152840",
        cardMuted: "#1B324E",
        text: "#EAF3FC",
        muted: "#93AFC9",
        border: "rgba(234,243,252,0.10)",
        borderStrong: "rgba(234,243,252,0.20)",
        accent: "#7DD3FC",
        accentBg: "#1E3A57",
        danger: "#E8A0A0",
      };

const fieldStyle = (colors: Colors): React.CSSProperties => ({
  width: "100%",
  borderRadius: 8,
  border: `0.5px solid ${colors.border}`,
  padding: "8px 11px",
  background: colors.cardMuted,
  color: colors.text,
  fontSize: 13.5,
  fontFamily: "inherit",
});

const secondaryButton = (colors: Colors): React.CSSProperties => ({
  borderRadius: 8,
  border: `0.5px solid ${colors.borderStrong}`,
  padding: "8px 13px",
  background: "transparent",
  color: colors.text,
  cursor: "pointer",
  fontSize: 13.5,
});

const primaryButton = (colors: Colors): React.CSSProperties => ({
  borderRadius: 8,
  border: "none",
  padding: "9px 15px",
  background: colors.accent,
  color: "#FFFFFF",
  cursor: "pointer",
  fontSize: 13.5,
});

const tabButton = (colors: Colors, active: boolean): React.CSSProperties => ({
  borderRadius: 8,
  border: active ? "none" : `0.5px solid ${colors.borderStrong}`,
  padding: "7px 13px",
  background: active ? colors.accent : "transparent",
  color: active ? "#FFFFFF" : colors.text,
  cursor: "pointer",
  fontSize: 13.5,
});

// Minimal CSV parser (handles quoted fields with commas) — no external dependency
// so it works in any project without adding a package.
const parseCsv = (text: string): string[][] => {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (inQuotes) {
      if (char === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field !== "" || row.length) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  return rows;
};

function LoginScreen({
  colors,
  lang,
  onLangChange,
  onLogin,
}: {
  colors: Colors;
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  onLogin: (user: CurrentUser) => void;
}) {
  const tt = translations[lang];
  const [name, setName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [permissionRole, setPermissionRole] = useState<PermissionRole>("Staff");
  const [shift, setShift] = useState("Day");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) {
      setError(tt.nameRequired);
      return;
    }
    setError("");
    onLogin({ name: name.trim(), roleTitle: roleTitle.trim() || "Staff", permissionRole, shift });
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, display: "grid", placeItems: "center", padding: 16, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" }}>
      <div style={{ width: "min(320px, 100%)", boxSizing: "border-box", background: colors.card, borderRadius: 12, border: `0.5px solid ${colors.border}`, padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: colors.muted, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tt.tagline}</div>
            <div style={{ fontSize: 24, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700, letterSpacing: "0.04em", color: colors.accent }}>
              BLUE TICK ICE
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            <button onClick={() => onLangChange("id")} style={{ ...tabButton(colors, lang === "id"), padding: "4px 8px", fontSize: 11 }}>ID</button>
            <button onClick={() => onLangChange("en")} style={{ ...tabButton(colors, lang === "en"), padding: "4px 8px", fontSize: 11 }}>EN</button>
          </div>
        </div>
        <div style={{ fontSize: 13, color: colors.muted, marginTop: 14, marginBottom: 18 }}>{tt.loginSubtitle}</div>
        <div style={{ display: "grid", gap: 10 }}>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder={tt.namePlaceholder} style={fieldStyle(colors)} onKeyDown={(e) => e.key === "Enter" && submit()} />
          <input value={roleTitle} onChange={(e) => setRoleTitle(e.target.value)} placeholder={tt.roleTitlePlaceholder} style={fieldStyle(colors)} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <select value={permissionRole} onChange={(e) => setPermissionRole(e.target.value as PermissionRole)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
            <select value={shift} onChange={(e) => setShift(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
              <option value="Day">{shiftLabels[lang].Day}</option>
              <option value="Night">{shiftLabels[lang].Night}</option>
            </select>
          </div>
          {error && <div style={{ fontSize: 12, color: colors.danger }}>{error}</div>}
          <button onClick={submit} style={primaryButton(colors)}>{tt.loginButton}</button>
          <div style={{ fontSize: 11, color: colors.muted, marginTop: 4, lineHeight: 1.6 }}>{tt.loginNote}</div>
        </div>
      </div>
    </div>
  );
}

function StockItemCard({
  item,
  colors,
  tt,
  canDelete,
  onMasuk,
  onKeluar,
  onDelete,
}: {
  item: StockItem;
  colors: Colors;
  tt: (typeof translations)["id"];
  canDelete: boolean;
  onMasuk: (qty: number) => void;
  onKeluar: (qty: number) => void;
  onDelete: () => void;
}) {
  const [qty, setQty] = useState("");

  const runMasuk = () => {
    const value = Number(qty);
    if (!value || value <= 0) return;
    onMasuk(value);
    setQty("");
  };
  const runKeluar = () => {
    const value = Number(qty);
    if (!value || value <= 0) return;
    onKeluar(value);
    setQty("");
  };

  return (
    <div style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500 }}>{item.item}</div>
          <div style={{ fontSize: 12, color: colors.muted, marginTop: 2 }}>{tt.lastUpdated}: {formatDate(item.updatedAt)}</div>
        </div>
        <div style={{ fontSize: 18, fontWeight: 600 }}>{item.total} <span style={{ fontSize: 12, color: colors.muted, fontWeight: 400 }}>{item.unit}</span></div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" }}>
        <div style={{ fontSize: 12, color: colors.muted }}>{tt.total}: <strong style={{ color: colors.text }}>{item.total}</strong></div>
        <div style={{ fontSize: 12, color: colors.muted }}>{tt.masuk}: <strong style={{ color: colors.text }}>{item.masuk}</strong></div>
        <div style={{ fontSize: 12, color: colors.muted }}>{tt.keluar}: <strong style={{ color: colors.text }}>{item.keluar}</strong></div>
      </div>

      {item.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 8 }}>{item.notes}</div>}

      <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
        <input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder={tt.qtyPlaceholder} style={{ ...fieldStyle(colors), width: 100 }} />
        <button onClick={runMasuk} style={primaryButton(colors)}>{tt.recordMasuk}</button>
        <button onClick={runKeluar} style={secondaryButton(colors)}>{tt.recordKeluar}</button>
        {canDelete && (
          <button onClick={onDelete} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger, marginLeft: "auto" }}>
            {tt.deleteItem}
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [theme, setTheme] = useState<Theme>("light");
  const [lang, setLang] = useState<Lang>("id");
  const colors = getColors(theme);
  const tt = translations[lang];
  const [activeTab, setActiveTab] = useState<Tab>("tasks");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [filterPriority, setFilterPriority] = useState("All");

  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: "",
    description: "",
    category: categories[0],
    priority: "Medium",
    assignee: "",
    deadline: new Date().toISOString().slice(0, 10),
    status: "Pending",
    notes: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  const [stockItems, setStockItems] = useState<StockItem[]>(sampleStock);
  const [stockForm, setStockForm] = useState({ item: "", unit: "", total: "", notes: "" });

  const [meetings, setMeetings] = useState<Meeting[]>(sampleMeetings);
  const [meetingForm, setMeetingForm] = useState({ title: "", date: new Date().toISOString().slice(0, 10), time: "", attendees: "", notes: "" });

  const [maintenanceItems, setMaintenanceItems] = useState<MaintenanceItem[]>(sampleMaintenance);
  const [maintenanceForm, setMaintenanceForm] = useState({ equipment: "", issue: "", technician: "", status: "Pending" as TaskStatus, notes: "" });

  const responsiveCss = `
    @media (max-width: 720px) {
      .bti-two-col { grid-template-columns: 1fr !important; }
      .bti-summary-row { flex-direction: column !important; align-items: stretch !important; gap: 14px !important; }
      .bti-stats { justify-content: space-between !important; }
      .bti-filter-row { grid-template-columns: 1fr 1fr !important; }
      .bti-filter-row > *:first-child { grid-column: 1 / -1 !important; }
      .bti-header { flex-direction: column; align-items: stretch !important; text-align: center; }
      .bti-header-left { justify-content: center; }
      .bti-header-right { justify-content: center; flex-wrap: wrap; }
    }
  `;

  if (!currentUser) {
    return (
      <>
        <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');`}</style>
        <LoginScreen
          colors={colors}
          lang={lang}
          onLangChange={setLang}
          onLogin={(user) => {
            setCurrentUser(user);
            setTaskForm((prev) => ({ ...prev, assignee: user.permissionRole === "Staff" ? user.name : prev.assignee }));
          }}
        />
      </>
    );
  }

  const role = currentUser.permissionRole;

  const filteredTasks = tasks
    .filter((task) => {
      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        task.description.toLowerCase().includes(search.toLowerCase()) ||
        task.assignee.toLowerCase().includes(search.toLowerCase());
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
    if (!taskForm.title?.trim()) {
      window.alert(tt.alertTitleRequired);
      return;
    }
    if (!taskForm.assignee?.trim()) {
      window.alert(tt.alertAssigneeRequired);
      return;
    }
    const isNew = !taskForm.id;
    if (isNew && taskLimitReached) {
      window.alert(`${tt.limitReached} (${role})`);
      return;
    }
    if (!isNew && role !== "Admin") {
      window.alert(tt.editAdminOnly);
      return;
    }

    const normalizedTask: Task = {
      id: taskForm.id || String(Date.now()),
      title: taskForm.title,
      description: taskForm.description || "",
      category: taskForm.category || categories[0],
      priority: (taskForm.priority || "Medium") as Priority,
      assignee: taskForm.assignee,
      deadline: taskForm.deadline || new Date().toISOString().slice(0, 10),
      status: (taskForm.status || "Pending") as TaskStatus,
      notes: taskForm.notes || "",
      createdAt: taskForm.createdAt || new Date().toISOString().slice(0, 10),
      createdByRole: taskForm.createdByRole || role,
      startTime: taskForm.startTime,
      endTime: taskForm.endTime,
      reason: taskForm.reason || "",
      photo: taskForm.photo,
    };

    setTasks((prev) => {
      const exists = prev.some((item) => item.id === normalizedTask.id);
      if (exists) return prev.map((item) => (item.id === normalizedTask.id ? normalizedTask : item));
      return [normalizedTask, ...prev];
    });

    setTaskForm({
      title: "",
      description: "",
      category: categories[0],
      priority: "Medium",
      assignee: role === "Staff" ? currentUser.name : "",
      deadline: new Date().toISOString().slice(0, 10),
      status: "Pending",
      notes: "",
      startTime: "",
      endTime: "",
      reason: "",
      photo: undefined,
    });
  };

  const handleEditTask = (task: Task) => setTaskForm(task);
  const handleDeleteTask = (id: string) => setTasks((prev) => prev.filter((task) => task.id !== id));

  const handleStatusToggle = (task: Task) => {
    if (role === "Staff" && task.assignee === currentUser.name) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id ? { ...item, status: item.status === "Completed" ? "In progress" : "Completed" } : item
        )
      );
    }
  };

  const handleTaskPhotoUpload = (taskId: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setTasks((prev) => prev.map((item) => (item.id === taskId ? { ...item, photo: reader.result as string } : item)));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setLogoUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleResetLogo = () => setLogoUrl(null);

  const handleImportCsv = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const text = typeof reader.result === "string" ? reader.result : "";
      const rows = parseCsv(text);
      if (rows.length < 2) {
        window.alert(tt.csvEmpty);
        return;
      }
      const header = rows[0].map((h) => h.trim().toLowerCase());
      const idx = (name: string) => header.indexOf(name);
      const iTitle = idx("title");
      const iDescription = idx("description");
      const iCategory = idx("category");
      const iPriority = idx("priority");
      const iAssignee = idx("assignee");
      const iDeadline = idx("deadline");
      const iStatus = idx("status");
      const iNotes = idx("notes");

      const imported: Task[] = [];
      rows.slice(1).forEach((cols, i) => {
        const title = iTitle >= 0 ? cols[iTitle]?.trim() : "";
        if (!title) return;
        imported.push({
          id: `${Date.now()}-${i}`,
          title,
          description: iDescription >= 0 ? cols[iDescription]?.trim() || "" : "",
          category: (iCategory >= 0 && cols[iCategory]?.trim()) || categories[0],
          priority: (["High", "Medium", "Low"].includes(cols[iPriority]?.trim()) ? cols[iPriority]?.trim() : "Medium") as Priority,
          assignee: iAssignee >= 0 ? cols[iAssignee]?.trim() || "" : "",
          deadline: iDeadline >= 0 ? cols[iDeadline]?.trim() || "" : "",
          status: (statuses.includes(cols[iStatus]?.trim() as TaskStatus) ? cols[iStatus]?.trim() : "Pending") as TaskStatus,
          notes: iNotes >= 0 ? cols[iNotes]?.trim() || "" : "",
          createdAt: new Date().toISOString().slice(0, 10),
          createdByRole: role,
        });
      });

      if (imported.length === 0) {
        window.alert(tt.csvEmpty);
        return;
      }
      setTasks((prev) => [...imported, ...prev]);
      window.alert(tt.csvImported(imported.length));
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const recordStockMasuk = (id: string, qty: number) => {
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, total: item.total + qty, masuk: item.masuk + qty, updatedAt: new Date().toISOString().slice(0, 10) } : item
      )
    );
  };
  const recordStockKeluar = (id: string, qty: number) => {
    setStockItems((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, total: Math.max(0, item.total - qty), keluar: item.keluar + qty, updatedAt: new Date().toISOString().slice(0, 10) }
          : item
      )
    );
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
      "📋 DAILY TASK REPORT",
      `👤 Employee : ${currentUser.name.toUpperCase()}`,
      `💼 Role : ${currentUser.roleTitle}`,
      `🕒 Shift : ${currentUser.shift}`,
      `📅 Date : ${formatDateShort(now)}`,
      divider,
      "📊 TASK SUMMARY",
      `📌 Assigned : ${assigned}`,
      `✅ Completed : ${completed}`,
      `⏳ Pending : ${pending}`,
      `📈 Completion Rate : ${rate}%`,
      divider,
      "✅ COMPLETED TASKS",
      ...(completedLines.length ? completedLines : ["-"]),
      divider,
      "⏳ PENDING TASKS",
      ...(pendingLines.length ? pendingLines : ["-"]),
      divider,
      `📤 Submitted by: ${currentUser.name.toUpperCase()}`,
      `🕒 Submitted: ${formatDateShort(now)} | ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`,
    ].join("\n");

    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  };

  return (
    <div style={{ minHeight: "100vh", background: colors.page, color: colors.text, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif", padding: 16, transition: "background 0.2s, color 0.2s" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'); ${responsiveCss}`}</style>

      <div style={{ maxWidth: 1120, margin: "0 auto", display: "grid", gap: 14 }}>
        <header className="bti-header" style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12, background: colors.card, borderRadius: 12, border: `0.5px solid ${colors.border}`, padding: "12px 16px" }}>
          <div className="bti-header-left" style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ position: "relative" }}>
              <div style={{ width: 40, height: 40, borderRadius: 9, background: colors.accentBg, color: colors.accent, display: "grid", placeItems: "center", fontSize: 16, fontWeight: 500, overflow: "hidden" }}>
                {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "✓"}
              </div>
              <label title={tt.changePhoto} style={{ position: "absolute", bottom: -3, right: -3, width: 16, height: 16, borderRadius: "50%", background: colors.accent, color: "#fff", display: "grid", placeItems: "center", fontSize: 10, cursor: "pointer", border: `2px solid ${colors.card}` }}>
                +
                <input type="file" accept="image/*" onChange={handleLogoUpload} style={{ display: "none" }} />
              </label>
            </div>
            <div>
              <div style={{ fontSize: 11, color: colors.muted, letterSpacing: "0.04em", textTransform: "uppercase" }}>{tt.tagline}</div>
              <div style={{ fontSize: 22, fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700, letterSpacing: "0.04em", color: colors.accent, lineHeight: 1 }}>
                BLUE TICK ICE
              </div>
            </div>
            {logoUrl && (
              <button onClick={handleResetLogo} style={{ ...secondaryButton(colors), padding: "5px 10px", fontSize: 12 }}>
                {tt.resetLogo}
              </button>
            )}
          </div>
          <div className="bti-header-right" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontSize: 13, color: colors.muted }}>{currentUser.name} · {currentUser.roleTitle}</div>
            <div style={{ display: "flex", gap: 4 }}>
              <button onClick={() => setLang("id")} style={{ ...tabButton(colors, lang === "id"), padding: "6px 10px" }}>ID</button>
              <button onClick={() => setLang("en")} style={{ ...tabButton(colors, lang === "en"), padding: "6px 10px" }}>EN</button>
            </div>
            <button onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))} style={secondaryButton(colors)}>
              {theme === "light" ? tt.darkMode : tt.lightMode}
            </button>
            <button onClick={() => setCurrentUser(null)} style={secondaryButton(colors)}>{tt.logout}</button>
          </div>
        </header>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {([
            ["tasks", tt.tabTasks],
            ["stock", tt.tabStock],
            ["meeting", tt.tabMeeting],
            ["maintenance", tt.tabMaintenance],
          ] as [Tab, string][]).map(([key, label]) => (
            <button key={key} onClick={() => setActiveTab(key)} style={tabButton(colors, activeTab === key)}>
              {label}
            </button>
          ))}
        </div>

        {activeTab === "tasks" && (
          <>
            <section className="bti-two-col" style={{ display: "grid", gap: 12, gridTemplateColumns: "1.6fr 1fr" }}>
              <div className="bti-summary-row" style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "flex", alignItems: "center", gap: 24 }}>
                <div className="bti-stats" style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontSize: 12, color: colors.muted }}>{tt.totalTasks}</div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>{totalCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: colors.muted }}>{tt.completed}</div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>{completedCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: colors.muted }}>{tt.remaining}</div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>{remainingCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: colors.muted }}>{tt.pending}</div>
                    <div style={{ fontSize: 18, fontWeight: 500 }}>{pendingCount}</div>
                  </div>
                </div>
                <div style={{ flex: 1, minWidth: 120 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: colors.muted, marginBottom: 4 }}>
                    <span>{tt.progress}</span><span>{completionPercent}%</span>
                  </div>
                  <div style={{ height: 6, background: colors.cardMuted, borderRadius: 999, overflow: "hidden" }}>
                    <div style={{ width: `${completionPercent}%`, height: "100%", background: colors.accent }} />
                  </div>
                </div>
              </div>
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                <div style={{ fontSize: 13, color: colors.muted }}>{tt.shareDescription}</div>
                <button onClick={shareWhatsApp} style={primaryButton(colors)}>{tt.shareButton}</button>
              </div>
            </section>

            <section className="bti-two-col" style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
              <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
                  {role === "Admin" && (
                    <label style={{ ...secondaryButton(colors), display: "inline-block", cursor: "pointer" }}>
                      {tt.importCsv}
                      <input type="file" accept=".csv" onChange={handleImportCsv} style={{ display: "none" }} />
                    </label>
                  )}
                </div>
                <div className="bti-filter-row" style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(4, minmax(0, 1fr))", marginBottom: 14 }}>
                  <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={tt.searchPlaceholder} style={{ ...fieldStyle(colors), gridColumn: "span 2" }} />
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
                    <option value="All">{tt.allOption}</option>
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                  <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
                    <option value="All">{tt.allOption}</option>
                    {statuses.map((s) => <option key={s} value={s}>{statusLabels[lang][s]}</option>)}
                  </select>
                  <select value={filterPriority} onChange={(e) => setFilterPriority(e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer", gridColumn: "1 / -1" }}>
                    <option value="All">{tt.allOption}</option>
                    {priorities.map((p) => <option key={p} value={p}>{priorityLabels[lang][p]}</option>)}
                  </select>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                  {filteredTasks.map((task) => {
                    const badge = statusStyles[task.status];
                    const canEditPhoto = role === "Admin" || task.assignee === currentUser.name;
                    return (
                      <div key={task.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                        <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 500 }}>{task.title}</div>
                            <div style={{ color: colors.muted, marginTop: 4, fontSize: 13 }}>
                              {task.category} · {priorityLabels[lang][task.priority]} · {task.assignee}
                            </div>
                          </div>
                          <span style={{ color: badge.text, background: badge.bg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 500, whiteSpace: "nowrap", height: "fit-content" }}>
                            {statusLabels[lang][task.status]}
                          </span>
                        </div>

                        <div style={{ marginTop: 10, color: colors.muted, fontSize: 13 }}>{task.description}</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 10 }}>
                          <div style={{ fontSize: 12, color: colors.muted }}>{tt.deadlineLabel}: {formatDate(task.deadline)}</div>
                          <div style={{ fontSize: 12, color: colors.muted }}>{tt.createdLabel}: {formatDate(task.createdAt)}</div>
                          {(task.startTime || task.endTime) && (
                            <div style={{ fontSize: 12, color: colors.muted }}>
                              {tt.timeLabel}: {formatTimeRange(task)}{getTaskDuration(task) ? ` (${getTaskDuration(task)})` : ""}
                            </div>
                          )}
                        </div>
                        {(task.status === "Pending" || task.status === "In progress") && task.reason && (
                          <div style={{ marginTop: 10, padding: "8px 10px", color: colors.text, background: colors.card, borderRadius: 8, fontSize: 12, border: `0.5px solid ${colors.border}` }}>
                            {tt.reasonLabel}: {task.reason}
                          </div>
                        )}

                        {task.photo && (
                          <img src={task.photo} alt="" style={{ width: "100%", maxHeight: 160, objectFit: "cover", borderRadius: 8, marginTop: 10 }} />
                        )}

                        <div style={{ marginTop: 12, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                          {(role === "Admin" || task.assignee === currentUser.name) && (
                            <button onClick={() => handleStatusToggle(task)} style={primaryButton(colors)} disabled={role !== "Staff"}>
                              {task.status === "Completed" ? tt.undo : tt.checklist}
                            </button>
                          )}
                          {role === "Admin" && (
                            <>
                              <button onClick={() => handleEditTask(task)} style={secondaryButton(colors)}>{tt.edit}</button>
                              <button onClick={() => handleDeleteTask(task.id)} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger }}>{tt.delete}</button>
                            </>
                          )}
                          {canEditPhoto && (
                            <label style={{ ...secondaryButton(colors), display: "inline-block", cursor: "pointer" }}>
                              {task.photo ? tt.changePhoto : tt.uploadPhoto}
                              <input type="file" accept="image/*" onChange={(e) => handleTaskPhotoUpload(task.id, e)} style={{ display: "none" }} />
                            </label>
                          )}
                        </div>

                        <div style={{ marginTop: 12 }}>
                          <textarea
                            value={task.notes}
                            onChange={(e) => setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, notes: e.target.value } : item)))}
                            placeholder={tt.notesPlaceholder}
                            style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical", background: colors.card }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  {filteredTasks.length === 0 && <div style={{ fontSize: 13, color: colors.muted, padding: "12px 0" }}>{tt.noTasksFilter}</div>}
                </div>
              </div>

              <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "flex", flexDirection: "column", gap: 10, height: "fit-content" }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{tt.taskFormTitle}</div>
                <div style={{ color: colors.muted, fontSize: 12, marginTop: -6 }}>{tt.adminStaffNote}</div>
                <input value={taskForm.title} onChange={(e) => handleFormChange("title", e.target.value)} placeholder={tt.titlePlaceholder} style={fieldStyle(colors)} />
                <textarea value={taskForm.description} onChange={(e) => handleFormChange("description", e.target.value)} placeholder={tt.descriptionPlaceholder} style={{ ...fieldStyle(colors), minHeight: 64, resize: "vertical" }} />
                <select value={taskForm.category} onChange={(e) => handleFormChange("category", e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
                  {categories.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <select value={taskForm.priority} onChange={(e) => handleFormChange("priority", e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
                  {priorities.map((p) => <option key={p} value={p}>{priorityLabels[lang][p]}</option>)}
                </select>
                <input value={taskForm.assignee} onChange={(e) => handleFormChange("assignee", e.target.value)} placeholder={tt.assigneePlaceholder} style={fieldStyle(colors)} disabled={role === "Staff"} />
                <input value={taskForm.deadline} onChange={(e) => handleFormChange("deadline", e.target.value)} type="date" style={{ ...fieldStyle(colors), cursor: "pointer" }} />
                <select value={taskForm.status} onChange={(e) => handleFormChange("status", e.target.value)} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
                  {statuses.map((s) => <option key={s} value={s}>{statusLabels[lang][s]}</option>)}
                </select>
                <textarea value={taskForm.notes} onChange={(e) => handleFormChange("notes", e.target.value)} placeholder={tt.notesPlaceholder} style={{ ...fieldStyle(colors), minHeight: 64, resize: "vertical" }} />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <input type="time" value={taskForm.startTime || ""} onChange={(e) => handleFormChange("startTime", e.target.value)} style={fieldStyle(colors)} />
                  <input type="time" value={taskForm.endTime || ""} onChange={(e) => handleFormChange("endTime", e.target.value)} style={fieldStyle(colors)} />
                </div>
                <textarea value={taskForm.reason} onChange={(e) => handleFormChange("reason", e.target.value)} placeholder={tt.reasonPlaceholder} style={{ ...fieldStyle(colors), minHeight: 52, resize: "vertical" }} />
                <button
                  type="button"
                  onClick={handleSaveTask}
                  disabled={taskLimitReached && !taskForm.id}
                  style={{ ...primaryButton(colors), cursor: taskLimitReached && !taskForm.id ? "not-allowed" : "pointer", opacity: taskLimitReached && !taskForm.id ? 0.6 : 1 }}
                >
                  {taskForm.id ? tt.saveChanges : tt.addTask}
                </button>
                <div style={{ color: colors.muted, fontSize: 11 }}>
                  {roleTaskCount}/{taskLimit} {tt.taskCreatedByRole} {role}. {taskLimitReached ? tt.limitReached : tt.canAddTask}
                </div>
              </aside>
            </section>
          </>
        )}

        {activeTab === "stock" && (
          <section className="bti-two-col" style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>{tt.stockSectionTitle}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {stockItems.map((sItem) => (
                  <StockItemCard
                    key={sItem.id}
                    item={sItem}
                    colors={colors}
                    tt={tt}
                    canDelete={role === "Admin"}
                    onMasuk={(qty) => recordStockMasuk(sItem.id, qty)}
                    onKeluar={(qty) => recordStockKeluar(sItem.id, qty)}
                    onDelete={() => setStockItems((prev) => prev.filter((s) => s.id !== sItem.id))}
                  />
                ))}
                {stockItems.length === 0 && <div style={{ fontSize: 13, color: colors.muted }}>{tt.noStockItems}</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 10, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{tt.addItemTitle}</div>
              <input value={stockForm.item} onChange={(e) => setStockForm((p) => ({ ...p, item: e.target.value }))} placeholder={tt.itemNamePlaceholder} style={fieldStyle(colors)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={stockForm.total} onChange={(e) => setStockForm((p) => ({ ...p, total: e.target.value }))} placeholder={tt.initialStockPlaceholder} type="number" style={fieldStyle(colors)} />
                <input value={stockForm.unit} onChange={(e) => setStockForm((p) => ({ ...p, unit: e.target.value }))} placeholder={tt.unitPlaceholder} style={fieldStyle(colors)} />
              </div>
              <textarea value={stockForm.notes} onChange={(e) => setStockForm((p) => ({ ...p, notes: e.target.value }))} placeholder={tt.notesGeneric} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <button
                onClick={() => {
                  if (!stockForm.item.trim()) {
                    window.alert(tt.itemNameRequired);
                    return;
                  }
                  setStockItems((prev) => [
                    { id: String(Date.now()), item: stockForm.item, unit: stockForm.unit, total: Number(stockForm.total) || 0, masuk: 0, keluar: 0, notes: stockForm.notes, updatedAt: new Date().toISOString().slice(0, 10) },
                    ...prev,
                  ]);
                  setStockForm({ item: "", unit: "", total: "", notes: "" });
                }}
                style={primaryButton(colors)}
              >
                {tt.addItem}
              </button>
            </aside>
          </section>
        )}

        {activeTab === "meeting" && (
          <section className="bti-two-col" style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>{tt.meetingSectionTitle}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {meetings.map((m) => (
                  <div key={m.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                    <div style={{ fontSize: 15, fontWeight: 500 }}>{m.title}</div>
                    <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{formatDate(m.date)} · {m.time || "-"}</div>
                    <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.attendees || "-"}</div>
                    {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                    <div style={{ marginTop: 10 }}>
                      <button onClick={() => setMeetings((prev) => prev.filter((x) => x.id !== m.id))} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger }}>{tt.delete}</button>
                    </div>
                  </div>
                ))}
                {meetings.length === 0 && <div style={{ fontSize: 13, color: colors.muted }}>{tt.noMeetings}</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 10, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{tt.scheduleMeeting}</div>
              <input value={meetingForm.title} onChange={(e) => setMeetingForm((p) => ({ ...p, title: e.target.value }))} placeholder={tt.meetingTitlePlaceholder} style={fieldStyle(colors)} />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input value={meetingForm.date} onChange={(e) => setMeetingForm((p) => ({ ...p, date: e.target.value }))} type="date" style={fieldStyle(colors)} />
                <input value={meetingForm.time} onChange={(e) => setMeetingForm((p) => ({ ...p, time: e.target.value }))} type="time" style={fieldStyle(colors)} />
              </div>
              <input value={meetingForm.attendees} onChange={(e) => setMeetingForm((p) => ({ ...p, attendees: e.target.value }))} placeholder={tt.attendeesPlaceholder} style={fieldStyle(colors)} />
              <textarea value={meetingForm.notes} onChange={(e) => setMeetingForm((p) => ({ ...p, notes: e.target.value }))} placeholder={tt.agendaPlaceholder} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <button
                onClick={() => {
                  if (!meetingForm.title.trim()) {
                    window.alert(tt.meetingTitleRequired);
                    return;
                  }
                  setMeetings((prev) => [{ id: String(Date.now()), ...meetingForm }, ...prev]);
                  setMeetingForm({ title: "", date: new Date().toISOString().slice(0, 10), time: "", attendees: "", notes: "" });
                }}
                style={primaryButton(colors)}
              >
                {tt.addMeeting}
              </button>
            </aside>
          </section>
        )}

        {activeTab === "maintenance" && (
          <section className="bti-two-col" style={{ display: "grid", gap: 16, gridTemplateColumns: "1.2fr 1fr" }}>
            <div style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}` }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 14 }}>{tt.maintenanceSectionTitle}</div>
              <div style={{ display: "grid", gap: 10 }}>
                {maintenanceItems.map((m) => {
                  const badge = statusStyles[m.status] || statusStyles.Pending;
                  return (
                    <div key={m.id} style={{ borderRadius: 10, border: `0.5px solid ${colors.border}`, padding: 14, background: colors.cardMuted }}>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <div style={{ fontSize: 15, fontWeight: 500 }}>{m.equipment}</div>
                        <span style={{ color: badge.text, background: badge.bg, borderRadius: 6, padding: "4px 10px", fontSize: 12, fontWeight: 500 }}>{statusLabels[lang][m.status]}</span>
                      </div>
                      <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.issue}</div>
                      <div style={{ fontSize: 12, color: colors.muted, marginTop: 6 }}>{m.technician || "-"} · {formatDate(m.date)}</div>
                      {m.notes && <div style={{ fontSize: 13, color: colors.muted, marginTop: 6 }}>{m.notes}</div>}
                      <div style={{ marginTop: 10 }}>
                        <button onClick={() => setMaintenanceItems((prev) => prev.filter((x) => x.id !== m.id))} style={{ ...secondaryButton(colors), color: colors.danger, borderColor: colors.danger }}>{tt.delete}</button>
                      </div>
                    </div>
                  );
                })}
                {maintenanceItems.length === 0 && <div style={{ fontSize: 13, color: colors.muted }}>{tt.noMaintenance}</div>}
              </div>
            </div>
            <aside style={{ background: colors.card, borderRadius: 12, padding: 16, border: `0.5px solid ${colors.border}`, display: "grid", gap: 10, height: "fit-content" }}>
              <div style={{ fontSize: 15, fontWeight: 500 }}>{tt.addMaintenance}</div>
              <input value={maintenanceForm.equipment} onChange={(e) => setMaintenanceForm((p) => ({ ...p, equipment: e.target.value }))} placeholder={tt.equipmentPlaceholder} style={fieldStyle(colors)} />
              <textarea value={maintenanceForm.issue} onChange={(e) => setMaintenanceForm((p) => ({ ...p, issue: e.target.value }))} placeholder={tt.issuePlaceholder} style={{ ...fieldStyle(colors), minHeight: 60, resize: "vertical" }} />
              <input value={maintenanceForm.technician} onChange={(e) => setMaintenanceForm((p) => ({ ...p, technician: e.target.value }))} placeholder={tt.technicianPlaceholder} style={fieldStyle(colors)} />
              <select value={maintenanceForm.status} onChange={(e) => setMaintenanceForm((p) => ({ ...p, status: e.target.value as TaskStatus }))} style={{ ...fieldStyle(colors), cursor: "pointer" }}>
                {statuses.map((s) => <option key={s} value={s}>{statusLabels[lang][s]}</option>)}
              </select>
              <textarea value={maintenanceForm.notes} onChange={(e) => setMaintenanceForm((p) => ({ ...p, notes: e.target.value }))} placeholder={tt.notesGeneric} style={{ ...fieldStyle(colors), minHeight: 52, resize: "vertical" }} />
              <button
                onClick={() => {
                  if (!maintenanceForm.equipment.trim()) {
                    window.alert(tt.equipmentRequired);
                    return;
                  }
                  setMaintenanceItems((prev) => [{ id: String(Date.now()), ...maintenanceForm, date: new Date().toISOString().slice(0, 10) }, ...prev]);
                  setMaintenanceForm({ equipment: "", issue: "", technician: "", status: "Pending", notes: "" });
                }}
                style={primaryButton(colors)}
              >
                {tt.addMaintenance}
              </button>
            </aside>
          </section>
        )}
      </div>
    </div>
  );
}

export default App;