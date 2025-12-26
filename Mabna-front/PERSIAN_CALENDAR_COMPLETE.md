# تقویم شمسی - پیاده‌سازی کامل ✅

## خلاصه پیاده‌سازی

تقویم شمسی با ادغام کامل APIهای وظایف و اهداف با موفقیت پیاده‌سازی شده است.

## ویژگی‌های پیاده‌سازی شده

### ✅ تقویم شمسی پایه
- نمایش تاریخ‌های شمسی با moment-jalaali
- ناوبری بین ماه‌ها (قبل/بعد/امروز)
- نمایش نام‌های فارسی ماه‌ها و روزهای هفته
- مشخص کردن تاریخ امروز
- رابط کاربری RTL و responsive

### ✅ ادغام وظایف (Tasks)
- دریافت وظایف از `GET /api/tasks`
- نمایش وظایف بر اساس تاریخ ایجاد (`created_at`)
- نمایش تاریخ سررسید (`due_date`) اگر موجود باشد
- رنگ‌بندی بر اساس وضعیت:
  - 🟢 سبز: انجام شده (`done`)
  - 🟠 نارنجی: در حال انجام (`in_progress`)
  - 🔵 آبی: انجام نشده (`todo`)
- آیکون وظیفه: CheckSquare
- مودال جزئیات شامل:
  - عنوان وظیفه
  - توضیحات
  - وضعیت (فارسی)
  - مسئول انجام

### ✅ ادغام اهداف (Objectives)
- دریافت اهداف از `GET /api/objectives`
- نمایش اهداف بر اساس تاریخ شروع (`start_date`)
- نمایش بازه زمانی تا تاریخ پایان (`end_date`)
- رنگ بنفش برای همه اهداف
- آیکون هدف: Target
- مودال جزئیات شامل:
  - عنوان هدف
  - توضیحات
  - تاریخ شروع و پایان (شمسی)

### ✅ تبدیل تاریخ
- تبدیل خودکار تاریخ‌های میلادی API به شمسی
- استفاده از moment-jalaali برای تبدیل دقیق
- نمایش تاریخ‌ها به فرمت فارسی

### ✅ رابط کاربری
- مودال‌های read-only برای وظایف و اهداف
- آیکون‌های متمایز برای هر نوع
- نمایش اطلاعات کامل در مودال‌ها
- طراحی سازگار با shadcn/ui

## کد کلیدی

### تبدیل وظایف به رویدادهای تقویم
```javascript
const convertTasksToEvents = () => {
  return tasks.map(task => ({
    id: `task-${task.id}`,
    title: task.title,
    description: task.description || '',
    startTime: task.created_at ? new Date(task.created_at) : new Date(),
    endTime: task.due_date ? new Date(task.due_date) : new Date(task.created_at || new Date()),
    color: getTaskColor(task.status),
    category: 'وظیفه',
    type: 'task',
    status: task.status,
    assignee: task.assignee,
    originalData: task
  }))
}
```

### تبدیل اهداف به رویدادهای تقویم
```javascript
const convertObjectivesToEvents = () => {
  return objectives.map(objective => ({
    id: `objective-${objective.id}`,
    title: objective.title,
    description: objective.description || '',
    startTime: objective.start_date ? new Date(objective.start_date) : new Date(),
    endTime: objective.end_date ? new Date(objective.end_date) : new Date(),
    color: 'purple',
    category: 'هدف',
    type: 'objective',
    originalData: objective
  }))
}
```

### رنگ‌بندی وظایف
```javascript
const getTaskColor = (status) => {
  switch (status) {
    case 'done': return 'green'
    case 'in_progress': return 'orange'
    case 'todo': return 'blue'
    default: return 'blue'
  }
}
```

## API های مورد استفاده

- `GET /api/tasks` - دریافت لیست وظایف
- `GET /api/objectives` - دریافت لیست اهداف

## فیلدهای مورد استفاده از API

### وظایف
- `id`: شناسه وظیفه
- `title`: عنوان وظیفه
- `description`: توضیحات
- `status`: وضعیت (todo/in_progress/done)
- `created_at`: تاریخ ایجاد
- `due_date`: تاریخ سررسید
- `assignee.full_name`: نام مسئول

### اهداف
- `id`: شناسه هدف
- `title`: عنوان هدف
- `description`: توضیحات
- `start_date`: تاریخ شروع
- `end_date`: تاریخ پایان

## نحوه استفاده

1. وارد داشبورد شوید
2. روی "تقویم" در منوی کناری کلیک کنید
3. وظایف و اهداف به‌صورت خودکار روی تقویم نمایش داده می‌شوند
4. روی هر وظیفه یا هدف کلیک کنید تا جزئیات را ببینید

## وضعیت نهایی

✅ **تقویم شمسی با ادغام کامل وظایف و اهداف آماده است!**

- همه APIها متصل شده‌اند
- تبدیل تاریخ میلادی به شمسی کار می‌کند
- رنگ‌بندی و آیکون‌ها درست نمایش داده می‌شوند
- مودال‌های جزئیات کاملاً کاربردی هستند
- رابط کاربری زیبا و responsive است

تقویم آماده استفاده است! 🎉