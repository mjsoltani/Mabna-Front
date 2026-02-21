import { ActionType, EntityType } from '../types/changeHistory';

export const ACTION_LABELS = {
  [ActionType.CREATE]: 'ایجاد شد',
  [ActionType.UPDATE]: 'ویرایش شد',
  [ActionType.DELETE]: 'حذف شد',
  [ActionType.STATUS_CHANGE]: 'وضعیت تغییر کرد',
  [ActionType.ASSIGN]: 'تخصیص داده شد'
};

export const ACTION_ICONS = {
  [ActionType.CREATE]: '➕',
  [ActionType.UPDATE]: '✏️',
  [ActionType.DELETE]: '🗑️',
  [ActionType.STATUS_CHANGE]: '🔄',
  [ActionType.ASSIGN]: '👤'
};

export const ENTITY_LABELS = {
  [EntityType.TASK]: 'وظیفه',
  [EntityType.OBJECTIVE]: 'هدف',
  [EntityType.KEY_RESULT]: 'شاخص کلیدی',
  [EntityType.TEAM]: 'تیم',
  [EntityType.ORGANIZATION]: 'سازمان'
};

export const FIELD_LABELS = {
  title: 'عنوان',
  description: 'توضیحات',
  status: 'وضعیت',
  type: 'نوع',
  assignee: 'مسئول',
  assigneeId: 'مسئول',
  dueDate: 'تاریخ سررسید',
  isApproved: 'تأیید',
  approvedById: 'تأیید کننده',
  startDate: 'تاریخ شروع',
  endDate: 'تاریخ پایان',
  initialValue: 'مقدار اولیه',
  targetValue: 'مقدار هدف',
  progress: 'پیشرفت'
};

export const STATUS_LABELS = {
  todo: 'انجام نشده',
  in_progress: 'در حال انجام',
  done: 'انجام شده',
  blocked: 'مسدود شده'
};

export function getActionLabel(action) {
  return ACTION_LABELS[action] || action;
}

export function getActionIcon(action) {
  return ACTION_ICONS[action] || '📝';
}

export function getEntityLabel(entityType) {
  return ENTITY_LABELS[entityType] || entityType;
}

export function getFieldLabel(fieldName) {
  return FIELD_LABELS[fieldName] || fieldName;
}

export function formatValue(value) {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? 'بله' : 'خیر';
  if (typeof value === 'string' && STATUS_LABELS[value]) {
    return STATUS_LABELS[value];
  }
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }
  return String(value);
}

export function getActionColor(action) {
  const colors = {
    [ActionType.CREATE]: 'text-green-600 bg-green-50 border-green-200',
    [ActionType.UPDATE]: 'text-blue-600 bg-blue-50 border-blue-200',
    [ActionType.DELETE]: 'text-red-600 bg-red-50 border-red-200',
    [ActionType.STATUS_CHANGE]: 'text-purple-600 bg-purple-50 border-purple-200',
    [ActionType.ASSIGN]: 'text-orange-600 bg-orange-50 border-orange-200'
  };
  return colors[action] || 'text-gray-600 bg-gray-50 border-gray-200';
}

export function getInitials(name) {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export function formatRelativeTime(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) return 'همین الان';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} دقیقه پیش`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} ساعت پیش`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} روز پیش`;
  
  return date.toLocaleDateString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function formatDateTime(dateString) {
  const date = new Date(dateString);
  return date.toLocaleString('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}
