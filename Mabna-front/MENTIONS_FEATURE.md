# فیچر Mention کاربران در توضیحات Task

## 📋 توضیحات

کاربران می‌تونن در description یک task، کاربران دیگه رو mention کنن. وقتی کسی mention میشه، notification دریافت می‌کنه.

---

## 🔤 فرمت Mention

```
@[نام کاربر](user-id)
```

**مثال:**
```
سلام @[محمد جواد](06b5fa94-483b-4691-b2b4-44315a5fd611) این task رو چک کن
```

---

## 🔔 Notification

وقتی کسی mention میشه، یک notification با type `task_mention` دریافت می‌کنه:

```json
{
  "id": "notif-uuid",
  "type": "task_mention",
  "title": "شما در یک وظیفه mention شدید",
  "message": "محمد جواد شما را در وظیفه \"پیاده‌سازی صفحه لندینگ\" mention کرد",
  "isRead": false,
  "taskId": "task-uuid",
  "createdAt": "2025-12-16T10:00:00.000Z"
}
```

---

## 💻 پیاده‌سازی در React

### 1. Component برای Mention Input

```jsx
import React, { useState, useRef, useEffect } from 'react';

function MentionTextarea({ value, onChange, users }) {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const textareaRef = useRef(null);

  // وقتی @ زده میشه
  const handleChange = (e) => {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(text);
    setCursorPosition(cursorPos);
    
    // چک کن که آیا @ زده شده
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // اگر بعد از @ فاصله نباشه
      if (!textAfterAt.includes(' ')) {
        setSearchQuery(textAfterAt);
        
        // فیلتر کردن users
        const filtered = users.filter(user =>
          user.full_name.toLowerCase().includes(textAfterAt.toLowerCase())
        );
        
        setSuggestions(filtered);
        setShowSuggestions(true);
      } else {
        setShowSuggestions(false);
      }
    } else {
      setShowSuggestions(false);
    }
  };

  // وقتی یک user انتخاب میشه
  const handleSelectUser = (user) => {
    const text = value;
    const cursorPos = cursorPosition;
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');
    
    // جایگزین کردن @query با mention
    const mention = `@[${user.full_name}](${user.user_id})`;
    const newText = 
      text.substring(0, lastAtIndex) + 
      mention + 
      ' ' +
      text.substring(cursorPos);
    
    onChange(newText);
    setShowSuggestions(false);
    
    // Focus برگشت به textarea
    textareaRef.current.focus();
  };

  return (
    <div className="mention-textarea-container">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder="توضیحات task را وارد کنید... (برای mention کردن @ بزنید)"
        rows={5}
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="mention-suggestions">
          {suggestions.map(user => (
            <div
              key={user.user_id}
              className="mention-suggestion-item"
              onClick={() => handleSelectUser(user)}
            >
              <span className="user-name">{user.full_name}</span>
              <span className="user-email">{user.email}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MentionTextarea;
```

---

### 2. Component برای نمایش Mentions

```jsx
import React from 'react';

function DescriptionWithMentions({ description, users }) {
  if (!description) return null;
  
  // تبدیل mentions به HTML
  const renderDescription = () => {
    // Regex برای پیدا کردن mentions
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    
    const parts = [];
    let lastIndex = 0;
    let match;
    
    while ((match = mentionRegex.exec(description)) !== null) {
      // متن قبل از mention
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: description.substring(lastIndex, match.index)
        });
      }
      
      // mention
      parts.push({
        type: 'mention',
        name: match[1],
        userId: match[2]
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // متن بعد از آخرین mention
    if (lastIndex < description.length) {
      parts.push({
        type: 'text',
        content: description.substring(lastIndex)
      });
    }
    
    return parts;
  };
  
  const parts = renderDescription();
  
  return (
    <div className="description-with-mentions">
      {parts.map((part, index) => {
        if (part.type === 'text') {
          return <span key={index}>{part.content}</span>;
        } else {
          return (
            <span key={index} className="mention" data-user-id={part.userId}>
              @{part.name}
            </span>
          );
        }
      })}
    </div>
  );
}

export default DescriptionWithMentions;
```

---

### 3. استفاده در Task Form

```jsx
import React, { useState, useEffect } from 'react';
import MentionTextarea from './MentionTextarea';

function CreateTaskForm({ onSubmit }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigneeId: ''
  });
  const token = localStorage.getItem('token');

  useEffect(() => {
    // دریافت لیست users
    fetch('http://193.141.64.139:3000/api/organization/users', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setUsers(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label>عنوان</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div className="form-group">
        <label>توضیحات</label>
        <MentionTextarea
          value={formData.description}
          onChange={(text) => setFormData({...formData, description: text})}
          users={users}
        />
      </div>
      
      <button type="submit">ساخت Task</button>
    </form>
  );
}
```

---

## 🎨 CSS

```css
.mention-textarea-container {
  position: relative;
}

.mention-textarea-container textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;
}

.mention-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  max-height: 200px;
  overflow-y: auto;
  z-index: 1000;
  margin-top: 4px;
}

.mention-suggestion-item {
  padding: 12px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.mention-suggestion-item:hover {
  background: #f5f5f5;
}

.mention-suggestion-item .user-name {
  font-weight: 500;
  color: #333;
}

.mention-suggestion-item .user-email {
  font-size: 12px;
  color: #999;
}

/* نمایش mentions */
.description-with-mentions {
  white-space: pre-wrap;
  line-height: 1.6;
}

.description-with-mentions .mention {
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 6px;
  border-radius: 3px;
  font-weight: 500;
  cursor: pointer;
}

.description-with-mentions .mention:hover {
  background: #bbdefb;
}
```

---

## 📝 نکات مهم

1. **فرمت mention**: حتما از فرمت `@[Name](id)` استفاده کن
2. **Backend خودکار notification می‌فرسته** - نیازی به کار اضافه نیست
3. **Mention ها case-insensitive** جستجو میشن
4. **فقط users از همون organization** قابل mention هستند
5. **خود کاربر و assignee** notification دریافت نمی‌کنن

---

## 🎯 UI/UX پیشنهادی

### Mention Input
- وقتی @ زده میشه، dropdown با لیست users نمایش داده بشه
- جستجو real-time باشه
- با کیبورد قابل navigate باشه (↑↓ Enter)
- با Esc بسته بشه

### Mention Display
- Mention ها با رنگ متفاوت highlight بشن
- Hover کردن روی mention، tooltip با اطلاعات user نشون بده
- کلیک روی mention، به پروفایل user برود

### Notifications
- وقتی mention میشی، notification دریافت کنی
- کلیک روی notification، به task مربوطه برود
- Badge تعداد mentions خوانده نشده

---

## 🔧 کتابخانه‌های پیشنهادی

اگر می‌خوای از کتابخانه آماده استفاده کنی:

### React
- **react-mentions**: https://github.com/signavio/react-mentions
- **draft-js**: برای Rich Text Editor
- **slate**: برای editor پیشرفته‌تر

### مثال با react-mentions:

```bash
npm install react-mentions
```

```jsx
import { MentionsInput, Mention } from 'react-mentions';

function TaskDescription({ value, onChange, users }) {
  return (
    <MentionsInput
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="توضیحات task..."
    >
      <Mention
        trigger="@"
        data={users.map(u => ({ id: u.user_id, display: u.full_name }))}
        markup="@[__display__](__id__)"
        displayTransform={(id, display) => `@${display}`}
      />
    </MentionsInput>
  );
}
```

---

## ✅ چک‌لیست پیاده‌سازی

- [ ] Mention input با @ trigger
- [ ] Dropdown لیست users
- [ ] جستجوی real-time
- [ ] انتخاب user با کلیک یا Enter
- [ ] نمایش mentions با highlight
- [ ] Tooltip برای mentions
- [ ] دریافت notification وقتی mention میشی
- [ ] لینک به task از notification
- [ ] Keyboard navigation
- [ ] Mobile responsive

---

**موفق باشید! 🚀**
