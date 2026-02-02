import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import './CreateRecurringPattern.css';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

function EditRecurringPattern({ token, patternId, onSuccess, onCancel }) {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    frequency: 'daily',
    interval: 1,
    day_of_week: 1,
    day_of_month: 1,
    start_date: '',
    end_date: '',
    is_active: true,
    subtask_templates: []
  });
  const [startDateValue, setStartDateValue] = useState(null);
  const [endDateValue, setEndDateValue] = useState(null);
  const [newSubtask, setNewSubtask] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    fetchUsers();
    fetchPattern();
  }, [patternId]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setUsers(await response.json());
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchPattern = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recurring-patterns/${patternId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || '',
          description: data.description || '',
          assignee_id: data.assignee?.user_id || '',
          frequency: data.frequency || 'daily',
          interval: data.interval || 1,
          day_of_week: data.day_of_week ?? 1,
          day_of_month: data.day_of_month ?? 1,
          start_date: data.start_date ? data.start_date.split('T')[0] : '',
          end_date: data.end_date ? data.end_date.split('T')[0] : '',
          is_active: data.is_active ?? true,
          subtask_templates: data.subtask_templates || []
        });
        
        if (data.start_date) {
          setStartDateValue(new Date(data.start_date));
        }
        if (data.end_date) {
          setEndDateValue(new Date(data.end_date));
        }
      }
    } catch (error) {
      console.error('Error fetching pattern:', error);
    } finally {
      setFetching(false);
    }
  };

  const addSubtask = () => {
    if (newSubtask.trim()) {
      setFormData({
        ...formData,
        subtask_templates: [...formData.subtask_templates, { title: newSubtask.trim() }]
      });
      setNewSubtask('');
    }
  };

  const removeSubtask = (index) => {
    setFormData({
      ...formData,
      subtask_templates: formData.subtask_templates.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        assignee_id: formData.assignee_id,
        frequency: formData.frequency,
        interval: formData.interval,
        start_date: formData.start_date,
        end_date: formData.end_date || null,
        is_active: formData.is_active,
        subtask_templates: formData.subtask_templates.map(st => ({ title: st.title }))
      };

      // اضافه کردن فیلدهای مربوط به frequency
      if (formData.frequency === 'weekly') {
        payload.day_of_week = formData.day_of_week;
      }
      if (formData.frequency === 'monthly') {
        payload.day_of_month = formData.day_of_month;
      }

      const response = await fetch(`${API_BASE_URL}/api/recurring-patterns/${patternId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        onSuccess();
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ویرایش الگوی تکرار');
      }
    } catch (error) {
      console.error('Error updating pattern:', error);
      alert('خطا در ویرایش الگوی تکرار');
    } finally {
      setLoading(false);
    }
  };

  const weekDays = [
    { value: 0, label: 'یکشنبه' },
    { value: 1, label: 'دوشنبه' },
    { value: 2, label: 'سه‌شنبه' },
    { value: 3, label: 'چهارشنبه' },
    { value: 4, label: 'پنج‌شنبه' },
    { value: 5, label: 'جمعه' },
    { value: 6, label: 'شنبه' }
  ];

  if (fetching) {
    return (
      <div className="create-recurring-pattern">
        <div className="loading-state">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="create-recurring-pattern">
      <h3>ویرایش الگوی تکرار</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>عنوان *</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
            required
            placeholder="مثال: گزارش روزانه"
          />
        </div>

        <div className="form-group">
          <label>توضیحات</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            rows={3}
            placeholder="توضیحات اختیاری..."
          />
        </div>

        <div className="form-group">
          <label>مسئول *</label>
          <select
            value={formData.assignee_id}
            onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
            required
          >
            <option value="">انتخاب کنید</option>
            {users.map(user => (
              <option key={user.user_id} value={user.user_id}>
                {user.full_name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>نوع تکرار *</label>
            <select
              value={formData.frequency}
              onChange={(e) => setFormData({...formData, frequency: e.target.value})}
              required
            >
              <option value="daily">روزانه</option>
              <option value="weekly">هفتگی</option>
              <option value="monthly">ماهانه</option>
            </select>
          </div>

          <div className="form-group">
            <label>فاصله تکرار *</label>
            <input
              type="number"
              min="1"
              value={formData.interval}
              onChange={(e) => setFormData({...formData, interval: parseInt(e.target.value)})}
              required
            />
            <small>
              {formData.frequency === 'daily' && 'هر چند روز یکبار'}
              {formData.frequency === 'weekly' && 'هر چند هفته یکبار'}
              {formData.frequency === 'monthly' && 'هر چند ماه یکبار'}
            </small>
          </div>
        </div>

        {formData.frequency === 'weekly' && (
          <div className="form-group">
            <label>روز هفته *</label>
            <select
              value={formData.day_of_week}
              onChange={(e) => setFormData({...formData, day_of_week: parseInt(e.target.value)})}
              required
            >
              {weekDays.map(day => (
                <option key={day.value} value={day.value}>{day.label}</option>
              ))}
            </select>
          </div>
        )}

        {formData.frequency === 'monthly' && (
          <div className="form-group">
            <label>روز ماه *</label>
            <input
              type="number"
              min="1"
              max="31"
              value={formData.day_of_month}
              onChange={(e) => setFormData({...formData, day_of_month: parseInt(e.target.value)})}
              required
            />
            <small>روز 1 تا 31</small>
          </div>
        )}

        <div className="form-row">
          <div className="form-group">
            <label>تاریخ شروع *</label>
            <DatePicker
              value={startDateValue}
              onChange={(date) => {
                setStartDateValue(date);
                if (date) {
                  const d = date.toDate();
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setFormData({...formData, start_date: `${y}-${m}-${day}`});
                }
              }}
              calendar={persian}
              locale={persian_fa}
              placeholder="تاریخ شروع"
              format="YYYY/MM/DD"
              style={{ width: '100%' }}
            />
          </div>

          <div className="form-group">
            <label>تاریخ پایان</label>
            <DatePicker
              value={endDateValue}
              onChange={(date) => {
                setEndDateValue(date);
                if (date) {
                  const d = date.toDate();
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setFormData({...formData, end_date: `${y}-${m}-${day}`});
                } else {
                  setFormData({...formData, end_date: ''});
                }
              }}
              calendar={persian}
              locale={persian_fa}
              placeholder="تاریخ پایان (اختیاری)"
              format="YYYY/MM/DD"
              style={{ width: '100%' }}
            />
            <small>خالی = تا ابد</small>
          </div>
        </div>

        <div className="form-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
            />
            <span>فعال</span>
          </label>
        </div>

        <div className="form-group">
          <label>Subtask های پیش‌فرض</label>
          <div className="subtask-input">
            <input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="عنوان subtask"
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubtask();
                }
              }}
            />
            <button type="button" onClick={addSubtask} className="btn-add-subtask">
              + افزودن
            </button>
          </div>
          {formData.subtask_templates.length > 0 && (
            <ul className="subtask-list">
              {formData.subtask_templates.map((st, index) => (
                <li key={index}>
                  <span>✓ {st.title}</span>
                  <button type="button" onClick={() => removeSubtask(index)}>×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="form-actions">
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
          </button>
          <button type="button" className="btn-secondary" onClick={onCancel}>
            انصراف
          </button>
        </div>
      </form>
    </div>
  );
}

export default EditRecurringPattern;
