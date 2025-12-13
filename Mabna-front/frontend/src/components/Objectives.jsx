import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

function Objectives({ token }) {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKRModal, setShowKRModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: ''
  });
  const [startValue, setStartValue] = useState(null);
  const [endValue, setEndValue] = useState(null);
  const [krFormData, setKrFormData] = useState({
    title: '',
    initial_value: 0,
    target_value: 0
  });

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setObjectives(data);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const toYMD = (d) => {
        if (!d) return '';
        const date = d.toDate ? d.toDate() : new Date(d);
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const das = String(date.getDate()).padStart(2, '0');
        return `${y}-${m}-${das}`;
      };

      const payload = {
        title: formData.title,
        start_date: toYMD(startValue),
        end_date: toYMD(endValue)
      };
      const response = await fetch(`${API_BASE_URL}/api/objectives`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowModal(false);
        setFormData({ title: '', start_date: '', end_date: '' });
        setStartValue(null);
        setEndValue(null);
      }
    } catch (error) {
      console.error('Error creating objective:', error);
    }
  };

  const handleKRSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${selectedObjective}/keyresults`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(krFormData)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowKRModal(false);
        setKrFormData({ title: '', initial_value: 0, target_value: 0 });
        setSelectedObjective(null);
      }
    } catch (error) {
      console.error('Error creating key result:', error);
    }
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div>
      <div className="section-header">
        <h2>اهداف و نتایج کلیدی (OKRs)</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + افزودن هدف جدید
        </button>
      </div>

      {objectives.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '64px', opacity: 0.3, marginBottom: '20px' }}>📋</div>
          <p>هنوز هدفی ثبت نشده است</p>
        </div>
      ) : (
        objectives.map(obj => (
          <div key={obj.id} className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{obj.title}</h3>
                <p className="card-date">
                  {obj.start_date} تا {obj.end_date}
                </p>
              </div>
              <button 
                className="btn-add" 
                onClick={() => {
                  setSelectedObjective(obj.id);
                  setShowKRModal(true);
                }}
              >
                + افزودن KR
              </button>
            </div>
            
            {obj.key_results && obj.key_results.length > 0 && (
              <div className="kr-list">
                <h4 style={{ marginBottom: '10px', color: '#666' }}>نتایج کلیدی:</h4>
                {obj.key_results.map(kr => (
                  <div key={kr.id} className="kr-item">
                    <div className="kr-header">
                      <div className="kr-title">{kr.title}</div>
                      <div className="kr-progress-badge">
                        {kr.progress !== undefined ? `${kr.progress}%` : '0%'}
                      </div>
                    </div>
                    <div className="kr-values">
                      {kr.initial_value} → {kr.target_value}
                    </div>
                    {kr.progress !== undefined && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${kr.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>افزودن هدف جدید</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>عنوان هدف</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="مثال: رشد محصول در سه‌ماهه اول"
                />
              </div>
              <div className="form-group">
                <label>تاریخ شروع (تقویم فارسی)</label>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={startValue}
                  onChange={setStartValue}
                  inputClass="input-control date-input"
                  containerStyle={{ width: '100%' }}
                />
              </div>
              <div className="form-group">
                <label>تاریخ پایان (تقویم فارسی)</label>
                <DatePicker
                  calendar={persian}
                  locale={persian_fa}
                  value={endValue}
                  onChange={setEndValue}
                  inputClass="input-control date-input"
                  containerStyle={{ width: '100%' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  انصراف
                </button>
                <button type="submit" className="btn-primary">
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showKRModal && (
        <div className="modal-overlay" onClick={() => setShowKRModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>افزودن نتیجه کلیدی</h3>
            <form onSubmit={handleKRSubmit}>
              <div className="form-group">
                <label>عنوان نتیجه کلیدی</label>
                <input
                  type="text"
                  value={krFormData.title}
                  onChange={(e) => setKrFormData({...krFormData, title: e.target.value})}
                  required
                  placeholder="مثال: افزایش بازدید"
                />
              </div>
              <div className="form-group">
                <label>مقدار اولیه</label>
                <input
                  type="number"
                  value={krFormData.initial_value}
                  onChange={(e) => setKrFormData({...krFormData, initial_value: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>مقدار هدف</label>
                <input
                  type="number"
                  value={krFormData.target_value}
                  onChange={(e) => setKrFormData({...krFormData, target_value: parseFloat(e.target.value)})}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowKRModal(false)}>
                  انصراف
                </button>
                <button type="submit" className="btn-primary">
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Objectives;
