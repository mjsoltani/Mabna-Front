import { useState } from 'react';
import { Filter, X, ChevronDown, ChevronUp } from 'lucide-react';
import './label-filter.css';

function LabelFilter({ 
  labels = [], 
  selectedLabels = [], 
  onFilterChange,
  operator = 'OR', // 'AND' یا 'OR'
  onOperatorChange 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // فیلتر labels بر اساس جستجو
  const filteredLabels = labels.filter(label =>
    label.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleLabelToggle = (labelId) => {
    const newFilter = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    onFilterChange(newFilter);
  };

  const clearAllFilters = () => {
    onFilterChange([]);
    setSearchTerm('');
  };

  const hasActiveFilters = selectedLabels.length > 0;

  return (
    <div className="label-filter">
      <div className="filter-header" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="filter-title">
          <Filter className="w-4 h-4" />
          <span>فیلتر برچسب‌ها</span>
          {hasActiveFilters && (
            <span className="active-count">({selectedLabels.length})</span>
          )}
        </div>
        <div className="filter-controls">
          {hasActiveFilters && (
            <button
              type="button"
              className="clear-filters-btn"
              onClick={(e) => {
                e.stopPropagation();
                clearAllFilters();
              }}
              title="پاک کردن همه فیلترها"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4" />
          ) : (
            <ChevronDown className="w-4 h-4" />
          )}
        </div>
      </div>

      {isExpanded && (
        <div className="filter-content">
          {/* جستجو در labels */}
          {labels.length > 5 && (
            <div className="search-box">
              <input
                type="text"
                placeholder="جستجو در برچسب‌ها..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          )}

          {/* انتخاب نوع فیلتر */}
          {selectedLabels.length > 1 && onOperatorChange && (
            <div className="operator-selector">
              <span className="operator-label">نوع فیلتر:</span>
              <div className="operator-buttons">
                <button
                  type="button"
                  className={`operator-btn ${operator === 'OR' ? 'active' : ''}`}
                  onClick={() => onOperatorChange('OR')}
                  title="نمایش وظایف که حداقل یکی از برچسب‌ها را دارند"
                >
                  یا (OR)
                </button>
                <button
                  type="button"
                  className={`operator-btn ${operator === 'AND' ? 'active' : ''}`}
                  onClick={() => onOperatorChange('AND')}
                  title="نمایش وظایف که همه برچسب‌ها را دارند"
                >
                  و (AND)
                </button>
              </div>
            </div>
          )}

          {/* لیست labels */}
          <div className="filter-labels">
            <button
              type="button"
              className={`filter-btn all-btn ${selectedLabels.length === 0 ? 'active' : ''}`}
              onClick={() => onFilterChange([])}
            >
              همه وظایف
              <span className="total-count">({labels.reduce((sum, label) => sum + (label.usage_count || 0), 0)})</span>
            </button>

            {filteredLabels.map(label => (
              <button
                key={label.id}
                type="button"
                className={`filter-btn label-btn ${selectedLabels.includes(label.id) ? 'active' : ''}`}
                onClick={() => handleLabelToggle(label.id)}
                title={label.description || label.name}
              >
                <span 
                  className="label-color" 
                  style={{ backgroundColor: label.color }}
                />
                <span className="label-name">{label.name}</span>
                {label.usage_count > 0 && (
                  <span className="usage-count">({label.usage_count})</span>
                )}
              </button>
            ))}

            {filteredLabels.length === 0 && searchTerm && (
              <div className="no-results">
                <p>هیچ برچسبی یافت نشد</p>
              </div>
            )}
          </div>

          {/* نمایش برچسب‌های انتخاب شده */}
          {hasActiveFilters && (
            <div className="selected-labels">
              <div className="selected-header">
                <span>برچسب‌های انتخاب شده:</span>
                <button
                  type="button"
                  className="clear-selected-btn"
                  onClick={clearAllFilters}
                >
                  پاک کردن همه
                </button>
              </div>
              <div className="selected-items">
                {selectedLabels.map(labelId => {
                  const label = labels.find(l => l.id === labelId);
                  if (!label) return null;
                  
                  return (
                    <span
                      key={labelId}
                      className="selected-label"
                      style={{ 
                        backgroundColor: label.color,
                        color: getContrastColor(label.color)
                      }}
                    >
                      {label.name}
                      <button
                        type="button"
                        className="remove-selected-btn"
                        onClick={() => handleLabelToggle(labelId)}
                        title={`حذف ${label.name}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// تابع برای تشخیص رنگ متن
function getContrastColor(hexColor) {
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default LabelFilter;