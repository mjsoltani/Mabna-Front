# Change History UI/UX Implementation Guide

## Component Library

Complete, production-ready React components for change history feature.

---

## Core Components

### 1. ChangeHistoryList

Main container component for displaying change history.

```tsx
// features/changeHistory/components/ChangeHistoryList.tsx
import React, { useState } from 'react';
import { useChangeHistory } from '../hooks/useChangeHistory';
import { EntityType, ChangeHistoryFilters } from '../../../types/changeHistory';
import ChangeHistoryItem from './ChangeHistoryItem';
import ChangeHistoryFilters from './ChangeHistoryFilters';
import Pagination from '../../../components/common/Pagination';
import EmptyState from '../../../components/common/EmptyState';
import ErrorState from '../../../components/common/ErrorState';
import LoadingSkeleton from './ChangeHistorySkeleton';

interface ChangeHistoryListProps {
  entityType: EntityType;
  entityId: string;
  className?: string;
}

export default function ChangeHistoryList({
  entityType,
  entityId,
  className = ''
}: ChangeHistoryListProps) {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Omit<ChangeHistoryFilters, 'page' | 'limit'>>({});

  const { data, isLoading, isError, error } = useChangeHistory(entityType, entityId, {
    filters: { ...filters, page, limit: 20 }
  });

  if (isLoading) {
    return <LoadingSkeleton count={5} />;
  }

  if (isError) {
    return (
      <ErrorState
        title="خطا در بارگذاری تاریخچه"
        message={error?.message || 'لطفاً دوباره تلاش کنید'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <EmptyState
        icon="📜"
        title="تاریخچه‌ای یافت نشد"
        description="هنوز هیچ تغییری ثبت نشده است"
      />
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Filters */}
      <ChangeHistoryFilters
        filters={filters}
        onFiltersChange={setFilters}
        onReset={() => {
          setFilters({});
          setPage(1);
        }}
      />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Items */}
        <div className="space-y-4">
          {data.data.map((item, index) => (
            <ChangeHistoryItem
              key={item.id}
              item={item}
              isFirst={index === 0}
              isLast={index === data.data.length - 1}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.total_pages > 1 && (
        <Pagination
          currentPage={data.pagination.page}
          totalPages={data.pagination.total_pages}
          totalItems={data.pagination.total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
```

---

### 2. ChangeHistoryItem

Individual history item with timeline design.

```tsx
// features/changeHistory/components/ChangeHistoryItem.tsx
import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { faIR } from 'date-fns/locale';
import { ChangeHistoryItem as HistoryItem } from '../../../types/changeHistory';
import {
  getActionIcon,
  getActionLabel,
  getActionColor,
  getFieldLabel,
  formatValue
} from '../utils/formatters';
import UserAvatar from '../../../components/common/UserAvatar';
import Badge from '../../../components/common/Badge';

interface ChangeHistoryItemProps {
  item: HistoryItem;
  isFirst?: boolean;
  isLast?: boolean;
}

export default function ChangeHistoryItem({
  item,
  isFirst = false,
  isLast = false
}: ChangeHistoryItemProps) {
  const [showDetails, setShowDetails] = useState(false);

  const renderValueChange = () => {
    if (item.action === 'create') {
      return (
        <div className="mt-2">
          <Badge variant="success" size="sm">
            ایجاد شد
          </Badge>
        </div>
      );
    }

    if (item.action === 'delete') {
      return (
        <div className="mt-2">
          <Badge variant="danger" size="sm">
            حذف شد
          </Badge>
        </div>
      );
    }

    if (!item.field_name) return null;

    return (
      <div className="mt-2 text-sm">
        <span className="font-medium text-gray-700">
          {getFieldLabel(item.field_name)}:
        </span>
        <div className="mt-1 flex items-center gap-2 flex-wrap">
          {item.old_value !== null && (
            <>
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded line-through">
                {formatValue(item.old_value)}
              </span>
              <span className="text-gray-400">→</span>
            </>
          )}
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-medium">
            {formatValue(item.new_value)}
          </span>
        </div>
      </div>
    );
  };

  const hasDetailedData = 
    (item.action === 'create' && item.new_value) ||
    (item.action === 'delete' && item.old_value);

  return (
    <div className="relative flex gap-4 pb-4">
      {/* Timeline dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-lg
            ${getActionColor(item.action)}
            ${isFirst ? 'ring-4 ring-blue-100' : ''}
          `}
        >
          {getActionIcon(item.action)}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserAvatar
              name={item.user.full_name}
              size="sm"
              src={undefined} // Add avatar URL if available
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900">
                  {item.user.full_name}
                </span>
                <span className="text-gray-500 text-sm">
                  {getActionLabel(item.action)}
                </span>
              </div>
              <span className="text-xs text-gray-400">
                {item.user.email}
              </span>
            </div>
          </div>

          <time
            className="text-sm text-gray-500 whitespace-nowrap"
            dateTime={item.created_at}
            title={new Date(item.created_at).toLocaleString('fa-IR')}
          >
            {formatDistanceToNow(new Date(item.created_at), {
              addSuffix: true,
              locale: faIR
            })}
          </time>
        </div>

        {/* Value change */}
        {renderValueChange()}

        {/* Detailed data toggle */}
        {hasDetailedData && (
          <div className="mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded"
            >
              {showDetails ? '▼ پنهان کردن جزئیات' : '▶ مشاهده جزئیات'}
            </button>

            {showDetails && (
              <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-x-auto border border-gray-200">
                {JSON.stringify(
                  item.action === 'create' ? item.new_value : item.old_value,
                  null,
                  2
                )}
              </pre>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
```

---

### 3. ChangeHistoryFilters

Advanced filtering component.

```tsx
// features/changeHistory/components/ChangeHistoryFilters.tsx
import React from 'react';
import { ActionType, ChangeHistoryFilters as Filters } from '../../../types/changeHistory';
import { getActionLabel } from '../utils/formatters';

interface ChangeHistoryFiltersProps {
  filters: Omit<Filters, 'page' | 'limit'>;
  onFiltersChange: (filters: Omit<Filters, 'page' | 'limit'>) => void;
  onReset: () => void;
}

export default function ChangeHistoryFilters({
  filters,
  onFiltersChange,
  onReset
}: ChangeHistoryFiltersProps) {
  const actionOptions: Array<{ value: ActionType | ''; label: string }> = [
    { value: '', label: 'همه عملیات' },
    { value: ActionType.CREATE, label: getActionLabel(ActionType.CREATE) },
    { value: ActionType.UPDATE, label: getActionLabel(ActionType.UPDATE) },
    { value: ActionType.DELETE, label: getActionLabel(ActionType.DELETE) },
    { value: ActionType.STATUS_CHANGE, label: getActionLabel(ActionType.STATUS_CHANGE) },
    { value: ActionType.ASSIGN, label: getActionLabel(ActionType.ASSIGN) }
  ];

  const handleChange = (key: keyof Omit<Filters, 'page' | 'limit'>, value: any) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '');

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">فیلترها</h3>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            پاک کردن همه
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Action filter */}
        <div>
          <label
            htmlFor="action-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            نوع عملیات
          </label>
          <select
            id="action-filter"
            value={filters.action || ''}
            onChange={(e) => handleChange('action', e.target.value as ActionType)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            {actionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Start date filter */}
        <div>
          <label
            htmlFor="start-date-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            از تاریخ
          </label>
          <input
            id="start-date-filter"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* End date filter */}
        <div>
          <label
            htmlFor="end-date-filter"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            تا تاریخ
          </label>
          <input
            id="end-date-filter"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleChange('endDate', e.target.value)}
            min={filters.startDate}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters.action && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {getActionLabel(filters.action as ActionType)}
              <button
                onClick={() => handleChange('action', undefined)}
                className="hover:text-blue-900"
                aria-label="حذف فیلتر"
              >
                ×
              </button>
            </span>
          )}
          {filters.startDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              از: {new Date(filters.startDate).toLocaleDateString('fa-IR')}
              <button
                onClick={() => handleChange('startDate', undefined)}
                className="hover:text-blue-900"
                aria-label="حذف فیلتر"
              >
                ×
              </button>
            </span>
          )}
          {filters.endDate && (
            <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              تا: {new Date(filters.endDate).toLocaleDateString('fa-IR')}
              <button
                onClick={() => handleChange('endDate', undefined)}
                className="hover:text-blue-900"
                aria-label="حذف فیلتر"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
```



---

### 4. ChangeHistoryModal

Modal wrapper for displaying history.

```tsx
// features/changeHistory/components/ChangeHistoryModal.tsx
import React from 'react';
import { EntityType } from '../../../types/changeHistory';
import { getEntityLabel } from '../utils/formatters';
import Modal from '../../../components/common/Modal';
import ChangeHistoryList from './ChangeHistoryList';

interface ChangeHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: EntityType;
  entityId: string;
  entityTitle?: string;
}

export default function ChangeHistoryModal({
  isOpen,
  onClose,
  entityType,
  entityId,
  entityTitle
}: ChangeHistoryModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <span className="text-2xl">📜</span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              تاریخچه تغییرات
            </h2>
            {entityTitle && (
              <p className="text-sm text-gray-500 mt-1">
                {getEntityLabel(entityType)}: {entityTitle}
              </p>
            )}
          </div>
        </div>
      }
      size="xl"
      className="max-h-[85vh]"
    >
      <div className="overflow-y-auto max-h-[calc(85vh-120px)] px-1">
        <ChangeHistoryList
          entityType={entityType}
          entityId={entityId}
        />
      </div>
    </Modal>
  );
}
```

---

### 5. ChangeHistoryButton

Trigger button component.

```tsx
// features/changeHistory/components/ChangeHistoryButton.tsx
import React, { useState } from 'react';
import { EntityType } from '../../../types/changeHistory';
import ChangeHistoryModal from './ChangeHistoryModal';
import Button from '../../../components/common/Button';
import { HistoryIcon } from '../../../components/icons';

interface ChangeHistoryButtonProps {
  entityType: EntityType;
  entityId: string;
  entityTitle?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function ChangeHistoryButton({
  entityType,
  entityId,
  entityTitle,
  variant = 'secondary',
  size = 'md',
  className = ''
}: ChangeHistoryButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsModalOpen(true)}
        className={className}
        leftIcon={<HistoryIcon />}
      >
        تاریخچه تغییرات
      </Button>

      <ChangeHistoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        entityType={entityType}
        entityId={entityId}
        entityTitle={entityTitle}
      />
    </>
  );
}
```

---

### 6. ChangeHistorySkeleton

Loading state component.

```tsx
// features/changeHistory/components/ChangeHistorySkeleton.tsx
import React from 'react';

interface ChangeHistorySkeletonProps {
  count?: number;
}

export default function ChangeHistorySkeleton({ count = 5 }: ChangeHistorySkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="relative flex gap-4 pb-4 animate-pulse">
          {/* Timeline dot skeleton */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
          </div>

          {/* Content skeleton */}
          <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-8 h-8 rounded-full bg-gray-200" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3" />
                  <div className="h-3 bg-gray-200 rounded w-1/4" />
                </div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
            <div className="mt-3 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-1/4" />
              <div className="h-8 bg-gray-200 rounded w-2/3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Usage Examples

### Basic Usage

```tsx
// In a task detail page
import ChangeHistoryButton from '../features/changeHistory/components/ChangeHistoryButton';
import { EntityType } from '../types/changeHistory';

function TaskDetailPage({ task }) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <h1>{task.title}</h1>
        <ChangeHistoryButton
          entityType={EntityType.TASK}
          entityId={task.id}
          entityTitle={task.title}
        />
      </div>
      {/* Rest of task details */}
    </div>
  );
}
```

### Inline History Display

```tsx
// Show history directly in a tab or section
import ChangeHistoryList from '../features/changeHistory/components/ChangeHistoryList';

function TaskDetailTabs({ task }) {
  return (
    <Tabs>
      <Tab label="جزئیات">
        {/* Task details */}
      </Tab>
      <Tab label="تاریخچه">
        <ChangeHistoryList
          entityType={EntityType.TASK}
          entityId={task.id}
        />
      </Tab>
    </Tabs>
  );
}
```

### Admin Dashboard

```tsx
// Admin view with stats
import { useChangeHistoryStats } from '../features/changeHistory/hooks/useChangeHistory';

function AdminDashboard() {
  const { data: stats } = useChangeHistoryStats();

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats?.by_entity_type.map((item) => (
        <StatCard
          key={item.entity_type}
          title={getEntityLabel(item.entity_type)}
          value={item.count}
        />
      ))}
    </div>
  );
}
```

---

## Styling Guidelines

### Color Palette

```css
/* Action colors */
.action-create { @apply text-green-600 bg-green-50; }
.action-update { @apply text-blue-600 bg-blue-50; }
.action-delete { @apply text-red-600 bg-red-50; }
.action-status-change { @apply text-purple-600 bg-purple-50; }
.action-assign { @apply text-orange-600 bg-orange-50; }

/* Timeline */
.timeline-line { @apply bg-gray-200; }
.timeline-dot { @apply bg-white border-2 border-gray-300; }
.timeline-dot-active { @apply border-blue-500 ring-4 ring-blue-100; }

/* Value changes */
.value-old { @apply bg-red-50 text-red-700 line-through; }
.value-new { @apply bg-green-50 text-green-700 font-medium; }
```

### Responsive Design

```tsx
// Mobile-first approach
<div className="
  grid grid-cols-1 gap-4
  md:grid-cols-2
  lg:grid-cols-3
">
  {/* Filters */}
</div>

// Hide timeline on mobile
<div className="
  hidden md:block
  absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200
">
  {/* Timeline line */}
</div>
```

---

## Animation & Transitions

### Smooth Transitions

```tsx
// Fade in animation for items
<div className="
  opacity-0 animate-fade-in
  transition-all duration-300
">
  {/* Content */}
</div>

// Tailwind config
module.exports = {
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
};
```

### Loading States

```tsx
// Skeleton with pulse animation
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
  <div className="h-4 bg-gray-200 rounded w-1/2" />
</div>
```

---

## Accessibility Checklist

- ✅ Keyboard navigation support
- ✅ ARIA labels for all interactive elements
- ✅ Focus indicators
- ✅ Screen reader friendly
- ✅ Semantic HTML
- ✅ Color contrast ratios (WCAG AA)
- ✅ Skip links for long lists
- ✅ Descriptive button labels

### Example Implementation

```tsx
<button
  onClick={openHistory}
  aria-label="مشاهده تاریخچه تغییرات این وظیفه"
  aria-describedby="history-tooltip"
  className="focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  <HistoryIcon aria-hidden="true" />
  <span className="sr-only">تاریخچه</span>
</button>

<div id="history-tooltip" role="tooltip" className="sr-only">
  مشاهده تمام تغییرات انجام شده روی این وظیفه
</div>
```

---

## Performance Optimization

### 1. Virtual Scrolling

For very long history lists:

```tsx
import { useVirtualizer } from '@tanstack/react-virtual';

function VirtualizedHistoryList({ items }) {
  const parentRef = React.useRef();

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
  });

  return (
    <div ref={parentRef} style={{ height: '600px', overflow: 'auto' }}>
      <div style={{ height: `${virtualizer.getTotalSize()}px` }}>
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            <ChangeHistoryItem item={items[virtualItem.index]} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 2. Lazy Loading Images

```tsx
<img
  src={user.avatar}
  alt={user.full_name}
  loading="lazy"
  className="w-8 h-8 rounded-full"
/>
```

### 3. Memoization

```tsx
const ChangeHistoryItem = React.memo(({ item }) => {
  // Component implementation
}, (prevProps, nextProps) => {
  return prevProps.item.id === nextProps.item.id;
});
```

---

## Dark Mode Support

```tsx
// Using Tailwind dark mode
<div className="
  bg-white dark:bg-gray-800
  text-gray-900 dark:text-gray-100
  border-gray-200 dark:border-gray-700
">
  {/* Content */}
</div>

// Action colors in dark mode
<div className="
  text-green-600 dark:text-green-400
  bg-green-50 dark:bg-green-900/20
">
  {/* Action badge */}
</div>
```

---

## Testing Recommendations

### Component Tests

```tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ChangeHistoryButton from '../ChangeHistoryButton';

describe('ChangeHistoryButton', () => {
  it('opens modal on click', async () => {
    const user = userEvent.setup();
    const queryClient = new QueryClient();

    render(
      <QueryClientProvider client={queryClient}>
        <ChangeHistoryButton
          entityType="task"
          entityId="test-id"
          entityTitle="Test Task"
        />
      </QueryClientProvider>
    );

    const button = screen.getByRole('button', { name: /تاریخچه تغییرات/i });
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

```tsx
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
  rest.get('/api/change-history/task/:id', (req, res, ctx) => {
    return res(
      ctx.json({
        data: [
          {
            id: '1',
            action: 'update',
            field_name: 'status',
            old_value: 'todo',
            new_value: 'done',
            user: { id: '1', full_name: 'Test User', email: 'test@test.com' },
            created_at: new Date().toISOString()
          }
        ],
        pagination: { page: 1, limit: 20, total: 1, total_pages: 1 }
      })
    );
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Storybook Stories

```tsx
// ChangeHistoryItem.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import ChangeHistoryItem from './ChangeHistoryItem';
import { ActionType, EntityType } from '../../../types/changeHistory';

const meta: Meta<typeof ChangeHistoryItem> = {
  title: 'Features/ChangeHistory/ChangeHistoryItem',
  component: ChangeHistoryItem,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ChangeHistoryItem>;

export const UpdateAction: Story = {
  args: {
    item: {
      id: '1',
      entity_type: EntityType.TASK,
      entity_id: 'task-1',
      action: ActionType.UPDATE,
      field_name: 'status',
      old_value: 'todo',
      new_value: 'in_progress',
      user: {
        id: 'user-1',
        full_name: 'علی احمدی',
        email: 'ali@example.com'
      },
      created_at: new Date().toISOString()
    }
  }
};

export const CreateAction: Story = {
  args: {
    item: {
      id: '2',
      entity_type: EntityType.TASK,
      entity_id: 'task-2',
      action: ActionType.CREATE,
      field_name: null,
      old_value: null,
      new_value: { title: 'New Task', status: 'todo' },
      user: {
        id: 'user-1',
        full_name: 'علی احمدی',
        email: 'ali@example.com'
      },
      created_at: new Date().toISOString()
    }
  }
};
```

---

## Common Patterns

### 1. Conditional Rendering Based on Permissions

```tsx
function TaskActions({ task, user }) {
  const canViewHistory = 
    user.role === 'admin' || 
    task.createdById === user.id;

  return (
    <div className="flex gap-2">
      {canViewHistory && (
        <ChangeHistoryButton
          entityType={EntityType.TASK}
          entityId={task.id}
          entityTitle={task.title}
        />
      )}
    </div>
  );
}
```

### 2. Real-time Updates with WebSocket

```tsx
import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { CHANGE_HISTORY_KEYS } from '../hooks/useChangeHistory';

function useRealtimeHistory(entityType: EntityType, entityId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const ws = new WebSocket('ws://localhost:3000');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'change_history_update' && 
          data.entityType === entityType && 
          data.entityId === entityId) {
        // Invalidate and refetch
        queryClient.invalidateQueries({
          queryKey: CHANGE_HISTORY_KEYS.entity(entityType, entityId)
        });
      }
    };

    return () => ws.close();
  }, [entityType, entityId, queryClient]);
}
```

### 3. Export History

```tsx
function ExportHistoryButton({ entityType, entityId }) {
  const handleExport = async () => {
    const data = await changeHistoryService.getEntityHistory(
      entityType,
      entityId,
      { limit: 1000 } // Get all
    );

    const csv = convertToCSV(data.data);
    downloadFile(csv, `history-${entityId}.csv`);
  };

  return (
    <Button onClick={handleExport} leftIcon={<DownloadIcon />}>
      دانلود تاریخچه
    </Button>
  );
}
```

---

## Troubleshooting

### Common Issues

1. **History not loading**
   - Check authentication token
   - Verify entity ID is valid UUID
   - Check network tab for API errors

2. **Pagination not working**
   - Ensure page state is managed correctly
   - Check if total_pages > 1

3. **Filters not applying**
   - Verify filter values are in correct format
   - Check if debouncing is working

4. **Performance issues**
   - Implement virtual scrolling for long lists
   - Use React.memo for items
   - Optimize re-renders with proper keys

---

## Additional Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Query DevTools](https://tanstack.com/query/latest/docs/react/devtools)
- [Storybook Best Practices](https://storybook.js.org/docs/react/writing-stories/introduction)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
