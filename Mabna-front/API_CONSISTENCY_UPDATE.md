# به‌روزرسانی API ها - یکسان‌سازی داده‌ها

## تغییرات اعمال شده ✅

تمام تغییرات درخواستی برای یکسان‌سازی API ها اعمال شد.

---

## 1. Profile Activity API - به‌روزرسانی شده

### Endpoint
```
GET /api/profile/activity
```

### Headers
```
Authorization: Bearer <token>
```

### Query Parameters (اختیاری)
- `limit`: تعداد آیتم‌ها (پیش‌فرض: 10)

### Response جدید
```json
{
  "recent_tasks": [
    {
      "id": "uuid",
      "title": "عنوان وظیفه",
      "description": "توضیحات کامل وظیفه",
      "status": "todo|in_progress|done",
      "priority": "low|medium|high",
      "deadline": "2025-12-25T00:00:00.000Z",
      "created_at": "2025-12-20T10:30:00.000Z",
      "assignee": {
        "user_id": "uuid",
        "full_name": "نام کاربر"
      },
      "creator": {
        "user_id": "uuid",
        "full_name": "نام سازنده"
      },
      "is_creator": true,
      "is_assignee": false,
      "subtasks": {
        "total": 5,
        "completed": 2
      }
    }
  ],
  "recent_comments": [
    {
      "id": "uuid",
      "content": "متن کامنت",
      "task": {
        "id": "uuid",
        "title": "عنوان وظیفه"
      },
      "created_at": "2025-12-20T10:30:00.000Z"
    }
  ],
  "recent_notifications": [
    {
      "id": "uuid",
      "type": "task_assigned|task_mention|comment_added",
      "title": "عنوان نوتیفیکیشن",
      "message": "پیام نوتیفیکیشن",
      "is_read": false,
      "task_id": "uuid",
      "created_at": "2025-12-20T10:30:00.000Z"
    }
  ]
}
```

### تغییرات کلیدی
- ✅ **همه وظایف مرتبط**: شامل وظایف ساخته شده توسط کاربر + وظایف assign شده به کاربر
- ✅ **فیلدهای کامل**: description, priority, deadline اضافه شد
- ✅ **اطلاعات assignee و creator**: هر دو با user_id و full_name
- ✅ **فیلدهای جدید**: `is_creator` و `is_assignee` برای تشخیص نوع وظیفه
- ✅ **آمار subtasks**: تعداد کل و تعداد تکمیل شده

---

## 2. Dashboard API - به‌روزرسانی شده

### Endpoint
```
GET /api/dashboard
```

### Headers
```
Authorization: Bearer <token>
```

### Response جدید
```json
{
  "organization_id": "uuid",
  "objectives": [
    {
      "id": "uuid",
      "title": "عنوان هدف",
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T00:00:00.000Z",
      "progress_percentage": 45,
      "key_results": [
        {
          "id": "uuid",
          "title": "عنوان نتیجه کلیدی",
          "initial_value": 0,
          "target_value": 100,
          "progress_percentage": 45,
          "total_tasks": 10,
          "completed_tasks": 4
        }
      ]
    }
  ],
  "recent_tasks": [
    {
      "id": "uuid",
      "title": "عنوان وظیفه",
      "description": "توضیحات کامل",
      "status": "todo|in_progress|done",
      "priority": "low|medium|high",
      "deadline": "2025-12-25T00:00:00.000Z",
      "created_at": "2025-12-20T10:30:00.000Z",
      "assignee": {
        "user_id": "uuid",
        "full_name": "نام کاربر"
      },
      "creator": {
        "user_id": "uuid",
        "full_name": "نام سازنده"
      },
      "is_creator": false,
      "is_assignee": true,
      "subtasks": {
        "total": 3,
        "completed": 1
      }
    }
  ],
  "tasks_summary": {
    "total": 25,
    "todo": 10,
    "in_progress": 8,
    "done": 7,
    "my_tasks": 15,
    "created_by_me": 10
  }
}
```

### تغییرات کلیدی
- ✅ **recent_tasks اضافه شد**: 10 وظیفه اخیر مرتبط با کاربر
- ✅ **tasks_summary اضافه شد**: آمار کامل وظایف سازمان
  - `total`: کل وظایف سازمان
  - `todo`, `in_progress`, `done`: تفکیک بر اساس وضعیت
  - `my_tasks`: وظایف assign شده به من
  - `created_by_me`: وظایف ساخته شده توسط من
- ✅ **فرمت یکسان**: recent_tasks همان فرمت Profile Activity دارد

---

## 3. نحوه استفاده در Frontend

### تشخیص نوع وظیفه
```javascript
// چک کردن اینکه آیا کاربر سازنده وظیفه است
if (task.is_creator) {
  // نمایش دکمه ویرایش/حذف
}

// چک کردن اینکه آیا وظیفه به کاربر assign شده
if (task.is_assignee) {
  // نمایش در لیست "وظایف من"
}

// وظایفی که هم ساخته و هم assign شده‌اند
if (task.is_creator && task.is_assignee) {
  // وظیفه‌ای که کاربر برای خودش ساخته
}
```

### نمایش پیشرفت Subtasks
```javascript
const progress = (task.subtasks.completed / task.subtasks.total) * 100;
// نمایش: "2 از 5 زیروظیفه تکمیل شده"
```

### فیلتر کردن وظایف
```javascript
// فقط وظایف assign شده به من
const myTasks = tasks.filter(t => t.is_assignee);

// فقط وظایف ساخته شده توسط من
const createdTasks = tasks.filter(t => t.is_creator);

// وظایف با deadline نزدیک
const upcomingTasks = tasks.filter(t => {
  const deadline = new Date(t.deadline);
  const today = new Date();
  const diff = deadline - today;
  return diff > 0 && diff < 7 * 24 * 60 * 60 * 1000; // 7 روز
});
```

---

## 4. مقایسه قبل و بعد

### قبل ❌
```json
{
  "recent_tasks": [
    {
      "id": "uuid",
      "title": "عنوان",
      "status": "todo",
      "createdAt": "..."
    }
  ]
}
```

### بعد ✅
```json
{
  "recent_tasks": [
    {
      "id": "uuid",
      "title": "عنوان",
      "description": "توضیحات کامل",
      "status": "todo",
      "priority": "high",
      "deadline": "2025-12-25T00:00:00.000Z",
      "created_at": "2025-12-20T10:30:00.000Z",
      "assignee": { "user_id": "...", "full_name": "..." },
      "creator": { "user_id": "...", "full_name": "..." },
      "is_creator": true,
      "is_assignee": false,
      "subtasks": { "total": 5, "completed": 2 }
    }
  ]
}
```

---

## 5. نکات مهم

### Deadline (due_date)
- اگر وظیفه deadline نداشته باشد: `"deadline": null`
- فرمت: ISO 8601 string

### Description
- اگر وظیفه توضیحات نداشته باشد: `"description": null`
- می‌تواند شامل mentions باشد: `@[User Name](user-id)`

### Priority
- مقادیر ممکن: `"low"`, `"medium"`, `"high"`

### Status
- مقادیر ممکن: `"todo"`, `"in_progress"`, `"done"`

### Subtasks
- همیشه object با `total` و `completed` برمی‌گردد
- اگر وظیفه subtask نداشته باشد: `{ "total": 0, "completed": 0 }`

---

## 6. Error Handling بهتر

همه API ها حالا خطاهای واضح‌تری برمی‌گردانند:

```json
// خطای Authentication
{
  "error": "Authentication required",
  "details": "User or organization information is missing"
}

// خطای سرور
{
  "error": "Failed to retrieve dashboard data",
  "details": "Connection timeout",
  "hint": "Check server logs for more information"
}
```

---

## تست API ها

### تست Profile Activity
```bash
curl -X GET http://localhost:3000/api/profile/activity \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

### تست Dashboard
```bash
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## وضعیت
✅ **تکمیل شده** - تمام تغییرات اعمال و آماده استفاده است
