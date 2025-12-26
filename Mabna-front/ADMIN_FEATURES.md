# قابلیت‌های Admin (Super Admin)

## تغییرات اعمال شده ✅

Admin حالا دسترسی کامل به همه بخش‌های سازمان داره و می‌تونه:

---

## 1. مدیریت Objectives (اهداف)

### قابلیت‌های Admin:
- ✅ ایجاد objective برای هر کسی
- ✅ ویرایش همه objectives (نه فقط objectives خودش)
- ✅ حذف همه objectives
- ✅ اضافه کردن key results به همه objectives
- ✅ ویرایش و حذف همه key results

### API Endpoints:
```bash
# ایجاد objective
POST /api/objectives
{
  "title": "عنوان هدف",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}

# ویرایش objective (admin می‌تونه هر objective رو ویرایش کنه)
PUT /api/objectives/:id
{
  "title": "عنوان جدید"
}

# حذف objective (admin می‌تونه هر objective رو حذف کنه)
DELETE /api/objectives/:id

# اضافه کردن key result (admin می‌تونه به هر objective اضافه کنه)
POST /api/objectives/:id/keyresults
{
  "title": "نتیجه کلیدی",
  "initial_value": 0,
  "target_value": 100
}
```

---

## 2. مدیریت Tasks (وظایف)

### قابلیت‌های Admin:
- ✅ ایجاد task برای هر کسی
- ✅ ویرایش همه tasks (نه فقط tasks خودش)
- ✅ حذف همه tasks
- ✅ تغییر assignee هر task
- ✅ مدیریت subtasks همه tasks

### API Endpoints:
```bash
# ایجاد task
POST /api/tasks
{
  "title": "عنوان وظیفه",
  "description": "توضیحات",
  "assignee_id": "user-id",
  "key_result_ids": ["kr-id-1", "kr-id-2"],
  "status": "todo",
  "type": "routine",
  "due_date": "2025-12-25",
  "subtasks": [
    {"title": "زیروظیفه 1"},
    {"title": "زیروظیفه 2"}
  ]
}

# ویرایش task (admin می‌تونه هر task رو ویرایش کنه)
PUT /api/tasks/:id
{
  "title": "عنوان جدید",
  "assignee_id": "new-user-id"
}

# حذف task (admin می‌تونه هر task رو حذف کنه)
DELETE /api/tasks/:id
```

---

## 3. مدیریت Teams (تیم‌ها)

### قابلیت‌های Admin:
- ✅ ایجاد تیم جدید
- ✅ ویرایش همه تیم‌ها
- ✅ حذف همه تیم‌ها
- ✅ اضافه/حذف کردن اعضا به/از تیم‌ها
- ✅ مشاهده همه تیم‌ها و اعضای آن‌ها

### API Endpoints:
```bash
# دریافت همه تیم‌ها
GET /api/teams

# ایجاد تیم جدید
POST /api/teams
{
  "name": "نام تیم",
  "description": "توضیحات",
  "member_ids": ["user-id-1", "user-id-2"]
}

# ویرایش تیم
PUT /api/teams/:id
{
  "name": "نام جدید"
}

# حذف تیم
DELETE /api/teams/:id

# اضافه کردن عضو به تیم
POST /api/teams/:id/members
{
  "user_id": "user-id",
  "role": "member"
}

# حذف عضو از تیم
DELETE /api/teams/:id/members/:userId
```

---

## 4. Admin Dashboard (داشبورد ویژه)

### Endpoint جدید:
```
GET /api/dashboard/admin
```

### Response:
```json
{
  "organization_id": "uuid",
  "summary": {
    "total_users": 25,
    "total_objectives": 10,
    "total_key_results": 30,
    "total_tasks": 150,
    "todo_tasks": 50,
    "in_progress_tasks": 60,
    "done_tasks": 40,
    "overdue_tasks": 15,
    "total_teams": 5,
    "completion_rate": 27
  },
  "objectives": [
    {
      "id": "uuid",
      "title": "عنوان هدف",
      "start_date": "2025-01-01T00:00:00.000Z",
      "end_date": "2025-12-31T00:00:00.000Z",
      "creator": {
        "user_id": "uuid",
        "full_name": "نام سازنده"
      },
      "progress_percentage": 45,
      "key_results": [...]
    }
  ],
  "recent_tasks": [
    {
      "id": "uuid",
      "title": "عنوان وظیفه",
      "status": "in_progress",
      "assignee": {
        "user_id": "uuid",
        "full_name": "نام کاربر"
      },
      "creator": {
        "user_id": "uuid",
        "full_name": "نام سازنده"
      },
      ...
    }
  ],
  "teams": [
    {
      "id": "uuid",
      "name": "نام تیم",
      "members_count": 5,
      "members": [...]
    }
  ]
}
```

### ویژگی‌های Admin Dashboard:
- ✅ آمار کامل سازمان
- ✅ همه objectives با creator آن‌ها
- ✅ 20 task اخیر از همه کاربران
- ✅ همه تیم‌ها با اعضای آن‌ها
- ✅ تعداد tasks overdue
- ✅ نرخ تکمیل کلی

---

## 5. تفاوت Admin با کاربران عادی

### کاربر عادی (member/leader):
- فقط می‌تونه objectives و tasks خودش رو ویرایش/حذف کنه
- فقط می‌تونه tasks مربوط به خودش رو ببینه (assigned یا created)
- نمی‌تونه تیم بسازه یا مدیریت کنه

### Admin:
- می‌تونه همه objectives و tasks رو ویرایش/حذف کنه
- می‌تونه همه tasks و objectives سازمان رو ببینه
- می‌تونه تیم بسازه و مدیریت کنه
- دسترسی به Admin Dashboard با آمار کامل
- می‌تونه برای هر کسی objective و task بسازه

---

## 6. نحوه تشخیص Admin

در backend، از `req.user.role` استفاده می‌شه:

```javascript
// در middleware auth
req.user = {
  userId: "uuid",
  organizationId: "uuid",
  role: "admin" // یا "leader" یا "member"
}

// چک کردن admin
if (req.user.role === 'admin') {
  // دسترسی کامل
}
```

---

## 7. Permission Logic

```javascript
// برای objectives و tasks:
if (user.role === 'admin') {
  // می‌تونه همه چیز رو مدیریت کنه
  return true;
} else {
  // فقط می‌تونه چیزهایی که خودش ساخته رو مدیریت کنه
  return item.createdById === user.userId;
}
```

---

## 8. تست Admin Features

### 1. Login به عنوان Admin
```bash
POST /api/auth/login
{
  "email": "admin@example.com",
  "password": "password"
}
```

### 2. دریافت Admin Dashboard
```bash
curl -X GET http://localhost:3000/api/dashboard/admin \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### 3. ویرایش objective کاربر دیگر
```bash
curl -X PUT http://localhost:3000/api/objectives/OTHER_USER_OBJECTIVE_ID \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "عنوان جدید"}'
```

### 4. ایجاد تیم
```bash
curl -X POST http://localhost:3000/api/teams \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "تیم جدید",
    "description": "توضیحات",
    "member_ids": ["user-id-1", "user-id-2"]
  }'
```

---

## 9. Error Messages

### کاربر عادی سعی می‌کنه objective دیگری رو ویرایش کنه:
```json
{
  "error": "You can only edit objectives that you created or you must be an admin"
}
```

### کاربر عادی سعی می‌کنه Admin Dashboard رو ببینه:
```json
{
  "error": "Access denied",
  "details": "Only admins can access this endpoint"
}
```

---

## 10. خلاصه تغییرات

### فایل‌های تغییر یافته:
1. ✅ `src/utils/permissions.js` - utility functions برای permission check
2. ✅ `src/controllers/objectives.controller.js` - اضافه شدن admin permission
3. ✅ `src/controllers/tasks.controller.js` - اضافه شدن admin permission
4. ✅ `src/controllers/dashboard.controller.js` - اضافه شدن Admin Dashboard
5. ✅ `src/routes/dashboard.routes.js` - route جدید `/admin`

### بدون تغییر در Database:
- ❌ نیازی به migration نیست
- ❌ نیازی به تغییر schema نیست
- ✅ فقط از role موجود `admin` استفاده می‌کنیم

---

## وضعیت
✅ **تکمیل شده** - Admin حالا دسترسی کامل به همه بخش‌های سازمان داره
