import { useState, useEffect, useCallback, useMemo } from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { UNIT_TYPES } from '../constants/keyResultUnits';
import API_BASE_URL from '../config';
import './EnhancedKeyResultForm.css';

// Debounce helper
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

function EnhancedKeyResultForm({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData = null,
  token,
  objectiveId 
}) {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [teamMembers, setTeamMembers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    initial_value: 0,
    current_value: null,
    target_value: 0,
    unit: 'number',
    owner_id: '',
    due_date: null,
    labels: []
  });
  const [dueDate, setDueDate] = useState(null);
  const [labelInput, setLabelInput] = useState('');
  const [errors, setErrors] = useState({});
  const [existingLabels, setExistingLabels] = useState([]);

  // Debounce label input for autocomplete
  const debouncedLabelInput = useDebounce(labelInput, 300);

  // Validation rules
  const validateForm = useCallback(() => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length === 0) {
      newErrors.title = 'عنوان الزامی است';
    } else if (formData.title.length > 255) {
      newErrors.title = 'عنوان نباید بیشتر از 255 کاراکتر باشد';
    }

    if (!formData.target_value || formData.target_value <= 0) {
      newErrors.target_value = 'مقدار هدف باید بیشتر از صفر باشد';
    }

    if (formData.current_value && parseFloat(formData.current_value) > parseFloat(formData.target_value)) {
      newErrors.current_value = 'مقدار فعلی نمی‌تواند بیشتر از مقدار هدف باشد';
    }

    if (formData.initial_value && parseFloat(formData.initial_value) > parseFloat(formData.target_value)) {
      newErrors.initial_value = 'مقدار اولیه نمی‌تواند بیشتر از مقدار هدف باشد';
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'توضیحات نباید بیشتر از 1000 کاراکتر باشد (توصیه)';
    }

    if (formData.labels.length > 10) {
      newErrors.labels = 'تعداد برچسب‌ها نباید بیشتر از 10 باشد (توصیه)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Filter existing labels for autocomplete
  const filteredLabels = useMemo(() => {
    if (!debouncedLabelInput) return [];
    return existingLabels.filter(label => 
      label.toLowerCase().includes(debouncedLabelInput.toLowerCase()) &&
      !formData.labels.includes(label)
    ).slice(0, 5);
  }, [debouncedLabelInput, existingLabels, formData.labels]);

  useEffect(() => {
    if (isOpen) {
      fetchTeamMembers();
      if (initialData) {
        setFormData({
          title: initialData.title || '',
          description: initialData.description || '',
          initial_value: initialData.initial_value || 0,
          current_value: initialData.current_value || null,
          target_value: initialData.target_value || 0,
          unit: initialData.unit || 'number',
          owner_id: initialData.owner_id || '',
          due_date: initialData.due_date || null,
          labels: initialData.labels || []
        });
        if (initialData.due_date) {
          setDueDate(new Date(initialData.due_date));
        }
        if (initialData.description || initialData.unit || initialData.owner_id || initialData.due_date) {
          setShowAdvanced(true);
        }
      }
    }
  }, [isOpen, initialData]);

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data.users || []);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate before submit
    if (!validateForm()) {
      return;
    }
    
    const payload = {
      title: formData.title.trim(),
      target_value: parseFloat(formData.target_value)
    };

    if (formData.description && formData.description.trim()) {
      payload.description = formData.description.trim();
    }
    if (formData.initial_value !== null && formData.initial_value !== '') {
      payload.initial_value = parseFloat(formData.initial_value);
    }
    if (formData.current_value !== null && formData.current_value !== '') {
      payload.current_value = parseFloat(formData.current_value);
    }
    if (formData.unit) payload.unit = formData.unit;
    if (formData.owner_id) payload.owner_id = formData.owner_id;
    if (dueDate) {
      const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      payload.due_date = `${y}-${m}-${d}`;
    }
    if (formData.labels.length > 0) payload.labels = formData.labels;

    onSubmit(payload);
  };

  const handleAddLabel = (e, labelToAdd = null) => {
    const label = labelToAdd || labelInput.trim();
    
    if ((e?.key === 'Enter' || labelToAdd) && label) {
      e?.preventDefault();
      if (!formData.labels.includes(label)) {
        if (formData.labels.length >= 10) {
          setErrors({ ...errors, labels: 'حداکثر 10 برچسب مجاز است' });
          return;
        }
        setFormData({
          ...formData,
          labels: [...formData.labels, label]
        });
        // Add to existing labels for future autocomplete
        if (!existingLabels.includes(label)) {
          setExistingLabels([...existingLabels, label]);
        }
      }
      setLabelInput('');
      setErrors({ ...errors, labels: undefined });
    }
  };

  const handleRemoveLabel = (label) => {
    setFormData({
      ...formData,
      labels: formData.labels.filter(l => l !== label)
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content enhanced-kr-form" onClick={(e) => e.stopPropagation()}>
        <h3>{initialData ? 'ویرایش شاخص کلیدی' : 'اضافه کردن شاخص کلیدی'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-section">
            <div className="form-group">
              <label>عنوان <span className="required">*</span></label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                maxLength={255}
                placeholder="عنوان شاخص کلیدی"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>مقدار اولیه</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.initial_value}
                  onChange={(e) => setFormData({ ...formData, initial_value: e.target.value })}
                  placeholder="0"
                />
              </div>

              <div className="form-group">
                <label>مقدار هدف <span className="required">*</span></label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target_value}
                  onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                  required
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="advanced-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
            <input type="checkbox" checked={showAdvanced} readOnly />
            <span>گزینه‌های پیشرفته</span>
          </div>

          {showAdvanced && (
            <div className="advanced-fields">
              <div className="form-group">
                <label>توضیحات <span className="optional-badge">اختیاری</span></label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات تکمیلی..."
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>واحد اندازه‌گیری <span className="optional-badge">اختیاری</span></label>
                  <select
                    className="unit-select"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  >
                    {Object.entries(UNIT_TYPES).map(([key, { label }]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>مقدار فعلی <span className="optional-badge">اختیاری</span></label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.current_value || ''}
                    onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                    placeholder="مقدار فعلی"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>مسئول <span className="optional-badge">اختیاری</span></label>
                  <select
                    className="owner-select"
                    value={formData.owner_id}
                    onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
                  >
                    <option value="">انتخاب مسئول</option>
                    {teamMembers.map(member => (
                      <option key={member.user_id} value={member.user_id}>
                        {member.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>تاریخ سررسید <span className="optional-badge">اختیاری</span></label>
                  <div className="date-picker-wrapper">
                    <DatePicker
                      value={dueDate}
                      onChange={setDueDate}
                      calendar={persian}
                      locale={persian_fa}
                      placeholder="انتخاب تاریخ"
                    />
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>برچسب‌ها <span className="optional-badge">اختیاری</span></label>
                <div className="label-input-wrapper">
                  {formData.labels.map(label => (
                    <span key={label} className="label-tag">
                      {label}
                      <button type="button" onClick={() => handleRemoveLabel(label)}>×</button>
                    </span>
                  ))}
                  <input
                    type="text"
                    className="label-input"
                    value={labelInput}
                    onChange={(e) => setLabelInput(e.target.value)}
                    onKeyDown={handleAddLabel}
                    placeholder="برچسب جدید (Enter برای افزودن)"
                  />
                </div>
                {errors.labels && <span className="error-message">{errors.labels}</span>}
                {filteredLabels.length > 0 && (
                  <div className="label-suggestions">
                    {filteredLabels.map(label => (
                      <button
                        key={label}
                        type="button"
                        className="label-suggestion"
                        onClick={() => handleAddLabel(null, label)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
                <small className="form-hint">
                  {formData.labels.length}/10 برچسب • پیشنهاد: دوره زمانی، دپارتمان، اولویت
                </small>
              </div>
            </div>
          )}

          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {initialData ? 'ذخیره تغییرات' : 'اضافه کردن'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EnhancedKeyResultForm;
