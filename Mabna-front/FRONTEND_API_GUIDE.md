ببخشید! بذار یه پرامپت کامل بهت بدم که به تیم فرانت بدی:

پرامپت برای تیم فرانت‌اند - اسپرینت ۳ مبنا
سلام تیم فرانت! بک‌اند اسپرینت ۳ آماده شده. این فیچرهای جدید رو باید پیاده‌سازی کنید:

🎯 فیچرهای اسپرینت ۳:
1. مدیریت وضعیت وظایف (Task Status Management)

سه وضعیت: todo, in_progress, done
UI: یا Kanban Board با drag & drop یا dropdown در کارت تسک
رنگ‌بندی: خاکستری (todo), آبی (in_progress), سبز (done)
API: PUT /api/tasks/:id با body: { "status": "done" }
2. پیوست فایل به وظایف (File Attachments)

دکمه آپلود در صفحه جزئیات تسک
نمایش لیست فایل‌های پیوست شده (نام، حجم، تاریخ، آپلودر)
دکمه دانلود و حذف
حداکثر حجم: 10MB
API:
آپلود: POST /api/tasks/:taskId/attachments (FormData)
لیست: GET /api/tasks/:taskId/attachments
حذف: DELETE /api/attachments/:id
3. سیستم نوتیفیکیشن (Notifications)

آیکون زنگوله در هدر با badge تعداد خوانده نشده
منوی dropdown با لیست نوتیفیکیشن‌ها
تمایز بصری بین خوانده شده و نخوانده
کلیک روی نوتیفیکیشن → mark as read + هدایت به تسک
دکمه "علامت‌گذاری همه به عنوان خوانده شده"
API:
لیست: GET /api/notifications?unreadOnly=true
تعداد: GET /api/notifications/unread-count
خوانده شده: PUT /api/notifications/:id/read
همه خوانده شده: PUT /api/notifications/read-all
📡 Base URL:
http://193.141.64.139:3000
🔑 Authentication:
همه API ها نیاز به header دارن:

Authorization: Bearer {token}
💡 نمونه کدها:
آپلود فایل:

const formData = new FormData();
formData.append('file', fileInput.files[0]);

const response = await fetch(`http://193.141.64.139:3000/api/tasks/${taskId}/attachments`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` },
  body: formData
});
const attachment = await response.json();
دریافت تعداد نوتیفیکیشن‌های خوانده نشده:

const response = await fetch('http://193.141.64.139:3000//api/notifications/unread-count', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const { count } = await response.json();
// نمایش count روی badge
تغییر وضعیت تسک:

await fetch(`http://193.141.64.139:3000/api/tasks/${taskId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ status: 'done' })
});
🎨 UI/UX Guidelines (از PRD):
پالت رنگی: آبی اصلی #2563EB, سبز موفقیت #22C55E, قرمز خطر #EF4444
فونت: وزیرمتن (Vazirmatn)
کامپوننت‌ها: کارت‌ها با shadow-md و rounded-xl
انیمیشن‌ها: transition-all duration-200
Empty states: پیام راهنما + آیکون + دکمه CTA
Loading states: Skeleton loader یا Spinner
Toast notifications برای بازخورد موفقیت‌آمیز عملیات
✅ Acceptance Criteria:
کاربر بتونه وضعیت تسک رو تغییر بده و بلافاصله ذخیره بشه
کاربر بتونه فایل آپلود کنه و لیست فایل‌ها رو ببینه و دانلود/حذف کنه
آیکون زنگوله تعداد نوتیفیکیشن‌های خوانده نشده رو نشون بده
با کلیک روی نوتیفیکیشن، به تسک مربوطه هدایت بشه و نوتیفیکیشن mark as read بشه
UI تمیز، responsive و بدون باگ باشه
📚 مستندات کامل API:
سرور روی http://193.141.64.139:3000 در حال اجراست مستندات Swagger: http://193.141.64.139:3000/docs

موفق باشید! 🚀

