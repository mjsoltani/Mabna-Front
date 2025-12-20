# Backend Updates - Sprint 4 ✅

## خلاصه تغییرات

تیم بکند سه تسک اصلی رو انجام داده:

### 1️⃣ دکمه خروج (Logout) ✅

**Endpoint جدید:**
```
POST /api/auth/logout
```

**نیاز به:**
- Authorization header با token

**Response:**
```json
{
  "message": "Logged out successfully",
  "success": true
}
```

**توضیح برای فرانت:**
- این endpoint فقط تایید می‌کنه که logout انجام شد
- تیم فرانت باید token رو از localStorage/sessionStorage حذف کنه
- بعد از logout، کاربر به صفحه login هدایت بشه

---

### 2️⃣ دو نوع وظیفه (Task Types) ✅

**تغییرات:**
- هر task اب یک `type` فیلد جدید داره
- دو نوع وجود داره: `"routine"` یا `"special"`
- اگر type مشخص نشه، پیش‌فرض `"routine"` هست

**هنگام ایجاد وظیفه:**
```json
{
  "title": "وظیفه جدید",
  "assignee_id": "user-id",
  "type": "routine",  // یا "special"
  "key_result_ids": [...]  // اختیاری
}
```

**هنگام ویرایش وظیفه:**
```json
{
  "type": "special"  // می‌تونه تغییر بکنه
}
```

**Response شامل:**
```json
{
  "id": "task-id",
  "title": "وظیفه جدید",
  "type": "routine",
  "status": "todo",
  ...
}
```

---

### 3️⃣ بهتر کردن سیستم هدف (Objectives) ✅

#### الف) حذف هدف
```
DELETE /api/objectives/:id
```

**Response:**
```json
{
  "message": "Objective deleted successfully",
  "id": "objective-id"
}
```

#### ب) ویرایش هدف
```
PUT /api/objectives/:id
```

**Body:**
```json
{
  "title": "عنوان جدید",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31"
}
```

#### ج) گزارش مخصوص هدف
```
GET /api/objectives/:id/report
```

**Response:**
```json
{
  "id": "objective-id",
  "title": "هدف سالانه",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31",
  "total_key_results": 3,
  "key_results": [
    {
      "id": "kr-id",
      "title": "Key Result 1",
      "initial_value": 0,
      "target_value": 100,
      "total_tasks": 5,
      "completed_tasks": 2,
      "progress_percentage": 40,
      "tasks": [
        {
          "id": "task-id",
          "title": "وظیفه 1",
          "status": "done",
          "type": "routine",
          "assignee": {
            "user_id": "user-id",
            "full_name": "نام کاربر"
          }
        }
      ]
    }
  ]
}
```

---

### 4️⃣ حذف وظیفه (Task Deletion) ✅

**Endpoint جدید:**
```
DELETE /api/tasks/:id
```

**Response:**
```json
{
  "message": "Task deleted successfully",
  "id": "task-id"
}
```

---

## تغییرات مهم برای تیم فرانت

### 1. صفحه Tasks
- اضافه کردن dropdown برای انتخاب task type (Routine / Special)
- اضافه کردن دکمه Delete برای هر task
- نمایش task type در لیست tasks

### 2. صفحه Objectives
- اضافه کردن دکمه Edit برای هر objective
- اضافه کردن دکمه Delete برای هر objective
- اضافه کردن دکمه "View Report" که گزارش تفصیلی رو نشون بده
- در گزارش، نمایش progress percentage برای هر key result

### 3. صفحه Auth
- اضافه کردن دکمه Logout در navbar/menu
- بعد از کلیک logout:
  1. POST request به `/api/auth/logout`
  2. حذف token از storage
  3. Redirect به صفحه login

### 4. Task Creation/Edit Form
- اضافه کردن field برای task type
- key_result_ids اب اختیاری شد (task می‌تونه بدون key result باشه)

---

## Database Changes

```sql
ALTER TABLE tasks ADD COLUMN type VARCHAR(50) DEFAULT 'routine';
```

---

## Testing Checklist

- [ ] Logout endpoint کار می‌کنه
- [ ] Task type می‌تونه routine یا special باشه
- [ ] Task می‌تونه بدون key result ایجاد بشه
- [ ] Task delete می‌کنه
- [ ] Objective delete می‌کنه
- [ ] Objective edit می‌کنه
- [ ] Objective report صحیح داده رو نشون می‌ده

---

## API Documentation

تمام endpoints در Swagger موجود هستند:
```
http://localhost:3000/docs
```