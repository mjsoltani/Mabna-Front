# راهنمای API ویرایش الگوهای تکرار (Recurring Patterns)

## 📋 خلاصه تغییرات

قابلیت **ویرایش کامل** الگوهای تکرار اضافه شد. حالا می‌تونید همه فیلدها از جمله subtask templates رو ویرایش کنید.

---

## 🆕 API جدید - دریافت یک الگو

### `GET /api/recurring-patterns/:id`

برای نمایش فرم ویرایش، ابتدا اطلاعات کامل الگو رو دریافت کنید.

**نمونه کد React:**
```javascript
const getRecurringPattern = async (patternId) => {
  const response = await fetch(`/api/recurring-patterns/${patternId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

**Response (200):**
```json
{
  "id": "pattern-uuid",
  "title": "گزارش هفتگی",
  "description": "ارسال گزارش عملکرد هفتگی",
  "assignee": {
    "user_id": "user-uuid",
    "full_name": "علی محمدی"
  },
  "frequency": "weekly",
  "interval": 1,
  "day_of_week": 6,
  "day_of_month": null,
  "start_date": "2025-01-01",
  "end_date": null,
  "is_active": true,
  "last_generated": "2025-12-21",
  "subtask_templates": [
    { "id": "st-1", "title": "جمع‌آوری داده‌ها" },
    { "id": "st-2", "title": "تهیه نمودار" },
    { "id": "st-3", "title": "ارسال به مدیر" }
  ],
  "recent_tasks": [
    {
      "id": "task-uuid",
      "title": "گزارش هفتگی",
      "status": "done",
      "due_date": "2025-12-21",
      "subtasks": [
        { "id": "sub-1", "title": "جمع‌آوری داده‌ها", "is_completed": true }
      ],
      "created_at": "2025-12-14T..."
    }
  ],
  "created_at": "2025-01-01T..."
}
```

---

## 🔄 API ویرایش الگو

### `PUT /api/recurring-patterns/:id`

**Request Body (همه فیلدها اختیاری):**
```json
{
  "title": "گزارش هفتگی - آپدیت شده",
  "description": "توضیحات جدید",
  "assignee_id": "new-user-uuid",
  "frequency": "weekly",
  "interval": 2,
  "day_of_week": 0,
  "day_of_month": null,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "is_active": true,
  "subtask_templates": [
    { "title": "ساب‌تسک جدید 1" },
    { "title": "ساب‌تسک جدید 2" }
  ]
}
```

**نمونه کد React:**
```javascript
const updateRecurringPattern = async (patternId, data) => {
  const response = await fetch(`/api/recurring-patterns/${patternId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  return response.json();
};

// استفاده:
const handleUpdate = async () => {
  const result = await updateRecurringPattern(patternId, {
    title: 'عنوان جدید',
    description: 'توضیحات جدید',
    frequency: 'daily',
    is_active: false,
    subtask_templates: [
      { title: 'مرحله 1' },
      { title: 'مرحله 2' }
    ]
  });
  console.log('Updated:', result);
};
```

**Response (200):**
```json
{
  "id": "pattern-uuid",
  "title": "گزارش هفتگی - آپدیت شده",
  "description": "توضیحات جدید",
  "assignee": {
    "user_id": "user-uuid",
    "full_name": "علی محمدی"
  },
  "frequency": "weekly",
  "interval": 2,
  "day_of_week": 0,
  "day_of_month": null,
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "is_active": true,
  "subtask_templates": [
    { "id": "new-st-1", "title": "ساب‌تسک جدید 1" },
    { "id": "new-st-2", "title": "ساب‌تسک جدید 2" }
  ],
  "created_at": "2025-01-01T..."
}
```

---

## 📝 فیلدهای قابل ویرایش

| فیلد | نوع | توضیحات |
|------|-----|---------|
| `title` | string | عنوان الگو |
| `description` | string/null | توضیحات |
| `assignee_id` | uuid | مسئول انجام |
| `frequency` | enum | `daily`, `weekly`, `monthly` |
| `interval` | number | هر چند وقت یکبار (پیش‌فرض: 1) |
| `day_of_week` | 0-6 | برای weekly (0=یکشنبه) |
| `day_of_month` | 1-31 | برای monthly |
| `start_date` | date | تاریخ شروع |
| `end_date` | date/null | تاریخ پایان (null = بدون پایان) |
| `is_active` | boolean | فعال/غیرفعال |
| `subtask_templates` | array | لیست ساب‌تسک‌های قالب |

---

## 🎨 پیشنهاد UI - فرم ویرایش

```jsx
const EditRecurringPatternForm = ({ patternId }) => {
  const [pattern, setPattern] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPattern();
  }, [patternId]);

  const loadPattern = async () => {
    const data = await getRecurringPattern(patternId);
    setPattern(data);
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    await updateRecurringPattern(patternId, {
      title: formData.get('title'),
      description: formData.get('description'),
      assignee_id: formData.get('assignee_id'),
      frequency: formData.get('frequency'),
      interval: parseInt(formData.get('interval')),
      day_of_week: formData.get('day_of_week') 
        ? parseInt(formData.get('day_of_week')) 
        : null,
      day_of_month: formData.get('day_of_month')
        ? parseInt(formData.get('day_of_month'))
        : null,
      start_date: formData.get('start_date'),
      end_date: formData.get('end_date') || null,
      is_active: formData.get('is_active') === 'on',
      subtask_templates: subtasks.map(st => ({ title: st.title }))
    });
  };

  if (loading) return <div>در حال بارگذاری...</div>;

  return (
    <form onSubmit={handleSubmit}>
      <input 
        name="title" 
        defaultValue={pattern.title}
        placeholder="عنوان الگو"
        required 
      />
      
      <textarea 
        name="description"
        defaultValue={pattern.description}
        placeholder="توضیحات (اختیاری)"
      />

      <select name="assignee_id" defaultValue={pattern.assignee.user_id}>
        {users.map(u => (
          <option key={u.id} value={u.id}>{u.full_name}</option>
        ))}
      </select>

      <select name="frequency" defaultValue={pattern.frequency}>
        <option value="daily">روزانه</option>
        <option value="weekly">هفتگی</option>
        <option value="monthly">ماهانه</option>
      </select>

      <input 
        type="number" 
        name="interval"
        defaultValue={pattern.interval}
        min="1"
        placeholder="هر چند وقت یکبار"
      />

      {/* نمایش day_of_week برای weekly */}
      {frequency === 'weekly' && (
        <select name="day_of_week" defaultValue={pattern.day_of_week}>
          <option value="0">یکشنبه</option>
          <option value="1">دوشنبه</option>
          <option value="2">سه‌شنبه</option>
          <option value="3">چهارشنبه</option>
          <option value="4">پنج‌شنبه</option>
          <option value="5">جمعه</option>
          <option value="6">شنبه</option>
        </select>
      )}

      {/* نمایش day_of_month برای monthly */}
      {frequency === 'monthly' && (
        <input 
          type="number"
          name="day_of_month"
          defaultValue={pattern.day_of_month}
          min="1" max="31"
          placeholder="روز ماه"
        />
      )}

      <input type="date" name="start_date" defaultValue={pattern.start_date} />
      <input type="date" name="end_date" defaultValue={pattern.end_date} />

      <label>
        <input 
          type="checkbox" 
          name="is_active"
          defaultChecked={pattern.is_active}
        />
        فعال
      </label>

      {/* بخش ساب‌تسک‌ها */}
      <SubtaskTemplatesEditor 
        templates={pattern.subtask_templates}
        onChange={setSubtasks}
      />

      <button type="submit">ذخیره تغییرات</button>
    </form>
  );
};
```

---

## ⚠️ نکات مهم

1. **subtask_templates:** وقتی این فیلد ارسال می‌شه، همه ساب‌تسک‌های قبلی حذف و جدیدها جایگزین می‌شن
2. **assignee_id:** باید کاربری از همان سازمان باشه
3. **frequency:** تغییر frequency ممکنه نیاز به آپدیت `day_of_week` یا `day_of_month` داشته باشه
4. **is_active:** غیرفعال کردن باعث توقف تولید خودکار task می‌شه

---

## 📞 سوالات؟

اگر سوالی داشتید با تیم بکند هماهنگ کنید.
