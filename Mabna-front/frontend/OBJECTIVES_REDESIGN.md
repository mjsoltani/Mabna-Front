# بازطراحی صفحه اهداف با ActivityCard

## خلاصه تغییرات

صفحه اهداف با استفاده از کامپوننت مدرن `ActivityCard` بازطراحی شد که یک رابط کاربری زیبا و تعاملی برای نمایش اهداف و نتایج کلیدی فراهم می‌کند.

## فایل‌های ایجاد شده

### 1. `src/components/ui/activity-card.jsx`
کامپوننت اصلی که برای نمایش هر هدف استفاده می‌شود.

**ویژگی‌ها:**
- نمایش متریک‌ها با حلقه‌های پیشرفت انیمیشن‌دار
- لیست نتایج کلیدی به صورت اهداف روزانه
- دکمه‌های تعاملی برای افزودن نتیجه کلیدی و مشاهده جزئیات
- پشتیبانی از حالت تاریک
- انیمیشن‌های smooth و hover effects

**Props:**
```jsx
{
  category: string,        // تاریخ شروع و پایان
  title: string,          // عنوان هدف
  metrics: Array,         // آرایه متریک‌ها (نتایج کلیدی، تکمیل شده، پیشرفت)
  dailyGoals: Array,      // آرایه نتایج کلیدی
  onAddGoal: Function,    // تابع افزودن نتیجه کلیدی
  onToggleGoal: Function, // تابع toggle کردن نتیجه کلیدی
  onViewDetails: Function,// تابع مشاهده گزارش
  className: string       // کلاس‌های اضافی
}
```

### 2. `src/components/ObjectivesModern.jsx`
کامپوننت اصلی صفحه اهداف که از ActivityCard استفاده می‌کند.

**ویژگی‌ها:**
- نمایش اهداف در قالب Grid با 3 ستون
- تبدیل خودکار داده‌های API به فرمت ActivityCard
- حفظ تمام قابلیت‌های قبلی (ایجاد، ویرایش، حذف)
- مودال‌های فارسی برای مدیریت اهداف و نتایج کلیدی
- Empty state زیبا برای زمانی که هدفی وجود ندارد
- پس‌زمینه gradient مدرن

## نحوه استفاده

کامپوننت جدید در `Dashboard.jsx` فعال شده است:

```jsx
import ObjectivesModern from './ObjectivesModern';

// در بخش render:
{activeTab === 'objectives' && <ObjectivesModern token={token} />}
```

## وابستگی‌ها

تمام وابستگی‌های مورد نیاز قبلاً نصب شده‌اند:
- ✅ `lucide-react` - برای آیکون‌ها
- ✅ `tailwindcss` - برای استایل‌دهی
- ✅ `framer-motion` - برای انیمیشن‌ها (اختیاری)
- ✅ `react-multi-date-picker` - برای انتخاب تاریخ

## تبدیل داده‌ها

تابع `convertObjectiveToActivityCard` داده‌های API را به فرمت مورد نیاز ActivityCard تبدیل می‌کند:

```javascript
{
  metrics: [
    { label: "نتایج کلیدی", value: "5", trend: 75, unit: "عدد" },
    { label: "تکمیل شده", value: "3", trend: 60, unit: "عدد" },
    { label: "پیشرفت", value: "75", trend: 75, unit: "%" }
  ],
  dailyGoals: [
    { id: "1", title: "افزایش فروش 20%", isCompleted: true },
    { id: "2", title: "کاهش هزینه‌ها 15%", isCompleted: false }
  ]
}
```

## مقایسه با نسخه قبلی

### نسخه قبلی (Objectives.jsx)
- نمایش لیستی ساده
- استایل‌های CSS سنتی
- کارت‌های ساده بدون انیمیشن

### نسخه جدید (ObjectivesModern.jsx)
- نمایش Grid مدرن
- استایل‌های Tailwind
- کارت‌های تعاملی با انیمیشن
- حلقه‌های پیشرفت بصری
- رابط کاربری بهتر و جذاب‌تر

## تنظیمات اضافی

### تغییر رنگ متریک‌ها
در فایل `activity-card.jsx`:

```javascript
const METRIC_COLORS = {
  Move: "#FF2D55",      // قرمز
  Exercise: "#2CD758",  // سبز
  Stand: "#007AFF",     // آبی
};
```

### تغییر تعداد ستون‌های Grid
در فایل `ObjectivesModern.jsx`:

```jsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
```

## نکات مهم

1. **حفظ سازگاری**: کامپوننت قدیمی (`Objectives.jsx`) حفظ شده و می‌توانید در صورت نیاز به آن بازگردید
2. **RTL Support**: تمام استایل‌ها با راست‌چین فارسی سازگار هستند
3. **Dark Mode**: کامپوننت از حالت تاریک پشتیبانی می‌کند
4. **Responsive**: در تمام سایزهای صفحه به خوبی نمایش داده می‌شود

## مراحل بعدی (اختیاری)

1. افزودن انیمیشن‌های بیشتر با framer-motion
2. اضافه کردن drag & drop برای مرتب‌سازی اهداف
3. نمایش نمودار پیشرفت در گزارش‌ها
4. افزودن فیلتر و جستجو
5. اضافه کردن export به PDF/Excel

## پشتیبانی

در صورت بروز مشکل، می‌توانید به کامپوننت قبلی بازگردید:

```jsx
// در Dashboard.jsx
import Objectives from './Objectives';
{activeTab === 'objectives' && <Objectives token={token} />}
```
