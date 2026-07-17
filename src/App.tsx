import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import "./App.css";

type UserRole = "Admin" | "Staff";
type Status = "Pending" | "In Progress" | "Completed" | "Cancelled";
type Priority = "High" | "Medium" | "Low";
type Category =
  | "Production"
  | "Delivery"
  | "Cleaning"
  | "Maintenance"
  | "Office"
  | "Warehouse"
  | "Administration"
  | "Others";

type Task = {
  id: string;
  title: string;
  description: string;
  category: Category;
  priority: Priority;
  assignee: string;
  deadline: string;
  status: Status;
  notes: string;
  photo?: string;
  createdAt: string;
  createdByRole?: UserRole;
  startTime?: string;
  endTime?: string;
  reason?: string;
  completedBy?: string;
  completedAt?: string;
};

const categories: Category[] = [
  "Production",
  "Delivery",
  "Cleaning",
  "Maintenance",
  "Office",
  "Warehouse",
  "Administration",
  "Others",
];
const priorities: Priority[] = ["High", "Medium", "Low"];
const statuses: Status[] = ["Pending", "In Progress", "Completed", "Cancelled"];
const statusColors: Record<Status, string> = {
  Pending: "#6b7280",
  "In Progress": "#3b82f6",
  Completed: "#16a34a",
  Cancelled: "#dc2626",
};

const statusBadgeBackground: Record<Status, string> = {
  Pending: "#f8fafc",
  "In Progress": "#dbeafe",
  Completed: "#dcfce7",
  Cancelled: "#fee2e2",
};

const statusBadgeText: Record<Status, string> = {
  Pending: "#475569",
  "In Progress": "#1d4ed8",
  Completed: "#166534",
  Cancelled: "#b91c1c",
};

type Language = "id" | "en";

const translations: Record<Language, Record<string, string>> = {
  id: {
    darkMode: "Mode Gelap",
    lightMode: "Mode Terang",
    languageLabel: "Bahasa",
    dashboard: "Dashboard",
    totalTasks: "Total tugas",
    completed: "Selesai",
    remaining: "Belum selesai",
    pending: "Pending",
    progress: "Progress",
    reportHeader: "Laporan & Share",
    shareDescription: "Bagikan status tugas ke WhatsApp.",
    shareWhatsApp: "Share WhatsApp",
    taskManagement: "Task Management",
    roleView: "view",
    exportCsv: "Export CSV",
    searchPlaceholder: "Cari tugas...",
    addEditTask: "Tambah / Edit Task",
    adminStaffNote: "Admin dan Staff dapat membuat task. Edit/hapus hanya untuk Admin.",
    titlePlaceholder: "Judul tugas",
    descriptionPlaceholder: "Deskripsi tugas",
    assigneePlaceholder: "Penanggung jawab",
    notesPlaceholder: "Catatan internal",
    startTimePlaceholder: "Jam Mulai",
    endTimePlaceholder: "Jam Selesai",
    reasonPlaceholder: "Alasan jika Pending atau In Progress",
    saveChanges: "Simpan Perubahan",
    addTask: "Tambah Task",
    resetAllTasks: "Reset Seluruh Task",
    resetConfirm: "Apakah Anda ingin mereset semua task?",
    alertTitleRequired: "Judul tugas wajib diisi.",
    alertAssigneeRequired: "Penanggung jawab wajib diisi.",
    alertTaskLimitReached: "Batas 50 tugas untuk peran telah tercapai.",
    alertEditAdminOnly: "Edit tugas hanya diperbolehkan oleh Admin.",
    createdLabel: "Dibuat",
    deadlineLabel: "Deadline",
    timeLabel: "Waktu",
    reasonLabel: "Alasan",
    taskCreatedByRole: "tugas dibuat oleh",
    limitReached: "Batas tercapai untuk penambahan tugas baru.",
    canAddTask: "Peran ini dapat membuat task baru.",
    reportDateAt: "pukul",
    accessWebLabel: "🔗 Akses web:",
  },
  en: {
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
    languageLabel: "Language",
    dashboard: "Dashboard",
    totalTasks: "Total tasks",
    completed: "Completed",
    remaining: "Remaining",
    pending: "Pending",
    progress: "Progress",
    reportHeader: "Report & Share",
    shareDescription: "Share task status to WhatsApp.",
    shareWhatsApp: "Share WhatsApp",
    taskManagement: "Task Management",
    roleView: "view",
    exportCsv: "Export CSV",
    searchPlaceholder: "Search tasks...",
    addEditTask: "Add / Edit Task",
    adminStaffNote: "Admin and Staff can create tasks. Edit/delete only by Admin.",
    titlePlaceholder: "Task title",
    descriptionPlaceholder: "Task description",
    assigneePlaceholder: "Assignee",
    notesPlaceholder: "Internal notes",
    startTimePlaceholder: "Start time",
    endTimePlaceholder: "End time",
    reasonPlaceholder: "Reason if Pending or In Progress",
    saveChanges: "Save Changes",
    addTask: "Add Task",
    resetAllTasks: "Reset All Tasks",
    resetConfirm: "Do you want to reset all tasks?",
    alertTitleRequired: "Task title is required.",
    alertAssigneeRequired: "Assignee is required.",
    alertTaskLimitReached: "50 task limit for this role has been reached.",
    alertEditAdminOnly: "Edit is allowed only for Admin.",
    createdLabel: "Created",
    deadlineLabel: "Deadline",
    timeLabel: "Time",
    reasonLabel: "Reason",
    taskCreatedByRole: "tasks created by",
    limitReached: "Limit reached for adding new tasks.",
    canAddTask: "This role can add new tasks.",
    reportDateAt: "at",
    accessWebLabel: "🔗 Web access:",
  },
};

const sampleTasks: Task[] = [
  {
    id: "1",
    title: "Clean Machine",
    description: "Bersihkan mesin utama agar siap digunakan.",
    category: "Production",
    priority: "High",
    assignee: "Budi",
    deadline: "2026-07-17",
    status: "Completed",
    notes: "Selesai pagi ini.",
    createdAt: "2026-07-17",
    startTime: "08:00",
    endTime: "09:10",
    createdByRole: "Admin",
    completedBy: "Budi",
    completedAt: "09:10",
  },
  {
    id: "2",
    title: "Wash Mold",
    description: "Cuci cetakan setelah produksi.",
    category: "Maintenance",
    priority: "Medium",
    assignee: "Ani",
    deadline: "2026-07-17",
    status: "Completed",
    notes: "Tidak ada masalah.",
    createdAt: "2026-07-17",
    completedBy: "Ani",
    completedAt: "10:30",
  },
  {
    id: "3",
    title: "Prepare Delivery",
    description: "Siapkan barang dan dokumen pengiriman.",
    category: "Delivery",
    priority: "High",
    assignee: "Siti",
    deadline: "2026-07-17",
    status: "In Progress",
    notes: "Menunggu armada.",
    startTime: "10:00",
    endTime: "12:30",
    reason: "Tim produksi belum siap mengangkut.",
    createdAt: "2026-07-17",
  },
  {
    id: "4",
    title: "Check Water Pump",
    description: "Periksa pompa air area produksi.",
    category: "Maintenance",
    priority: "Low",
    assignee: "Dedi",
    deadline: "2026-07-18",
    status: "Pending",
    notes: "Belum dilakukan.",
    createdAt: "2026-07-17",
    createdByRole: "Admin",
  },
];

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

const formatTimeRange = (task: Task) => {
  if (!task.startTime && !task.endTime) return "";
  return `${task.startTime || "-"} - ${task.endTime || "-"}`;
};

const getTaskDuration = (task: Task) => {
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

function App() {
  const [role, setRole] = useState<UserRole>("Admin");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [lang, setLang] = useState<Language>("id");
  const [logoSrc, setLogoSrc] = useState<string | null>(null);
  const t = translations[lang];
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem("blue-tick-todo-tasks");
    return saved ? JSON.parse(saved) : sampleTasks;
  });
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [taskForm, setTaskForm] = useState<Partial<Task>>({
    title: "",
    description: "",
    category: "Production",
    priority: "Medium",
    assignee: "",
    deadline: new Date().toISOString().slice(0, 10),
    status: "Pending",
    notes: "",
    startTime: "",
    endTime: "",
    reason: "",
  });

  useEffect(() => {
    localStorage.setItem("blue-tick-todo-tasks", JSON.stringify(tasks));
  }, [tasks]);

  const today = new Date().toLocaleDateString(lang === "id" ? "id-ID" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const filteredTasks = useMemo(
    () =>
      tasks
        .filter((task) => {
          const matchesSearch =
            !search ||
            task.title.toLowerCase().includes(search.toLowerCase()) ||
            task.description.toLowerCase().includes(search.toLowerCase()) ||
            task.assignee.toLowerCase().includes(search.toLowerCase());
          const matchesCategory =
            filterCategory === "All" || task.category === filterCategory;
          const matchesStatus =
            filterStatus === "All" || task.status === filterStatus;
          const matchesPriority =
            filterPriority === "All" || task.priority === filterPriority;
          return matchesSearch && matchesCategory && matchesStatus && matchesPriority;
        })
        .sort((a, b) => {
          const order = { High: 0, Medium: 1, Low: 2 } as const;
          return order[a.priority] - order[b.priority];
        }),
    [tasks, search, filterCategory, filterStatus, filterPriority]
  );

  const totalCount = tasks.length;
  const completedCount = tasks.filter((task) => task.status === "Completed").length;
  const pendingCount = tasks.filter((task) => task.status === "Pending").length;
  const remainingCount = tasks.filter(
    (task) => task.status !== "Completed" && task.status !== "Cancelled"
  ).length;
  const taskLimit = 50;
  const roleTaskCount = tasks.filter((task) => task.createdByRole === role).length;
  const taskLimitReached = roleTaskCount >= taskLimit;
  const completionPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleFormChange = (field: keyof Task, value: string) => {
    setTaskForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveTask = () => {
    if (!taskForm.title?.trim()) {
      window.alert(t.alertTitleRequired);
      return;
    }
    if (!taskForm.assignee?.trim()) {
      window.alert(t.alertAssigneeRequired);
      return;
    }

    const isNew = !taskForm.id;
    if (isNew && taskLimitReached) {
      window.alert(`Batas ${taskLimit} tugas untuk peran ${role} telah tercapai.`);
      return;
    }

    if (!isNew && role !== "Admin") {
      window.alert("Edit tugas hanya diperbolehkan oleh Admin.");
      return;
    }

    const normalizedTask: Task = {
      id: taskForm.id || String(Date.now()),
      title: taskForm.title,
      description: taskForm.description || "",
      category: (taskForm.category || "Production") as Category,
      priority: (taskForm.priority || "Medium") as Priority,
      assignee: taskForm.assignee,
      deadline: taskForm.deadline || new Date().toISOString().slice(0, 10),
      status: (taskForm.status || "Pending") as Status,
      notes: taskForm.notes || "",
      createdAt: taskForm.createdAt || new Date().toISOString().slice(0, 10),
      createdByRole: taskForm.createdByRole || role,
      startTime: taskForm.startTime,
      endTime: taskForm.endTime,
      reason: taskForm.reason || "",
      completedBy: taskForm.completedBy,
      completedAt: taskForm.completedAt,
      photo: taskForm.photo,
    };

    setTasks((prev) => {
      const exists = prev.some((item) => item.id === normalizedTask.id);
      if (exists) {
        return prev.map((item) => (item.id === normalizedTask.id ? normalizedTask : item));
      }
      return [normalizedTask, ...prev];
    });

    setTaskForm({
      title: "",
      description: "",
      category: "Production",
      priority: "Medium",
      assignee: "",
      deadline: new Date().toISOString().slice(0, 10),
      status: "Pending",
      notes: "",
      startTime: "",
      endTime: "",
      reason: "",
    });
  };

  const handleEditTask = (task: Task) => {
    setTaskForm(task);
  };

  const handleDeleteTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const handleResetTasks = () => {
    if (window.confirm(t.resetConfirm)) {
      setTasks([]);
    }
  };

  const handleStatusToggle = (task: Task) => {
    if (role === "Staff") {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === task.id
            ? {
                ...item,
                status: item.status === "Completed" ? "In Progress" : "Completed",
                completedBy: item.status === "Completed" ? undefined : "Staff",
                completedAt:
                  item.status === "Completed"
                    ? undefined
                    : new Date().toLocaleTimeString("en-GB", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
              }
            : item
        )
      );
    }
  };

  const handlePhotoUpload = (id: string, e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setTasks((prev) => prev.map((task) => (task.id === id ? { ...task, photo: result } : task)));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === "string") {
        setLogoSrc(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const shareWhatsApp = () => {
    const completedTasks = tasks.filter((task) => task.status === "Completed");
    const remainingTasks = tasks.filter((task) => task.status !== "Completed" && task.status !== "Cancelled");
    const now = new Date();
    const formattedDate = now.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
    const formattedTime = now.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const reportDate = `${formattedDate} pukul ${formattedTime}`;

    const completedLines = completedTasks.map((task) => {
      const duration = getTaskDuration(task);
      const timeRange = formatTimeRange(task);
      const timeInfo = timeRange ? ` (${timeRange}${duration ? `, ${duration}` : ""})` : "";
      return `✔ ${task.title}${timeInfo}`;
    });

    const remainingLines = remainingTasks.map((task) => {
      const duration = getTaskDuration(task);
      const timeRange = formatTimeRange(task);
      const timeInfo = timeRange ? ` (${timeRange}${duration ? `, ${duration}` : ""})` : "";
      return `• ${task.title}${timeInfo}`;
    });

    const lines = [
      "🧊 RUBEN TO DO",
      "",
      `📅 ${reportDate}`,
      "",
      "━━━━━━━━━━━━━━",
      "",
      `✅ COMPLETED (${completedTasks.length})`,
      "",
      ...completedLines,
      "",
      "━━━━━━━━━━━━━━",
      "",
      `⬜ REMAINING (${remainingTasks.length})`,
      "",
      ...remainingLines,
      "",
      "━━━━━━━━━━━━━━",
      "",
      "📊 Progress",
      `${completionPercent}%`,
      "",
      "Ruben",
      "",
      `🔗 Akses web: ${window.location.href}`,
    ].join("\n");
    window.open(`https://wa.me/?text=${encodeURIComponent(lines)}`, "_blank");
  };

  const exportCsv = () => {
    const header = ["Title", "Description", "Category", "Priority", "Assignee", "Deadline", "Status", "Notes"];
    const rows = tasks.map((task) => [
      task.title,
      task.description,
      task.category,
      task.priority,
      task.assignee,
      task.deadline,
      task.status,
      task.notes.replace(/\n/g, " "),
    ]);
    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${value}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "blue-tick-todo.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  const colors = theme === "light"
    ? {
        page: "#f3f4f6",
        card: "#ffffff",
        text: "#0f172a",
        muted: "#475569",
        border: "#e2e8f0",
      }
    : {
        page: "#0f172a",
        card: "#111827",
        text: "#f8fafc",
        muted: "#cbd5e1",
        border: "#334155",
      };

  return (
    <div className="app-root"
      style={{
        minHeight: "100vh",
        background: colors.page,
        color: colors.text,
        fontFamily: "Inter, Arial, sans-serif",
        padding: 24,
      }}
    >
      <div className="app-content"
        style={{
          maxWidth: 1200,
          margin: "0 auto",
          display: "grid",
          gap: 24,
        }}
      >
        <header className="app-header"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div className="header-brand" style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: 18,
                background: "#60a5fa",
                color: "white",
                display: "grid",
                placeItems: "center",
                fontSize: 24,
                fontWeight: 800,
                position: "relative",
                overflow: "hidden",
              }}
            >
              {logoSrc ? (
                <img
                  src={logoSrc}
                  alt="Logo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                "✓"
              )}
              <input
                id="logo-upload"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleLogoUpload}
              />
            </div>
            <div>
              <div
                style={{
                  fontSize: 28,
                  fontWeight: 700,
                  fontFamily: "'Matterhorn', cursive",
                  lineHeight: 1.05,
                }}
              >
                Daily Operation Task
              </div>
              <div
                style={{
                  marginTop: 8,
                  fontSize: 38,
                  fontWeight: 800,
                  fontFamily: "'Bebas Neue', sans-serif",
                  letterSpacing: "0.08em",
                  color: "#7dd3fc",
                }}
              >
                BLUE TICK ICE
              </div>
            </div>
          </div>
          <div className="header-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button
              onClick={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}
              style={{
                border: `1px solid ${colors.border}`,
                borderRadius: 10,
                padding: "10px 14px",
                background: colors.card,
                color: colors.text,
                cursor: "pointer",
              }}
            >
              {theme === "light" ? t.darkMode : t.lightMode}
            </button>
            <select
              value={lang}
              onChange={(e) => setLang(e.target.value as Language)}
              style={{
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                padding: "10px 12px",
                background: colors.card,
                color: colors.text,
                cursor: "pointer",
              }}
            >
              <option value="id">ID</option>
              <option value="en">EN</option>
            </select>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{
                borderRadius: 10,
                border: `1px solid ${colors.border}`,
                padding: "10px 12px",
                background: colors.card,
                color: colors.text,
                cursor: "pointer",
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          </div>
        </header>

        <section className="dashboard-grid"
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          }}
        >
          <div
            style={{
              background: colors.card,
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>
              {t.dashboard}
            </div>
            <div style={{ marginBottom: 16, color: colors.muted }}>{today}</div>
            <div style={{ display: "grid", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: colors.muted }}>
                <span>{t.totalTasks}</span>
                <strong>{totalCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: colors.muted }}>
                <span>{t.completed}</span>
                <strong>{completedCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: colors.muted }}>
                <span>{t.remaining}</span>
                <strong>{remainingCount}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: colors.muted }}>
                <span>{t.pending}</span>
                <strong>{pendingCount}</strong>
              </div>
            </div>
          </div>
          <div
            style={{
              background: colors.card,
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Progress</div>
            <div style={{ fontSize: 32, fontWeight: 800, color: "#3b82f6" }}>
              {completionPercent}%
            </div>
            <div
              style={{
                height: 12,
                background: colors.border,
                borderRadius: 999,
                marginTop: 14,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${completionPercent}%`,
                  height: "100%",
                  background: "#60a5fa",
                }}
              />
            </div>
          </div>
          <div
            style={{
              background: colors.card,
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>{t.reportHeader}</div>
              <div style={{ color: colors.muted, marginBottom: 16 }}>
                {t.shareDescription}
              </div>
            </div>
            <button
              onClick={shareWhatsApp}
              style={{
                width: "100%",
                borderRadius: 12,
                padding: "12px 16px",
                border: "none",
                background: "#10b981",
                color: "white",
                cursor: "pointer",
              }}
            >
              Share WhatsApp
            </button>
          </div>
        </section>

        <section className="main-grid"
          style={{
            display: "grid",
            gap: 24,
            gridTemplateColumns: "1.2fr 1fr",
          }}
        >
          <div
            style={{
              background: colors.card,
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${colors.border}`,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <div>
                <div style={{ fontSize: 18, fontWeight: 700 }}>{t.taskManagement}</div>
                <div style={{ color: colors.muted, marginTop: 4 }}>{role} {t.roleView}</div>
              </div>
              <button
                onClick={exportCsv}
                style={{
                  borderRadius: 10,
                  padding: "10px 14px",
                  border: `1px solid ${colors.border}`,
                  background: colors.card,
                  color: colors.text,
                  cursor: "pointer",
                }}
              >
                {t.exportCsv}
              </button>
            </div>

            <div className="filter-row"
              style={{
                marginBottom: 20,
                display: "grid",
                gap: 12,
                gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
              }}
            >
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.searchPlaceholder}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "10px 12px",
                  background: colors.page,
                  color: colors.text,
                  gridColumn: "span 2",
                }}
              />
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "10px 12px",
                  background: colors.page,
                  color: colors.text,
                }}
              >
                <option>All</option>
                {categories.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "10px 12px",
                  background: colors.page,
                  color: colors.text,
                }}
              >
                <option>All</option>
                {statuses.map((status) => (
                  <option key={status}>{status}</option>
                ))}
              </select>
              <select
                value={filterPriority}
                onChange={(e) => setFilterPriority(e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "10px 12px",
                  background: colors.page,
                  color: colors.text,
                }}
              >
                <option>All</option>
                {priorities.map((priority) => (
                  <option key={priority}>{priority}</option>
                ))}
              </select>
            </div>

            <div className="task-list" style={{ display: "grid", gap: 14 }}>
              {filteredTasks.map((task) => (
                <div
                  key={task.id}
                  className="task-card"
                  style={{
                    borderRadius: 18,
                    border: `1px solid ${colors.border}`,
                    padding: 18,
                    background: colors.page,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 16 }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700 }}>{task.title}</div>
                      <div style={{ color: colors.muted, marginTop: 6, fontSize: 13 }}>
                        {task.category} • {task.priority} • {task.assignee}
                      </div>
                    </div>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: statusBadgeText[task.status],
                        background: statusBadgeBackground[task.status],
                        border: `1px solid ${statusColors[task.status]}`,
                        borderRadius: 999,
                        padding: "6px 10px",
                        fontSize: 12,
                        fontWeight: 700,
                        lineHeight: 1,
                        whiteSpace: "nowrap",
                        minWidth: 0,
                      }}
                    >
                      {task.status}
                    </span>
                  </div>

                  <div style={{ marginTop: 12, color: colors.muted, fontSize: 14 }}>
                    {task.description}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 14 }}>
                    <div style={{ fontSize: 13, color: colors.muted }}>
                      Deadline: {formatDate(task.deadline)}
                    </div>
                    <div style={{ fontSize: 13, color: colors.muted }}>
                      Dibuat: {formatDate(task.createdAt)}
                    </div>
                    {(task.startTime || task.endTime) && (
                      <div style={{ fontSize: 13, color: colors.muted }}>
                        Waktu: {formatTimeRange(task)}
                        {getTaskDuration(task) ? ` (${getTaskDuration(task)})` : ""}
                      </div>
                    )}
                  </div>
                  {(task.status === "Pending" || task.status === "In Progress") && task.reason && (
                    <div
                      style={{
                        marginTop: 12,
                        borderLeft: `4px solid ${statusColors[task.status]}`,
                        paddingLeft: 12,
                        color: colors.text,
                        background: theme === "light" ? "#f8fafc" : "#1f2937",
                        borderRadius: 12,
                        fontSize: 13,
                      }}
                    >
                      Alasan: {task.reason}
                    </div>
                  )}

                  {task.photo && (
                    <img
                      src={task.photo}
                      alt="Bukti"
                      style={{
                        width: "100%",
                        marginTop: 14,
                        borderRadius: 14,
                        maxHeight: 180,
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <div className="task-card-actions" style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <label style={{ cursor: "pointer", color: "#2563eb", fontSize: 13 }}>
                      Upload Foto Bukti
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(task.id, e)}
                        style={{ display: "none" }}
                      />
                    </label>
                    <button
                      onClick={() => handleStatusToggle(task)}
                      style={{
                        borderRadius: 10,
                        border: "1px solid #2563eb",
                        background: "#2563eb",
                        color: "white",
                        padding: "8px 12px",
                        cursor: "pointer",
                      }}
                    >
                      {task.status === "Completed" ? "Undo" : "Checklist"}
                    </button>
                    {role === "Admin" && (
                      <>
                        <button
                          onClick={() => handleEditTask(task)}
                          style={{
                            borderRadius: 10,
                            border: `1px solid ${colors.border}`,
                            background: colors.card,
                            color: colors.text,
                            padding: "8px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          style={{
                            borderRadius: 10,
                            border: "1px solid #ef4444",
                            background: "#ef4444",
                            color: "white",
                            padding: "8px 12px",
                            cursor: "pointer",
                          }}
                        >
                          Hapus
                        </button>
                      </>
                    )}
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <textarea
                      value={task.notes}
                      onChange={(e) =>
                        setTasks((prev) =>
                          prev.map((item) =>
                            item.id === task.id ? { ...item, notes: e.target.value } : item
                          )
                        )
                      }
                      placeholder="Catatan tambahan..."
                      style={{
                        width: "100%",
                        minHeight: 80,
                        borderRadius: 14,
                        border: `1px solid ${colors.border}`,
                        padding: 12,
                        background: colors.card,
                        color: colors.text,
                        resize: "vertical",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <aside
            style={{
              background: colors.card,
              borderRadius: 20,
              padding: 20,
              border: `1px solid ${colors.border}`,
              display: "flex",
              flexDirection: "column",
              gap: 18,
            }}
          >
            <div>
              <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>
                {t.addEditTask}
              </div>
              <div style={{ color: colors.muted, fontSize: 14 }}>
                {t.adminStaffNote}
              </div>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <input
                value={taskForm.title}
                onChange={(e) => handleFormChange("title", e.target.value)}
                placeholder={t.titlePlaceholder}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                }}
              />
              <textarea
                value={taskForm.description}
                onChange={(e) => handleFormChange("description", e.target.value)}
                placeholder={t.descriptionPlaceholder}
                style={{
                  width: "100%",
                  minHeight: 96,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                  resize: "vertical",
                }}
              />
              <select
                className="mobile-hide"
                value={taskForm.category}
                onChange={(e) => handleFormChange("category", e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
              <select
                className="mobile-hide"
                value={taskForm.priority}
                onChange={(e) => handleFormChange("priority", e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                }}
              >
                {priorities.map((priority) => (
                  <option key={priority} value={priority}>
                    {priority}
                  </option>
                ))}
              </select>
              <input
                value={taskForm.assignee}
                onChange={(e) => handleFormChange("assignee", e.target.value)}
                placeholder={t.assigneePlaceholder}
                style={{
                  width: "100%",
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                }}
              />
              <input
                value={taskForm.deadline}
                onChange={(e) => handleFormChange("deadline", e.target.value)}
                type="date"
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                }}
              />
              <select
                className="mobile-hide"
                value={taskForm.status}
                onChange={(e) => handleFormChange("status", e.target.value)}
                style={{
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                }}
              >
                {statuses.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
              <textarea
                className="mobile-hide"
                value={taskForm.notes}
                onChange={(e) => handleFormChange("notes", e.target.value)}
                placeholder={t.notesPlaceholder}
                style={{
                  width: "100%",
                  minHeight: 96,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                  resize: "vertical",
                }}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <input
                  type="time"
                  value={taskForm.startTime || ""}
                  onChange={(e) => handleFormChange("startTime", e.target.value)}
                  placeholder={t.startTimePlaceholder}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    padding: "12px 14px",
                    background: colors.page,
                    color: colors.text,
                  }}
                />
                <input
                  type="time"
                  value={taskForm.endTime || ""}
                  onChange={(e) => handleFormChange("endTime", e.target.value)}
                  placeholder={t.endTimePlaceholder}
                  style={{
                    width: "100%",
                    borderRadius: 12,
                    border: `1px solid ${colors.border}`,
                    padding: "12px 14px",
                    background: colors.page,
                    color: colors.text,
                  }}
                />
              </div>
              <textarea
                value={taskForm.reason}
                onChange={(e) => handleFormChange("reason", e.target.value)}
                placeholder={t.reasonPlaceholder}
                style={{
                  width: "100%",
                  minHeight: 72,
                  borderRadius: 12,
                  border: `1px solid ${colors.border}`,
                  padding: "12px 14px",
                  background: colors.page,
                  color: colors.text,
                  resize: "vertical",
                }}
              />
              <button
                type="button"
                onClick={handleSaveTask}
                style={{
                  borderRadius: 12,
                  border: "none",
                  background: "#2563eb",
                  color: "white",
                  padding: "12px 14px",
                  cursor: taskLimitReached && !taskForm.id ? "not-allowed" : "pointer",
                  opacity: taskLimitReached && !taskForm.id ? 0.6 : 1,
                }}
                disabled={taskLimitReached && !taskForm.id}
              >
                {taskForm.id ? t.saveChanges : t.addTask}
              </button>
              <div style={{ color: colors.muted, fontSize: 13, marginTop: 8 }}>
                {roleTaskCount}/{taskLimit} {t.taskCreatedByRole} {role}. {taskLimitReached ? t.limitReached : t.canAddTask}
              </div>
              {role === "Admin" && (
                <button
                  onClick={handleResetTasks}
                  style={{
                    borderRadius: 12,
                    border: "1px solid #ef4444",
                    background: "transparent",
                    color: "#ef4444",
                    padding: "12px 14px",
                    cursor: "pointer",
                  }}
                >
                  {t.resetAllTasks}
                </button>
              )}
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}

export default App;
