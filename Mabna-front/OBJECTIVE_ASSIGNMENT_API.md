# راهنمای API انتساب هدف به کاربر یا تیم

## 📋 خلاصه تغییرات

اهداف (Objectives) حالا می‌تونن به یک **کاربر** یا یک **تیم** (یا هر دو) assign بشن. این فیچر **اجباری** هست و حداقل یکی از این دو باید مشخص بشه.

---

## 🔄 تغییرات در API ها

### 1. ایجاد هدف جدید
`POST /api/objectives`

**Request Body:**
```json
{
  "title": "افزایش فروش Q1",
  "description": "هدف اصلی این فصل افزایش 30 درصدی فروش است",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "assignee_id": "user-uuid",
  "team_id": "team-uuid"
}
```

**قوانین:**
- `assignee_id` یا `team_id` یا **هر دو** باید داده بشن
- اگر هیچکدوم داده نشه، خطای 400 برمی‌گرده

**Response (201):**
```json
{
  "id": "objective-uuid",
  "title": "افزایش فروش Q1",
  "description": "هدف اصلی این فصل...",
  "start_date": "2025-01-01",
  "end_date": "2025-03-31",
  "created_by_id": "creator-uuid",
  "organization_id": "org-uuid",
  "assignee": {
    "user_id": "user-uuid",
    "full_name": "علی محمدی"
  },
  "team": {
    "id": "team-uuid",
    "name": "تیم فروش"
  },
  "created_at": "2025-12-21T..."
}
```

**خطاهای احتمالی:**
```json
// اگر assignee یا team داده نشه
{ "error": "At least one of assignee_id or team_id is required" }

// اگر کاربر پیدا نشه
{ "error": "Assignee not found or does not belong to your organization" }

// اگر تیم پیدا نشه
{ "error": "Team not found or does not belong to your organization" }
```

---

### 2. دریافت لیست اهداف
`GET /api/objectives`

**Response (آپدیت شده):**
```json
[
  {
    "id": "objective-uuid",
    "title": "افزایش فروش Q1",
    "description": "توضیحات...",
    "start_date": "2025-01-01",
    "end_date": "2025-03-31",
    "assignee": {
      "user_id": "user-uuid",
      "full_name": "علی محمدی"
    },
    "team": {
      "id": "team-uuid",
      "name": "تیم فروش",
      "members": [
        { "user_id": "member-1", "full_name": "رضا احمدی" },
        { "user_id": "member-2", "full_name": "سارا کریمی" }
      ]
    },
    "key_results": [...],
    "attachments": [...]
  }
]
```

---

### 3. ویرایش هدف
`PUT /api/objectives/:id`

**Request Body (همه فیلدها اختیاری):**
```json
{
  "title": "عنوان جدید",
  "description": "توضیحات جدید",
  "start_date": "2025-01-01",
  "end_date": "2025-06-30",
  "assignee_id": "new-user-uuid",
  "team_id": "new-team-uuid"
}
```

**نکته:** برای حذف assignee یا team، مقدار `null` بفرستید:
```json
{
  "assignee_id": null,
  "team_id": "team-uuid"
}
```

---

## 🎨 پیشنهاد UI - فرم ایجاد/ویرایش هدف

```jsx
const ObjectiveForm = ({ objective, users, teams, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: objective?.title || '',
    description: objective?.description || '',
    start_date: objective?.start_date || '',
    end_date: objective?.end_date || '',
    assignee_id: objective?.assignee?.user_id || '',
    team_id: objective?.team?.id || ''
  });

  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation: حداقل یکی باید انتخاب بشه
    if (!formData.assignee_id && !formData.team_id) {
      setError('لطفاً حداقل یک مسئول یا تیم انتخاب کنید');
      return;
    }

    const payload = {
      title: formData.title,
      description: formData.description || null,
      start_date: formData.start_date,
      end_date: formData.end_date,
      assignee_id: formData.assignee_id || null,
      team_id: formData.team_id || null
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="title"
        value={formData.title}
        onChange={e => setFormData({...formData, title: e.target.value})}
        placeholder="عنوان هدف"
        required
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={e => setFormData({...formData, description: e.target.value})}
        placeholder="توضیحات (اختیاری)"
        rows={4}
      />

      <div className="date-inputs">
        <input
          type="date"
          name="start_date"
          value={formData.start_date}
          onChange={e => setFormData({...formData, start_date: e.target.value})}
          required
        />
        <input
          type="date"
          name="end_date"
          value={formData.end_date}
          onChange={e => setFormData({...formData, end_date: e.target.value})}
          required
        />
      </div>

      {/* بخش انتساب - اجباری */}
      <div className="assignment-section">
        <h4>انتساب به: <span className="required">*</span></h4>
        
        {error && <div className="error-message">{error}</div>}

        {/* انتخاب کاربر */}
        <div className="assignment-option">
          <label>مسئول (کاربر):</label>
          <select
            name="assignee_id"
            value={formData.assignee_id}
            onChange={e => setFormData({...formData, assignee_id: e.target.value})}
          >
            <option value="">انتخاب کنید...</option>
            {users.map(user => (
              <option key={user.id} value={user.id}>
                {user.full_name}
              </option>
            ))}
          </select>
        </div>

        {/* انتخاب تیم */}
        <div className="assignment-option">
          <label>تیم:</label>
          <select
            name="team_id"
            value={formData.team_id}
            onChange={e => setFormData({...formData, team_id: e.target.value})}
          >
            <option value="">انتخاب کنید...</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <p className="hint">حداقل یکی از موارد بالا باید انتخاب شود</p>
      </div>

      <button type="submit">
        {objective ? 'ذخیره تغییرات' : 'ایجاد هدف'}
      </button>
    </form>
  );
};
```

---

## 📊 نمایش اهداف با اطلاعات انتساب

```jsx
const ObjectiveCard = ({ objective }) => {
  return (
    <div className="objective-card">
      <h3>{objective.title}</h3>
      {objective.description && (
        <p className="description">{objective.description}</p>
      )}
      
      <div className="dates">
        <span>از: {objective.start_date}</span>
        <span>تا: {objective.end_date}</span>
      </div>

      {/* نمایش انتساب */}
      <div className="assignment-info">
        {objective.assignee && (
          <div className="assignee">
            <span className="label">مسئول:</span>
            <span className="value">{objective.assignee.full_name}</span>
          </div>
        )}

        {objective.team && (
          <div className="team">
            <span className="label">تیم:</span>
            <span className="value">{objective.team.name}</span>
            
            {/* نمایش اعضای تیم */}
            <div className="team-members">
              {objective.team.members.map(member => (
                <span key={member.user_id} className="member-badge">
                  {member.full_name}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Key Results */}
      <div className="key-results">
        {objective.key_results.map(kr => (
          <div key={kr.id} className="kr-item">
            {kr.title}
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔧 نمونه کدهای API

```javascript
// ایجاد هدف جدید
const createObjective = async (data) => {
  const response = await fetch('/api/objectives', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error);
  }
  
  return response.json();
};

// ویرایش هدف
const updateObjective = async (objectiveId, data) => {
  const response = await fetch(`/api/objectives/${objectiveId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  
  return response.json();
};

// دریافت لیست اهداف
const getObjectives = async () => {
  const response = await fetch('/api/objectives', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  
  return response.json();
};
```

---

## ⚠️ نکات مهم

1. **اجباری بودن انتساب:** حداقل یکی از `assignee_id` یا `team_id` باید داده بشه
2. **هر دو همزمان:** می‌تونید هم کاربر و هم تیم رو همزمان انتخاب کنید
3. **اعضای تیم:** در response، لیست اعضای تیم هم برگردونده می‌شه
4. **حذف انتساب:** برای حذف، مقدار `null` بفرستید (ولی حداقل یکی باید باقی بمونه)

---

## 📞 سوالات؟

اگر سوالی داشتید با تیم بکند هماهنگ کنید.
