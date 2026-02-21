import { useState, useEffect } from 'react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { UNIT_TYPES } from '../constants/keyResultUnits';
import API_BASE_URL from '../config';
import './EnhancedKeyResultForm.css';

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
    
    const payload = {
      title: formData.title,
      target_value: parseFloat(formData.target_value)
    };

    if (formData.description) payload.description = formData.description;
    if (formData.initial_value !== null) payload.initial_value = parseFloat(formData.initial_value);
    if (formData.current_value !== null) payload.current_value = parseFloat(formData.current_value);
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

  const handleAddLabel = (e) => {
    if (e.key === 'Enter' && labelInput.trim()) {
      e.preventDefault();
      if (!formData.labels.includes(labelInput.trim())) {
        setFormData({
          ...formData,
          labels: [...formData.labels, labelInput.trim()]
        });
      }
      setLabelInput('');
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
