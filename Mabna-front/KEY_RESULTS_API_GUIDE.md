# راهنمای API نتایج کلیدی (Key Results)

## 📋 توضیحات

API های کامل برای مدیریت نتایج کلیدی شامل دریافت، ویرایش، حذف و گزارش‌گیری.

---

## 📡 API Endpoints

### 1. دریافت همه Key Results

**GET** `/api/keyresults`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
[
  {
    "id": "kr-uuid",
    "title": "افزایش فروش",
    "objective_title": "رشد کسب‌وکار",
    "initial_value": 0,
    "target_value": 100
  }
]
```

---

### 2. دریافت یک Key Result

**GET** `/api/keyresults/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "kr-uuid",
  "title": "افزایش فروش",
  "initial_value": 0,
  "target_value": 100,
  "objective": {
    "id": "obj-uuid",
    "title": "رشد کسب‌وکار"
  },
  "tasks": [
    {
      "id": "task-uuid",
      "title": "کمپین تبلیغاتی",
      "status": "in_progress",
      "assignee": {
        "user_id": "user-uuid",
        "full_name": "محمد جواد"
      }
    }
  ],
  "created_at": "2025-12-18T10:00:00.000Z"
}
```

---

### 3. ویرایش Key Result

**PUT** `/api/keyresults/:id`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "افزایش فروش (آپدیت شده)",
  "initial_value": 10,
  "target_value": 150
}
```

**نکته:** همه فیلدها اختیاری هستند. فقط فیلدهایی که می‌خواید تغییر بدید رو بفرستید.

**Response:**
```json
{
  "id": "kr-uuid",
  "title": "افزایش فروش (آپدیت شده)",
  "initial_value": 10,
  "target_value": 150,
  "objective_id": "obj-uuid",
  "created_at": "2025-12-18T10:00:00.000Z"
}
```

**خطاها:**
- `403`: فقط سازنده objective می‌تونه key results اون رو ویرایش کنه
- `404`: Key result پیدا نشد

---

### 4. حذف Key Result

**DELETE** `/api/keyresults/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "Key result deleted successfully",
  "id": "kr-uuid"
}
```

**خطاها:**
- `403`: فقط سازنده objective می‌تونه key results اون رو حذف کنه
- `404`: Key result پیدا نشد

**نکته:** وقتی key result حذف میشه، ارتباط با tasks هم حذف میشه ولی خود tasks حذف نمیشن.

---

### 5. گزارش از Key Result

**GET** `/api/keyresults/:id/report`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "id": "kr-uuid",
  "title": "افزایش فروش",
  "initial_value": 0,
  "target_value": 100,
  "current_value": 45.5,
  "progress_percentage": 65,
  "objective": {
    "id": "obj-uuid",
    "title": "رشد کسب‌وکار",
    "start_date": "2025-01-01T00:00:00.000Z",
    "end_date": "2025-12-31T00:00:00.000Z"
  },
  "stats": {
    "total_tasks": 10,
    "completed_tasks": 6,
    "in_progress_tasks": 3,
    "todo_tasks": 1
  },
  "tasks": [
    {
      "id": "task-uuid",
      "title": "کمپین تبلیغاتی",
      "status": "done",
      "type": "special",
      "due_date": "2025-12-25T00:00:00.000Z",
      "assignee": {
        "user_id": "user-uuid",
        "full_name": "محمد جواد"
      },
      "subtasks": {
        "total": 5,
        "completed": 3
      },
      "created_at": "2025-12-18T10:00:00.000Z"
    }
  ]
}
```

**توضیحات فیلدها:**
- `current_value`: مقدار فعلی محاسبه شده بر اساس progress
- `progress_percentage`: درصد پیشرفت بر اساس tasks تکمیل شده
- `stats`: آمار کلی tasks

---

## 💻 پیاده‌سازی در React

### 1. Component برای ویرایش Key Result

```jsx
import React, { useState, useEffect } from 'react';

function EditKeyResultForm({ keyResultId, onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    title: '',
    initial_value: 0,
    target_value: 100
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchKeyResult();
  }, []);

  const fetchKeyResult = async () => {
    try {
      const response = await fetch(`http://193.141.64.139:3000/api/keyresults/${keyResultId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setFormData({
        title: data.title,
        initial_value: data.initial_value,
        target_value: data.target_value
      });
    } catch (err) {
      setError('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`http://193.141.64.139:3000/api/keyresults/${keyResultId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.status === 403) {
        const data = await response.json();
        setError(data.error);
        return;
      }

      if (!response.ok) {
        throw new Error('خطا در ویرایش');
      }

      const data = await response.json();
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !formData.title) return <div>در حال بارگذاری...</div>;

  return (
    <form onSubmit={handleSubmit} className="edit-kr-form">
      <h2>ویرایش نتیجه کلیدی</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>عنوان</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>مقدار اولیه</label>
          <input
            type="number"
            value={formData.initial_value}
            onChange={(e) => setFormData({...formData, initial_value: parseFloat(e.target.value)})}
            required
          />
        </div>

        <div className="form-group">
          <label>مقدار هدف</label>
          <input
            type="number"
            value={formData.target_value}
            onChange={(e) => setFormData({...formData, target_value: parseFloat(e.target.value)})}
            required
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" disabled={loading}>
          {loading ? 'در حال ذخیره...' : 'ذخیره'}
        </button>
        <button type="button" onClick={onCancel}>
          انصراف
        </button>
      </div>
    </form>
  );
}

export default EditKeyResultForm;
```

---

### 2. Component برای گزارش Key Result

```jsx
import React, { useState, useEffect } from 'react';

function KeyResultReport({ keyResultId }) {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      const response = await fetch(`http://193.141.64.139:3000/api/keyresults/${keyResultId}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error fetching report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!report) return <div>خطا در بارگذاری گزارش</div>;

  return (
    <div className="kr-report">
      <div className="report-header">
        <h2>{report.title}</h2>
        <span className="objective-badge">{report.objective.title}</span>
      </div>

      <div className="progress-section">
        <div className="progress-bar-container">
          <div 
            className="progress-bar" 
            style={{ width: `${report.progress_percentage}%` }}
          >
            {report.progress_percentage}%
          </div>
        </div>
        <div className="progress-values">
          <span>مقدار فعلی: {report.current_value}</span>
          <span>هدف: {report.target_value}</span>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{report.stats.total_tasks}</div>
          <div className="stat-label">کل وظایف</div>
        </div>
        <div className="stat-card success">
          <div className="stat-value">{report.stats.completed_tasks}</div>
          <div className="stat-label">تکمیل شده</div>
        </div>
        <div className="stat-card warning">
          <div className="stat-value">{report.stats.in_progress_tasks}</div>
          <div className="stat-label">در حال انجام</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{report.stats.todo_tasks}</div>
          <div className="stat-label">در انتظار</div>
        </div>
      </div>

      <div className="tasks-section">
        <h3>وظایف</h3>
        {report.tasks.length === 0 ? (
          <p className="empty-state">هیچ وظیفه‌ای وجود ندارد</p>
        ) : (
          <div className="tasks-list">
            {report.tasks.map(task => (
              <div key={task.id} className={`task-item status-${task.status}`}>
                <div className="task-header">
                  <h4>{task.title}</h4>
                  <span className={`status-badge ${task.status}`}>
                    {task.status === 'done' ? 'تکمیل شده' : 
                     task.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                  </span>
                </div>
                <div className="task-meta">
                  <span>مسئول: {task.assignee.full_name}</span>
                  {task.due_date && (
                    <span>موعد: {new Date(task.due_date).toLocaleDateString('fa-IR')}</span>
                  )}
                  {task.subtasks.total > 0 && (
                    <span>
                      Subtasks: {task.subtasks.completed}/{task.subtasks.total}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default KeyResultReport;
```

---

### 3. Component لیست Key Results با دکمه‌های عملیات

```jsx
import React, { useState, useEffect } from 'react';

function KeyResultsList({ objectiveId, currentUserId, objectiveCreatorId }) {
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const canEdit = currentUserId === objectiveCreatorId;

  useEffect(() => {
    fetchKeyResults();
  }, []);

  const fetchKeyResults = async () => {
    try {
      const response = await fetch('http://193.141.64.139:3000/api/keyresults', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setKeyResults(data);
    } catch (error) {
      console.error('Error fetching key results:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (krId) => {
    if (!confirm('آیا مطمئن هستید؟')) return;

    try {
      const response = await fetch(`http://193.141.64.139:3000/api/keyresults/${krId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.status === 403) {
        const error = await response.json();
        alert(error.error);
        return;
      }

      if (response.ok) {
        fetchKeyResults();
      }
    } catch (error) {
      console.error('Error deleting key result:', error);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="key-results-list">
      <h3>نتایج کلیدی</h3>
      {keyResults.length === 0 ? (
        <p className="empty-state">هیچ نتیجه کلیدی وجود ندارد</p>
      ) : (
        <div className="kr-grid">
          {keyResults.map(kr => (
            <div key={kr.id} className="kr-card">
              <h4>{kr.title}</h4>
              <div className="kr-values">
                <span>مقدار اولیه: {kr.initial_value}</span>
                <span>هدف: {kr.target_value}</span>
              </div>
              <p className="objective-name">{kr.objective_title}</p>
              
              <div className="kr-actions">
                <button onClick={() => handleViewReport(kr.id)}>
                  گزارش
                </button>
                {canEdit && (
                  <>
                    <button onClick={() => handleEdit(kr.id)}>
                      ویرایش
                    </button>
                    <button 
                      onClick={() => handleDelete(kr.id)}
                      className="btn-danger"
                    >
                      حذف
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default KeyResultsList;
```

---

## 🎨 CSS

```css
.kr-report {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.report-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.objective-badge {
  padding: 6px 16px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 16px;
  font-size: 14px;
}

.progress-section {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.progress-bar-container {
  width: 100%;
  height: 40px;
  background: #f5f5f5;
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #4caf50, #8bc34a);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  transition: width 0.3s ease;
}

.progress-values {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card.success {
  background: #e8f5e9;
}

.stat-card.warning {
  background: #fff3e0;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.tasks-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-item {
  background: white;
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid #ddd;
}

.task-item.status-done {
  border-left-color: #4caf50;
}

.task-item.status-in_progress {
  border-left-color: #ff9800;
}

.task-item.status-todo {
  border-left-color: #2196f3;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-meta {
  display: flex;
  gap: 16px;
  font-size: 13px;
  color: #666;
}

.kr-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
}

.kr-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.kr-values {
  display: flex;
  justify-content: space-between;
  margin: 12px 0;
  font-size: 14px;
  color: #666;
}

.kr-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.kr-actions button {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.kr-actions button:hover {
  background: #f5f5f5;
}

.kr-actions .btn-danger {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}
```

---

## 📝 نکات مهم

1. **Permissions**: فقط سازنده objective می‌تونه key results اون رو ویرایش/حذف کنه
2. **Current Value**: به صورت خودکار بر اساس progress tasks محاسبه میشه
3. **Progress**: بر اساس تعداد tasks تکمیل شده محاسبه میشه
4. **Delete**: وقتی key result حذف میشه، tasks حذف نمیشن، فقط ارتباطشون قطع میشه

---

## 🚀 دستورات Deploy

```bash
ssh -p 3031 root@193.141.64.139
cd /opt/mabna
git pull origin master
pm2 restart mabna-api
pm2 logs mabna-api --lines 10
```

---

**موفق باشید! 🎯**
