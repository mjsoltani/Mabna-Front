# راهنمای API توضیحات و فایل پیوست اهداف (Objectives)

## 📋 خلاصه تغییرات

طبق فیدبک کاربران، قابلیت **توضیحات (description)** و **فایل پیوست (attachments)** به اهداف اضافه شد.

---

## 🔄 تغییرات در API های موجود

### 1. ایجاد هدف جدید
`POST /api/objectives`

**Request Body (جدید):**
```json
{
  "title": "افزایش فروش Q1",
  "description": "هدف اصلی این فصل افزایش 30 درصدی فروش نسبت به فصل قبل است. تمرکز روی بازارهای جدید و محصولات پرفروش خواهد بود.",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31"
}
```

**Response:**
```json
{
  "id": "uuid",
  "title": "افزایش فروش Q1",
  "description": "هدف اصلی این فصل...",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "created_by_id": "user-uuid",
  "organization_id": "org-uuid",
  "created_at": "2025-12-21T..."
}
```

> ⚠️ فیلد `description` اختیاری است و می‌تواند `null` باشد.

---

### 2. ویرایش هدف
`PUT /api/objectives/:id`

**Request Body:**
```json
{
  "title": "عنوان جدید",
  "description": "توضیحات جدید یا آپدیت شده"
}
```

**Response:** شامل `description` و `attachments`

---

### 3. دریافت لیست اهداف
`GET /api/objectives`

**Response (آپدیت شده):**
```json
[
  {
    "id": "uuid",
    "title": "افزایش فروش Q1",
    "description": "توضیحات هدف...",
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "key_results": [...],
    "attachments": [
      {
        "id": "att-uuid",
        "file_name": "strategy.pdf",
        "file_url": "/uploads/objectives/1234-strategy.pdf",
        "file_size": 245000,
        "mime_type": "application/pdf",
        "created_at": "2025-12-21T..."
      }
    ]
  }
]
```

---

## 📎 API های جدید - فایل پیوست اهداف

### 1. آپلود فایل پیوست
`POST /api/objectives/:id/attachments`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Form Data:**
- `file`: فایل مورد نظر

**نمونه کد React:**
```javascript
const uploadObjectiveAttachment = async (objectiveId, file) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`/api/objectives/${objectiveId}/attachments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
      // نکته: Content-Type را ست نکنید، browser خودش تنظیم می‌کند
    },
    body: formData
  });

  return response.json();
};

// استفاده:
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  const result = await uploadObjectiveAttachment(objectiveId, file);
  console.log('Uploaded:', result);
};
```

**Response (201):**
```json
{
  "id": "att-uuid",
  "file_name": "roadmap.pdf",
  "file_url": "/uploads/objectives/1703158800000-roadmap.pdf",
  "file_size": 524288,
  "mime_type": "application/pdf",
  "objective_id": "obj-uuid",
  "uploaded_by": {
    "id": "user-uuid",
    "full_name": "علی محمدی",
    "email": "ali@example.com"
  },
  "created_at": "2025-12-21T11:20:00.000Z"
}
```

---

### 2. دریافت لیست فایل‌های پیوست
`GET /api/objectives/:id/attachments`

**نمونه کد React:**
```javascript
const getObjectiveAttachments = async (objectiveId) => {
  const response = await fetch(`/api/objectives/${objectiveId}/attachments`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  return response.json();
};
```

**Response (200):**
```json
[
  {
    "id": "att-uuid-1",
    "file_name": "roadmap.pdf",
    "file_url": "/uploads/objectives/1703158800000-roadmap.pdf",
    "file_size": 524288,
    "mime_type": "application/pdf",
    "uploaded_by": {
      "id": "user-uuid",
      "full_name": "علی محمدی",
      "email": "ali@example.com"
    },
    "created_at": "2025-12-21T11:20:00.000Z"
  }
]
```

---

### 3. حذف فایل پیوست
`DELETE /api/objectives/:id/attachments/:attachmentId`

**نمونه کد React:**
```javascript
const deleteObjectiveAttachment = async (objectiveId, attachmentId) => {
  const response = await fetch(
    `/api/objectives/${objectiveId}/attachments/${attachmentId}`,
    {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }
  );
  return response.json();
};
```

**Response (200):**
```json
{
  "message": "Attachment deleted successfully",
  "id": "att-uuid"
}
```

---

## 🎨 پیشنهاد UI/UX

### فرم ایجاد/ویرایش هدف:
```jsx
<form onSubmit={handleSubmit}>
  <input 
    type="text" 
    name="title" 
    placeholder="عنوان هدف"
    required 
  />
  
  <textarea 
    name="description" 
    placeholder="توضیحات هدف (اختیاری)"
    rows={4}
  />
  
  <input type="date" name="start_date" required />
  <input type="date" name="end_date" required />
  
  <button type="submit">ذخیره</button>
</form>
```

### بخش فایل‌های پیوست:
```jsx
<div className="attachments-section">
  <h4>فایل‌های پیوست</h4>
  
  {/* آپلود */}
  <input 
    type="file" 
    onChange={handleFileUpload}
    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg"
  />
  
  {/* لیست فایل‌ها */}
  <ul>
    {attachments.map(att => (
      <li key={att.id}>
        <a href={att.file_url} target="_blank">
          {att.file_name}
        </a>
        <span>{formatFileSize(att.file_size)}</span>
        <button onClick={() => handleDelete(att.id)}>حذف</button>
      </li>
    ))}
  </ul>
</div>
```

---

## ⚠️ نکات مهم

1. **سایز فایل:** محدودیت پیش‌فرض 10MB است
2. **فرمت‌های مجاز:** همه فرمت‌ها پشتیبانی می‌شوند
3. **دسترسی:** فقط اعضای سازمان می‌توانند فایل‌ها را ببینند/آپلود کنند
4. **حذف:** فقط ادمین یا سازنده هدف می‌تواند فایل را حذف کند

---

## 📞 سوالات؟

اگر سوالی داشتید با تیم بکند هماهنگ کنید.
