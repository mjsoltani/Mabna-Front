import { useState, useEffect } from 'react';
import { Plus, X, Palette } from 'lucide-react';
import './label-selector.css';

// رنگ‌های پیش‌فرض برای labels
const LABEL_COLORS = [
  '#ef4444', // قرمز
  '#f97316', // نارنجی  
  '#f59e0b', // زرد
  '#84cc16', // سبز روشن
  '#10b981', // سبز
  '#06b6d4', // آبی روشن
  '#3b82f6', // آبی
  '#6366f1', // بنفش روشن
  '#8b5cf6', // بنفش
  '#d946ef', // صورتی
  '#ec4899', // صورتی تیره
  '#6b7280'  // خاکستری
];

function LabelSelector({ 
  selectedLabels = [], 
  onLabelsChange, 
  availableLabels = [],
  onCreateLabel,
  disabled = false 
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newLabel, setNewLabel] = useState({
    name: '',
    color: LABEL_COLORS[0],
    description: ''
  });

  const handleLabelToggle = (labelId) => {
    if (disabled) return;
    
    const newLabels = selectedLabels.includes(labelId)
      ? selectedLabels.filter(id => id !== labelId)
      : [...selectedLabels, labelId];
    onLabelsChange(newLabels);
  };

  const handleCreateLabel = async (e) => {
    e.preventDefault();
    if (!newLabel.name.trim()) return;

    try {
      await onCreateLabel(newLabel);
      setNewLabel({ name: '', color: LABEL_COLORS[0], description: '' });
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating label:', error);
    }
  };

  return (
    <div className="label-selector">
      <div className="label-selector-header">
        <label className="label-selector-title">برچسب‌ها</label>
        {!disabled && (
          <button
            type="button"
            className="btn-add-label"
            onClick={() => setShowCreateForm(!showCreateForm)}
            title="افزودن برچسب جدید"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* فرم ایجاد برچسب جدید */}
      {showCreateForm && (
        <div className="create-label-form">
          <form onSubmit={handleCreateLabel}>
            <div className="form-row">
              <input
                type="text"
                placeholder="نام برچسب..."
                value={newLabel.name}
                onChange={(e) => setNewLabel({ ...newLabel, name: e.target.value })}
                className="label-name-input"
                maxLength={20}
                required
              />
              <div className="color-picker">
                <Palette className="w-4 h-4" />
                <div className="color-options">
                  {LABEL_COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`color-option ${newLabel.color === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewLabel({ ...newLabel, color })}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-create">ایجاد</button>
              <button 
                type="button" 
                className="btn-cancel"
                onClick={() => setShowCreateForm(false)}
              >
                لغو
              </button>
            </div>
          </form>
        </div>
      )}

      {/* لیست برچسب‌های موجود */}
      <div className="labels-grid">
        {availableLabels.map(label => (
          <button
            key={label.id}
            type="button"
            className={`label-item ${selectedLabels.includes(label.id) ? 'selected' : ''} ${disabled ? 'disabled' : ''}`}
            style={{ 
              backgroundColor: selectedLabels.includes(label.id) ? label.color : 'transparent',
              borderColor: label.color,
              color: selectedLabels.includes(label.id) ? 'white' : label.color
            }}
            onClick={() => handleLabelToggle(label.id)}
            disabled={disabled}
            title={label.description || label.name}
          >
            {label.name}
            {label.usage_count > 0 && (
              <span className="usage-count">({label.usage_count})</span>
            )}
          </button>
        ))}
      </div>

      {availableLabels.length === 0 && !showCreateForm && (
        <div className="no-labels">
          <p>هیچ برچسبی وجود ندارد</p>
          {!disabled && (
            <button
              type="button"
              className="btn-create-first"
              onClick={() => setShowCreateForm(true)}
            >
              اولین برچسب را ایجاد کنید
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default LabelSelector;