# درخواست آپدیت Register API

## مشکل فعلی
در حال حاضر، register API فقط `organization_name` را قبول می‌کند و همیشه یک organization جدید می‌سازد. اما ما می‌خواهیم کاربران بتوانند به تیم‌های موجود بپیوندند.

## تغییرات مورد نیاز

### 1. آپدیت Register Endpoint

**POST** `/api/auth/register`

باید هم `organization_id` و هم `organization_name` را پشتیبانی کند:

#### حالت 1: پیوستن به تیم موجود (با organization_id)

```json
{
  "full_name": "علی احمدی",
  "email": "ali@example.com",
  "password": "password123",
  "organization_id": "uuid-of-existing-org"
}
```

**رفتار مورد انتظار:**
- کاربر به organization موجود اضافه شود
- نقش کاربر: `member` (نه `admin`)
- تیم پیش‌فرض: اولین تیم موجود در organization یا null

#### حالت 2: ساخت تیم جدید (با organization_name) - رفتار فعلی

```json
{
  "full_name": "علی احمدی",
  "email": "ali@example.com",
  "password": "password123",
  "organization_name": "تیم جدید",
  "team_name": "تیم جدید"
}
```

**رفتار مورد انتظار:**
- organization جدید ساخته شود
- کاربر به عنوان `admin` اضافه شود
- تیم جدید ساخته شود

### 2. منطق پیشنهادی در Backend

```javascript
const register = async (req, res) => {
  const { full_name, email, password, organization_name, organization_id, team_name } = req.body;

  // Validation
  if (!full_name || !email || !password) {
    return res.status(400).json({ 
      error: 'Missing required fields: full_name, email, password' 
    });
  }

  // باید یکی از organization_id یا organization_name وجود داشته باشد
  if (!organization_id && !organization_name) {
    return res.status(400).json({ 
      error: 'Either organization_id or organization_name is required' 
    });
  }

  try {
    // چک کردن ایمیل تکراری
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    let user;
    let orgId;
    let role;

    // حالت 1: پیوستن به organization موجود
    if (organization_id) {
      // چک کردن وجود organization
      const existingOrg = await prisma.organization.findUnique({
        where: { id: organization_id }
      });

      if (!existingOrg) {
        return res.status(404).json({ error: 'Organization not found' });
      }

      orgId = organization_id;
      role = 'member'; // کاربران جدید member هستند

      // ساخت کاربر
      user = await prisma.user.create({
        data: {
          fullName: full_name,
          email,
          passwordHash,
          role,
          organizationId: orgId
        }
      });
    } 
    // حالت 2: ساخت organization جدید
    else {
      role = 'admin'; // اولین کاربر admin است

      // ساخت organization و کاربر
      const organization = await prisma.organization.create({
        data: {
          name: organization_name
        }
      });

      orgId = organization.id;

      user = await prisma.user.create({
        data: {
          fullName: full_name,
          email,
          passwordHash,
          role,
          organizationId: orgId
        }
      });

      // اگر team_name داده شده، تیم بساز
      if (team_name) {
        await prisma.team.create({
          data: {
            name: team_name,
            organizationId: orgId,
            leadId: user.id
          }
        });
      }
    }

    // ساخت token
    const token = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // دریافت اطلاعات کامل کاربر
    const userWithOrg = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        organization: true
      }
    });

    res.status(201).json({
      token,
      user: {
        user_id: userWithOrg.id,
        full_name: userWithOrg.fullName,
        email: userWithOrg.email,
        role: userWithOrg.role,
        organization: {
          org_id: userWithOrg.organization.id,
          name: userWithOrg.organization.name
        }
      }
    });

  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
```

## خلاصه تغییرات

1. ✅ قبول کردن `organization_id` در کنار `organization_name`
2. ✅ اگر `organization_id` داده شد → پیوستن به تیم موجود با نقش `member`
3. ✅ اگر `organization_name` داده شد → ساخت تیم جدید با نقش `admin`
4. ✅ Validation مناسب برای هر دو حالت

## تست

### تست 1: پیوستن به تیم موجود
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "کاربر جدید",
    "email": "newuser@example.com",
    "password": "test123",
    "organization_id": "97c894cb-e85c-4884-855c-5928b87e2721"
  }'
```

**انتظار:** کاربر با نقش `member` به تیم موجود اضافه شود

### تست 2: ساخت تیم جدید (رفتار فعلی)
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "ادمین جدید",
    "email": "admin@example.com",
    "password": "test123",
    "organization_name": "تیم جدید من",
    "team_name": "تیم جدید من"
  }'
```

**انتظار:** organization و تیم جدید ساخته شود، کاربر `admin` باشد

## اولویت
بالا - این تغییر برای تکمیل فیچر ثبت‌نام ضروری است.
