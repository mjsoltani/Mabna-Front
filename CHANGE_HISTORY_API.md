# Change History API - Frontend Integration Guide

## Overview

The Change History system provides comprehensive audit logging for all entity modifications (Tasks, Objectives, Key Results, Teams, Organizations). This document outlines the API contract, integration patterns, and implementation recommendations for frontend engineers.

---

## API Specification

### Base URL
```
/api/change-history
```

### Authentication
All endpoints require Bearer token authentication:
```
Authorization: Bearer <jwt_token>
```

---

## Endpoints

### 1. Get Entity History

Retrieve change history for a specific entity with pagination and filtering.

```http
GET /api/change-history/:entityType/:entityId
```

#### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entityType` | string | Yes | Entity type: `task`, `objective`, `key_result`, `team`, `organization` |
| `entityId` | string (UUID) | Yes | Entity identifier |

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 20 | Items per page (max: 100) |
| `action` | string | No | - | Filter by action type |
| `userId` | string (UUID) | No | - | Filter by user who made the change |
| `startDate` | string (ISO 8601) | No | - | Filter changes after this date |
| `endDate` | string (ISO 8601) | No | - | Filter changes before this date |

#### Response Schema

```typescript
interface ChangeHistoryResponse {
  data: ChangeHistoryItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

interface ChangeHistoryItem {
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
  created_at: string; // ISO 8601
}

type EntityType = 'task' | 'objective' | 'key_result' | 'team' | 'organization';
type ActionType = 'create' | 'update' | 'delete' | 'status_change' | 'assign';
```

#### Example Request

```bash
curl -X GET \
  'https://api.example.com/api/change-history/task/550e8400-e29b-41d4-a716-446655440000?page=1&limit=20&action=update' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
```

#### Example Response

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
        "id": "user-uuid",
        "full_name": "علی احمدی",
        "email": "ali@example.com"
      },
      "created_at": "2024-01-15T10:30:00.000Z"
    },
    {
      "id": "223e4567-e89b-12d3-a456-426614174001",
      "entity_type": "task",
      "entity_id": "550e8400-e29b-41d4-a716-446655440000",
      "action": "assign",
      "field_name": "assignee",
      "old_value": null,
      "new_value": "user-uuid-2",
      "user": {
        "id": "user-uuid",
        "full_name": "علی احمدی",
        "email": "ali@example.com"
      },
      "created_at": "2024-01-15T09:15:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "total_pages": 3
  }
}
```

---

### 2. Get All History (Admin Only)

Retrieve system-wide change history. Requires admin role.

```http
GET /api/change-history
```

#### Query Parameters

Same as entity history endpoint, plus:

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `entityType` | string | No | - | Filter by entity type |

#### Response Schema

Same as entity history endpoint.

#### Authorization

Returns `403 Forbidden` if user is not admin.

---

### 3. Get Change Statistics (Admin Only)

Retrieve aggregated statistics about changes.

```http
GET /api/change-history/stats/summary
```

#### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `startDate` | string (ISO 8601) | No | - | Stats from this date |
| `endDate` | string (ISO 8601) | No | - | Stats until this date |

#### Response Schema

```typescript
interface ChangeStatsResponse {
  by_entity_type: Array<{
    entity_type: EntityType;
    count: number;
  }>;
  by_action: Array<{
    action: ActionType;
    count: number;
  }>;
  top_users: Array<{
    user: {
      id: string;
      full_name: string;
      email: string;
    };
    change_count: number;
  }>;
}
```

#### Example Response

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

---

## Error Responses

### Standard Error Format

```typescript
interface ErrorResponse {
  error: string;
}
```

### Common Error Codes

| Status Code | Description | Example |
|-------------|-------------|---------|
| 400 | Bad Request | Invalid entity type |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Entity not found |
| 500 | Internal Server Error | Database error |

#### Example Error Response

```json
{
  "error": "نوع موجودیت نامعتبر است"
}
```

---

## TypeScript Type Definitions

```typescript
// types/changeHistory.ts

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

export interface ChangeHistoryUser {
  id: string;
  full_name: string;
  email: string;
}

export interface ChangeHistoryItem {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  action: ActionType;
  field_name: string | null;
  old_value: any | null;
  new_value: any | null;
  user: ChangeHistoryUser;
  created_at: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface ChangeHistoryResponse {
  data: ChangeHistoryItem[];
  pagination: PaginationMeta;
}

export interface ChangeHistoryFilters {
  page?: number;
  limit?: number;
  action?: ActionType;
  userId?: string;
  startDate?: string;
  endDate?: string;
  entityType?: EntityType;
}

export interface ChangeStats {
  by_entity_type: Array<{
    entity_type: EntityType;
    count: number;
  }>;
  by_action: Array<{
    action: ActionType;
    count: number;
  }>;
  top_users: Array<{
    user: ChangeHistoryUser;
    change_count: number;
  }>;
}
```



---

## Implementation Guide

### API Client Service

```typescript
// services/changeHistoryService.ts
import axios, { AxiosInstance } from 'axios';
import {
  ChangeHistoryResponse,
  ChangeHistoryFilters,
  ChangeStats,
  EntityType
} from '../types/changeHistory';

class ChangeHistoryService {
  private api: AxiosInstance;

  constructor(baseURL: string = process.env.REACT_APP_API_URL || '') {
    this.api = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Request interceptor for auth token
    this.api.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Handle unauthorized - redirect to login
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  /**
   * Fetch change history for a specific entity
   */
  async getEntityHistory(
    entityType: EntityType,
    entityId: string,
    filters?: ChangeHistoryFilters
  ): Promise<ChangeHistoryResponse> {
    const { data } = await this.api.get<ChangeHistoryResponse>(
      `/api/change-history/${entityType}/${entityId}`,
      { params: filters }
    );
    return data;
  }

  /**
   * Fetch all change history (admin only)
   */
  async getAllHistory(
    filters?: ChangeHistoryFilters
  ): Promise<ChangeHistoryResponse> {
    const { data } = await this.api.get<ChangeHistoryResponse>(
      '/api/change-history',
      { params: filters }
    );
    return data;
  }

  /**
   * Fetch change statistics (admin only)
   */
  async getStats(
    startDate?: string,
    endDate?: string
  ): Promise<ChangeStats> {
    const { data } = await this.api.get<ChangeStats>(
      '/api/change-history/stats/summary',
      { params: { startDate, endDate } }
    );
    return data;
  }
}

export default new ChangeHistoryService();
```

---

### React Query Integration

```typescript
// hooks/useChangeHistory.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import changeHistoryService from '../services/changeHistoryService';
import {
  ChangeHistoryResponse,
  ChangeHistoryFilters,
  EntityType
} from '../types/changeHistory';

export const CHANGE_HISTORY_KEYS = {
  all: ['changeHistory'] as const,
  entity: (type: EntityType, id: string) => 
    [...CHANGE_HISTORY_KEYS.all, 'entity', type, id] as const,
  entityWithFilters: (type: EntityType, id: string, filters: ChangeHistoryFilters) =>
    [...CHANGE_HISTORY_KEYS.entity(type, id), filters] as const,
  stats: (startDate?: string, endDate?: string) =>
    [...CHANGE_HISTORY_KEYS.all, 'stats', { startDate, endDate }] as const,
};

interface UseChangeHistoryOptions extends Omit<UseQueryOptions<ChangeHistoryResponse>, 'queryKey' | 'queryFn'> {
  filters?: ChangeHistoryFilters;
}

export function useChangeHistory(
  entityType: EntityType,
  entityId: string,
  options?: UseChangeHistoryOptions
) {
  const { filters, ...queryOptions } = options || {};

  return useQuery({
    queryKey: CHANGE_HISTORY_KEYS.entityWithFilters(entityType, entityId, filters || {}),
    queryFn: () => changeHistoryService.getEntityHistory(entityType, entityId, filters),
    staleTime: 30000, // 30 seconds
    ...queryOptions
  });
}

export function useChangeHistoryStats(
  startDate?: string,
  endDate?: string,
  options?: Omit<UseQueryOptions, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: CHANGE_HISTORY_KEYS.stats(startDate, endDate),
    queryFn: () => changeHistoryService.getStats(startDate, endDate),
    staleTime: 60000, // 1 minute
    ...options
  });
}
```

---

### Redux Toolkit Integration

```typescript
// store/slices/changeHistorySlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import changeHistoryService from '../../services/changeHistoryService';
import {
  ChangeHistoryResponse,
  ChangeHistoryFilters,
  EntityType
} from '../../types/changeHistory';

interface ChangeHistoryState {
  items: ChangeHistoryResponse['data'];
  pagination: ChangeHistoryResponse['pagination'] | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChangeHistoryState = {
  items: [],
  pagination: null,
  loading: false,
  error: null
};

export const fetchChangeHistory = createAsyncThunk(
  'changeHistory/fetch',
  async (
    {
      entityType,
      entityId,
      filters
    }: {
      entityType: EntityType;
      entityId: string;
      filters?: ChangeHistoryFilters;
    },
    { rejectWithValue }
  ) => {
    try {
      return await changeHistoryService.getEntityHistory(
        entityType,
        entityId,
        filters
      );
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.error || 'Failed to fetch change history'
      );
    }
  }
);

const changeHistorySlice = createSlice({
  name: 'changeHistory',
  initialState,
  reducers: {
    clearHistory: (state) => {
      state.items = [];
      state.pagination = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChangeHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(
        fetchChangeHistory.fulfilled,
        (state, action: PayloadAction<ChangeHistoryResponse>) => {
          state.loading = false;
          state.items = action.payload.data;
          state.pagination = action.payload.pagination;
        }
      )
      .addCase(fetchChangeHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { clearHistory } = changeHistorySlice.actions;
export default changeHistorySlice.reducer;
```

---

## Component Architecture

### Recommended Structure

```
src/
├── features/
│   └── changeHistory/
│       ├── components/
│       │   ├── ChangeHistoryList.tsx
│       │   ├── ChangeHistoryItem.tsx
│       │   ├── ChangeHistoryFilters.tsx
│       │   ├── ChangeHistoryModal.tsx
│       │   └── ChangeHistoryButton.tsx
│       ├── hooks/
│       │   ├── useChangeHistory.ts
│       │   └── useChangeHistoryStats.ts
│       ├── utils/
│       │   ├── formatters.ts
│       │   └── constants.ts
│       └── types/
│           └── index.ts
├── services/
│   └── changeHistoryService.ts
└── types/
    └── changeHistory.ts
```

---

## Utility Functions

```typescript
// features/changeHistory/utils/formatters.ts
import { ActionType, EntityType } from '../../../types/changeHistory';

export const ACTION_LABELS: Record<ActionType, string> = {
  create: 'ایجاد شد',
  update: 'ویرایش شد',
  delete: 'حذف شد',
  status_change: 'وضعیت تغییر کرد',
  assign: 'تخصیص داده شد'
};

export const ACTION_ICONS: Record<ActionType, string> = {
  create: '➕',
  update: '✏️',
  delete: '🗑️',
  status_change: '🔄',
  assign: '👤'
};

export const ENTITY_LABELS: Record<EntityType, string> = {
  task: 'وظیفه',
  objective: 'هدف',
  key_result: 'نتیجه کلیدی',
  team: 'تیم',
  organization: 'سازمان'
};

export const FIELD_LABELS: Record<string, string> = {
  title: 'عنوان',
  description: 'توضیحات',
  status: 'وضعیت',
  type: 'نوع',
  assignee: 'مسئول',
  assigneeId: 'مسئول',
  dueDate: 'تاریخ سررسید',
  isApproved: 'تأیید',
  approvedById: 'تأیید کننده'
};

export function getActionLabel(action: ActionType): string {
  return ACTION_LABELS[action] || action;
}

export function getActionIcon(action: ActionType): string {
  return ACTION_ICONS[action] || '📝';
}

export function getFieldLabel(fieldName: string): string {
  return FIELD_LABELS[fieldName] || fieldName;
}

export function formatValue(value: any): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function getActionColor(action: ActionType): string {
  const colors: Record<ActionType, string> = {
    create: 'text-green-600 bg-green-50',
    update: 'text-blue-600 bg-blue-50',
    delete: 'text-red-600 bg-red-50',
    status_change: 'text-purple-600 bg-purple-50',
    assign: 'text-orange-600 bg-orange-50'
  };
  return colors[action] || 'text-gray-600 bg-gray-50';
}
```

---

## Performance Considerations

### 1. Pagination Strategy

Always use pagination for large datasets:

```typescript
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

// Implement infinite scroll or load more pattern
const { data, fetchNextPage, hasNextPage } = useInfiniteQuery({
  queryKey: ['changeHistory', entityType, entityId],
  queryFn: ({ pageParam = 1 }) =>
    changeHistoryService.getEntityHistory(entityType, entityId, {
      page: pageParam,
      limit: DEFAULT_PAGE_SIZE
    }),
  getNextPageParam: (lastPage) => {
    const { page, total_pages } = lastPage.pagination;
    return page < total_pages ? page + 1 : undefined;
  }
});
```

### 2. Caching Strategy

```typescript
// Cache for 30 seconds, refetch on window focus
const { data } = useChangeHistory(entityType, entityId, {
  staleTime: 30000,
  cacheTime: 300000, // 5 minutes
  refetchOnWindowFocus: true,
  refetchOnMount: false
});
```

### 3. Debounced Filters

```typescript
import { useDebouncedValue } from '@mantine/hooks';

const [filters, setFilters] = useState<ChangeHistoryFilters>({});
const [debouncedFilters] = useDebouncedValue(filters, 500);

const { data } = useChangeHistory(entityType, entityId, {
  filters: debouncedFilters
});
```

---

## Testing

### Unit Test Example

```typescript
// __tests__/changeHistoryService.test.ts
import { describe, it, expect, vi } from 'vitest';
import axios from 'axios';
import changeHistoryService from '../services/changeHistoryService';
import { EntityType } from '../types/changeHistory';

vi.mock('axios');

describe('ChangeHistoryService', () => {
  it('should fetch entity history', async () => {
    const mockResponse = {
      data: {
        data: [],
        pagination: { page: 1, limit: 20, total: 0, total_pages: 0 }
      }
    };

    (axios.create as any).mockReturnValue({
      get: vi.fn().mockResolvedValue(mockResponse),
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() }
      }
    });

    const result = await changeHistoryService.getEntityHistory(
      EntityType.TASK,
      'test-id'
    );

    expect(result).toEqual(mockResponse.data);
  });
});
```

---

## Best Practices

### 1. Error Handling

```typescript
const { data, error, isError } = useChangeHistory(entityType, entityId);

if (isError) {
  // Show user-friendly error message
  toast.error(error?.message || 'خطا در دریافت تاریخچه');
}
```

### 2. Loading States

```typescript
const { data, isLoading, isFetching } = useChangeHistory(entityType, entityId);

// Show skeleton on initial load
if (isLoading) return <ChangeHistorySkeleton />;

// Show subtle indicator on refetch
if (isFetching) return <RefetchIndicator />;
```

### 3. Optimistic Updates

When making changes to entities, invalidate the change history cache:

```typescript
import { useQueryClient } from '@tanstack/react-query';
import { CHANGE_HISTORY_KEYS } from '../hooks/useChangeHistory';

const queryClient = useQueryClient();

// After updating a task
await updateTask(taskId, updates);

// Invalidate change history
queryClient.invalidateQueries({
  queryKey: CHANGE_HISTORY_KEYS.entity(EntityType.TASK, taskId)
});
```

### 4. Access Control

```typescript
// Only show history button if user has permission
const canViewHistory = user.role === 'admin' || entity.createdById === user.id;

{canViewHistory && (
  <ChangeHistoryButton entityType="task" entityId={task.id} />
)}
```

---

## Accessibility

Ensure components are accessible:

```tsx
<button
  onClick={openHistory}
  aria-label="مشاهده تاریخچه تغییرات"
  aria-describedby="history-description"
>
  <HistoryIcon aria-hidden="true" />
  تاریخچه
</button>

<div id="history-description" className="sr-only">
  مشاهده تمام تغییرات انجام شده روی این {entityLabel}
</div>
```

---

## Internationalization (i18n)

```typescript
// i18n/fa/changeHistory.json
{
  "actions": {
    "create": "ایجاد شد",
    "update": "ویرایش شد",
    "delete": "حذف شد",
    "status_change": "وضعیت تغییر کرد",
    "assign": "تخصیص داده شد"
  },
  "fields": {
    "title": "عنوان",
    "description": "توضیحات",
    "status": "وضعیت"
  },
  "errors": {
    "fetch_failed": "خطا در دریافت تاریخچه",
    "unauthorized": "شما مجوز مشاهده تاریخچه را ندارید"
  }
}
```

---

## Additional Resources

- [React Query Documentation](https://tanstack.com/query/latest)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/)
- [Axios Documentation](https://axios-http.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
