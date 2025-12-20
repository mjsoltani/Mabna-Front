# راهنمای API پروفایل کاربر

## 📋 توضیحات

API های مربوط به پروفایل کاربر شامل دریافت اطلاعات، آپدیت پروفایل، تغییر رمز عبور و دریافت activity های اخیر.

---

## 📡 API Endpoints

### 1. دریافت پروفایل کامل

**GET** `/api/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "full_name": "محمد جواد سلطانی",
    "email": "soltani@mabna.com",
    "role": "admin",
    "created_at": "2025-12-18T10:00:00.000Z"
  },
  "organization": {
    "id": "org-uuid",
    "name": "شرکت مبنا"
  },
  "teams": [
    {
      "id": "team-uuid",
      "name": "تیم توسعه",
      "description": "تیم توسعه نرم‌افزار",
      "role": "member",
      "joined_at": "2025-12-15T10:00:00.000Z"
    }
  ],
  "stats": {
    "tasks": {
      "total": 25,
      "todo": 10,
      "in_progress": 8,
      "done": 7,
      "upcoming": 5,
      "overdue": 2
    },
    "comments": 45,
    "unread_notifications": 3
  }
}
```

**توضیحات فیلدها:**
- `user`: اطلاعات کاربر
- `organization`: سازمان کاربر
- `teams`: لیست تیم‌هایی که کاربر عضوشه
- `stats.tasks.total`: تعداد کل tasks
- `stats.tasks.todo`: tasks با وضعیت todo
- `stats.tasks.in_progress`: tasks در حال انجام
- `stats.tasks.done`: tasks تکمیل شده
- `stats.tasks.upcoming`: tasks با deadline در 7 روز آینده
- `stats.tasks.overdue`: tasks گذشته از موعد
- `stats.comments`: تعداد کل comments کاربر
- `stats.unread_notifications`: تعداد notifications خوانده نشده

---

### 2. آپدیت پروفایل

**PUT** `/api/profile`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "full_name": "محمد جواد سلطانی",
  "email": "new-email@mabna.com"
}
```

**نکته:** هر دو فیلد اختیاری هستند. فقط فیلدهایی که می‌خواید تغییر بدید رو بفرستید.

**Response:**
```json
{
  "user": {
    "id": "user-uuid",
    "full_name": "محمد جواد سلطانی",
    "email": "new-email@mabna.com",
    "role": "admin",
    "created_at": "2025-12-18T10:00:00.000Z"
  },
  "organization": {
    "id": "org-uuid",
    "name": "شرکت مبنا"
  }
}
```

**خطاها:**
- `400`: Email تکراری است
- `401`: Unauthorized
- `500`: خطای سرور

---

### 3. تغییر رمز عبور

**POST** `/api/profile/change-password`

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Body:**
```json
{
  "current_password": "old-password",
  "new_password": "new-password"
}
```

**Validation:**
- رمز جدید باید حداقل 6 کاراکتر باشه
- رمز فعلی باید صحیح باشه

**Response:**
```json
{
  "message": "Password changed successfully",
  "success": true
}
```

**خطاها:**
- `400`: فیلدهای الزامی وجود ندارد یا رمز جدید کوتاه است
- `401`: رمز فعلی اشتباه است
- `404`: کاربر پیدا نشد
- `500`: خطای سرور

---

### 4. دریافت Activity های اخیر

**GET** `/api/profile/activity?limit=10`

**Headers:**
```
Authorization: Bearer {token}
```

**Query Parameters:**
- `limit` (optional): تعداد آیتم‌ها (default: 10)

**Response:**
```json
{
  "recent_tasks": [
    {
      "id": "task-uuid",
      "title": "پیاده‌سازی صفحه لندینگ",
      "status": "in_progress",
      "due_date": "2025-12-25T00:00:00.000Z",
      "created_at": "2025-12-18T10:00:00.000Z"
    }
  ],
  "recent_comments": [
    {
      "id": "comment-uuid",
      "content": "این کار انجام شد",
      "task": {
        "id": "task-uuid",
        "title": "پیاده‌سازی صفحه لندینگ"
      },
      "created_at": "2025-12-18T11:00:00.000Z"
    }
  ],
  "recent_notifications": [
    {
      "id": "notif-uuid",
      "type": "task_assigned",
      "title": "وظیفه جدید",
      "message": "وظیفه \"تست API\" به شما محول شد",
      "is_read": false,
      "task_id": "task-uuid",
      "created_at": "2025-12-18T12:00:00.000Z"
    }
  ]
}
```

---

## 💻 پیاده‌سازی در React

### 1. Component صفحه پروفایل

```jsx
import React, { useState, useEffect } from 'react';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch('http://193.141.64.139:3000/api/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!profile) return <div>خطا در بارگذاری پروفایل</div>;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="avatar">
          {profile.user.full_name.charAt(0)}
        </div>
        <div className="user-info">
          <h1>{profile.user.full_name}</h1>
          <p className="email">{profile.user.email}</p>
          <span className="role-badge">{profile.user.role}</span>
        </div>
      </div>

      <div className="profile-content">
        <div className="info-section">
          <h2>اطلاعات سازمان</h2>
          <p><strong>نام سازمان:</strong> {profile.organization.name}</p>
          <p><strong>تاریخ عضویت:</strong> {new Date(profile.user.created_at).toLocaleDateString('fa-IR')}</p>
        </div>

        {profile.teams.length > 0 && (
          <div className="teams-section">
            <h2>تیم‌ها</h2>
            <div className="teams-grid">
              {profile.teams.map(team => (
                <div key={team.id} className="team-card">
                  <h3>{team.name}</h3>
                  <p>{team.description}</p>
                  <span className="team-role">{team.role}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="stats-section">
          <h2>آمار فعالیت</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{profile.stats.tasks.total}</div>
              <div className="stat-label">کل وظایف</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile.stats.tasks.todo}</div>
              <div className="stat-label">در انتظار</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile.stats.tasks.in_progress}</div>
              <div className="stat-label">در حال انجام</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile.stats.tasks.done}</div>
              <div className="stat-label">تکمیل شده</div>
            </div>
            <div className="stat-card warning">
              <div className="stat-value">{profile.stats.tasks.upcoming}</div>
              <div className="stat-label">نزدیک به موعد</div>
            </div>
            <div className="stat-card danger">
              <div className="stat-value">{profile.stats.tasks.overdue}</div>
              <div className="stat-label">گذشته از موعد</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile.stats.comments}</div>
              <div className="stat-label">نظرات</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{profile.stats.unread_notifications}</div>
              <div className="stat-label">اعلان‌های جدید</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
```

---

### 2. Component ویرایش پروفایل

```jsx
import React, { useState } from 'react';

function EditProfileForm({ currentUser, onSuccess }) {
  const [formData, setFormData] = useState({
    full_name: currentUser.full_name,
    email: currentUser.email
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://193.141.64.139:3000/api/profile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'خطا در آپدیت پروفایل');
      }

      const data = await response.json();
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="edit-profile-form">
      <h2>ویرایش پروفایل</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>نام و نام خانوادگی</label>
        <input
          type="text"
          value={formData.full_name}
          onChange={(e) => setFormData({...formData, full_name: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>ایمیل</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
      </button>
    </form>
  );
}

export default EditProfileForm;
```

---

### 3. Component تغییر رمز عبور

```jsx
import React, { useState } from 'react';

function ChangePasswordForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.new_password.length < 6) {
      setError('رمز عبور جدید باید حداقل 6 کاراکتر باشد');
      return;
    }

    if (formData.new_password !== formData.confirm_password) {
      setError('رمز عبور جدید و تکرار آن یکسان نیستند');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('http://193.141.64.139:3000/api/profile/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: formData.current_password,
          new_password: formData.new_password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'خطا در تغییر رمز عبور');
      }

      // پاک کردن فرم
      setFormData({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });

      onSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="change-password-form">
      <h2>تغییر رمز عبور</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="form-group">
        <label>رمز عبور فعلی</label>
        <input
          type="password"
          value={formData.current_password}
          onChange={(e) => setFormData({...formData, current_password: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>رمز عبور جدید</label>
        <input
          type="password"
          value={formData.new_password}
          onChange={(e) => setFormData({...formData, new_password: e.target.value})}
          required
          minLength={6}
        />
        <small>حداقل 6 کاراکتر</small>
      </div>

      <div className="form-group">
        <label>تکرار رمز عبور جدید</label>
        <input
          type="password"
          value={formData.confirm_password}
          onChange={(e) => setFormData({...formData, confirm_password: e.target.value})}
          required
        />
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
      </button>
    </form>
  );
}

export default ChangePasswordForm;
```

---

### 4. Component Activity های اخیر

```jsx
import React, { useState, useEffect } from 'react';

function RecentActivity() {
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchActivity();
  }, []);

  const fetchActivity = async () => {
    try {
      const response = await fetch('http://193.141.64.139:3000/api/profile/activity?limit=5', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setActivity(data);
    } catch (error) {
      console.error('Error fetching activity:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>در حال بارگذاری...</div>;
  if (!activity) return null;

  return (
    <div className="recent-activity">
      <h2>فعالیت‌های اخیر</h2>

      <div className="activity-section">
        <h3>آخرین وظایف</h3>
        {activity.recent_tasks.length === 0 ? (
          <p className="empty-state">وظیفه‌ای وجود ندارد</p>
        ) : (
          <ul className="activity-list">
            {activity.recent_tasks.map(task => (
              <li key={task.id} className="activity-item">
                <div className="activity-icon">📋</div>
                <div className="activity-content">
                  <strong>{task.title}</strong>
                  <span className={`status-badge ${task.status}`}>{task.status}</span>
                  <small>{new Date(task.created_at).toLocaleDateString('fa-IR')}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="activity-section">
        <h3>آخرین نظرات</h3>
        {activity.recent_comments.length === 0 ? (
          <p className="empty-state">نظری وجود ندارد</p>
        ) : (
          <ul className="activity-list">
            {activity.recent_comments.map(comment => (
              <li key={comment.id} className="activity-item">
                <div className="activity-icon">💬</div>
                <div className="activity-content">
                  <p>{comment.content}</p>
                  <small>در وظیفه: {comment.task.title}</small>
                  <small>{new Date(comment.created_at).toLocaleDateString('fa-IR')}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="activity-section">
        <h3>آخرین اعلان‌ها</h3>
        {activity.recent_notifications.length === 0 ? (
          <p className="empty-state">اعلانی وجود ندارد</p>
        ) : (
          <ul className="activity-list">
            {activity.recent_notifications.map(notif => (
              <li key={notif.id} className={`activity-item ${!notif.is_read ? 'unread' : ''}`}>
                <div className="activity-icon">🔔</div>
                <div className="activity-content">
                  <strong>{notif.title}</strong>
                  <p>{notif.message}</p>
                  <small>{new Date(notif.created_at).toLocaleDateString('fa-IR')}</small>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default RecentActivity;
```

---

## 🎨 CSS

```css
.profile-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 32px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 24px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 40px;
  font-weight: bold;
  color: white;
}

.user-info h1 {
  margin: 0 0 8px 0;
  font-size: 28px;
}

.user-info .email {
  color: #666;
  margin: 0 0 12px 0;
}

.role-badge {
  display: inline-block;
  padding: 4px 12px;
  background: #e3f2fd;
  color: #1976d2;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 500;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.stat-card {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.stat-card.warning {
  background: #fff3e0;
}

.stat-card.danger {
  background: #ffebee;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.teams-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.team-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.team-card h3 {
  margin: 0 0 8px 0;
}

.team-role {
  display: inline-block;
  padding: 4px 8px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 12px;
  margin-top: 12px;
}

.activity-list {
  list-style: none;
  padding: 0;
}

.activity-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: white;
  border-radius: 8px;
  margin-bottom: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.activity-item.unread {
  background: #e3f2fd;
}

.activity-icon {
  font-size: 24px;
}

.activity-content {
  flex: 1;
}

.activity-content strong {
  display: block;
  margin-bottom: 4px;
}

.activity-content small {
  display: block;
  color: #666;
  font-size: 12px;
  margin-top: 4px;
}

.error-message {
  padding: 12px;
  background: #ffebee;
  color: #c62828;
  border-radius: 4px;
  margin-bottom: 16px;
}
```

---

## 📝 نکات مهم

1. **Authentication**: همه endpoints نیاز به token دارن
2. **Email Validation**: وقتی email رو تغییر می‌دید، چک میشه که تکراری نباشه
3. **Password Security**: رمز عبور باید حداقل 6 کاراکتر باشه
4. **Stats Real-time**: آمارها real-time محاسبه میشن
5. **Activity Limit**: می‌تونید تعداد آیتم‌های activity رو با query parameter تنظیم کنید

---

## 🚀 دستورات Deploy

```bash
ssh -p 3031 root@193.141.64.139
cd /opt/mabna
git pull origin master
pm2 restart mabna-api
pm2 logs mabna-api --lines 10
```

---

**موفق باشید! 👤**
