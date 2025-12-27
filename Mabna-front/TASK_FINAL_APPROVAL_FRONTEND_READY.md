# پیاده‌سازی فرانت‌اند تأیید نهایی وظایف ✅

## خلاصه

رابط کاربری برای قابلیت "تأیید نهایی" وظایف کاملاً پیاده‌سازی شده و آماده استفاده است. منتظر پیاده‌سازی API های بکند می‌باشد.

## ویژگی‌های پیاده‌سازی شده

### ✅ 1. Kanban Board با ستون تأیید شده
- **ستون جدید**: "تأیید شده" با رنگ بنفش
- **فیلتر هوشمند**: 
  - ستون "انجام شده": وظایف done اما تأیید نشده
  - ستون "تأیید شده": وظایف done + is_approved = true
- **Drag & Drop**: کشیدن وظیفه به ستون تأیید شده = تأیید نهایی

### ✅ 2. نمایش بصری وضعیت تأیید
- **آیکون آرشیو**: در کارت‌های وظایف تأیید شده
- **نشان تأیید**: نمایش نام تأیید کننده
- **رنگ‌بندی**: بنفش برای وظایف تأیید شده

### ✅ 3. دکمه‌های مدیریتی
- **دکمه تأیید نهایی**: فقط برای مدیران روی وظایف done
- **دکمه لغو تأیید**: فقط برای مدیران روی وظایف تأیید شده
- **محدودیت دسترسی**: بررسی نقش کاربر

### ✅ 4. جلوگیری از تغییرات
- **وظایف تأیید شده**: غیرقابل ویرایش وضعیت و نوع
- **پیام هشدار**: هنگام تلاش برای تغییر وظیفه تأیید شده
- **قفل کردن**: dropdown های وضعیت و نوع

## کد پیاده‌سازی شده

### 1. ستون‌های جدید Kanban
```javascript
const statuses = [
  { id: 'todo', name: 'انجام نشده', color: '#f59e0b' },
  { id: 'in_progress', name: 'در حال انجام', color: '#3b82f6' },
  { id: 'done', name: 'انجام شده', color: '#10b981' },
  { id: 'approved', name: 'تأیید شده', color: '#8b5cf6' }, // جدید
];
```

### 2. فیلتر هوشمند وظایف
```javascript
const getTasksByStatus = (statusId) => {
  if (statusId === 'approved') {
    // وظایف تأیید شده: done + is_approved = true
    return tasks.filter(task => task.status === 'done' && task.is_approved === true);
  } else if (statusId === 'done') {
    // وظایف انجام شده اما تأیید نشده: done + is_approved = false/null
    return tasks.filter(task => task.status === 'done' && task.is_approved !== true);
  } else {
    // سایر وضعیت‌ها
    return tasks.filter(task => task.status === statusId);
  }
};
```

### 3. مدیریت Drag & Drop
```javascript
const handleDragEnd = async (event) => {
  const { active, over } = event;
  if (!over) return;

  const newStatus = over.id;
  const taskId = active.id;
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) return;

  // اگر وظیفه به ستون approved کشیده شد
  if (newStatus === 'approved') {
    // فقط وظایف done قابل تأیید هستند
    if (task.status !== 'done') {
      alert('فقط وظایف انجام شده قابل تأیید نهایی هستند');
      return;
    }
    // تأیید نهایی وظیفه
    await handleApproveTask(taskId);
    return;
  }

  // اگر وظیفه تأیید شده به ستون دیگری کشیده شد
  if (task.is_approved && newStatus !== 'approved') {
    alert('وظایف تأیید شده قابل تغییر وضعیت نیستند');
    return;
  }

  // ادامه منطق معمولی...
};
```

### 4. تأیید نهایی وظیفه
```javascript
const handleApproveTask = async (taskId) => {
  const previousTasks = [...tasks];

  // آپدیت optimistic
  setTasks(prevTasks => prevTasks.map(t => 
    t.id === taskId ? { 
      ...t, 
      is_approved: true, 
      approved_at: new Date().toISOString(),
      approved_by: { full_name: 'شما' } // موقتی
    } : t
  ));

  try {
    const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/approve`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        approval_note: 'تأیید شده از طریق kanban'
      })
    });
    
    if (!response.ok) {
      setTasks(previousTasks);
      const errorData = await response.json();
      alert('خطا در تأیید وظیفه: ' + (errorData.message || 'خطای نامشخص'));
    } else {
      await fetchTasks();
    }
  } catch (error) {
    console.error('Error approving task:', error);
    setTasks(previousTasks);
    alert('خطا در ارتباط با سرور');
  }
};
```

### 5. دکمه‌های مدیریتی در Modal
```javascript
{/* دکمه‌های تأیید نهایی - فقط برای مدیران */}
{user && user.role === 'admin' && selectedTask.status === 'done' && !selectedTask.is_approved && (
  <button
    className="btn-approve"
    onClick={() => {
      if (confirm('آیا مطمئن هستید که می‌خواهید این وظیفه را تأیید نهایی کنید؟')) {
        handleApproveTask(selectedTask.id);
      }
    }}
    style={{
      background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      color: 'white',
      // سایر استایل‌ها...
    }}
  >
    ✅ تأیید نهایی
  </button>
)}

{/* دکمه لغو تأیید - فقط برای مدیران */}
{user && user.role === 'admin' && selectedTask.is_approved && (
  <button
    className="btn-unapprove"
    onClick={() => {
      if (confirm('آیا مطمئن هستید که می‌خواهید تأیید این وظیفه را لغو کنید؟')) {
        handleUnapproveTask(selectedTask.id);
      }
    }}
    style={{
      background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      color: 'white',
      // سایر استایل‌ها...
    }}
  >
    ❌ لغو تأیید
  </button>
)}
```

### 6. نمایش وضعیت تأیید در جزئیات
```javascript
{selectedTask.is_approved && (
  <div className="detail-row">
    <span className="label">تأیید نهایی:</span>
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
      color: 'white',
      borderRadius: '8px',
      fontSize: '14px',
      fontWeight: '600'
    }}>
      ✅ تأیید شده توسط {selectedTask.approved_by?.full_name || 'مدیر'}
      {selectedTask.approved_at && (
        <span style={{ fontSize: '12px', opacity: '0.9' }}>
          ({new Date(selectedTask.approved_at).toLocaleDateString('fa-IR')})
        </span>
      )}
    </div>
  </div>
)}
```

## API های مورد استفاده

### 1. تأیید نهایی
```
PUT /api/tasks/{task_id}/approve
```

### 2. لغو تأیید
```
DELETE /api/tasks/{task_id}/approve
```

### 3. دریافت وظایف (با فیلدهای جدید)
```
GET /api/tasks
```

## فیلدهای مورد انتظار از API

```javascript
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
  // سایر فیلدهای موجود...
}
```

## قوانین دسترسی پیاده‌سازی شده

### ✅ بررسی‌های فرانت‌اند:
1. **فقط مدیران**: `user.role === 'admin'`
2. **فقط وظایف done**: `task.status === 'done'`
3. **جلوگیری از تغییر**: وظایف تأیید شده قفل می‌شوند
4. **تأیید کاربر**: confirm dialog قبل از عملیات

### ⚠️ بررسی‌های بکند (مورد انتظار):
1. سازنده نتواند وظیفه خودش را تأیید کند
2. مجوز سازمان/تیم
3. اعتبارسنجی وضعیت وظیفه

## تجربه کاربری

### 🎯 برای مدیران:
1. **Kanban**: کشیدن وظیفه done به ستون "تأیید شده"
2. **Modal**: دکمه‌های "تأیید نهایی" و "لغو تأیید"
3. **بازخورد**: پیام‌های موفقیت/خطا

### 👤 برای کاربران عادی:
1. **مشاهده**: وضعیت تأیید در کارت‌ها و جزئیات
2. **محدودیت**: عدم دسترسی به دکمه‌های تأیید
3. **قفل**: عدم امکان تغییر وظایف تأیید شده

## نمایش بصری

### 🎨 رنگ‌بندی:
- **ستون تأیید شده**: بنفش (#8b5cf6)
- **دکمه تأیید**: سبز gradient
- **دکمه لغو تأیید**: نارنجی gradient
- **نشان تأیید**: بنفش با آیکون آرشیو

### 🔍 آیکون‌ها:
- **Archive**: برای وظایف تأیید شده
- **Shield**: برای نشان تأیید کننده
- **✅**: برای دکمه تأیید
- **❌**: برای دکمه لغو تأیید

## تست و بررسی

### ✅ تست‌های انجام شده:
- نمایش ستون جدید در kanban
- فیلتر صحیح وظایف
- نمایش دکمه‌ها بر اساس نقش
- قفل کردن وظایف تأیید شده
- پیام‌های خطا و موفقیت

### 🔍 تست‌های مورد نیاز (پس از API):
1. تأیید وظیفه از kanban
2. تأیید وظیفه از modal
3. لغو تأیید وظیفه
4. بررسی مجوزهای بکند
5. نمایش اطلاعات تأیید کننده

## وضعیت فعلی

✅ **فرانت‌اند کاملاً آماده است!**

- رابط کاربری پیاده‌سازی شده
- API calls آماده
- مدیریت خطا انجام شده
- تجربه کاربری بهینه‌سازی شده

⏳ **منتظر پیاده‌سازی بکند:**
- API های تأیید نهایی
- فیلدهای جدید در response
- مجوزهای دسترسی

## فایل‌های تغییر یافته

- `TasksKanban.jsx` - ستون جدید و drag & drop
- `TasksV2.jsx` - دکمه‌ها و نمایش وضعیت
- `Dashboard.jsx` - پاس کردن user prop
- `TASK_FINAL_APPROVAL_API_REQUEST.md` - درخواست بکند

آماده برای تست نهایی پس از پیاده‌سازی API! 🎉