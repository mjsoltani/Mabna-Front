# آپدیت: فیلد توضیحات (Description) برای Tasks

## 📋 تغییرات

فیلد `description` به tasks اضافه شد که می‌تونه توضیحات کامل task رو نگه داره.

---

## 🔌 API Changes

### 1. ساخت Task با Description

**POST** `/api/tasks`

```json
{
  "title": "پیاده‌سازی صفحه لندینگ",
  "description": "این صفحه باید شامل:\n- هدر با منو\n- بخش Hero با CTA\n- بخش Features\n- فوتر\n\nطراحی از Figma استفاده شود.",
  "assignee_id": "user-uuid",
  "key_result_ids": [],
  "status": "todo",
  "type": "routine",
  "subtasks": []
}
```

**Response:**
```json
{
  "id": "task-uuid",
  "title": "پیاده‌سازی صفحه لندینگ",
  "description": "این صفحه باید شامل:\n- هدر با منو\n- بخش Hero با CTA\n- بخش Features\n- فوتر\n\nطراحی از Figma استفاده شود.",
  "status": "todo",
  "type": "routine",
  "assignee": {...},
  "key_results": [],
  "subtasks": [],
  "created_at": "2025-12-16T10:00:00.000Z"
}
```

---

### 2. دریافت Tasks (با Description)

**GET** `/api/tasks`

**Response:**
```json
[
  {
    "id": "task-uuid",
    "title": "پیاده‌سازی صفحه لندینگ",
    "description": "توضیحات کامل task...",
    "status": "in_progress",
    "type": "routine",
    "assignee": {...},
    "key_results": [],
    "subtasks": [],
    "created_at": "2025-12-16T10:00:00.000Z"
  }
]
```

---

### 3. ویرایش Task (با Description)

**PUT** `/api/tasks/:id`

```json
{
  "title": "عنوان جدید",
  "description": "توضیحات جدید یا آپدیت شده"
}
```

---

## 💻 نمونه کد React

### Component برای نمایش و ویرایش Description

```jsx
import React, { useState } from 'react';

function TaskCard({ task, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [description, setDescription] = useState(task.description || '');

  const handleSave = async () => {
    await onUpdate(task.id, { description });
    setIsEditing(false);
  };

  return (
    <div className="task-card">
      <h3>{task.title}</h3>
      
      <div className="task-description">
        {isEditing ? (
          <div>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="توضیحات task را وارد کنید..."
              rows={5}
            />
            <div className="actions">
              <button onClick={handleSave}>ذخیره</button>
              <button onClick={() => setIsEditing(false)}>لغو</button>
            </div>
          </div>
        ) : (
          <div>
            {task.description ? (
              <p className="description-text">{task.description}</p>
            ) : (
              <p className="no-description">توضیحاتی وجود ندارد</p>
            )}
            <button onClick={() => setIsEditing(true)}>
              ✏️ ویرایش توضیحات
            </button>
          </div>
        )}
      </div>
      
      {/* بقیه محتوای task */}
    </div>
  );
}

export default TaskCard;
```

---

### فرم ساخت Task با Description

```jsx
import React, { useState } from 'react';

function CreateTaskForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: '',
    status: 'todo',
    type: 'routine',
    subtasks: []
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
    setFormData({
      title: '',
      description: '',
      assigneeId: '',
      status: 'todo',
      type: 'routine',
      subtasks: []
    });
  };

  return (
    <form onSubmit={handleSubmit} className="create-task-form">
      <div className="form-group">
        <label>عنوان Task *</label>
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
          placeholder="توضیحات کامل task را وارد کنید..."
          rows={5}
        />
        <small>این فیلد اختیاری است</small>
      </div>
      
      <div className="form-group">
        <label>Assignee *</label>
        <select
          value={formData.assigneeId}
          onChange={(e) => setFormData({...formData, assigneeId: e.target.value})}
          required
        >
          <option value="">انتخاب کنید</option>
          {/* لیست users */}
        </select>
      </div>
      
      <button type="submit">ساخت Task</button>
    </form>
  );
}

export default CreateTaskForm;
```

---

### API Calls

```javascript
const API_BASE = 'http://193.141.64.139:3000/api';

// ساخت task با description
async function createTask(taskData, token) {
  const response = await fetch(`${API_BASE}/tasks`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      title: taskData.title,
      description: taskData.description || null,
      assignee_id: taskData.assigneeId,
      key_result_ids: taskData.keyResultIds || [],
      status: taskData.status || 'todo',
      type: taskData.type || 'routine',
      subtasks: taskData.subtasks || []
    })
  });
  
  return response.json();
}

// ویرایش description
async function updateTaskDescription(taskId, description, token) {
  const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      description: description
    })
  });
  
  return response.json();
}
```

---

## 🎨 CSS نمونه

```css
.task-description {
  margin-top: 16px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
}

.description-text {
  white-space: pre-wrap;
  line-height: 1.6;
  color: #333;
  margin: 0 0 12px 0;
}

.no-description {
  color: #999;
  font-style: italic;
  margin: 0 0 12px 0;
}

.task-description textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
}

.task-description .actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.task-description button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.task-description button:first-child {
  background: #4caf50;
  color: white;
}

.task-description button:last-child {
  background: #f0f0f0;
  color: #333;
}
```

---

## 📝 نکات مهم

1. **فیلد اختیاری است** - می‌تونی task بدون description بسازی
2. **پشتیبانی از متن چند خطی** - از `\n` برای خط جدید استفاده کن
3. **در CSS از `white-space: pre-wrap`** استفاده کن تا خطوط جدید نمایش داده بشن
4. **می‌تونی Markdown** یا Rich Text Editor استفاده کنی
5. **برای ویرایش فقط description** رو بفرست، بقیه فیلدها اختیاری هستند

---

## 🎯 UI/UX پیشنهادی

### حالت نمایش (View Mode)
- اگر description خالی بود: "توضیحاتی وجود ندارد" با رنگ خاکستری
- اگر description داشت: نمایش متن با فرمت مناسب
- دکمه "ویرایش توضیحات" برای تغییر به حالت ویرایش

### حالت ویرایش (Edit Mode)
- Textarea با حداقل 5 خط
- Placeholder مناسب
- دکمه‌های "ذخیره" و "لغو"
- Auto-focus روی textarea

### در فرم ساخت Task
- Textarea بعد از فیلد title
- Label: "توضیحات (اختیاری)"
- Placeholder: "توضیحات کامل task را وارد کنید..."

---

## ✅ چک‌لیست پیاده‌سازی

- [ ] نمایش description در کارت task
- [ ] حالت ویرایش inline
- [ ] فیلد description در فرم ساخت task
- [ ] پشتیبانی از متن چند خطی
- [ ] حالت خالی (no description)
- [ ] دکمه ویرایش
- [ ] ذخیره و لغو
- [ ] Responsive design

---

**موفق باشید! 🚀**
