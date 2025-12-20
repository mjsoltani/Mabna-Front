# درخواست یکسان‌سازی API ها

## مشکل فعلی

در حال حاضر، وظایف در جاهای مختلف از API های متفاوت گرفته می‌شوند و داده‌های متفاوتی نشون میدن:

### 1. Profile Activity API
**Endpoint:** `GET /api/profile/activity`

**Response:**
```json
{
  "recent_tasks": [
    {
      "id": "uuid",
      "title": "عنوان وظیفه",
      "status": "todo|in_progress|done",
      "createdAt": "2025-12-20T..."
    }
  ],
  "recent_comments": [...],
  "recent_notifications": [...]
}
```

**مشکل:** فقط وظایفی که خود کاربر ساخته رو نشون میده، وظایف assign شده رو نشون نمیده

### 2. Dashboard API
**Endpoint:** `GET /api/dashboard`

**Response:**
```json
{
  "objectives": [...],
  "tasks": [] // یا اصلاً وجود نداره
}
```

**مشکل:** لیست وظایف رو برنمی‌گردونه یا ناقص هست

### 3. Tasks API
**Endpoint:** `GET /api/tasks`

**Response:**
```json
[
  {
    "id": "uuid",
    "title": "عنوان",
    "description": "توضیحات",
    "status": "todo|in_progress|done",
    "priority": "low|medium|high",
    "assignee": {...},
    "creator": {...},
    "deadline": "2025-12-25",
    ...
  }
]
```

**این API کامل هست** ✅

---

## راه‌حل پیشنهادی

### 1. آپدیت Profile Activity API

`GET /api/profile/activity` باید **همه وظایف مرتبط با کاربر** رو برگردونه:

```json
{
  "recent_tasks": [
    {
      "id": "uuid",
      "title": "عنوان وظیفه",
      "description": "توضیحات",
      "status": "todo|in_progress|done",
      "priority": "low|medium|high",
      "deadline": "2025-12-25",
      "createdAt": "2025-12-20T...",
      "assignee": {
        "user_id": "uuid",
        "full_name": "نام کاربر"
      },
      "creator": {
        "user_id": "uuid",
        "full_name": "نام سازنده"
      },
      "is_creator": true,  // آیا کاربر سازنده است؟
      "is_assignee": false // آیا کاربر assignee است؟
    }
  ],
  "recent_comments": [...],
  "recent_notifications": [...]
}
```

**منطق:**
- وظایفی که کاربر ساخته (`creator_id = user_id`)
- وظایفی که به کاربر assign شده (`assignee_id = user_id`)
- مرتب شده بر اساس `createdAt` (جدیدترین اول)
- محدود به 5 یا 10 تا

### 2. آپدیت Dashboard API

`GET /api/dashboard` باید لیست وظایف رو هم برگردونه:

```json
{
  "objectives": [...],
  "recent_tasks": [
    // همون فرمت بالا
  ],
  "tasks_summary": {
    "total": 25,
    "todo": 10,
    "in_progress": 8,
    "done": 7,
    "my_tasks": 15,      // وظایف assign شده به من
    "created_by_me": 10  // وظایف ساخته شده توسط من
  }
}
```

### 3. Error Handling بهتر

همه API ها باید خطاهای واضح برگردونن:

```json
// بد ❌
{"error": "Failed to retrieve objectives"}

// خوب ✅
{"error": "No team found. Please create or join a team first."}
{"error": "User not found"}
{"error": "Database connection failed", "details": "..."}
```

---

## خلاصه تغییرات

1. ✅ `/api/profile/activity` → شامل همه وظایف (created + assigned)
2. ✅ `/api/dashboard` → اضافه کردن لیست وظایف
3. ✅ Error messages واضح‌تر
4. ✅ فیلدهای `is_creator` و `is_assignee` برای تشخیص نوع وظیفه

---

## مثال Query برای Backend

```sql
-- وظایف مرتبط با کاربر
SELECT t.*, 
       u1.full_name as creator_name,
       u2.full_name as assignee_name,
       CASE WHEN t.creator_id = $userId THEN true ELSE false END as is_creator,
       CASE WHEN t.assignee_id = $userId THEN true ELSE false END as is_assignee
FROM tasks t
LEFT JOIN users u1 ON t.creator_id = u1.id
LEFT JOIN users u2 ON t.assignee_id = u2.id
WHERE t.creator_id = $userId OR t.assignee_id = $userId
ORDER BY t.created_at DESC
LIMIT 10;
```

---

## اولویت
**بالا** - این تغییرات برای یکسان‌سازی تجربه کاربری ضروری هستند.
