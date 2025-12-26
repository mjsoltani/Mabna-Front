# قابلیت اختصاص رویداد به کاربران و تیم‌ها

## خلاصه

قابلیت اختصاص رویدادهای تقویم به کاربران و تیم‌ها به کامپوننت Calendar اضافه شده است. این ویژگی آماده استفاده است و منتظر پیاده‌سازی API های بکند می‌باشد.

## ویژگی‌های اضافه شده

### ✅ رابط کاربری اختصاص
- **انتخاب کاربران**: dropdown برای انتخاب کاربران سازمان
- **انتخاب تیم‌ها**: dropdown برای انتخاب تیم‌های سازمان
- **نمایش انتخاب‌ها**: نمایش کاربران و تیم‌های انتخاب شده با امکان حذف
- **رنگ‌بندی**: کاربران با رنگ آبی، تیم‌ها با رنگ سبز

### ✅ مدیریت داده‌ها
- دریافت لیست کاربران از `GET /api/users/list`
- دریافت لیست تیم‌ها از `GET /api/teams/members`
- ذخیره اختصاص‌ها در state کامپوننت
- ارسال اختصاص‌ها به API هنگام ایجاد/ویرایش رویداد

### ✅ نمایش اطلاعات
- نمایش کاربران و تیم‌های اختصاص داده شده در مودال جزئیات
- اطلاعات اختصاص در توضیحات رویداد
- حفظ اطلاعات اختصاص هنگام ویرایش

## تغییرات کد

### 1. State جدید
```javascript
const [users, setUsers] = useState([])
const [teams, setTeams] = useState([])

const [newEvent, setNewEvent] = useState({
  // فیلدهای قبلی...
  assignedUsers: [],
  assignedTeams: [],
})
```

### 2. دریافت کاربران و تیم‌ها
```javascript
const fetchUsersAndTeams = async () => {
  try {
    const [usersRes, teamsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/users/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      }),
      fetch(`${API_BASE_URL}/api/teams/members`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    ])

    if (usersRes.ok) {
      const usersData = await usersRes.json()
      setUsers(usersData)
    }
    if (teamsRes.ok) {
      const teamsData = await teamsRes.json()
      setTeams(teamsData)
    }
  } catch (error) {
    console.error('Error fetching users and teams:', error)
  }
}
```

### 3. ارسال اختصاص‌ها به API
```javascript
const event = {
  title: newEvent.title,
  description: newEvent.description,
  start_time: new Date(newEvent.startTime).toISOString(),
  end_time: new Date(newEvent.endTime).toISOString(),
  color: newEvent.color,
  category: newEvent.category,
  assigned_user_ids: newEvent.assignedUsers,
  assigned_team_ids: newEvent.assignedTeams,
}
```

### 4. رابط کاربری اختصاص
```jsx
{/* اختصاص به کاربران */}
<div className="space-y-2">
  <Label htmlFor="assignedUsers">اختصاص به کاربران</Label>
  <Select
    value=""
    onValueChange={(userId) => {
      if (!newEvent.assignedUsers.includes(userId)) {
        setNewEvent(prev => ({
          ...prev,
          assignedUsers: [...prev.assignedUsers, userId]
        }))
      }
    }}
  >
    <SelectTrigger>
      <SelectValue placeholder="انتخاب کاربر برای اختصاص" />
    </SelectTrigger>
    <SelectContent>
      {users.map(user => (
        <SelectItem key={user.id} value={user.id}>
          {user.full_name}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
  
  {/* نمایش کاربران انتخاب شده */}
  <div className="flex flex-wrap gap-2">
    {newEvent.assignedUsers.map(userId => {
      const user = users.find(u => u.id === userId)
      return user ? (
        <div key={userId} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
          {user.full_name}
          <button onClick={() => removeUser(userId)}>×</button>
        </div>
      ) : null
    })}
  </div>
</div>
```

## API های مورد استفاده

### موجود (برای دریافت لیست‌ها)
- `GET /api/users/list` - لیست کاربران سازمان
- `GET /api/teams/members` - لیست تیم‌های سازمان

### مورد نیاز (برای رویدادها)
- `POST /api/events` - ایجاد رویداد با اختصاص
- `PUT /api/events/{id}` - ویرایش رویداد با اختصاص
- `GET /api/events` - دریافت رویدادها با اطلاعات اختصاص

## ساختار داده‌های ارسالی

### ایجاد رویداد
```json
{
  "title": "جلسه تیم",
  "description": "جلسه هماهنگی هفتگی",
  "start_time": "2025-01-20T09:00:00Z",
  "end_time": "2025-01-20T10:00:00Z",
  "color": "blue",
  "category": "جلسه",
  "assigned_user_ids": ["user-uuid-1", "user-uuid-2"],
  "assigned_team_ids": ["team-uuid-1"]
}
```

### پاسخ API مورد انتظار
```json
{
  "event": {
    "id": "event-uuid",
    "title": "جلسه تیم",
    "description": "جلسه هماهنگی هفتگی",
    "start_time": "2025-01-20T09:00:00Z",
    "end_time": "2025-01-20T10:00:00Z",
    "color": "blue",
    "category": "جلسه",
    "assigned_users": [
      {
        "id": "user-uuid-1",
        "full_name": "احمد محمدی",
        "email": "ahmad@example.com"
      }
    ],
    "assigned_teams": [
      {
        "id": "team-uuid-1",
        "name": "تیم توسعه",
        "description": "تیم توسعه نرم‌افزار"
      }
    ],
    "is_creator": true,
    "created_at": "2025-01-15T08:00:00Z"
  }
}
```

## نحوه استفاده

### 1. ایجاد رویداد با اختصاص
1. روی "رویداد جدید" کلیک کنید
2. فرم را پر کنید (عنوان، توضیحات، زمان، رنگ، دسته‌بندی)
3. از dropdown "اختصاص به کاربران" کاربران مورد نظر را انتخاب کنید
4. از dropdown "اختصاص به تیم‌ها" تیم‌های مورد نظر را انتخاب کنید
5. روی "ایجاد" کلیک کنید

### 2. مشاهده اختصاص‌ها
- روی هر رویداد کلیک کنید
- در مودال جزئیات، اطلاعات کاربران و تیم‌های اختصاص داده شده نمایش داده می‌شود

### 3. ویرایش اختصاص‌ها
- در مودال ویرایش رویداد
- کاربران و تیم‌های جدید اضافه کنید
- کاربران و تیم‌های موجود را با کلیک روی × حذف کنید

## ویژگی‌های رابط کاربری

### نمایش کاربران انتخاب شده
- **رنگ**: آبی (`bg-blue-100 text-blue-800`)
- **محتوا**: نام کامل کاربر
- **حذف**: دکمه × برای حذف

### نمایش تیم‌های انتخاب شده
- **رنگ**: سبز (`bg-green-100 text-green-800`)
- **محتوا**: نام تیم
- **حذف**: دکمه × برای حذف

### Dropdown ها
- **Placeholder**: متن راهنما مناسب
- **محتوا**: نام کامل کاربران / نام تیم‌ها
- **عملکرد**: اضافه کردن به لیست انتخاب‌ها

## وضعیت فعلی

✅ **رابط کاربری کاملاً آماده است**
- فرم‌های اختصاص پیاده‌سازی شده
- مدیریت state انجام شده
- نمایش اطلاعات اختصاص آماده
- کد ارسال به API نوشته شده

⏳ **منتظر پیاده‌سازی API بکند**
- API های رویدادها (`/api/events`)
- ساختار پاسخ با اطلاعات اختصاص
- مجوزهای دسترسی

## تست

برای تست قابلیت:

1. **بدون API**: 
   - اختصاص‌ها محلی ذخیره می‌شوند
   - در مودال جزئیات نمایش داده می‌شوند

2. **با API**:
   - پس از پیاده‌سازی بکند، تست کامل انجام دهید
   - اختصاص‌ها باید در دیتابیس ذخیره شوند
   - فیلترینگ رویدادها بر اساس اختصاص

## نکات مهم

1. **مجوزها**: فقط کاربران همان سازمان قابل اختصاص هستند
2. **Performance**: برای سازمان‌های بزرگ، pagination در dropdown ها
3. **UX**: امکان جستجو در لیست کاربران و تیم‌ها
4. **اعلان‌ها**: ارسال اعلان به کاربران و تیم‌های اختصاص داده شده

قابلیت اختصاص رویداد آماده استفاده است! 🎉