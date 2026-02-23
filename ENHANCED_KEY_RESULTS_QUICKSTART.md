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

- سبز (>= 70%): روی مسیر ✅
- زرد (40-69%): در خطر ⚠️
- قرمز (< 40%): عقب افتاده ❌

### Badge Colors

- Owner: آبی (#dbeafe)
- Due Date: زرد (#fef3c7) / قرمز (#fee2e2 برای کمتر از 7 روز)
- Labels: بنفش (#e0e7ff)

### Customization

می‌تونید استایل‌ها رو override کنید:

```css
/* در فایل CSS خودتون */
.enhanced-kr-card {
  border-radius: 12px; /* تغییر گوشه‌ها */
}

.kr-progress-bar-fill {
  background: linear-gradient(90deg, #your-color-1, #your-color-2);
}
```

## سناریوهای رایج

### سناریو 1: ایجاد KR برای تیم فروش

```jsx
// مثال واقعی با داده‌های نمونه
const salesKR = {
  title: 'افزایش فروش ماهانه',
  description: 'افزایش فروش محصولات دیجیتال در بازار B2B',
  initial_value: 50000000,
  current_value: 65000000,
  target_value: 100000000,
  unit: 'currency',
  owner_id: 'sales-manager-id',
  due_date: '2025-03-31',
  labels: ['فروش', 'Q1', 'اولویت بالا', 'B2B']
};

// ارسال به API
const response = await fetch(`${API_BASE_URL}/api/objectives/${objId}/keyresults`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify(salesKR)
});
```

### سناریو 2: ترک پروژه با Progress Updates

```jsx
// Step 1: ایجاد KR برای پروژه
const projectKR = {
  title: 'تکمیل فیچر Authentication',
  target_value: 100,
  unit: 'percent',
  owner_id: 'dev-lead-id',
  due_date: '2025-04-15',
  labels: ['Development', 'Sprint 3']
};

// Step 2: ثبت پیشرفت هفتگی
// هفته 1
await addProgress(krId, { value: 25, note: 'طراحی UI تکمیل شد' });

// هفته 2
await addProgress(krId, { value: 50, note: 'Backend API آماده شد' });

// هفته 3
await addProgress(krId, { value: 75, note: 'Integration تست شد' });

// هفته 4
await addProgress(krId, { value: 100, note: 'فیچر به production رفت' });
```

### سناریو 3: مدیریت KR با فایل‌های متعدد

```jsx
// آپلود مستندات و فایل‌های مرتبط
const files = [
  { name: 'requirements.pdf', type: 'مستندات' },
  { name: 'design-mockup.png', type: 'طراحی' },
  { name: 'test-results.xlsx', type: 'گزارش' }
];

for (const file of files) {
  const formData = new FormData();
  formData.append('file', file);
  
  await fetch(`${API_BASE_URL}/api/keyresults/${krId}/attachments`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
    body: formData
  });
}
```

## سوالات متداول (FAQ)

**س: چطور می‌تونم KR رو کپی کنم؟**
ج: فعلاً باید دستی ایجاد کنید، ولی می‌تونید از همون فرم با مقادیر قبلی استفاده کنید.

**س: آیا می‌تونم چند مسئول تعیین کنم؟**
ج: خیر، فقط یک owner مجاز هست. برای کار تیمی از labels استفاده کنید.

**س: چطور می‌تونم KRهای expired رو ببینم؟**
ج: KRهایی که due_date گذشته باشه با badge قرمز نمایش داده میشن.

**س: آیا می‌تونم Progress Update رو ویرایش کنم؟**
ج: خیر، برای حفظ تاریخچه دقیق، فقط می‌تونید update جدید اضافه کنید.

## نکات مهم

1. همه فیلدهای جدید اختیاری هستند به جز `title` و `target_value`
2. Progress updates نمی‌توانند ویرایش یا حذف شوند
3. فایل‌ها محدود به 10MB هستند
4. برچسب‌ها با Enter اضافه می‌شوند
5. واحد پیش‌فرض "عدد" است

## Best Practices

### 1. نام‌گذاری KR
```javascript
// ❌ بد
title: "KR1"

// ✅ خوب
title: "افزایش نرخ تبدیل از 2% به 5%"
```

### 2. استفاده از واحدها
```javascript
// برای اهداف مالی
unit: 'currency'

// برای درصدها
unit: 'percent'

// برای تعداد
unit: 'number'
```

### 3. تنظیم Due Date
```javascript
// همیشه تاریخ واقع‌بینانه تعیین کنید
// و 1-2 هفته buffer در نظر بگیرید
const dueDate = new Date();
dueDate.setDate(dueDate.getDate() + 90); // 3 ماه
```

### 4. استفاده از Labels
```javascript
// از labels برای دسته‌بندی استفاده کنید
labels: [
  'Q1',              // دوره زمانی
  'فروش',           // دپارتمان
  'اولویت بالا',    // اولویت
  'B2B'              // نوع
]
```

### 5. ثبت Progress منظم
```javascript
// هر هفته یا هر 2 هفته progress ثبت کنید
// حتی اگر تغییری نداشته باشید
await addProgress(krId, {
  value: currentValue,
  note: 'بدون تغییر - در حال کار روی فاز بعدی'
});
```

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
