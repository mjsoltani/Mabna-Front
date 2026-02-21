import { useState } from 'react';
import {
  getActionIcon,
  getActionLabel,
  getActionColor,
  getFieldLabel,
  formatValue,
  formatRelativeTime,
  formatDateTime,
  getInitials
} from '../utils/changeHistoryFormatters';
import { ActionType } from '../types/changeHistory';

function ChangeHistoryItem({ item, isFirst = false }) {
  const [showDetails, setShowDetails] = useState(false);

  const renderValueChange = () => {
    if (item.action === ActionType.CREATE) {
      return (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
            ایجاد شد
          </span>
        </div>
      );
    }

    if (item.action === ActionType.DELETE) {
      return (
        <div className="mt-2">
          <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
            حذف شد
          </span>
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
          {item.old_value !== null && item.old_value !== undefined && (
            <>
              <span className="px-2 py-1 bg-red-50 text-red-700 rounded line-through text-xs">
                {formatValue(item.old_value)}
              </span>
              <span className="text-gray-400">←</span>
            </>
          )}
          <span className="px-2 py-1 bg-green-50 text-green-700 rounded font-medium text-xs">
            {formatValue(item.new_value)}
          </span>
        </div>
      </div>
    );
  };

  const hasDetailedData = 
    (item.action === ActionType.CREATE && item.new_value) ||
    (item.action === ActionType.DELETE && item.old_value);

  return (
    <div className="relative flex gap-4 pb-4">
      {/* Timeline dot */}
      <div className="relative z-10 flex-shrink-0">
        <div
          className={`
            w-8 h-8 rounded-full flex items-center justify-center text-lg border-2
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
            {/* User Avatar */}
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {getInitials(item.user.full_name)}
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
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
            title={formatDateTime(item.created_at)}
          >
            {formatRelativeTime(item.created_at)}
          </time>
        </div>

        {/* Value change */}
        {renderValueChange()}

        {/* Detailed data toggle */}
        {hasDetailedData && (
          <div className="mt-3">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded px-2 py-1"
            >
              {showDetails ? '▼ پنهان کردن جزئیات' : '▶ مشاهده جزئیات'}
            </button>

            {showDetails && (
              <pre className="mt-2 p-3 bg-gray-50 rounded-md text-xs overflow-x-auto border border-gray-200 max-h-64 overflow-y-auto">
                {JSON.stringify(
                  item.action === ActionType.CREATE ? item.new_value : item.old_value,
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

export default ChangeHistoryItem;
