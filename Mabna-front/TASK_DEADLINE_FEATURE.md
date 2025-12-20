# فیچر Deadline برای Tasks

## 📋 توضیحات

حالا tasks می‌تونن deadline (سررسید) داشته باشن. این فیلد اختیاری هست و می‌تونه null باشه.

---

## 🔧 تغییرات Backend

### فیلد جدید در Task:
- **due_date**: تاریخ سررسید (nullable)
- **فرمت**: ISO 8601 Date (YYYY-MM-DD)
- **مثال**: `"2025-12-31"`

---

## 📡 API Changes

### 1. ساخت Task با Deadline

**POST** `/api/tasks`

```json
{
  "title": "پیاده‌سازی صفحه لندینگ",
  "description": "طراحی و کدنویسی صفحه اصلی",
  "assignee_id": "user-uuid",
  "key_result_ids": ["kr-uuid"],
  "status": "todo",
  "type": "routine",
  "due_date": "2025-12-31"
}
```

**Response:**
```json
{
  "id": "task-uuid",
  "title": "پیاده‌سازی صفحه لندینگ",
  "description": "طراحی و کدنویسی صفحه اصلی",
  "status": "todo",
  "type": "routine",
  "due_date": "2025-12-31T00:00:00.000Z",
  "assignee": {
    "user_id": "user-uuid",
    "full_name": "محمد جواد"
  },
  "key_results": [...],
  "subtasks": [],
  "organization_id": "org-uuid",
  "created_at": "2025-12-18T10:00:00.000Z"
}
```

---

### 2. آپدیت Deadline

**PUT** `/api/tasks/:id`

```json
{
  "due_date": "2026-01-15"
}
```

**حذف Deadline:**
```json
{
  "due_date": null
}
```

---

### 3. دریافت Tasks

**GET** `/api/tasks`

همه tasks حالا فیلد `due_date` دارن که می‌تونه null باشه:

```json
[
  {
    "id": "task-1",
    "title": "Task با deadline",
    "due_date": "2025-12-31T00:00:00.000Z",
    ...
  },
  {
    "id": "task-2",
    "title": "Task بدون deadline",
    "due_date": null,
    ...
  }
]
```

---

## 💻 پیاده‌سازی در React

### 1. Component برای انتخاب تاریخ

```jsx
import React, { useState } from 'react';

function TaskForm({ onSubmit, initialData = {} }) {
  const [formData, setFormData] = useState({
    title: initialData.title || '',
    description: initialData.description || '',
    assignee_id: initialData.assignee_id || '',
    due_date: initialData.due_date ? 
      new Date(initialData.due_date).toISOString().split('T')[0] : '',
    status: initialData.status || 'todo',
    type: initialData.type || 'routine'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      due_date: formData.due_date || null // اگر خالی بود null بفرست
    };
    
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>عنوان</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>سررسید (اختیاری)</label>
        <input
          type="date"
          value={formData.due_date}
          onChange={(e) => setFormData({...formData, due_date: e.target.value})}
          min={new Date().toISOString().split('T')[0]} // حداقل امروز
        />
        {formData.due_date && (
          <button
            type="button"
            onClick={() => setFormData({...formData, due_date: ''})}
            className="clear-date-btn"
          >
            حذف سررسید
          </button>
        )}
      </div>

      <button type="submit">ذخیره</button>
    </form>
  );
}

export default TaskForm;
```

---

### 2. نمایش Deadline در لیست Tasks

```jsx
import React from 'react';

function TaskCard({ task }) {
  // محاسبه وضعیت deadline
  const getDeadlineStatus = (dueDate) => {
    if (!dueDate) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const deadline = new Date(dueDate);
    deadline.setHours(0, 0, 0, 0);
    
    const diffTime = deadline - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'overdue', text: 'گذشته', days: Math.abs(diffDays) };
    } else if (diffDays === 0) {
      return { status: 'today', text: 'امروز', days: 0 };
    } else if (diffDays <= 3) {
      return { status: 'urgent', text: 'نزدیک', days: diffDays };
    } else {
      return { status: 'normal', text: 'عادی', days: diffDays };
    }
  };

  const deadlineInfo = getDeadlineStatus(task.due_date);

  // فرمت تاریخ به شمسی (اختیاری)
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description}</p>
      
      {task.due_date && (
        <div className={`deadline-badge ${deadlineInfo.status}`}>
          <span className="deadline-icon">📅</span>
          <span className="deadline-date">{formatDate(task.due_date)}</span>
          <span className="deadline-status">
            {deadlineInfo.status === 'overdue' && `${deadlineInfo.days} روز گذشته`}
            {deadlineInfo.status === 'today' && 'امروز'}
            {deadlineInfo.status === 'urgent' && `${deadlineInfo.days} روز مانده`}
            {deadlineInfo.status === 'normal' && `${deadlineInfo.days} روز مانده`}
          </span>
        </div>
      )}
      
      <div className="task-meta">
        <span>وضعیت: {task.status}</span>
        <span>مسئول: {task.assignee.full_name}</span>
      </div>
    </div>
  );
}

export default TaskCard;
```

---

### 3. فیلتر و مرتب‌سازی بر اساس Deadline

```jsx
import React, { useState, useEffect } from 'react';

function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // all, overdue, upcoming, no-deadline
  const [sortBy, setSortBy] = useState('due_date'); // due_date, created_at, title

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://193.141.64.139:3000/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setTasks(data);
  };

  // فیلتر کردن tasks
  const getFilteredTasks = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let filtered = [...tasks];

    switch (filter) {
      case 'overdue':
        filtered = filtered.filter(t => {
          if (!t.due_date) return false;
          const deadline = new Date(t.due_date);
          deadline.setHours(0, 0, 0, 0);
          return deadline < today && t.status !== 'done';
        });
        break;
      
      case 'upcoming':
        filtered = filtered.filter(t => {
          if (!t.due_date) return false;
          const deadline = new Date(t.due_date);
          deadline.setHours(0, 0, 0, 0);
          const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
          return diffDays >= 0 && diffDays <= 7;
        });
        break;
      
      case 'no-deadline':
        filtered = filtered.filter(t => !t.due_date);
        break;
      
      default:
        // all - همه tasks
        break;
    }

    // مرتب‌سازی
    filtered.sort((a, b) => {
      if (sortBy === 'due_date') {
        // tasks بدون deadline در آخر
        if (!a.due_date && !b.due_date) return 0;
        if (!a.due_date) return 1;
        if (!b.due_date) return -1;
        return new Date(a.due_date) - new Date(b.due_date);
      } else if (sortBy === 'created_at') {
        return new Date(b.created_at) - new Date(a.created_at);
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title, 'fa');
      }
      return 0;
    });

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  return (
    <div className="task-list-container">
      <div className="filters">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">همه وظایف</option>
          <option value="overdue">گذشته از موعد</option>
          <option value="upcoming">هفته آینده</option>
          <option value="no-deadline">بدون سررسید</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="due_date">مرتب‌سازی: سررسید</option>
          <option value="created_at">مرتب‌سازی: تاریخ ساخت</option>
          <option value="title">مرتب‌سازی: عنوان</option>
        </select>
      </div>

      <div className="tasks">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} />
        ))}
      </div>
    </div>
  );
}

export default TaskList;
```

---

## 🎨 CSS

```css
/* Deadline Badge */
.deadline-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  margin-top: 8px;
}

.deadline-badge.normal {
  background: #e3f2fd;
  color: #1976d2;
}

.deadline-badge.urgent {
  background: #fff3e0;
  color: #f57c00;
}

.deadline-badge.today {
  background: #fce4ec;
  color: #c2185b;
}

.deadline-badge.overdue {
  background: #ffebee;
  color: #d32f2f;
  font-weight: 600;
}

.deadline-icon {
  font-size: 16px;
}

.deadline-date {
  font-weight: 600;
}

.deadline-status {
  font-size: 12px;
  opacity: 0.9;
}

/* Form Date Input */
.form-group input[type="date"] {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
}

.clear-date-btn {
  margin-top: 8px;
  padding: 6px 12px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.clear-date-btn:hover {
  background: #e0e0e0;
}

/* Filters */
.filters {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.filters select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}
```

---

## 📊 Dashboard Widget - Tasks نزدیک به سررسید

```jsx
function UpcomingDeadlinesWidget() {
  const [upcomingTasks, setUpcomingTasks] = useState([]);

  useEffect(() => {
    fetchUpcomingTasks();
  }, []);

  const fetchUpcomingTasks = async () => {
    const token = localStorage.getItem('token');
    const response = await fetch('http://193.141.64.139:3000/api/tasks', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // فقط tasks با deadline در 7 روز آینده
    const upcoming = data
      .filter(t => {
        if (!t.due_date || t.status === 'done') return false;
        const deadline = new Date(t.due_date);
        deadline.setHours(0, 0, 0, 0);
        const diffDays = Math.ceil((deadline - today) / (1000 * 60 * 60 * 24));
        return diffDays >= 0 && diffDays <= 7;
      })
      .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
      .slice(0, 5); // فقط 5 تای اول
    
    setUpcomingTasks(upcoming);
  };

  return (
    <div className="widget upcoming-deadlines">
      <h3>وظایف نزدیک به سررسید</h3>
      {upcomingTasks.length === 0 ? (
        <p className="empty-state">وظیفه‌ای با سررسید نزدیک وجود ندارد</p>
      ) : (
        <ul className="deadline-list">
          {upcomingTasks.map(task => (
            <li key={task.id} className="deadline-item">
              <span className="task-title">{task.title}</span>
              <span className="task-deadline">
                {new Date(task.due_date).toLocaleDateString('fa-IR')}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 🔔 Notification برای Deadlines (پیشنهاد آینده)

در آینده می‌تونید یک cron job اضافه کنید که:
- هر روز tasks با deadline امروز یا فردا رو چک کنه
- به assignee ها notification بفرسته
- برای overdue tasks هم notification بفرسته

---

## 📝 نکات مهم

1. **فیلد اختیاری**: `due_date` می‌تونه null باشه
2. **فرمت تاریخ**: از ISO 8601 استفاده کن (YYYY-MM-DD)
3. **Validation**: Backend چک می‌کنه که فرمت تاریخ درست باشه
4. **Timezone**: تاریخ‌ها به صورت UTC ذخیره میشن
5. **حذف deadline**: برای حذف، `null` بفرست
6. **مرتب‌سازی**: tasks بدون deadline معمولا در آخر لیست نمایش داده میشن

---

## 🚀 دستورات Deploy

```bash
# روی سرور
ssh -p 3031 root@193.141.64.139
cd /opt/mabna
git pull origin master
npx prisma migrate deploy
npx prisma generate
pm2 restart mabna-api
pm2 logs mabna-api --lines 10
```

---

**موفق باشید! 🎯**
