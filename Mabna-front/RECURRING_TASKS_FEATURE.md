# فیچر Recurring Tasks (وظایف تکرارشونده)

## 📋 توضیحات

این فیچر به شما اجازه می‌ده که وظایف روتین تعریف کنید که به صورت خودکار در بازه‌های زمانی مشخص (روزانه، هفتگی، ماهانه) ساخته بشن.

---

## 🎯 مفاهیم کلیدی

### Recurring Pattern (الگوی تکرار)
یک template برای ساخت خودکار tasks که شامل:
- عنوان و توضیحات
- مسئول (assignee)
- نوع تکرار (روزانه/هفتگی/ماهانه)
- فاصله تکرار (مثلا هر 2 هفته)
- تاریخ شروع و پایان
- لیست subtask های پیش‌فرض

### Generated Task
Task هایی که از pattern ساخته میشن و دارای:
- همه مشخصات pattern
- لینک به pattern اصلی
- due_date خودکار بر اساس نوع تکرار

---

## 📡 API Endpoints

### 1. ساخت Recurring Pattern

**POST** `/api/recurring-patterns`

```json
{
  "title": "گزارش روزانه",
  "description": "ارسال گزارش کارهای انجام شده",
  "assignee_id": "user-uuid",
  "frequency": "daily",
  "interval": 1,
  "start_date": "2025-12-18",
  "end_date": null,
  "subtask_templates": [
    { "title": "جمع‌آوری اطلاعات" },
    { "title": "نوشتن گزارش" },
    { "title": "ارسال به مدیر" }
  ]
}
```

**فیلدها:**
- `title`: عنوان (required)
- `description`: توضیحات (optional)
- `assignee_id`: مسئول (required)
- `frequency`: نوع تکرار - `"daily"`, `"weekly"`, `"monthly"` (required)
- `interval`: فاصله تکرار - عدد (default: 1)
- `day_of_week`: روز هفته برای weekly - 0-6 (0=یکشنبه) (required for weekly)
- `day_of_month`: روز ماه برای monthly - 1-31 (required for monthly)
- `start_date`: تاریخ شروع (required)
- `end_date`: تاریخ پایان (optional - null = تا ابد)
- `subtask_templates`: لیست subtask های پیش‌فرض (optional)

**مثال‌های مختلف:**

```json
// روزانه - هر روز
{
  "title": "چک کردن ایمیل‌ها",
  "assignee_id": "user-uuid",
  "frequency": "daily",
  "interval": 1,
  "start_date": "2025-12-18"
}

// هفتگی - هر دوشنبه
{
  "title": "جلسه هفتگی تیم",
  "assignee_id": "user-uuid",
  "frequency": "weekly",
  "interval": 1,
  "day_of_week": 1,
  "start_date": "2025-12-18"
}

// هفتگی - هر 2 هفته یکبار جمعه
{
  "title": "گزارش دو هفتگی",
  "assignee_id": "user-uuid",
  "frequency": "weekly",
  "interval": 2,
  "day_of_week": 5,
  "start_date": "2025-12-18"
}

// ماهانه - روز 1 هر ماه
{
  "title": "گزارش ماهانه",
  "assignee_id": "user-uuid",
  "frequency": "monthly",
  "interval": 1,
  "day_of_month": 1,
  "start_date": "2025-12-18"
}

// ماهانه - هر 3 ماه یکبار روز 15
{
  "title": "گزارش فصلی",
  "assignee_id": "user-uuid",
  "frequency": "monthly",
  "interval": 3,
  "day_of_month": 15,
  "start_date": "2025-12-18"
}
```

**Response:**
```json
{
  "id": "pattern-uuid",
  "title": "گزارش روزانه",
  "description": "ارسال گزارش کارهای انجام شده",
  "assignee_id": "user-uuid",
  "frequency": "daily",
  "interval": 1,
  "day_of_week": null,
  "day_of_month": null,
  "start_date": "2025-12-18T00:00:00.000Z",
  "end_date": null,
  "is_active": true,
  "subtask_templates": [
    { "id": "st-uuid-1", "title": "جمع‌آوری اطلاعات" },
    { "id": "st-uuid-2", "title": "نوشتن گزارش" },
    { "id": "st-uuid-3", "title": "ارسال به مدیر" }
  ],
  "created_at": "2025-12-18T10:00:00.000Z"
}
```

---

### 2. دریافت همه Patterns

**GET** `/api/recurring-patterns`

**Response:**
```json
[
  {
    "id": "pattern-uuid",
    "title": "گزارش روزانه",
    "description": "...",
    "assignee_id": "user-uuid",
    "frequency": "daily",
    "interval": 1,
    "day_of_week": null,
    "day_of_month": null,
    "start_date": "2025-12-18T00:00:00.000Z",
    "end_date": null,
    "is_active": true,
    "last_generated": "2025-12-18T00:00:00.000Z",
    "subtask_templates": [...],
    "recent_tasks": [
      {
        "id": "task-uuid",
        "title": "گزارش روزانه",
        "status": "todo",
        "due_date": "2025-12-19T00:00:00.000Z",
        "created_at": "2025-12-18T10:00:00.000Z"
      }
    ],
    "created_at": "2025-12-18T10:00:00.000Z"
  }
]
```

---

### 3. آپدیت Pattern

**PUT** `/api/recurring-patterns/:id`

```json
{
  "title": "گزارش روزانه (آپدیت شده)",
  "is_active": false
}
```

---

### 4. حذف Pattern

**DELETE** `/api/recurring-patterns/:id`

**نکته:** Tasks ساخته شده حذف نمیشن، فقط pattern حذف میشه.

---

### 5. ساخت دستی Task از Pattern

**POST** `/api/recurring-patterns/:id/generate`

```json
{
  "due_date": "2025-12-25"
}
```

این endpoint برای ساخت دستی یک task از pattern استفاده میشه.

---

### 6. اجرای Generator (برای تست)

**POST** `/api/recurring-patterns/run-generator`

این endpoint همه patterns رو چک می‌کنه و اگر زمانش رسیده باشه، task جدید می‌سازه.

**Response:**
```json
{
  "message": "Generator executed successfully",
  "tasks_generated": 3
}
```

---

## 💻 پیاده‌سازی در React

### 1. Component برای ساخت Recurring Pattern

```jsx
import React, { useState, useEffect } from 'react';

function CreateRecurringPattern({ onSubmit }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    frequency: 'daily',
    interval: 1,
    day_of_week: 1,
    day_of_month: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    subtask_templates: []
  });
  const [newSubtask, setNewSubtask] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    // دریافت لیست users
    fetch('http://193.141.64.139:3000/api/organization/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData({
        ...formData,
        subtask_templates: [...formData.subtask_templates, { title: newSubtask }]
      });
      setNewSubtask('');
    }
  };

  const removeSubtask = (index) => {
    setFormData({
      ...formData,
      subtask_templates: formData.subtask_templates.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const payload = {
      ...formData,
      end_date: formData.end_date || null
    };

    // حذف فیلدهای غیرضروری
    if (formData.frequency !== 'weekly') {
      delete payload.day_of_week;
    }
    if (formData.frequency !== 'monthly') {
      delete payload.day_of_month;
    }

    await onSubmit(payload);
  };

  const weekDays = [
    { value: 0, label: 'یکشنبه' },
    { value: 1, label: 'دوشنبه' },
    { value: 2, label: 'سه‌شنبه' },
    { value: 3, label: 'چهارشنبه' },
    { value: 4, label: 'پنج‌شنبه' },
    { value: 5, label: 'جمعه' },
    { value: 6, label: 'شنبه' }
  ];

  return (
    <form onSubmit={handleSubmit} className="recurring-pattern-form">
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
        <label>توضیحات</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
          rows={3}
        />
      </div>

      <div className="form-group">
        <label>مسئول</label>
        <select
          value={formData.assignee_id}
          onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
          required
        >
          <option value="">انتخاب کنید</option>
          {users.map(user => (
            <option key={user.user_id} value={user.user_id}>
              {user.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>نوع تکرار</label>
          <select
            value={formData.frequency}
            onChange={(e) => setFormData({...formData, frequency: e.target.value})}
            required
          >
            <option value="daily">روزانه</option>
            <option value="weekly">هفتگی</option>
            <option value="monthly">ماهانه</option>
          </select>
        </div>

        <div className="form-group">
          <label>فاصله تکرار</label>
          <input
            type="number"
            min="1"
            value={formData.interval}
            onChange={(e) => setFormData({...formData, interval: parseInt(e.target.value)})}
            required
          />
          <small>
            {formData.frequency === 'daily' && 'هر چند روز یکبار'}
            {formData.frequency === 'weekly' && 'هر چند هفته یکبار'}
            {formData.frequency === 'monthly' && 'هر چند ماه یکبار'}
          </small>
        </div>
      </div>

      {formData.frequency === 'weekly' && (
        <div className="form-group">
          <label>روز هفته</label>
          <select
            value={formData.day_of_week}
            onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
            required
          >
            {weekDays.map(day => (
              <option key={day.value} value={day.value}>{day.label}</option>
            ))}
          </select>
        </div>
      )}

      {formData.frequency === 'monthly' && (
        <div className="form-group">
          <label>روز ماه</label>
          <input
            type="number"
            min="1"
            max="31"
            value={formData.day_of_month}
            onChange={(e) => setFormData({...formData, day_of_month: parseInt(e.target.value)})}
            required
          />
        </div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label>تاریخ شروع</label>
          <input
            type="date"
            value={formData.start_date}
            onChange={(e) => setFormData({...formData, start_date: e.target.value})}
            required
          />
        </div>

        <div className="form-group">
          <label>تاریخ پایان (اختیاری)</label>
          <input
            type="date"
            value={formData.end_date}
            onChange={(e) => setFormData({...formData, end_date: e.target.value})}
            min={formData.start_date}
          />
          <small>خالی = تا ابد</small>
        </div>
      </div>

      <div className="form-group">
        <label>Subtask های پیش‌فرض</label>
        <div className="subtask-input">
          <input
            type="text"
            value={newSubtask}
            onChange={(e) => setNewSubtask(e.target.value)}
            placeholder="عنوان subtask"
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
          />
          <button type="button" onClick={addSubtask}>افزودن</button>
        </div>
        <ul className="subtask-list">
          {formData.subtask_templates.map((st, index) => (
            <li key={index}>
              {st.title}
              <button type="button" onClick={() => removeSubtask(index)}>×</button>
            </li>
          ))}
        </ul>
      </div>

      <button type="submit" className="btn-primary">ساخت الگوی تکرار</button>
    </form>
  );
}

export default CreateRecurringPattern;
```

---

### 2. لیست Recurring Patterns

```jsx
import React, { useState, useEffect } from 'react';

function RecurringPatternsList() {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const response = await fetch('http://193.141.64.139:3000/api/recurring-patterns', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setPatterns(data);
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (patternId, currentStatus) => {
    try {
      await fetch(`http://193.141.64.139:3000/api/recurring-patterns/${patternId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      fetchPatterns();
    } catch (error) {
      console.error('Error toggling pattern:', error);
    }
  };

  const deletePattern = async (patternId) => {
    if (!confirm('آیا مطمئن هستید؟')) return;
    
    try {
      await fetch(`http://193.141.64.139:3000/api/recurring-patterns/${patternId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      fetchPatterns();
    } catch (error) {
      console.error('Error deleting pattern:', error);
    }
  };

  const generateTask = async (patternId) => {
    try {
      await fetch(`http://193.141.64.139:3000/api/recurring-patterns/${patternId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      alert('Task ساخته شد!');
      fetchPatterns();
    } catch (error) {
      console.error('Error generating task:', error);
    }
  };

  const getFrequencyText = (pattern) => {
    if (pattern.frequency === 'daily') {
      return pattern.interval === 1 ? 'هر روز' : `هر ${pattern.interval} روز`;
    } else if (pattern.frequency === 'weekly') {
      const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
      const dayName = days[pattern.day_of_week];
      return pattern.interval === 1 ? `هر ${dayName}` : `هر ${pattern.interval} هفته - ${dayName}`;
    } else if (pattern.frequency === 'monthly') {
      return pattern.interval === 1 
        ? `هر ماه روز ${pattern.day_of_month}` 
        : `هر ${pattern.interval} ماه روز ${pattern.day_of_month}`;
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <div className="recurring-patterns-list">
      <h2>الگوهای تکرار</h2>
      
      {patterns.length === 0 ? (
        <p className="empty-state">هیچ الگوی تکراری وجود ندارد</p>
      ) : (
        <div className="patterns-grid">
          {patterns.map(pattern => (
            <div key={pattern.id} className={`pattern-card ${!pattern.is_active ? 'inactive' : ''}`}>
              <div className="pattern-header">
                <h3>{pattern.title}</h3>
                <span className={`status-badge ${pattern.is_active ? 'active' : 'inactive'}`}>
                  {pattern.is_active ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              <p className="pattern-description">{pattern.description}</p>

              <div className="pattern-info">
                <div className="info-item">
                  <span className="label">تکرار:</span>
                  <span className="value">{getFrequencyText(pattern)}</span>
                </div>
                <div className="info-item">
                  <span className="label">شروع:</span>
                  <span className="value">
                    {new Date(pattern.start_date).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                {pattern.end_date && (
                  <div className="info-item">
                    <span className="label">پایان:</span>
                    <span className="value">
                      {new Date(pattern.end_date).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
                {pattern.last_generated && (
                  <div className="info-item">
                    <span className="label">آخرین ساخت:</span>
                    <span className="value">
                      {new Date(pattern.last_generated).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
              </div>

              {pattern.subtask_templates.length > 0 && (
                <div className="subtasks-preview">
                  <strong>Subtasks:</strong>
                  <ul>
                    {pattern.subtask_templates.map(st => (
                      <li key={st.id}>{st.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              {pattern.recent_tasks.length > 0 && (
                <div className="recent-tasks">
                  <strong>آخرین tasks:</strong>
                  <ul>
                    {pattern.recent_tasks.map(task => (
                      <li key={task.id}>
                        {task.title} - {task.status}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pattern-actions">
                <button onClick={() => generateTask(pattern.id)}>
                  ساخت Task
                </button>
                <button onClick={() => toggleActive(pattern.id, pattern.is_active)}>
                  {pattern.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                </button>
                <button onClick={() => deletePattern(pattern.id)} className="btn-danger">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecurringPatternsList;
```

---

## 🎨 CSS

```css
.recurring-pattern-form {
  max-width: 600px;
  margin: 0 auto;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
}

.form-group small {
  display: block;
  margin-top: 4px;
  color: #666;
  font-size: 12px;
}

.subtask-input {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}

.subtask-input input {
  flex: 1;
}

.subtask-list {
  list-style: none;
  padding: 0;
}

.subtask-list li {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f5f5f5;
  border-radius: 4px;
  margin-bottom: 8px;
}

.subtask-list button {
  background: none;
  border: none;
  color: #d32f2f;
  font-size: 20px;
  cursor: pointer;
  padding: 0 8px;
}

.patterns-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.pattern-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
  background: white;
}

.pattern-card.inactive {
  opacity: 0.6;
  background: #f9f9f9;
}

.pattern-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.status-badge {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.active {
  background: #e8f5e9;
  color: #2e7d32;
}

.status-badge.inactive {
  background: #ffebee;
  color: #c62828;
}

.pattern-info {
  margin: 16px 0;
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item .label {
  color: #666;
  font-size: 14px;
}

.info-item .value {
  font-weight: 500;
}

.subtasks-preview,
.recent-tasks {
  margin: 16px 0;
  padding: 12px;
  background: #f5f5f5;
  border-radius: 4px;
}

.subtasks-preview ul,
.recent-tasks ul {
  margin: 8px 0 0 0;
  padding-right: 20px;
}

.subtasks-preview li,
.recent-tasks li {
  font-size: 14px;
  margin-bottom: 4px;
}

.pattern-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.pattern-actions button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

.pattern-actions button:hover {
  background: #f5f5f5;
}

.pattern-actions .btn-danger {
  background: #ffebee;
  border-color: #ef5350;
  color: #c62828;
}

.pattern-actions .btn-danger:hover {
  background: #ef5350;
  color: white;
}
```

---

## ⚙️ تنظیم Cron Job (اختیاری)

برای ساخت خودکار tasks، می‌تونید یک cron job روی سرور تنظیم کنید:

```bash
# ویرایش crontab
crontab -e

# اضافه کردن این خط برای اجرای روزانه در ساعت 00:00
0 0 * * * curl -X POST http://localhost:3000/api/recurring-patterns/run-generator \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  >> /var/log/recurring-tasks.log 2>&1
```

یا می‌تونید از node-cron استفاده کنید:

```bash
npm install node-cron
```

```javascript
// در src/index.js
const cron = require('node-cron');
const { runRecurringTasksGenerator } = require('./utils/recurringTasksGenerator');

// اجرای روزانه در ساعت 00:00
cron.schedule('0 0 * * *', async () => {
  console.log('🔄 Running recurring tasks generator...');
  try {
    await runRecurringTasksGenerator();
  } catch (error) {
    console.error('❌ Cron job error:', error);
  }
});
```

---

## 📝 نکات مهم

1. **Frequency Types:**
   - `daily`: هر روز یا هر چند روز
   - `weekly`: روز مشخصی از هفته
   - `monthly`: روز مشخصی از ماه

2. **Interval:** فاصله تکرار (مثلا interval=2 با weekly = هر 2 هفته)

3. **Day of Week:** 0=یکشنبه, 1=دوشنبه, ..., 6=شنبه

4. **End Date:** اگر null باشه، تا ابد ادامه داره

5. **Generated Tasks:** همه tasks ساخته شده لینک به pattern اصلی دارن

6. **Subtask Templates:** وقتی task ساخته میشه، subtasks هم خودکار ساخته میشن

7. **Manual Generation:** می‌تونید دستی هم task بسازید

---

## 🚀 دستورات Deploy

```bash
ssh -p 3031 root@193.141.64.139
cd /opt/mabna
git pull origin master
npx prisma migrate deploy
npx prisma generate
pm2 restart mabna-api
pm2 logs mabna-api --lines 10
```

---

**موفق باشید! 🔄**
