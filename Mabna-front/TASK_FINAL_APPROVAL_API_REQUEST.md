# درخواست API تأیید نهایی وظایف

## خلاصه درخواست

سلام تیم بکند عزیز،

نیاز به اضافه کردن قابلیت "تأیید نهایی" برای وظایف داریم. این ویژگی به مدیران اجازه می‌دهد وظایف انجام شده را تأیید نهایی کنند و به آرشیو منتقل کنند.

## مفهوم تأیید نهایی

### جریان کار فعلی:
```
todo → in_progress → done
```

### جریان کار جدید:
```
todo → in_progress → done → approved (آرشیو)
```

## تغییرات مورد نیاز در دیتابیس

### 1. اضافه کردن فیلد جدید به جدول tasks
```sql
ALTER TABLE tasks ADD COLUMN is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE tasks ADD COLUMN approved_by UUID REFERENCES users(id);
ALTER TABLE tasks ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE;
```

### 2. ایندکس برای بهبود عملکرد
```sql
CREATE INDEX idx_tasks_is_approved ON tasks(is_approved);
CREATE INDEX idx_tasks_approved_by ON tasks(approved_by);
```

## API های مورد نیاز

### 1. تأیید نهایی وظیفه
```
PUT /api/tasks/{task_id}/approve
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "approval_note": "وظیفه با کیفیت مناسب انجام شده است" // اختیاری
}
```

**Response:**
```json
{
  "task": {
    "id": "task-uuid",
    "title": "عنوان وظیفه",
    "status": "done",
    "is_approved": true,
    "approved_by": {
      "id": "user-uuid",
      "full_name": "احمد مدیری",
      "email": "admin@example.com"
    },
    "approved_at": "2025-01-27T10:30:00Z",
    "approval_note": "وظیفه با کیفیت مناسب انجام شده است"
  }
}
```

### 2. لغو تأیید نهایی
```
DELETE /api/tasks/{task_id}/approve
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "task": {
    "id": "task-uuid",
    "title": "عنوان وظیفه",
    "status": "done",
    "is_approved": false,
    "approved_by": null,
    "approved_at": null,
    "approval_note": null
  }
}
```

### 3. دریافت وظایف با فیلتر تأیید
```
GET /api/tasks?approved={true|false|all}
```

**Query Parameters:**
- `approved=true`: فقط وظایف تأیید شده
- `approved=false`: فقط وظایف تأیید نشده
- `approved=all`: همه وظایف (پیش‌فرض)

### 4. به‌روزرسانی GET /api/tasks
Response باید شامل فیلدهای جدید باشد:

```json
{
  "id": "task-uuid",
  "title": "عنوان وظیفه",
  "status": "done",
  "is_approved": true,
  "approved_by": {
    "id": "user-uuid",
    "full_name": "احمد مدیری",
    "email": "admin@example.com"
  },
  "approved_at": "2025-01-27T10:30:00Z",
  "approval_note": "وظیفه با کیفیت مناسب انجام شده است",
  "is_creator": true,
  // سایر فیلدهای موجود...
}
```

## قوانین دسترسی

### مجوزهای تأیید نهایی:
1. **فقط مدیران** می‌توانند وظایف را تأیید نهایی کنند
2. **فقط وظایف با وضعیت `done`** قابل تأیید هستند
3. **سازنده وظیفه نمی‌تواند** وظیفه خودش را تأیید کند
4. **مدیر سازمان** می‌تواند همه وظایف سازمان را تأیید کند
5. **مدیر تیم** می‌تواند وظایف اعضای تیمش را تأیید کند

### بررسی‌های لازم:
```javascript
// شبه کد برای بررسی مجوز
if (user.role !== 'admin') {
  return error('فقط مدیران می‌توانند وظایف را تأیید کنند')
}

if (task.status !== 'done') {
  return error('فقط وظایف انجام شده قابل تأیید هستند')
}

if (task.created_by === user.id) {
  return error('نمی‌توانید وظیفه خودتان را تأیید کنید')
}

// بررسی مجوز سازمان/تیم
if (!canApproveTask(user, task)) {
  return error('شما مجوز تأیید این وظیفه را ندارید')
}
```

## نمایش در فرانت‌اند

### 1. فیلتر وظایف:
- تب "همه وظایف"
- تب "تأیید شده" (آرشیو)
- تب "در انتظار تأیید" (done اما approved نشده)

### 2. نمایش وضعیت:
- وظایف `done` + `is_approved: false`: نشان "در انتظار تأیید"
- وظایف `done` + `is_approved: true`: نشان "تأیید شده" + آیکون آرشیو

### 3. دکمه‌های عملیات:
- برای مدیران: دکمه "تأیید نهایی" روی وظایف `done`
- برای مدیران: دکمه "لغو تأیید" روی وظایف تأیید شده
- برای سایرین: فقط مشاهده وضعیت

## مثال‌های استفاده

### تأیید وظیفه:
```javascript
const response = await fetch(`/api/tasks/${taskId}/approve`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    approval_note: 'عالی انجام شده'
  })
})
```

### فیلتر وظایف تأیید شده:
```javascript
const response = await fetch('/api/tasks?approved=true', {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

## اعلان‌ها (اختیاری)

### اعلان‌های پیشنهادی:
1. **به سازنده وظیفه**: "وظیفه شما تأیید نهایی شد"
2. **به مدیران**: "وظیفه جدیدی در انتظار تأیید است"

## آمار و گزارش (اختیاری)

### آمارهای مفید:
- تعداد وظایف تأیید شده در ماه
- میانگین زمان بین انجام و تأیید
- وظایف در انتظار تأیید
- عملکرد تیم‌ها بر اساس تأیید نهایی

## نکات مهم

1. **Backward Compatibility**: وظایف موجود `is_approved: false` خواهند بود
2. **Performance**: ایندکس‌گذاری مناسب برای فیلترها
3. **Audit Trail**: ثبت تاریخ و کاربر تأیید کننده
4. **Validation**: بررسی دقیق مجوزها قبل از تأیید

## اولویت پیاده‌سازی

1. **مرحله 1**: اضافه کردن فیلدها و API پایه
2. **مرحله 2**: پیاده‌سازی مجوزها
3. **مرحله 3**: فیلترها و جستجو
4. **مرحله 4**: اعلان‌ها و آمار

لطفاً در صورت سوال یا نیاز به توضیح بیشتر، اطلاع دهید.

با تشکر،
تیم فرانت‌اند