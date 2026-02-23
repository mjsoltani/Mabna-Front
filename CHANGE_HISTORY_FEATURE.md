# راهنمای پیاده‌سازی سیستم تاریخچه تغییرات (Change History / Audit Log)

## 1. مقدمه

این سند راهنمای کامل پیاده‌سازی سیستم تاریخچه تغییرات برای موجودیت‌های اصلی سیستم است. این سیستم تمام تغییرات انجام شده روی Tasks، Objectives، Key Results، Organizations و Teams را ثبت و قابل مشاهده می‌کند.

## 2. مدل دیتابیس (Prisma Schema)

### 2.1. جدول اصلی تاریخچه تغییرات

```prisma
model ChangeHistory {
  id            String   @id @default(uuid())
  entityType    String   @map("entity_type")    // "task", "objective", "key_result", "organization", "team"
  entityId      String   @map("entity_id")      // شناسه موجودیت تغییر یافته
  action        String                          // "create", "update", "delete", "status_change", "assign"
  fieldName     String?  @map("field_name")     // نام فیلد تغییر یافته (برای update)
  oldValue      String?  @map("old_value") @db.Text  // مقدار قبلی (JSON string)
  newValue      String?  @map("new_value") @db.Text  // مقدار جدید (JSON string)
  userId        String   @map("user_id")        // کاربر انجام‌دهنده تغییر
  organizationId String  @map("organization_id")
  createdAt     DateTime @default(now()) @map("created_at")
  
  user          User         @relation(fields: [userId], references: [id])
  organization  Organization @relation(fields: [organizationId], references: [id])

  @@index([entityType, entityId])
  @@index([userId])
  @@index([createdAt])
  @@index([organizationId])
  @@map("change_history")
}
```

### 2.2. به‌روزرسانی مدل User

```prisma
model User {
  // ... فیلدهای موجود
  changeHistory ChangeHistory[]
}
```

### 2.3. به‌روزرسانی مدل Organization

```prisma
model Organization {
  // ... فیلدهای موجود
  changeHistory ChangeHistory[]
}
```

## 3. Migration دیتابیس

```bash
# ایجاد migration جدید
npx prisma migrate dev --name add_change_history

# اعمال migration
npx prisma generate
```

## 4. Helper Functions

### 4.1. ایجاد فایل `src/utils/changeHistory.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * ثبت تغییرات در تاریخچه
 */
const logChange = async ({
  entityType,
  entityId,
  action,
  fieldName = null,
  oldValue = null,
  newValue = null,
  userId,
  organizationId
}) => {
  try {
    await prisma.changeHistory.create({
      data: {
        entityType,
        entityId,
        action,
        fieldName,
        oldValue: oldValue ? JSON.stringify(oldValue) : null,
        newValue: newValue ? JSON.stringify(newValue) : null,
        userId,
        organizationId
      }
    });
  } catch (error) {
    console.error('Error logging change:', error);
    // عدم ثبت تاریخچه نباید عملیات اصلی را متوقف کند
  }
};

/**
 * ثبت ایجاد موجودیت جدید
 */
const logCreate = async (entityType, entityId, entityData, userId, organizationId) => {
  await logChange({
    entityType,
    entityId,
    action: 'create',
    newValue: entityData,
    userId,
    organizationId
  });
};

/**
 * ثبت به‌روزرسانی موجودیت
 */
const logUpdate = async (entityType, entityId, changes, userId, organizationId) => {
  // ثبت هر تغییر به صورت جداگانه
  for (const [fieldName, { oldValue, newValue }] of Object.entries(changes)) {
    await logChange({
      entityType,
      entityId,
      action: 'update',
      fieldName,
      oldValue,
      newValue,
      userId,
      organizationId
    });
  }
};

/**
 * ثبت حذف موجودیت
 */
const logDelete = async (entityType, entityId, entityData, userId, organizationId) => {
  await logChange({
    entityType,
    entityId,
    action: 'delete',
    oldValue: entityData,
    userId,
    organizationId
  });
};

/**
 * ثبت تغییر وضعیت
 */
const logStatusChange = async (entityType, entityId, oldStatus, newStatus, userId, organizationId) => {
  await logChange({
    entityType,
    entityId,
    action: 'status_change',
    fieldName: 'status',
    oldValue: oldStatus,
    newValue: newStatus,
    userId,
    organizationId
  });
};

/**
 * ثبت تخصیص به کاربر
 */
const logAssignment = async (entityType, entityId, oldAssignee, newAssignee, userId, organizationId) => {
  await logChange({
    entityType,
    entityId,
    action: 'assign',
    fieldName: 'assignee',
    oldValue: oldAssignee,
    newValue: newAssignee,
    userId,
    organizationId
  });
};

/**
 * مقایسه دو شیء و استخراج تغییرات
 */
const detectChanges = (oldData, newData, fieldsToTrack) => {
  const changes = {};
  
  for (const field of fieldsToTrack) {
    const oldVal = oldData[field];
    const newVal = newData[field];
    
    // مقایسه مقادیر
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      changes[field] = {
        oldValue: oldVal,
        newValue: newVal
      };
    }
  }
  
  return changes;
};

module.exports = {
  logChange,
  logCreate,
  logUpdate,
  logDelete,
  logStatusChange,
  logAssignment,
  detectChanges
};
```

## 5. Controller برای تاریخچه تغییرات

### 5.1. ایجاد فایل `src/controllers/changeHistory.controller.js`

```javascript
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * دریافت تاریخچه تغییرات یک موجودیت خاص
 * GET /api/change-history/:entityType/:entityId
 */
const getEntityHistory = async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const { page = 1, limit = 20, action, userId, startDate, endDate } = req.query;

    // اعتبارسنجی entityType
    const validEntityTypes = ['task', 'objective', 'key_result', 'organization', 'team'];
    if (!validEntityTypes.includes(entityType)) {
      return res.status(400).json({ 
        error: 'نوع موجودیت نامعتبر است' 
      });
    }

    // ساخت شرط where
    const whereClause = {
      entityType,
      entityId,
      organizationId: req.user.organizationId
    };

    if (action) {
      whereClause.action = action;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // محاسبه pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // دریافت تاریخچه
    const [history, total] = await Promise.all([
      prisma.changeHistory.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.changeHistory.count({ where: whereClause })
    ]);

    // فرمت کردن نتایج
    const formattedHistory = history.map(item => ({
      id: item.id,
      entity_type: item.entityType,
      entity_id: item.entityId,
      action: item.action,
      field_name: item.fieldName,
      old_value: item.oldValue ? JSON.parse(item.oldValue) : null,
      new_value: item.newValue ? JSON.parse(item.newValue) : null,
      user: {
        id: item.user.id,
        full_name: item.user.fullName,
        email: item.user.email
      },
      created_at: item.createdAt
    }));

    return res.status(200).json({
      data: formattedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get entity history error:', error);
    return res.status(500).json({ error: 'خطا در دریافت تاریخچه تغییرات' });
  }
};

/**
 * دریافت تاریخچه تغییرات کل سیستم (فقط برای ادمین)
 * GET /api/change-history
 */
const getAllHistory = async (req, res) => {
  try {
    // بررسی مجوز - فقط ادمین‌ها
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        error: 'فقط مدیران به تاریخچه کامل دسترسی دارند' 
      });
    }

    const { 
      page = 1, 
      limit = 50, 
      entityType, 
      action, 
      userId, 
      startDate, 
      endDate 
    } = req.query;

    // ساخت شرط where
    const whereClause = {
      organizationId: req.user.organizationId
    };

    if (entityType) {
      whereClause.entityType = entityType;
    }

    if (action) {
      whereClause.action = action;
    }

    if (userId) {
      whereClause.userId = userId;
    }

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // محاسبه pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // دریافت تاریخچه
    const [history, total] = await Promise.all([
      prisma.changeHistory.findMany({
        where: whereClause,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take
      }),
      prisma.changeHistory.count({ where: whereClause })
    ]);

    // فرمت کردن نتایج
    const formattedHistory = history.map(item => ({
      id: item.id,
      entity_type: item.entityType,
      entity_id: item.entityId,
      action: item.action,
      field_name: item.fieldName,
      old_value: item.oldValue ? JSON.parse(item.oldValue) : null,
      new_value: item.newValue ? JSON.parse(item.newValue) : null,
      user: {
        id: item.user.id,
        full_name: item.user.fullName,
        email: item.user.email
      },
      created_at: item.createdAt
    }));

    return res.status(200).json({
      data: formattedHistory,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        total_pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get all history error:', error);
    return res.status(500).json({ error: 'خطا در دریافت تاریخچه تغییرات' });
  }
};

/**
 * دریافت آمار تغییرات (فقط برای ادمین)
 * GET /api/change-history/stats
 */
const getHistoryStats = async (req, res) => {
  try {
    // بررسی مجوز - فقط ادمین‌ها
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      return res.status(403).json({ 
        error: 'فقط مدیران به آمار دسترسی دارند' 
      });
    }

    const { startDate, endDate } = req.query;

    const whereClause = {
      organizationId: req.user.organizationId
    };

    if (startDate || endDate) {
      whereClause.createdAt = {};
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate);
      }
    }

    // آمار بر اساس نوع موجودیت
    const byEntityType = await prisma.changeHistory.groupBy({
      by: ['entityType'],
      where: whereClause,
      _count: true
    });

    // آمار بر اساس نوع عملیات
    const byAction = await prisma.changeHistory.groupBy({
      by: ['action'],
      where: whereClause,
      _count: true
    });

    // فعال‌ترین کاربران
    const topUsers = await prisma.changeHistory.groupBy({
      by: ['userId'],
      where: whereClause,
      _count: true,
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 10
    });

    // دریافت اطلاعات کاربران
    const userIds = topUsers.map(u => u.userId);
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        fullName: true,
        email: true
      }
    });

    const topUsersWithDetails = topUsers.map(item => {
      const user = users.find(u => u.id === item.userId);
      return {
        user: {
          id: user.id,
          full_name: user.fullName,
          email: user.email
        },
        change_count: item._count
      };
    });

    return res.status(200).json({
      by_entity_type: byEntityType.map(item => ({
        entity_type: item.entityType,
        count: item._count
      })),
      by_action: byAction.map(item => ({
        action: item.action,
        count: item._count
      })),
      top_users: topUsersWithDetails
    });
  } catch (error) {
    console.error('Get history stats error:', error);
    return res.status(500).json({ error: 'خطا در دریافت آمار تغییرات' });
  }
};

module.exports = {
  getEntityHistory,
  getAllHistory,
  getHistoryStats
};
```

## 6. Routes

### 6.1. ایجاد فایل `src/routes/changeHistory.routes.js`

```javascript
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getEntityHistory,
  getAllHistory,
  getHistoryStats
} = require('../controllers/changeHistory.controller');

// دریافت تاریخچه یک موجودیت خاص
router.get('/:entityType/:entityId', authenticate, getEntityHistory);

// دریافت تاریخچه کل سیستم (فقط ادمین)
router.get('/', authenticate, getAllHistory);

// دریافت آمار تغییرات (فقط ادمین)
router.get('/stats/summary', authenticate, getHistoryStats);

module.exports = router;
```

### 6.2. اضافه کردن به `src/index.js`

```javascript
const changeHistoryRoutes = require('./routes/changeHistory.routes');

// ...

app.use('/api/change-history', changeHistoryRoutes);
```

## 7. پیاده‌سازی در Controllers موجود

### 7.1. به‌روزرسانی `src/controllers/tasks.controller.js`

```javascript
const {
  logCreate,
  logUpdate,
  logDelete,
  logStatusChange,
  logAssignment,
  detectChanges
} = require('../utils/changeHistory');

// در تابع createTask
const createTask = async (req, res) => {
  try {
    // ... کد موجود

    const result = await prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        // ... کد موجود
      });

      // ... کد موجود

      // ثبت در تاریخچه
      await logCreate('task', task.id, {
        title: task.title,
        description: task.description,
        status: task.status,
        type: task.type,
        assigneeId: task.assigneeId
      }, req.user.userId, req.user.organizationId);

      return taskWithRelations;
    });

    // ... کد موجود
  } catch (error) {
    // ... کد موجود
  }
};

// در تابع updateTask
const updateTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;
    const { title, description, assignee_id, key_result_ids, status, type, due_date, labels } = req.body;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId: req.user.organizationId
      }
    });

    // ... کد موجود

    // تشخیص تغییرات
    const fieldsToTrack = ['title', 'description', 'status', 'type', 'dueDate', 'assigneeId'];
    const oldData = {
      title: existingTask.title,
      description: existingTask.description,
      status: existingTask.status,
      type: existingTask.type,
      dueDate: existingTask.dueDate,
      assigneeId: existingTask.assigneeId
    };

    const result = await prisma.$transaction(async (tx) => {
      const updateData = {};
      // ... کد موجود برای ساخت updateData

      const task = await tx.task.update({
        where: { id: taskId },
        data: updateData
      });

      // ... کد موجود

      const taskWithRelations = await tx.task.findUnique({
        // ... کد موجود
      });

      return taskWithRelations;
    });

    // ثبت تغییرات در تاریخچه
    const newData = {
      title: result.title,
      description: result.description,
      status: result.status,
      type: result.type,
      dueDate: result.dueDate,
      assigneeId: result.assigneeId
    };

    const changes = detectChanges(oldData, newData, fieldsToTrack);
    
    if (Object.keys(changes).length > 0) {
      await logUpdate('task', taskId, changes, req.user.userId, req.user.organizationId);
    }

    // ثبت تغییر وضعیت به صورت جداگانه
    if (status && status !== existingTask.status) {
      await logStatusChange('task', taskId, existingTask.status, status, req.user.userId, req.user.organizationId);
    }

    // ثبت تغییر assignee به صورت جداگانه
    if (assignee_id && assignee_id !== existingTask.assigneeId) {
      await logAssignment('task', taskId, existingTask.assigneeId, assignee_id, req.user.userId, req.user.organizationId);
    }

    // ... کد موجود
  } catch (error) {
    // ... کد موجود
  }
};

// در تابع deleteTask
const deleteTask = async (req, res) => {
  try {
    const { id: taskId } = req.params;

    const existingTask = await prisma.task.findFirst({
      where: {
        id: taskId,
        organizationId: req.user.organizationId
      }
    });

    // ... کد موجود

    await prisma.$transaction(async (tx) => {
      // ... کد موجود

      // ثبت در تاریخچه قبل از حذف
      await logDelete('task', taskId, {
        title: existingTask.title,
        description: existingTask.description,
        status: existingTask.status,
        type: existingTask.type
      }, req.user.userId, req.user.organizationId);

      await tx.task.delete({
        where: { id: taskId }
      });
    });

    // ... کد موجود
  } catch (error) {
    // ... کد موجود
  }
};

// در تابع approveTask
const approveTask = async (req, res) => {
  try {
    // ... کد موجود

    const approvedTask = await prisma.task.update({
      // ... کد موجود
    });

    // ثبت تأیید در تاریخچه
    await logUpdate('task', taskId, {
      isApproved: {
        oldValue: false,
        newValue: true
      },
      approvedById: {
        oldValue: null,
        newValue: req.user.userId
      }
    }, req.user.userId, req.user.organizationId);

    // ... کد موجود
  } catch (error) {
    // ... کد موجود
  }
};
```

## 8. مثال‌های استفاده از API

### 8.1. دریافت تاریخچه یک Task

```bash
GET /api/change-history/task/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer <token>

# با فیلتر
GET /api/change-history/task/550e8400-e29b-41d4-a716-446655440000?action=update&page=1&limit=10
```

پاسخ:
```json
{
  "data": [
    {
      "id": "123e4567-e89b-12d3-a456-426614174000",
      "entity_type": "task",
      "entity_id": "550e8400-e29b-41d4-a716-446655440000",
      "action": "update",
      "field_name": "status",
      "old_value": "todo",
      "new_value": "in_progress",
      "user": {
        "id": "user-id",
        "full_name": "علی احمدی",
        "email": "ali@example.com"
      },
      "created_at": "2024-01-15T10:30:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "total_pages": 3
  }
}
```

### 8.2. دریافت تاریخچه کل سیستم (ادمین)

```bash
GET /api/change-history?entityType=task&startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <admin-token>
```

### 8.3. دریافت آمار تغییرات

```bash
GET /api/change-history/stats/summary?startDate=2024-01-01
Authorization: Bearer <admin-token>
```

پاسخ:
```json
{
  "by_entity_type": [
    { "entity_type": "task", "count": 150 },
    { "entity_type": "objective", "count": 45 },
    { "entity_type": "key_result", "count": 30 }
  ],
  "by_action": [
    { "action": "update", "count": 120 },
    { "action": "create", "count": 80 },
    { "action": "status_change", "count": 25 }
  ],
  "top_users": [
    {
      "user": {
        "id": "user-1",
        "full_name": "علی احمدی",
        "email": "ali@example.com"
      },
      "change_count": 45
    }
  ]
}
```

## 9. نکات پیاده‌سازی

### 9.1. Performance

- از indexها برای بهبود سرعت query استفاده شده است
- تاریخچه در transaction جداگانه ثبت می‌شود تا عملیات اصلی را کند نکند
- در صورت خطا در ثبت تاریخچه، عملیات اصلی متوقف نمی‌شود

### 9.2. Storage

- مقادیر به صورت JSON string ذخیره می‌شوند
- برای موجودیت‌های بزرگ، فقط فیلدهای مهم ذخیره شوند
- می‌توان یک job برای پاکسازی تاریخچه قدیمی (مثلاً بیش از 1 سال) ایجاد کرد

### 9.3. Security

- فقط کاربران همان سازمان به تاریخچه دسترسی دارند
- تاریخچه کامل فقط برای ادمین‌ها قابل مشاهده است
- تاریخچه قابل حذف یا ویرایش نیست

## 10. مراحل پیاده‌سازی

1. ✅ اضافه کردن مدل `ChangeHistory` به `schema.prisma`
2. ✅ اجرای migration
3. ✅ ایجاد helper functions در `src/utils/changeHistory.js`
4. ✅ ایجاد controller در `src/controllers/changeHistory.controller.js`
5. ✅ ایجاد routes در `src/routes/changeHistory.routes.js`
6. ✅ اضافه کردن routes به `src/index.js`
7. ⏳ به‌روزرسانی `tasks.controller.js`
8. ⏳ به‌روزرسانی `objectives.controller.js`
9. ⏳ به‌روزرسانی `keyResults.controller.js`
10. ⏳ به‌روزرسانی `teams.controller.js`
11. ⏳ تست API endpoints
12. ⏳ پیاده‌سازی در Frontend

## 11. Frontend Integration

برای نمایش تاریخچه در فرانت‌اند:

```javascript
// دریافت تاریخچه یک task
const fetchTaskHistory = async (taskId) => {
  const response = await fetch(`/api/change-history/task/${taskId}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};

// نمایش تاریخچه
{history.data.map(item => (
  <div key={item.id}>
    <p>{item.user.full_name} {getActionText(item.action)} {item.field_name}</p>
    <p>از {item.old_value} به {item.new_value}</p>
    <small>{new Date(item.created_at).toLocaleString('fa-IR')}</small>
  </div>
))}
```
