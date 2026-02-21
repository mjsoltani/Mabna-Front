# راهنمای سریع - Enhanced Key Results

## شروع سریع

### 1. استفاده از کامپوننت جدید

در `Dashboard.jsx` یا هر جایی که می‌خواهید از Key Results استفاده کنید:

```jsx
import ObjectivesEnhanced from './components/ObjectivesEnhanced';

function Dashboard() {
  return (
    <ObjectivesEnhanced token={userToken} />
  );
}
```

### 2. ایجاد Key Result با فیلدهای جدید

کاربر می‌تواند:
1. روی "هدف جدید" کلیک کند
2. هدف را ایجاد کند
3. روی "+ شاخص کلیدی جدید" کلیک کند
4. فرم را پر کند:
   - عنوان (الزامی)
   - مقدار هدف (الزامی)
   - کلیک روی "گزینه‌های پیشرفته" برای:
     - توضیحات
     - واحد اندازه‌گیری
     - مقدار فعلی
     - مسئول
     - تاریخ سررسید
     - برچسب‌ها

### 3. ثبت پیشرفت

1. روی دکمه "📈 ثبت پیشرفت" کلیک کنید
2. مقدار جدید را وارد کنید
3. (اختیاری) یادداشت اضافه کنید
4. "ثبت پیشرفت" را بزنید

### 4. مدیریت فایل‌ها

1. روی دکمه "📎 فایل‌ها" کلیک کنید
2. فایل را drag & drop کنید یا کلیک کنید
3. فایل‌های آپلود شده را مشاهده کنید
4. برای دانلود روی ⬇️ کلیک کنید
5. برای حذف روی 🗑️ کلیک کنید

## مثال‌های کد

### استفاده از EnhancedKeyResultCard

```jsx
import EnhancedKeyResultCard from './components/EnhancedKeyResultCard';

<EnhancedKeyResultCard
  keyResult={{
    id: '123',
    title: 'افزایش فروش',
    description: 'افزایش فروش محصولات دیجیتال',
    initial_value: 0,
    current_value: 45,
    target_value: 100,
    unit: 'percent',
    owner: { full_name: 'علی احمدی' },
    due_date: '2025-12-31',
    labels: ['Q1', 'فروش']
  }}
  token={token}
  isCreator={true}
  onEdit={() => console.log('Edit')}
  onDelete={() => console.log('Delete')}
  onUpdate={() => console.log('Update')}
/>
```

### استفاده از EnhancedKeyResultForm

```jsx
import EnhancedKeyResultForm from './components/EnhancedKeyResultForm';

const [showForm, setShowForm] = useState(false);

<EnhancedKeyResultForm
  isOpen={showForm}
  onClose={() => setShowForm(false)}
  onSubmit={(data) => {
    console.log('Submitted:', data);
    // ارسال به API
  }}
  token={token}
  objectiveId="objective-123"
/>
```

### استفاده از KeyResultProgressModal

```jsx
import KeyResultProgressModal from './components/KeyResultProgressModal';

<KeyResultProgressModal
  isOpen={showProgressModal}
  onClose={() => setShowProgressModal(false)}
  keyResult={selectedKR}
  token={token}
  onSuccess={() => {
    console.log('Progress added');
    fetchData(); // رفرش داده‌ها
  }}
/>
```

### استفاده از KeyResultAttachments

```jsx
import KeyResultAttachments from './components/KeyResultAttachments';

<KeyResultAttachments
  keyResultId="kr-123"
  token={token}
/>
```

## API Calls

### ایجاد Key Result با همه فیلدها

```javascript
const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}/keyresults`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'افزایش فروش',
    description: 'افزایش فروش محصولات دیجیتال',
    initial_value: 0,
    current_value: 25,
    target_value: 100,
    unit: 'percent',
    owner_id: 'user-uuid',
    due_date: '2025-12-31',
    labels: ['Q1', 'فروش', 'اولویت بالا']
  })
});
```

### ثبت پیشرفت

```javascript
const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/progress`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    value: 45.5,
    note: 'پیشرفت خوبی داشتیم این هفته'
  })
});
```

### آپلود فایل

```javascript
const formData = new FormData();
formData.append('file', file);

const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/attachments`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`
  },
  body: formData
});
```

## Styling

همه کامپوننت‌ها از CSS modules استفاده می‌کنند و با استایل‌های موجود سازگار هستند.

### رنگ‌های Progress Bar

- سبز (>= 70%): روی مسیر
- زرد (40-69%): در خطر
- قرمز (< 40%): عقب افتاده

### Badge Colors

- Owner: آبی
- Due Date: زرد (عادی) / قرمز (کمتر از 7 روز)
- Labels: بنفش

## نکات مهم

1. همه فیلدهای جدید اختیاری هستند به جز `title` و `target_value`
2. Progress updates نمی‌توانند ویرایش یا حذف شوند
3. فایل‌ها محدود به 10MB هستند
4. برچسب‌ها با Enter اضافه می‌شوند
5. واحد پیش‌فرض "عدد" است

## Troubleshooting

### مشکل: فرم باز نمی‌شود
```jsx
// مطمئن شوید isOpen به درستی تنظیم شده
<EnhancedKeyResultForm isOpen={true} ... />
```

### مشکل: داده‌ها نمایش داده نمی‌شوند
```jsx
// مطمئن شوید token معتبر است
// و API endpoint صحیح است
console.log('Token:', token);
console.log('API URL:', API_BASE_URL);
```

### مشکل: فایل آپلود نمی‌شود
```javascript
// بررسی سایز فایل
if (file.size > 10 * 1024 * 1024) {
  alert('حجم فایل نباید بیشتر از 10 مگابایت باشد');
  return;
}
```

## مثال کامل

```jsx
import { useState } from 'react';
import ObjectivesEnhanced from './components/ObjectivesEnhanced';

function App() {
  const [token] = useState(localStorage.getItem('token'));

  return (
    <div className="app">
      <ObjectivesEnhanced token={token} />
    </div>
  );
}

export default App;
```

## منابع بیشتر

- مستندات کامل: `KEY_RESULTS_IMPLEMENTATION.md`
- مستندات API: `KEY_RESULTS_ENHANCEMENT.md` (اگر موجود باشد)
- کد نمونه: `src/components/ObjectivesEnhanced.jsx`
