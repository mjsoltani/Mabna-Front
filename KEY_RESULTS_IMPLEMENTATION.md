# پیاده‌سازی قابلیت‌های پیشرفته Key Results

## خلاصه

این پیاده‌سازی شامل 8 قابلیت جدید برای Key Results است که به صورت کامل در فرانت‌اند پیاده‌سازی شده‌اند.

## فایل‌های ایجاد شده

### 1. Services
- `src/services/keyResultService.js` - سرویس‌های API برای Progress و Attachments

### 2. Constants
- `src/constants/keyResultUnits.js` - تعریف واحدهای اندازه‌گیری و توابع کمکی

### 3. Components

#### کامپوننت‌های اصلی:
- `src/components/EnhancedKeyResultForm.jsx` - فرم ایجاد/ویرایش با فیلدهای جدید
- `src/components/EnhancedKeyResultForm.css`
- `src/components/EnhancedKeyResultCard.jsx` - کارت نمایش با قابلیت‌های جدید
- `src/components/EnhancedKeyResultCard.css`

#### کامپوننت‌های فرعی:
- `src/components/KeyResultProgressModal.jsx` - مودال ثبت و نمایش تاریخچه پیشرفت
- `src/components/KeyResultProgressModal.css`
- `src/components/KeyResultAttachments.jsx` - مدیریت فایل‌های پیوست
- `src/components/KeyResultAttachments.css`

#### کامپوننت صفحه:
- `src/components/ObjectivesEnhanced.jsx` - نسخه جدید صفحه اهداف با قابلیت‌های Enhanced

## قابلیت‌های پیاده‌سازی شده

### ✅ 1. Description (توضیحات)
- فیلد textarea در فرم
- نمایش در کارت اگر وجود داشته باشد
- اختیاری

### ✅ 2. Current Value (مقدار فعلی)
- فیلد number در فرم
- نمایش در progress bar
- اختیاری

### ✅ 3. Unit (واحد اندازه‌گیری)
- Dropdown با 7 واحد: عدد، درصد، تومان، ساعت، روز، کاربر، مورد
- نمایش سمبل واحد در کنار مقادیر
- اختیاری

### ✅ 4. Owner (مسئول)
- Select از لیست اعضای تیم
- نمایش آواتار و نام در کارت
- اختیاری

### ✅ 5. Due Date (تاریخ سررسید)
- DatePicker فارسی
- نمایش badge با هشدار اگر کمتر از 7 روز مانده
- اختیاری

### ✅ 6. Labels (برچسب‌ها)
- Input با قابلیت افزودن چندین برچسب
- نمایش به صورت badge
- اختیاری

### ✅ 7. Progress Updates (تاریخچه پیشرفت)
- مودال جداگانه برای ثبت پیشرفت
- نمایش timeline تاریخچه
- نمایش تفاوت بین آپدیت‌ها
- امکان افزودن یادداشت

### ✅ 8. Attachments (فایل‌های پیوست)
- Drag & Drop برای آپلود
- نمایش لیست فایل‌ها با آیکون
- دانلود و حذف فایل
- محدودیت 10MB

## نحوه استفاده

### استفاده از کامپوننت ObjectivesEnhanced

```jsx
import ObjectivesEnhanced from './components/ObjectivesEnhanced';

// در Dashboard یا App
<ObjectivesEnhanced token={token} />
```

### استفاده مستقل از کامپوننت‌ها

```jsx
import EnhancedKeyResultForm from './components/EnhancedKeyResultForm';
import EnhancedKeyResultCard from './components/EnhancedKeyResultCard';

// فرم
<EnhancedKeyResultForm
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  onSubmit={handleSubmit}
  token={token}
  objectiveId={objectiveId}
/>

// کارت
<EnhancedKeyResultCard
  keyResult={kr}
  token={token}
  isCreator={true}
  onEdit={handleEdit}
  onDelete={handleDelete}
  onUpdate={handleUpdate}
/>
```

## ویژگی‌های UI/UX

### فرم
- بخش "گزینه‌های پیشرفته" تاشو برای فیلدهای اختیاری
- Validation کامل
- پیام‌های خطای واضح
- Loading states

### کارت نمایش
- Progress bar رنگی (سبز/زرد/قرمز)
- Badge های اطلاعاتی
- دکمه‌های عملیاتی واضح
- نمایش شرطی اطلاعات

### مودال پیشرفت
- Timeline بصری
- نمایش تفاوت مقادیر
- فرم ساده برای ثبت

### مدیریت فایل
- Drag & Drop
- آیکون‌های مناسب برای انواع فایل
- نمایش سایز و تاریخ
- تأیید قبل از حذف

## اعتبارسنجی

### فیلدهای الزامی:
- title (حداکثر 255 کاراکتر)
- target_value (عدد)

### فیلدهای اختیاری با validation:
- current_value: باید <= target_value
- initial_value: باید <= target_value
- due_date: باید تاریخ معتبر
- owner_id: باید کاربر معتبر
- labels: آرایه از رشته‌ها

## تست

برای تست کامل:

1. ایجاد Key Result با فقط فیلدهای الزامی
2. ایجاد Key Result با همه فیلدهای اختیاری
3. ویرایش و تغییر هر فیلد
4. ثبت چند آپدیت پیشرفت
5. آپلود فایل‌های مختلف
6. حذف فایل
7. اضافه/حذف برچسب‌ها
8. تغییر مسئول
9. بررسی هشدار due date

## یکپارچه‌سازی با Dashboard

برای استفاده در Dashboard فعلی:

```jsx
// در Dashboard.jsx
import ObjectivesEnhanced from './ObjectivesEnhanced';

// جایگزینی
{activeTab === 'objectives' && <ObjectivesEnhanced token={token} />}
```

یا استفاده موازی:

```jsx
{activeTab === 'objectives' && <ObjectivesModern token={token} />}
{activeTab === 'objectives-enhanced' && <ObjectivesEnhanced token={token} />}
```

## نکات مهم

1. همه APIها از بک‌اند آماده هستند
2. همه فیلدهای جدید اختیاری هستند
3. فرم‌ها backward compatible هستند
4. Progress updates immutable هستند
5. فایل‌ها محدود به 10MB هستند

## مشکلات احتمالی و راه‌حل

### مشکل: فایل آپلود نمی‌شود
- بررسی کنید سایز کمتر از 10MB باشد
- بررسی کنید token معتبر باشد

### مشکل: لیست اعضا خالی است
- API `/api/users` را بررسی کنید
- مطمئن شوید کاربر در سازمان عضو است

### مشکل: تاریخ ذخیره نمی‌شود
- فرمت تاریخ باید YYYY-MM-DD باشد
- DatePicker به درستی تنظیم شده باشد

## بهبودهای آینده

- [ ] Autocomplete برای برچسب‌ها از برچسب‌های موجود
- [ ] Preview برای فایل‌های تصویری
- [ ] نمودار پیشرفت در timeline
- [ ] فیلتر و جستجو در Key Results
- [ ] Export گزارش به PDF
- [ ] نوتیفیکیشن برای due date نزدیک

## پشتیبانی

برای سوالات یا مشکلات، به مستندات API مراجعه کنید:
- `KEY_RESULTS_ENHANCEMENT.md` (اگر موجود باشد)
- یا با تیم بک‌اند تماس بگیرید
