# Change History - Quick Start Guide

## 🚀 5-Minute Integration

Get change history working in your app in 5 minutes.

---

## Step 1: Install Dependencies (if needed)

```bash
npm install @tanstack/react-query axios date-fns
# or
yarn add @tanstack/react-query axios date-fns
```

---

## Step 2: Copy Type Definitions

Create `src/types/changeHistory.ts`:

```typescript
export enum EntityType {
  TASK = 'task',
  OBJECTIVE = 'objective',
  KEY_RESULT = 'key_result',
  TEAM = 'team',
  ORGANIZATION = 'organization'
}

export enum ActionType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  STATUS_CHANGE = 'status_change',
  ASSIGN = 'assign'
}

export interface ChangeHistoryItem {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  action: ActionType;
  field_name: string | null;
  old_value: any | null;
  new_value: any | null;
  user: {
    id: string;
    full_name: string;
    email: string;
  };
  created_at: string;
}

export interface ChangeHistoryResponse {
  data: ChangeHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}
```

---

## Step 3: Create API Service

Create `src/services/changeHistoryService.ts`:

```typescript
import axios from 'axios';
import { ChangeHistoryResponse, EntityType } from '../types/changeHistory';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000/api'
});

// Add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const changeHistoryService = {
  async getEntityHistory(
    entityType: EntityType,
    entityId: string,
    params?: any
  ): Promise<ChangeHistoryResponse> {
    const { data } = await api.get(
      `/change-history/${entityType}/${entityId}`,
      { params }
    );
    return data;
  }
};
```

---

## Step 4: Create Hook

Create `src/hooks/useChangeHistory.ts`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { changeHistoryService } from '../services/changeHistoryService';
import { EntityType } from '../types/changeHistory';

export function useChangeHistory(
  entityType: EntityType,
  entityId: string,
  page: number = 1
) {
  return useQuery({
    queryKey: ['changeHistory', entityType, entityId, page],
    queryFn: () => 
      changeHistoryService.getEntityHistory(entityType, entityId, { page, limit: 20 }),
    enabled: !!entityType && !!entityId
  });
}
```

---

## Step 5: Create Simple Component

Create `src/components/ChangeHistory.tsx`:

```tsx
import React, { useState } from 'react';
import { useChangeHistory } from '../hooks/useChangeHistory';
import { EntityType } from '../types/changeHistory';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';

interface Props {
  entityType: EntityType;
  entityId: string;
}

export default function ChangeHistory({ entityType, entityId }: Props) {
  const [page, setPage] = useState(1);
  const { data, isLoading, error } = useChangeHistory(entityType, entityId, page);

  if (isLoading) return <div>در حال بارگذاری...</div>;
  if (error) return <div>خطا در بارگذاری تاریخچه</div>;
  if (!data?.data.length) return <div>تاریخچه‌ای یافت نشد</div>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">تاریخچه تغییرات</h2>
      
      {data.data.map((item) => (
        <div key={item.id} className="border rounded p-4">
          <div className="flex justify-between">
            <div>
              <strong>{item.user.full_name}</strong>
              <span className="mx-2">{item.action}</span>
              {item.field_name && <span>({item.field_name})</span>}
            </div>
            <time className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(item.created_at), {
                addSuffix: true,
                locale: faIR
              })}
            </time>
          </div>
          
          {item.field_name && (
            <div className="mt-2 text-sm">
              {item.old_value && (
                <span className="line-through text-red-600">
                  {JSON.stringify(item.old_value)}
                </span>
              )}
              {item.old_value && ' → '}
              <span className="text-green-600">
                {JSON.stringify(item.new_value)}
              </span>
            </div>
          )}
        </div>
      ))}

      {/* Pagination */}
      {data.pagination.total_pages > 1 && (
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            قبلی
          </button>
          <span className="px-4 py-2">
            صفحه {page} از {data.pagination.total_pages}
          </span>
          <button
            onClick={() => setPage(p => p + 1)}
            disabled={page === data.pagination.total_pages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            بعدی
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Step 6: Use in Your App

```tsx
import ChangeHistory from './components/ChangeHistory';
import { EntityType } from './types/changeHistory';

function TaskDetailPage({ task }) {
  return (
    <div>
      <h1>{task.title}</h1>
      
      {/* Your task details */}
      
      {/* Add change history */}
      <ChangeHistory
        entityType={EntityType.TASK}
        entityId={task.id}
      />
    </div>
  );
}
```

---

## ✅ Done!

You now have a working change history feature. 

### Next Steps:

1. **Styling**: Add Tailwind classes or your design system
2. **Filters**: Add action type and date filters
3. **Modal**: Wrap in a modal for better UX
4. **Permissions**: Add role-based access control
5. **Advanced**: Check the full documentation for advanced features

---

## 📚 Full Documentation

- **API Reference**: `CHANGE_HISTORY_API.md`
- **UI Components**: `CHANGE_HISTORY_UI_GUIDE.md`
- **Backend Guide**: `CHANGE_HISTORY_FEATURE.md`

---

## 🐛 Troubleshooting

### "401 Unauthorized"
- Check if token is in localStorage
- Verify token is valid and not expired

### "404 Not Found"
- Verify API base URL is correct
- Check entity ID is valid UUID

### "No data showing"
- Open DevTools Network tab
- Check API response
- Verify entity has change history

### "CORS Error"
- Backend must allow your frontend origin
- Check CORS configuration

---

## 💡 Pro Tips

1. **Wrap in Modal**: Better UX than inline display
2. **Add Loading State**: Use skeleton screens
3. **Cache Data**: React Query handles this automatically
4. **Debounce Filters**: Prevent too many API calls
5. **Virtual Scroll**: For very long histories

---

## 🎨 Quick Styling with Tailwind

```tsx
// Better styled version
<div className="bg-white rounded-lg shadow-md p-6">
  <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
    <span>📜</span>
    تاریخچه تغییرات
  </h2>
  
  <div className="space-y-3">
    {data.data.map((item) => (
      <div
        key={item.id}
        className="border-l-4 border-blue-500 bg-gray-50 rounded-r-lg p-4 hover:shadow-md transition-shadow"
      >
        {/* Content */}
      </div>
    ))}
  </div>
</div>
```

---

## 🔥 Common Use Cases

### 1. Show in Modal

```tsx
const [showHistory, setShowHistory] = useState(false);

<button onClick={() => setShowHistory(true)}>
  مشاهده تاریخچه
</button>

{showHistory && (
  <Modal onClose={() => setShowHistory(false)}>
    <ChangeHistory entityType={EntityType.TASK} entityId={taskId} />
  </Modal>
)}
```

### 2. Show in Tab

```tsx
<Tabs>
  <Tab label="جزئیات">
    {/* Task details */}
  </Tab>
  <Tab label="تاریخچه">
    <ChangeHistory entityType={EntityType.TASK} entityId={taskId} />
  </Tab>
</Tabs>
```

### 3. Admin Dashboard

```tsx
// Show all changes (admin only)
const { data } = useQuery({
  queryKey: ['allHistory'],
  queryFn: () => changeHistoryService.getAllHistory({ limit: 50 })
});
```

---

## 📞 Need Help?

- Check full documentation files
- Review API responses in Network tab
- Test with Postman/Insomnia first
- Check backend logs for errors

---

**Happy Coding! 🚀**
