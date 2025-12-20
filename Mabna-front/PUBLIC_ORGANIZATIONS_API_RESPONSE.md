# ✅ API عمومی Organizations آماده شد!

## 📡 Endpoint جدید

### دریافت لیست عمومی سازمان‌ها

**GET** `/api/auth/organizations`

**ویژگی‌ها:**
- ✅ بدون نیاز به Authentication
- ✅ فقط اطلاعات عمومی (id و name)
- ✅ مرتب‌سازی بر اساس نام (الفبایی)
- ✅ امن - بدون اطلاعات حساس

---

## 📋 Response Format

```json
[
  {
    "id": "19aa421f-46bb-4b58-b496-b695b9044925",
    "name": "شرکت مبنا"
  },
  {
    "id": "5276d030-5ba2-48ab-adc7-95aba42e870e",
    "name": "شرکت نوآوران"
  }
]
```

---

## 💻 استفاده در React

### 1. Component ثبت‌نام با انتخاب سازمان

```jsx
import React, { useState, useEffect } from 'react';

function RegisterForm() {
  const [organizations, setOrganizations] = useState([]);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    organization_id: '', // انتخاب سازمان موجود
    organization_name: '' // یا ساخت سازمان جدید
  });
  const [isNewOrganization, setIsNewOrganization] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('http://193.141.64.139:3000/api/auth/organizations');
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error fetching organizations:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password
      };

      if (isNewOrganization) {
        // ساخت سازمان جدید
        payload.organization_name = formData.organization_name;
      } else {
        // پیوستن به سازمان موجود
        payload.organization_id = formData.organization_id;
      }

      const response = await fetch('http://193.141.64.139:3000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);
      // Redirect to dashboard
      window.location.href = '/dashboard';
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="register-form">
      <h2>ثبت‌نام</h2>

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

      <div className="form-group">
        <label>رمز عبور</label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({...formData, password: e.target.value})}
          required
          minLength={6}
        />
      </div>

      <div className="form-group">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={isNewOrganization}
            onChange={(e) => setIsNewOrganization(e.target.checked)}
          />
          ساخت سازمان جدید
        </label>
      </div>

      {isNewOrganization ? (
        <div className="form-group">
          <label>نام سازمان جدید</label>
          <input
            type="text"
            value={formData.organization_name}
            onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
            required
            placeholder="مثال: شرکت مبنا"
          />
        </div>
      ) : (
        <div className="form-group">
          <label>انتخاب سازمان</label>
          <select
            value={formData.organization_id}
            onChange={(e) => setFormData({...formData, organization_id: e.target.value})}
            required
          >
            <option value="">یک سازمان را انتخاب کنید</option>
            {organizations.map(org => (
              <option key={org.id} value={org.id}>
                {org.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <button type="submit" disabled={loading}>
        {loading ? 'در حال ثبت‌نام...' : 'ثبت‌نام'}
      </button>

      <p className="login-link">
        قبلا ثبت‌نام کرده‌اید؟ <a href="/login">ورود</a>
      </p>
    </form>
  );
}

export default RegisterForm;
```

---

### 2. Component ساده‌تر (فقط انتخاب سازمان)

```jsx
import React, { useState, useEffect } from 'react';

function OrganizationSelector({ value, onChange }) {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('http://193.141.64.139:3000/api/auth/organizations');
      const data = await response.json();
      setOrganizations(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>در حال بارگذاری سازمان‌ها...</div>;
  }

  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} required>
      <option value="">انتخاب سازمان</option>
      {organizations.map(org => (
        <option key={org.id} value={org.id}>
          {org.name}
        </option>
      ))}
    </select>
  );
}

export default OrganizationSelector;
```

---

## 🔧 تغییرات در Backend

### آپدیت Register API

اگر می‌خواید کاربران بتونن به سازمان موجود بپیوندن، باید register endpoint رو آپدیت کنید:

```javascript
// در auth.controller.js
const register = async (req, res) => {
  const { full_name, email, password, organization_name, organization_id } = req.body;

  // اگر organization_id داده شده، به سازمان موجود بپیوند
  if (organization_id) {
    // چک کن که سازمان وجود داره
    const existingOrg = await prisma.organization.findUnique({
      where: { id: organization_id }
    });

    if (!existingOrg) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    // ساخت کاربر با organization_id موجود
    const user = await prisma.user.create({
      data: {
        fullName: full_name,
        email,
        passwordHash: await bcrypt.hash(password, 10),
        role: 'member', // نه admin
        organizationId: organization_id
      }
    });

    // ...
  } else {
    // ساخت سازمان جدید (کد قبلی)
    // ...
  }
};
```

---

## 🎨 CSS

```css
.register-form {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.register-form h2 {
  text-align: center;
  margin-bottom: 30px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #555;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #2196f3;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.checkbox-label input[type="checkbox"] {
  width: auto;
  cursor: pointer;
}

button[type="submit"] {
  width: 100%;
  padding: 12px;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.3s;
}

button[type="submit"]:hover {
  background: #1976d2;
}

button[type="submit"]:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.login-link a {
  color: #2196f3;
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
```

---

## 📝 نکات مهم

1. **امنیت**: این endpoint فقط id و name برمی‌گردونه - بدون اطلاعات حساس
2. **Public Access**: بدون نیاز به token قابل دسترسی هست
3. **مرتب‌سازی**: بر اساس نام (الفبایی) مرتب شده
4. **Use Case**: برای فرم ثبت‌نام و انتخاب سازمان

---

## 🔒 Endpoints مقایسه

| Endpoint | Authentication | Response |
|----------|---------------|----------|
| `GET /api/auth/organizations` | ❌ نیاز ندارد | فقط id و name |
| `GET /api/organizations` | ✅ نیاز دارد | اطلاعات کامل + آمار |
| `GET /api/organizations/:id` | ✅ نیاز دارد | جزئیات کامل + users |

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

## ✅ تست

```bash
# تست endpoint عمومی (بدون token)
curl http://localhost:3000/api/auth/organizations

# باید لیست سازمان‌ها رو برگردونه
```

---

**مشکل تیم فرانت حل شد! ✨**
