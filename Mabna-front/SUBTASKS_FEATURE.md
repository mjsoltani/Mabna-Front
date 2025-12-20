# فیچر Subtasks (چک‌لیست وظایف)

## 📋 توضیحات

هر task حالا می‌تونه یک لیست از subtasks (زیروظایف) داشته باشه که به صورت چک‌لیست کار می‌کنن.

---

## 🔌 API Endpoints

### 1. ساخت Task با Subtasks

**POST** `/api/tasks`

```json
{
  "title": "پیاده‌سازی صفحه لندینگ",
  "assignee_id": "user-uuid",
  "key_result_ids": [],
  "status": "todo",
  "type": "routine",
  "subtasks": [
    {"title": "طراحی UI"},
    {"title": "کدنویسی HTML/CSS"},
    {"title": "اضافه کردن انیمیشن"},
    {"title": "تست روی موبایل"}
  ]
}
```

**Response:**
```json
{
  "id": "task-uuid",
  "title": "پیاده‌سازی صفحه لندینگ",
  "status": "todo",
  "type": "routine",
  "assignee": {
    "user_id": "user-uuid",
    "full_name": "محمد جواد"
  },
  "key_results": [],
  "subtasks": [
    {
      "id": "subtask-1-uuid",
      "title": "طراحی UI",
      "isCompleted": false,
      "taskId": "task-uuid",
      "createdAt": "2025-12-15T10:00:00.000Z"
    },
    {
      "id": "subtask-2-uuid",
      "title": "کدنویسی HTML/CSS",
      "isCompleted": false,
      "taskId": "task-uuid",
      "createdAt": "2025-12-15T10:00:00.000Z"
    }
  ],
  "created_at": "2025-12-15T10:00:00.000Z"
}
```

---

### 2. دریافت Tasks (با Subtasks)

**GET** `/api/tasks`

**Response:**
```json
[
  {
    "id": "task-uuid",
    "title": "پیاده‌سازی صفحه لندینگ",
    "status": "in_progress",
    "type": "routine",
    "assignee": {
      "user_id": "user-uuid",
      "full_name": "محمد جواد"
    },
    "key_results": [],
    "subtasks": [
      {
        "id": "subtask-1-uuid",
        "title": "طراحی UI",
        "isCompleted": true,
        "taskId": "task-uuid",
        "createdAt": "2025-12-15T10:00:00.000Z"
      },
      {
        "id": "subtask-2-uuid",
        "title": "کدنویسی HTML/CSS",
        "isCompleted": false,
        "taskId": "task-uuid",
        "createdAt": "2025-12-15T10:00:00.000Z"
      }
    ],
    "created_at": "2025-12-15T10:00:00.000Z"
  }
]
```

---

### 3. Toggle Subtask (تغییر وضعیت)

**PUT** `/api/subtasks/:id/toggle`

این endpoint وضعیت `isCompleted` رو toggle می‌کنه (true ↔ false)

**Response:**
```json
{
  "id": "subtask-uuid",
  "title": "طراحی UI",
  "isCompleted": true,
  "taskId": "task-uuid",
  "createdAt": "2025-12-15T10:00:00.000Z"
}
```

---

### 4. حذف Subtask

**DELETE** `/api/subtasks/:id`

**Response:**
```json
{
  "message": "Subtask deleted successfully"
}
```

---

## 💻 نمونه کد React

### Component برای نمایش Task با Subtasks

```jsx
import React, { useState } from 'react';

function TaskCard({ task, onSubtaskToggle, onSubtaskDelete }) {
  const completedCount = task.subtasks.filter(st => st.isCompleted).length;
  const totalCount = task.subtasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>Assignee: {task.assignee.full_name}</p>
      <p>Status: {task.status}</p>
      
      {task.subtasks.length > 0 && (
        <div className="subtasks-section">
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${progress}%` }}
            />
            <span>{completedCount}/{totalCount} completed</span>
          </div>
          
          <ul className="subtasks-list">
            {task.subtasks.map(subtask => (
              <li key={subtask.id} className="subtask-item">
                <input
                  type="checkbox"
                  checked={subtask.isCompleted}
                  onChange={() => onSubtaskToggle(subtask.id)}
                />
                <span className={subtask.isCompleted ? 'completed' : ''}>
                  {subtask.title}
                </span>
                <button onClick={() => onSubtaskDelete(subtask.id)}>
                  🗑️
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default TaskCard;
```

---

### API Calls

```javascript
const API_BASE = 'http://193.141.64.139:3000/api';

// ساخت task با subtasks
async function createTaskWithSubtasks(taskData, token) {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskData.title,
      assignee_id: taskData.assigneeId,
      key_result_ids: taskData.keyResultIds || [],
      status: taskData.status || 'todo',
      type: taskData.type || 'routine',
      subtasks: taskData.subtasks || []
    })
  });
  
  return response.json();
}

// Toggle subtask
async function toggleSubtask(subtaskId, token) {
  const response = await fetch(`${API_BASE}/subtasks/${subtaskId}/toggle`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// حذف subtask
async function deleteSubtask(subtaskId, token) {
  const response = await fetch(`${API_BASE}/subtasks/${subtaskId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}

// دریافت tasks
async function getTasks(token) {
  const response = await fetch(`${API_BASE}/tasks`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
}
```

---

### مثال استفاده کامل

```jsx
import React, { useState, useEffect } from 'react';

function TasksPage() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    assigneeId: '',
    subtasks: []
  });
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    const data = await getTasks(token);
    setTasks(data);
  }

  async function handleCreateTask(e) {
    e.preventDefault();
    await createTaskWithSubtasks(newTask, token);
    setNewTask({ title: '', assigneeId: '', subtasks: [] });
    loadTasks();
  }

  function handleAddSubtask() {
    if (newSubtaskTitle.trim()) {
      setNewTask({
        ...newTask,
        subtasks: [...newTask.subtasks, { title: newSubtaskTitle }]
      });
      setNewSubtaskTitle('');
    }
  }

  async function handleToggleSubtask(subtaskId) {
    await toggleSubtask(subtaskId, token);
    loadTasks();
  }

  async function handleDeleteSubtask(subtaskId) {
    await deleteSubtask(subtaskId, token);
    loadTasks();
  }

  return (
    <div className="tasks-page">
      <h1>Tasks</h1>
      
      {/* فرم ساخت task */}
      <form onSubmit={handleCreateTask}>
        <input
          type="text"
          placeholder="Task title"
          value={newTask.title}
          onChange={(e) => setNewTask({...newTask, title: e.target.value})}
          required
        />
        
        <select
          value={newTask.assigneeId}
          onChange={(e) => setNewTask({...newTask, assigneeId: e.target.value})}
          required
        >
          <option value="">Select assignee</option>
          {/* لیست users */}
        </select>
        
        {/* اضافه کردن subtasks */}
        <div className="subtasks-input">
          <input
            type="text"
            placeholder="Add subtask"
            value={newSubtaskTitle}
            onChange={(e) => setNewSubtaskTitle(e.target.value)}
          />
          <button type="button" onClick={handleAddSubtask}>
            + Add
          </button>
        </div>
        
        {/* نمایش subtasks اضافه شده */}
        {newTask.subtasks.length > 0 && (
          <ul>
            {newTask.subtasks.map((st, idx) => (
              <li key={idx}>
                {st.title}
                <button onClick={() => {
                  setNewTask({
                    ...newTask,
                    subtasks: newTask.subtasks.filter((_, i) => i !== idx)
                  });
                }}>
                  ✕
                </button>
              </li>
            ))}
          </ul>
        )}
        
        <button type="submit">Create Task</button>
      </form>
      
      {/* لیست tasks */}
      <div className="tasks-list">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onSubtaskToggle={handleToggleSubtask}
            onSubtaskDelete={handleDeleteSubtask}
          />
        ))}
      </div>
    </div>
  );
}
```

---

## 🎨 CSS نمونه

```css
.task-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
}

.subtasks-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.progress-bar {
  background: #f0f0f0;
  border-radius: 4px;
  height: 24px;
  position: relative;
  margin-bottom: 12px;
}

.progress-fill {
  background: #4caf50;
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-bar span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 12px;
  font-weight: bold;
}

.subtasks-list {
  list-style: none;
  padding: 0;
}

.subtask-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px;
  border-radius: 4px;
}

.subtask-item:hover {
  background: #f9f9f9;
}

.subtask-item input[type="checkbox"] {
  width: 18px;
  height: 18px;
  cursor: pointer;
}

.subtask-item span {
  flex: 1;
}

.subtask-item span.completed {
  text-decoration: line-through;
  color: #999;
}

.subtask-item button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.5;
}

.subtask-item button:hover {
  opacity: 1;
}
```

---

## ✅ چک‌لیست پیاده‌سازی

- [ ] نمایش subtasks در کارت task
- [ ] Progress bar برای نمایش پیشرفت
- [ ] Checkbox برای toggle کردن subtask
- [ ] دکمه حذف subtask
- [ ] فرم اضافه کردن subtask هنگام ساخت task
- [ ] Animation برای تغییرات
- [ ] Responsive design

---

## 📝 نکات مهم

1. **همیشه token رو در header بفرست**
2. **subtasks اختیاری است** - می‌تونی task بدون subtask بسازی
3. **subtasks به ترتیب createdAt نمایش داده میشن**
4. **وقتی task حذف میشه، subtasks هم حذف میشن** (CASCADE)
5. **Progress bar رو خودت محاسبه کن** - backend progress نمی‌فرسته

---

## 🐛 مشکلات احتمالی

**Q: subtasks نمایش داده نمیشه**
A: مطمئن شو که backend آپدیت شده و migration اجرا شده

**Q: toggle کار نمی‌کنه**
A: چک کن که subtask.id رو درست می‌فرستی

**Q: بعد از toggle باید refresh کنم**
A: بعد از toggle، دوباره tasks رو fetch کن یا state رو local آپدیت کن

---

**موفق باشید! 🚀**
