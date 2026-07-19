import { useState, useEffect } from 'react';

// Data awal untuk demo
const initialUsers = [
  { id: 1, name: 'RUBEN HINA', role: 'Factory Supervisor', shift: 'Day' },
  { id: 2, name: 'John Doe', role: 'Staff', shift: 'Morning' },
  { id: 3, name: 'Jane Smith', role: 'Manager', shift: 'Night' }
];

const initialCategories = [
  'Production',
  'Cleaning',
  'Delivery',
  'Maintenance',
  'Meeting'
];

const initialTasks = [
  {
    id: 1,
    title: 'Maintenance Updated and Planning',
    category: 'Maintenance',
    assignee: 'RUBEN HINA',
    status: 'completed',
    startTime: '13:59',
    endTime: '13:59',
    reason: '',
    notes: 'Regular maintenance check'
  },
  {
    id: 2,
    title: 'Bike Delivery',
    category: 'Delivery',
    assignee: 'RUBEN HINA',
    status: 'completed',
    startTime: '12:03',
    endTime: '12:03',
    reason: '',
    notes: ''
  },
  {
    id: 3,
    title: 'Factory Cleaning',
    category: 'Cleaning',
    assignee: 'RUBEN HINA',
    status: 'completed',
    startTime: '12:03',
    endTime: '12:03',
    reason: '',
    notes: ''
  },
  {
    id: 4,
    title: 'Cocktails Ice Prep',
    category: 'Production',
    assignee: 'RUBEN HINA',
    status: 'completed',
    startTime: '13:53',
    endTime: '13:53',
    reason: '',
    notes: ''
  },
  {
    id: 5,
    title: 'Helping Organize Melting Bags',
    category: 'Production',
    assignee: 'RUBEN HINA',
    status: 'completed',
    startTime: '13:59',
    endTime: '13:59',
    reason: '',
    notes: ''
  },
  {
    id: 6,
    title: 'Ice Ball Harvest & Production',
    category: 'Production',
    assignee: 'RUBEN HINA',
    status: 'pending',
    startTime: '',
    endTime: '',
    reason: 'Still Watery',
    notes: ''
  },
  {
    id: 7,
    title: 'Daily Team Meeting',
    category: 'Meeting',
    assignee: 'RUBEN HINA',
    status: 'pending',
    startTime: '',
    endTime: '',
    reason: '',
    notes: ''
  },
  {
    id: 8,
    title: 'Equipment Inspection',
    category: 'Maintenance',
    assignee: 'John Doe',
    status: 'pending',
    startTime: '',
    endTime: '',
    reason: '',
    notes: ''
  }
];

function App() {
  const [users] = useState(initialUsers);
  const [currentUser, setCurrentUser] = useState(initialUsers[0]);
  const [tasks, setTasks] = useState(initialTasks);
  const [categories] = useState(initialCategories);
  const [newTask, setNewTask] = useState({ title: '', category: categories[0], notes: '' });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter tasks berdasarkan user yang login
  const filteredTasks = tasks.filter(task => task.assignee === currentUser.name);

  const completedTasks = filteredTasks.filter(t => t.status === 'completed');
  const pendingTasks = filteredTasks.filter(t => t.status === 'pending');

  const completionRate = filteredTasks.length > 0 
    ? Math.round((completedTasks.length / filteredTasks.length) * 100) 
    : 0;

  const getCurrentDate = () => {
    const now = new Date();
    return now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;
    
    const task = {
      id: Date.now(),
      title: newTask.title,
      category: newTask.category,
      assignee: currentUser.name,
      status: 'pending',
      startTime: '',
      endTime: '',
      reason: '',
      notes: newTask.notes
    };
    
    setTasks([...tasks, task]);
    setNewTask({ title: '', category: categories[0], notes: '' });
    setShowAddForm(false);
  };

  const completeTask = (taskId) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'completed', startTime: getCurrentTime(), endTime: getCurrentTime() }
        : task
    ));
  };

  const resetTask = (taskId) => {
    // Reset hanya menghilangkan tanggal, jam, dan status - notes tetap ada
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: 'pending', startTime: '', endTime: '', reason: '' }
        : task
    ));
  };

  const updateTaskReason = (taskId, reason) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, reason } : task
    ));
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const shareToWhatsApp = () => {
    const date = getCurrentDate();
    const submittedTime = new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ' | ' + getCurrentTime();
    
    let message = `📋 DAILY TASK REPORT\n`;
    message += `👤 Employee : ${currentUser.name}\n`;
    message += `💼 Role : ${currentUser.role}\n`;
    message += `🕒 Shift : ${currentUser.shift}\n`;
    message += `📅 Date : ${date}\n`;
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `📊 TASK SUMMARY\n`;
    message += `📌 Assigned : ${filteredTasks.length}\n`;
    message += `✅ Completed : ${completedTasks.length}\n`;
    message += `⏳ Pending : ${pendingTasks.length}\n`;
    message += `📈 Completion Rate : ${completionRate}%\n`;
    message += `━━━━━━━━━━━━━━━━━━\n`;
    
    if (completedTasks.length > 0) {
      message += `✅ COMPLETED TASKS\n\n`;
      completedTasks.forEach(task => {
        message += `${task.title} 🕒 ✓ ${task.endTime}`;
        if (task.notes) {
          message += `\n   Notes: ${task.notes}`;
        }
        message += `\n`;
      });
      message += `\n`;
    }
    
    if (pendingTasks.length > 0) {
      message += `━━━━━━━━━━━━━━━━━━\n`;
      message += `⏳ PENDING TASKS\n`;
      pendingTasks.forEach(task => {
        message += `• ${task.title}`;
        if (task.reason) {
          message += `\n  Reason: ${task.reason}`;
        }
        if (task.notes) {
          message += `\n  Notes: ${task.notes}`;
        }
        message += `\n`;
      });
      message += `\n`;
    }
    
    message += `━━━━━━━━━━━━━━━━━━\n`;
    message += `📤 Submitted by: ${currentUser.name}\n`;
    message += `🕒 Submitted: ${submittedTime}`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/?text=${encodedMessage}`, '_blank');
  };

  return (
    <div style={{ color: 'white' }}>
      {/* Header */}
      <div style={{ 
        background: 'rgba(255,255,255,0.1)', 
        backdropFilter: 'blur(10px)', 
        borderRadius: '15px', 
        padding: '20px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
          <div>
            <h1 className="bebas-neue" style={{ fontSize: '48px', color: '#7dd3fc', letterSpacing: '2px' }}>
              BLUE TICK ICE
            </h1>
            <p style={{ opacity: 0.8 }}>Task Management System</p>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select 
              value={currentUser.name}
              onChange={(e) => setCurrentUser(users.find(u => u.name === e.target.value))}
              style={{
                padding: '10px 15px',
                borderRadius: '8px',
                border: 'none',
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              {users.map(user => (
                <option key={user.id} value={user.name} style={{ color: 'black' }}>
                  {user.name} - {user.role}
                </option>
              ))}
            </select>
            
            <button 
              onClick={shareToWhatsApp}
              style={{
                padding: '10px 20px',
                borderRadius: '8px',
                border: 'none',
                background: '#25D366',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>📤</span> Share Report
            </button>
          </div>
        </div>
        
        {/* User Info */}
        <div style={{ marginTop: '15px', padding: '15px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px' }}>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            <span>👤 {currentUser.name}</span>
            <span>💼 {currentUser.role}</span>
            <span>🕒 Shift: {currentUser.shift}</span>
            <span>📅 {getCurrentDate()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '20px' }}>
        <div style={{ background: 'rgba(255,255,255,0.15)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{filteredTasks.length}</div>
          <div style={{ opacity: 0.8 }}>Total Tasks</div>
        </div>
        <div style={{ background: 'rgba(76, 175, 80, 0.3)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{completedTasks.length}</div>
          <div style={{ opacity: 0.8 }}>Completed</div>
        </div>
        <div style={{ background: 'rgba(255, 152, 0, 0.3)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{pendingTasks.length}</div>
          <div style={{ opacity: 0.8 }}>Pending</div>
        </div>
        <div style={{ background: 'rgba(33, 150, 243, 0.3)', padding: '20px', borderRadius: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold' }}>{completionRate}%</div>
          <div style={{ opacity: 0.8 }}>Completion Rate</div>
        </div>
      </div>

      {/* Add Task Button */}
      <button 
        onClick={() => setShowAddForm(!showAddForm)}
        style={{
          width: '100%',
          padding: '15px',
          borderRadius: '12px',
          border: '2px dashed rgba(255,255,255,0.3)',
          background: 'transparent',
          color: 'white',
          fontSize: '16px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {showAddForm ? 'Cancel' : '+ Add New Task'}
      </button>

      {/* Add Task Form */}
      {showAddForm && (
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '20px', 
          borderRadius: '12px', 
          marginBottom: '20px' 
        }}>
          <input
            type="text"
            placeholder="Task title..."
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '14px'
            }}
          />
          <select
            value={newTask.category}
            onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '14px'
            }}
          >
            {categories.map(cat => (
              <option key={cat} value={cat} style={{ color: 'black' }}>{cat}</option>
            ))}
          </select>
          <textarea
            placeholder="Notes (optional)..."
            value={newTask.notes}
            onChange={(e) => setNewTask({ ...newTask, notes: e.target.value })}
            style={{
              width: '100%',
              padding: '12px',
              marginBottom: '10px',
              borderRadius: '8px',
              border: 'none',
              background: 'rgba(255,255,255,0.9)',
              fontSize: '14px',
              minHeight: '80px',
              resize: 'vertical'
            }}
          />
          <button 
            onClick={addTask}
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              border: 'none',
              background: '#4CAF50',
              color: 'white',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Add Task
          </button>
        </div>
      )}

      {/* Completed Tasks */}
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>✅</span> Completed Tasks ({completedTasks.length})
        </h2>
        {completedTasks.length === 0 ? (
          <p style={{ opacity: 0.7, fontStyle: 'italic' }}>No completed tasks yet</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {completedTasks.map(task => (
              <div 
                key={task.id}
                style={{
                  background: 'rgba(76, 175, 80, 0.2)',
                  border: '1px solid rgba(76, 175, 80, 0.4)',
                  borderRadius: '12px',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {task.category}
                      </span>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        🕒 ✓ {task.endTime}
                      </span>
                    </div>
                    {task.notes && (
                      <div style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        padding: '8px', 
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontStyle: 'italic'
                      }}>
                        📝 Notes: {task.notes}
                      </div>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => resetTask(task.id)}
                      title="Reset Task"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(255, 152, 0, 0.7)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ↻ Reset
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      title="Delete Task"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(244, 67, 54, 0.7)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pending Tasks */}
      <div>
        <h2 style={{ fontSize: '24px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>⏳</span> Pending Tasks ({pendingTasks.length})
        </h2>
        {pendingTasks.length === 0 ? (
          <p style={{ opacity: 0.7, fontStyle: 'italic' }}>All tasks completed! 🎉</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {pendingTasks.map(task => (
              <div 
                key={task.id}
                style={{
                  background: 'rgba(255, 152, 0, 0.2)',
                  border: '1px solid rgba(255, 152, 0, 0.4)',
                  borderRadius: '12px',
                  padding: '15px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '5px' }}>{task.title}</div>
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '8px' }}>
                      <span style={{ 
                        background: 'rgba(255,255,255,0.2)', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        fontSize: '12px'
                      }}>
                        {task.category}
                      </span>
                    </div>
                    {task.notes && (
                      <div style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        padding: '8px', 
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontStyle: 'italic',
                        marginBottom: '8px'
                      }}>
                        📝 Notes: {task.notes}
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
                      <input
                        type="text"
                        placeholder="Reason for pending (optional)..."
                        value={task.reason}
                        onChange={(e) => updateTaskReason(task.id, e.target.value)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          background: 'rgba(255,255,255,0.1)',
                          color: 'white',
                          fontSize: '13px'
                        }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => completeTask(task.id)}
                      title="Complete Task"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(76, 175, 80, 0.7)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✓ Done
                    </button>
                    <button 
                      onClick={() => deleteTask(task.id)}
                      title="Delete Task"
                      style={{
                        padding: '8px 12px',
                        borderRadius: '6px',
                        border: 'none',
                        background: 'rgba(244, 67, 54, 0.7)',
                        color: 'white',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      ✕ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
