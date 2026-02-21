import { X } from 'lucide-react';
import './task-labels.css';

function TaskLabels({ 
  labels = [], 
  onRemoveLabel, 
  showRemove = false, 
  size = 'small',
  maxDisplay = null 
}) {
  if (!labels || labels.length === 0) return null;

  const displayLabels = maxDisplay ? labels.slice(0, maxDisplay) : labels;
  const remainingCount = maxDisplay && labels.length > maxDisplay ? labels.length - maxDisplay : 0;

  return (
    <div className={`task-labels task-labels-${size}`}>
      {displayLabels.map(label => (
        <span
          key={label.id}
          className="task-label"
          style={{ 
            backgroundColor: label.color,
            color: getContrastColor(label.color)
          }}
          title={label.description || label.name}
        >
          {label.name}
          {showRemove && onRemoveLabel && (
            <button
              type="button"
              className="remove-label-btn"
              onClick={(e) => {
                e.stopPropagation();
                onRemoveLabel(label.id);
              }}
              title={`حذف برچسب ${label.name}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
      
      {remainingCount > 0 && (
        <span className="remaining-labels" title={`${remainingCount} برچسب دیگر`}>
          +{remainingCount}
        </span>
      )}
    </div>
  );
}

// تابع برای تشخیص رنگ متن بر اساس رنگ پس‌زمینه
function getContrastColor(hexColor) {
  // حذف # از ابتدای رنگ
  const hex = hexColor.replace('#', '');
  
  // تبدیل به RGB
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // محاسبه luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // اگر رنگ روشن است، متن تیره و برعکس
  return luminance > 0.5 ? '#000000' : '#ffffff';
}

export default TaskLabels;