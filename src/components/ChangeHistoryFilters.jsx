import { ActionType } from '../types/changeHistory';
import { getActionLabel } from '../utils/changeHistoryFormatters';

function ChangeHistoryFilters({ filters, onFiltersChange, onReset }) {
  const actionOptions = [
    { value: '', label: 'همه عملیات' },
    { value: ActionType.CREATE, label: getActionLabel(ActionType.CREATE) },
    { value: ActionType.UPDATE, label: getActionLabel(ActionType.UPDATE) },
    { value: ActionType.DELETE, label: getActionLabel(ActionType.DELETE) },
    { value: ActionType.STATUS_CHANGE, label: getActionLabel(ActionType.STATUS_CHANGE) },
    { value: ActionType.ASSIGN, label: getActionLabel(ActionType.ASSIGN) }
  ];

  const handleChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value || undefined
    });
  };

  const hasActiveFilters = Object.values(filters).some(
    v => v !== undefined && v !== '' && v !== null
  );

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
            onChange={(e) => handleChange('action', e.target.value)}
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
              {getActionLabel(filters.action)}
              <button
                onClick={() => handleChange('action', undefined)}
                className="hover:text-blue-900 font-bold"
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
                className="hover:text-blue-900 font-bold"
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
                className="hover:text-blue-900 font-bold"
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

export default ChangeHistoryFilters;
