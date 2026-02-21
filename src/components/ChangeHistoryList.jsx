import { useState, useEffect } from 'react';
import changeHistoryService from '../services/changeHistoryService';
import ChangeHistoryItem from './ChangeHistoryItem';
import ChangeHistoryFilters from './ChangeHistoryFilters';

function ChangeHistoryList({ entityType, entityId }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchHistory();
  }, [entityType, entityId, page, filters]);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await changeHistoryService.getEntityHistory(
        entityType,
        entityId,
        { ...filters, page, limit: 20 }
      );
      setData(response);
    } catch (err) {
      setError(err.message || 'خطا در بارگذاری تاریخچه');
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1); // Reset to first page when filters change
  };

  const handleResetFilters = () => {
    setFilters({});
    setPage(1);
  };

  if (loading && !data) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse flex gap-4">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex justify-between mb-3">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-gray-200" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                    <div className="h-3 bg-gray-200 rounded w-1/4" />
                  </div>
                </div>
                <div className="h-3 bg-gray-200 rounded w-20" />
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-8 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-5xl mb-4">⚠️</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          خطا در بارگذاری تاریخچه
        </h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchHistory}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          تلاش مجدد
        </button>
      </div>
    );
  }

  if (!data?.data || data.data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 text-5xl mb-4">📜</div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          تاریخچه‌ای یافت نشد
        </h3>
        <p className="text-gray-600">
          هنوز هیچ تغییری ثبت نشده است
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <ChangeHistoryFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
      />

      {/* Timeline */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute right-4 top-0 bottom-0 w-0.5 bg-gray-200" />

        {/* Items */}
        <div className="space-y-4">
          {data.data.map((item, index) => (
            <ChangeHistoryItem
              key={item.id}
              item={item}
              isFirst={index === 0}
            />
          ))}
        </div>
      </div>

      {/* Pagination */}
      {data.pagination && data.pagination.total_pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-700">
            نمایش {((page - 1) * data.pagination.limit) + 1} تا{' '}
            {Math.min(page * data.pagination.limit, data.pagination.total)} از{' '}
            {data.pagination.total} مورد
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              قبلی
            </button>
            
            <span className="px-4 py-2 text-sm text-gray-700">
              صفحه {page} از {data.pagination.total_pages}
            </span>
            
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page === data.pagination.total_pages}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              بعدی
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ChangeHistoryList;
