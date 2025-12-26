# درخواست API رویدادهای تقویم

## خلاصه درخواست

سلام تیم بکند عزیز،

برای تکمیل قابلیت تقویم شمسی، نیاز به پیاده‌سازی API های مدیریت رویدادها داریم. این API ها باید امکان ایجاد، مشاهده، ویرایش و حذف رویدادها را فراهم کنند و همچنین قابلیت اختصاص رویداد به کاربران و تیم‌ها را داشته باشند.

## API های مورد نیاز

### 1. دریافت لیست رویدادها
```
GET /api/events
```

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters (اختیاری):**
- `start_date`: تاریخ شروع فیلتر (ISO 8601)
- `end_date`: تاریخ پایان فیلتر (ISO 8601)
- `assigned_to_me`: true/false (فقط رویدادهای اختصاص داده شده به کاربر فعلی)

**Response:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "جلسه تیم",
      "description": "جلسه هماهنگی هفتگی",
      "start_time": "2025-01-20T09:00:00Z",
      "end_time": "2025-01-20T10:00:00Z",
      "color": "blue",
      "category": "جلسه",
      "created_by": {
        "id": "uuid",
        "full_name": "احمد محمدی",
        "email": "ahmad@example.com"
      },
      "assigned_users": [
        {
          "id": "uuid",
          "full_name": "علی احمدی",
          "email": "ali@example.com"
        }
      ],
      "assigned_teams": [
        {
          "id": "uuid",
          "name": "تیم توسعه",
          "description": "تیم توسعه نرم‌افزار"
        }
      ],
      "is_creator": true,
      "created_at": "2025-01-15T08:00:00Z",
      "updated_at": "2025-01-15T08:00:00Z"
    }
  ]
}
```

### 2. ایجاد رویداد جدید
```
POST /api/events
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "جلسه تیم",
  "description": "جلسه هماهنگی هفتگی",
  "start_time": "2025-01-20T09:00:00Z",
  "end_time": "2025-01-20T10:00:00Z",
  "color": "blue",
  "category": "جلسه",
  "assigned_user_ids": ["uuid1", "uuid2"],
  "assigned_team_ids": ["uuid1", "uuid2"]
}
```

**Response:**
```json
{
  "event": {
    "id": "uuid",
    "title": "جلسه تیم",
    "description": "جلسه هماهنگی هفتگی",
    "start_time": "2025-01-20T09:00:00Z",
    "end_time": "2025-01-20T10:00:00Z",
    "color": "blue",
    "category": "جلسه",
    "created_by": {
      "id": "uuid",
      "full_name": "احمد محمدی",
      "email": "ahmad@example.com"
    },
    "assigned_users": [...],
    "assigned_teams": [...],
    "is_creator": true,
    "created_at": "2025-01-15T08:00:00Z",
    "updated_at": "2025-01-15T08:00:00Z"
  }
}
```

### 3. مشاهده جزئیات رویداد
```
GET /api/events/{event_id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
همان ساختار رویداد در بالا

### 4. ویرایش رویداد
```
PUT /api/events/{event_id}
```

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request Body:**
```json
{
  "title": "جلسه تیم (ویرایش شده)",
  "description": "جلسه هماهنگی هفتگی",
  "start_time": "2025-01-20T09:30:00Z",
  "end_time": "2025-01-20T10:30:00Z",
  "color": "green",
  "category": "جلسه",
  "assigned_user_ids": ["uuid1", "uuid3"],
  "assigned_team_ids": ["uuid2"]
}
```

**Response:**
رویداد ویرایش شده

### 5. حذف رویداد
```
DELETE /api/events/{event_id}
```

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "message": "رویداد با موفقیت حذف شد"
}
```

## ساختار دیتابیس پیشنهادی

### جدول events
```sql
CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    color VARCHAR(50) DEFAULT 'blue',
    category VARCHAR(100) DEFAULT 'رویداد',
    created_by UUID NOT NULL REFERENCES users(id),
    organization_id UUID NOT NULL REFERENCES organizations(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### جدول event_user_assignments
```sql
CREATE TABLE event_user_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
```

### جدول event_team_assignments
```sql
CREATE TABLE event_team_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, team_id)
);
```

## قوانین دسترسی

### مجوزهای مشاهده
- کاربران می‌توانند رویدادهایی را ببینند که:
  - خودشان ایجاد کرده‌اند
  - به آن‌ها اختصاص داده شده
  - به تیم‌شان اختصاص داده شده
  - عمومی هستند (در صورت نیاز)

### مجوزهای ویرایش/حذف
- فقط سازنده رویداد می‌تواند آن را ویرایش یا حذف کند
- فیلد `is_creator` در response نشان می‌دهد آیا کاربر فعلی سازنده است یا خیر

### مجوزهای اختصاص
- فقط کاربران همان سازمان قابل اختصاص هستند
- فقط تیم‌های همان سازمان قابل اختصاص هستند

## ویژگی‌های اضافی (اختیاری)

### 1. اعلان‌ها
- ارسال اعلان به کاربران و تیم‌های اختصاص داده شده
- یادآوری قبل از شروع رویداد

### 2. تکرار رویداد
- امکان تعریف رویدادهای تکراری (روزانه، هفتگی، ماهانه)

### 3. دعوت‌نامه
- ارسال دعوت‌نامه به کاربران
- پاسخ دعوت (قبول/رد)

## مثال‌های استفاده

### ایجاد جلسه تیمی
```javascript
const response = await fetch('/api/events', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'جلسه هماهنگی پروژه',
    description: 'بررسی پیشرفت پروژه و برنامه‌ریزی هفته آینده',
    start_time: '2025-01-22T14:00:00Z',
    end_time: '2025-01-22T15:00:00Z',
    color: 'blue',
    category: 'جلسه',
    assigned_team_ids: ['team-uuid-1']
  })
})
```

### دریافت رویدادهای هفته جاری
```javascript
const startOfWeek = '2025-01-20T00:00:00Z'
const endOfWeek = '2025-01-26T23:59:59Z'

const response = await fetch(
  `/api/events?start_date=${startOfWeek}&end_date=${endOfWeek}`,
  {
    headers: { 'Authorization': `Bearer ${token}` }
  }
)
```

## نکات مهم

1. **تاریخ و زمان**: همه تاریخ‌ها در فرمت ISO 8601 با timezone
2. **مجوزها**: حتماً بررسی کنید کاربر به رویداد دسترسی دارد
3. **سازمان**: رویدادها محدود به سازمان کاربر باشند
4. **Performance**: برای تاریخ‌های طولانی، pagination اضافه کنید
5. **Validation**: اعتبارسنجی تاریخ شروع < تاریخ پایان

## اولویت پیاده‌سازی

1. **مرحله 1**: API های پایه (CRUD) بدون اختصاص
2. **مرحله 2**: اختصاص به کاربران
3. **مرحله 3**: اختصاص به تیم‌ها
4. **مرحله 4**: ویژگی‌های اضافی (اعلان‌ها، تکرار)

لطفاً در صورت سوال یا نیاز به توضیح بیشتر، اطلاع دهید.

با تشکر،
تیم فرانت‌اند