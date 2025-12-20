# خطای Backend - فیلد created_by_id

## خطاهای فعلی

چندین API با خطای 500 مواجه هستند:

### 1. GET /api/dashboard
```json
{
  "error": "Failed to retrieve dashboard data",
  "details": "The column `objectives.created_by_id` does not exist in the current database."
}
```

### 2. GET /api/recurring-patterns
```json
{
  "error": "Failed to retrieve recurring patterns"
}
```

### 3. GET /api/objectives
```json
{
  "error": "Failed to retrieve objectives"
}
```

---

## مشکل اصلی

در فایل `/root/Mabna/src/controllers/dashboard.controller.js` خط 17، کد دنبال فیلد `created_by_id` در جدول `objectives` میگرده که این فیلد در دیتابیس وجود ندارد.

```javascript
// خط 17 - dashboard.controller.js
const objectives = await prisma.objective.findMany({
  where: {
    organizationId: organizationId,
    created_by_id: userId  // ❌ این فیلد وجود ندارد
  }
})
```

---

## راه‌حل

### گزینه 1: حذف فیلتر created_by_id (توصیه می‌شود)

اگر می‌خواهید همه objectives سازمان را نشان دهید:

```javascript
const objectives = await prisma.objective.findMany({
  where: {
    organizationId: organizationId
    // created_by_id را حذف کنید
  },
  include: {
    key_results: {
      include: {
        tasks: true
      }
    }
  }
})
```

### گزینه 2: اضافه کردن فیلد به دیتابیس

اگر واقعاً نیاز به فیلتر کردن بر اساس سازنده دارید، باید:

1. Migration بسازید و فیلد `created_by_id` را به جدول `objectives` اضافه کنید
2. مقادیر پیش‌فرض برای رکوردهای موجود تنظیم کنید
3. کد را آپدیت کنید

**Migration نمونه:**
```sql
ALTER TABLE objectives 
ADD COLUMN created_by_id UUID REFERENCES users(id);

-- مقدار پیش‌فرض برای رکوردهای موجود
UPDATE objectives 
SET created_by_id = (
  SELECT id FROM users 
  WHERE organization_id = objectives.organization_id 
  AND role = 'admin' 
  LIMIT 1
)
WHERE created_by_id IS NULL;
```

---

## بررسی سایر فایل‌ها

لطفاً این فایل‌ها را هم چک کنید که آیا از `created_by_id` استفاده می‌کنند:

- `objectives.controller.js`
- `recurring-patterns.controller.js`
- هر controller دیگری که با objectives کار می‌کند

و همه جا را یکسان کنید.

---

## تست

بعد از fix:

```bash
# تست dashboard
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"

# تست objectives
curl -X GET http://localhost:3000/api/objectives \
  -H "Authorization: Bearer YOUR_TOKEN"

# تست recurring patterns
curl -X GET http://localhost:3000/api/recurring-patterns \
  -H "Authorization: Bearer YOUR_TOKEN"
```

همه باید بدون خطا کار کنند.

---

## اولویت
**بسیار بالا** - این خطا باعث می‌شود چندین بخش اصلی سیستم کار نکنند.
