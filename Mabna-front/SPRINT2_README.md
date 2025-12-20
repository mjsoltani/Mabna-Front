# Mabna Backend - Sprint 2

## 🎯 اهداف اسپرینت ۲

اسپرینت ۲ با هدف **فعال‌سازی کار تیمی و نمایش پیشرفت** پیاده‌سازی شده است. در این اسپرینت، محصول از یک ابزار شخصی به یک ابزار تیمی تبدیل شده است.

## ✨ فیچرهای جدید

### 1. مدیریت کاربران و دعوت‌نامه‌ها

- **ارسال دعوت‌نامه**: ادمین‌ها می‌توانند کاربران جدید را از طریق ایمیل دعوت کنند
- **مشاهده دعوت‌نامه‌ها**: لیست تمام دعوت‌نامه‌های ارسال شده
- **پذیرش دعوت‌نامه**: کاربران جدید می‌توانند با دعوت‌نامه به سازمان بپیوندند

### 2. داشبورد پیشرفت

- **نمایش پیشرفت KRها**: محاسبه خودکار درصد پیشرفت بر اساس وظایف انجام شده
- **آمار سازمان**: نمایش آمار کلی شامل تعداد اهداف، KRها، وظایف و نرخ تکمیل
- **پیشرفت Objectives**: محاسبه پیشرفت کلی هر هدف بر اساس میانگین KRهای آن

### 3. سیستم کامنت

- **افزودن کامنت**: امکان گذاشتن نظر روی وظایف
- **مشاهده کامنت‌ها**: نمایش تمام کامنت‌های یک وظیفه به ترتیب زمانی
- **حذف کامنت**: کاربران می‌توانند کامنت‌های خود را حذف کنند

### 4. مدیریت وضعیت وظایف

- **سه وضعیت**: `todo`, `in_progress`, `done`
- **تغییر وضعیت**: امکان تغییر وضعیت وظایف
- **تأثیر بر پیشرفت**: وظایف با وضعیت `done` در محاسبه پیشرفت KRها لحاظ می‌شوند

## 📊 تغییرات دیتابیس

### جداول جدید:

1. **invitations**: مدیریت دعوت‌نامه‌های کاربران
2. **comments**: ذخیره کامنت‌های وظایف

### تغییرات جداول موجود:

- **tasks**: افزودن فیلد `status` با مقدار پیش‌فرض `todo`

## 🚀 API Endpoints جدید

### دعوت‌نامه‌ها (Invitations)

```bash
# ارسال دعوت‌نامه
POST /api/invitations
Authorization: Bearer {token}
{
  "email": "newuser@example.com"
}

# مشاهده دعوت‌نامه‌ها
GET /api/invitations
Authorization: Bearer {token}

# پذیرش دعوت‌نامه (بدون نیاز به احراز هویت)
POST /api/invitations/accept
{
  "invitation_id": "uuid",
  "full_name": "نام کامل",
  "password": "رمز عبور"
}
```

### کامنت‌ها (Comments)

```bash
# افزودن کامنت
POST /api/comments
Authorization: Bearer {token}
{
  "task_id": "uuid",
  "content": "متن کامنت"
}

# مشاهده کامنت‌های یک وظیفه
GET /api/comments/task/{task_id}
Authorization: Bearer {token}

# حذف کامنت
DELETE /api/comments/{id}
Authorization: Bearer {token}
```

### داشبورد (Dashboard)

```bash
# دریافت داشبورد با پیشرفت
GET /api/dashboard
Authorization: Bearer {token}

# دریافت آمار کلی سازمان
GET /api/dashboard/stats
Authorization: Bearer {token}
```

### وظایف (Tasks) - آپدیت شده

```bash
# ایجاد وظیفه با وضعیت
POST /api/tasks
Authorization: Bearer {token}
{
  "title": "عنوان وظیفه",
  "assignee_id": "uuid",
  "key_result_ids": ["uuid1", "uuid2"],
  "status": "todo"  // اختیاری: todo, in_progress, done
}

# آپدیت وضعیت وظیفه
PUT /api/tasks/{id}
Authorization: Bearer {token}
{
  "status": "done"
}
```

## 🧪 تست فیچرهای جدید

### 1. تست داشبورد

```bash
# لاگین
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"usera@mabna.com","password":"password123"}' \
  | jq -r '.token')

# مشاهده داشبورد
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 2. تست کامنت‌ها

```bash
# افزودن کامنت
curl -X POST http://localhost:3000/api/comments \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "task_id": "task-1",
    "content": "این کار عالی پیش رفته!"
  }' | jq

# مشاهده کامنت‌ها
curl -X GET http://localhost:3000/api/comments/task/task-1 \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 3. تست دعوت‌نامه

```bash
# ارسال دعوت‌نامه
curl -X POST http://localhost:3000/api/invitations \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "newuser@mabna.com"}' | jq

# مشاهده دعوت‌نامه‌ها
curl -X GET http://localhost:3000/api/invitations \
  -H "Authorization: Bearer $TOKEN" | jq
```

### 4. تست تغییر وضعیت وظیفه

```bash
# تغییر وضعیت به done
curl -X PUT http://localhost:3000/api/tasks/task-2 \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status": "done"}' | jq

# بررسی تأثیر بر داشبورد
curl -X GET http://localhost:3000/api/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq
```

## 📈 دیتای تست

پس از اجرای `npm run seed`، دیتای زیر ایجاد می‌شود:

- **سازمان**: Mabna HQ
- **کاربران**: 
  - User A (Admin) - usera@mabna.com
  - User B (Member) - userb@mabna.com
- **هدف**: رشد محصول در سه‌ماهه اول
- **KRها**: 
  - KR-1: افزایش بازدید (2 وظیفه، 1 انجام شده = 50% پیشرفت)
  - KR-2: افزایش ثبت‌نام (2 وظیفه، 0 انجام شده = 0% پیشرفت)
- **وظایف**: 3 وظیفه با وضعیت‌های مختلف
- **کامنت‌ها**: 2 کامنت نمونه
- **دعوت‌نامه**: 1 دعوت‌نامه pending

## 🔄 مقایسه با اسپرینت ۱

| ویژگی | اسپرینت ۱ | اسپرینت ۲ |
|------|----------|----------|
| مدیریت کاربران | ثبت‌نام و لاگین | + دعوت کاربران |
| وظایف | ایجاد و اتصال به KR | + وضعیت‌ها (todo/in_progress/done) |
| همکاری | - | + سیستم کامنت |
| گزارش‌گیری | - | + داشبورد با پیشرفت |
| آمار | - | + آمار کلی سازمان |

## 🎨 نکات پیاده‌سازی

### محاسبه پیشرفت

پیشرفت هر KR بر اساس فرمول زیر محاسبه می‌شود:

```
progress = (completed_tasks / total_tasks) * 100
```

پیشرفت هر Objective میانگین پیشرفت KRهای آن است:

```
objective_progress = average(kr_progress_values)
```

### امنیت

- تمام endpoint های جدید با JWT محافظت شده‌اند (به جز `/invitations/accept`)
- بررسی مالکیت سازمان برای تمام عملیات
- کاربران فقط می‌توانند کامنت‌های خود را حذف کنند

## 📝 TODO برای اسپرینت ۳

- [ ] آپلود فایل برای وظایف
- [ ] سیستم نوتیفیکیشن
- [ ] بهبود UI/UX
- [ ] فیلتر و جستجو
- [ ] ارسال ایمیل واقعی برای دعوت‌نامه‌ها

## 🐛 مشکلات شناخته شده

- ایمیل دعوت‌نامه فعلاً ارسال نمی‌شود (فقط در دیتابیس ذخیره می‌شود)
- نیاز به پیاده‌سازی pagination برای لیست‌ها در آینده

## 📚 مستندات

مستندات کامل API در آدرس زیر در دسترس است:

```
http://localhost:3000/docs
```

---

**نسخه**: 2.0.0  
**تاریخ**: ۲۲ آبان ۱۴۰۴  
**وضعیت**: ✅ تکمیل شده
