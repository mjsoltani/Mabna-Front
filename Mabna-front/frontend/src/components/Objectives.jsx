import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';

function Objectives({ token, showOnlyKRs }) {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKRModal, setShowKRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    start_date: '',
    end_date: ''
  });
  const [startValue, setStartValue] = useState(null);
  const [endValue, setEndValue] = useState(null);
  const [editStartValue, setEditStartValue] = useState(null);
  const [editEndValue, setEditEndValue] = useState(null);
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

  const toYMD = (d) => {
    if (!d) return '';
    const date = d.toDate ? d.toDate() : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const das = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${das}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
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

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        start_date: toYMD(editStartValue),
        end_date: toYMD(editEndValue)
      };
      const response = await fetch(`${API_BASE_URL}/api/objectives/${selectedObjective.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowEditModal(false);
        setSelectedObjective(null);
      }
    } catch (error) {
      console.error('Error updating objective:', error);
    }
  };

  const handleDeleteObjective = async (objectiveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchObjectives();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const handleAddKR = async (e) => {
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
      }
    } catch (error) {
      console.error('Error adding key result:', error);
    }
  };

  const fetchReport = async (objectiveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setShowReportModal(true);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  return (
    <div className="objectives-container">
      <div className="objectives-header">
        <h2>{showOnlyKRs ? 'نتایج کلیدی' : 'اهداف'}</h2>
        {!showOnlyKRs && (
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            + هدف جدید
          </button>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ایجاد هدف جدید</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>عنوان هدف</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="عنوان هدف را وارد کنید"
                />
              </div>

              <div className="form-group">
                <label>تاریخ شروع</label>
                <DatePicker
                  value={startValue}
                  onChange={setStartValue}
                  calendar={persian}
                  locale={persian_fa}
                  placeholder="تاریخ شروع"
                />
              </div>

              <div className="form-group">
                <label>تاریخ پایان</label>
                <DatePicker
                  value={endValue}
                  onChange={setEndValue}
                  calendar={persian}
                  locale={persian_fa}
                  placeholder="تاریخ پایان"
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">ایجاد</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && selectedObjective && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ویرایش هدف</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>عنوان هدف</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>تاریخ شروع</label>
                <DatePicker
                  value={editStartValue}
                  onChange={setEditStartValue}
                  calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="form-group">
                <label>تاریخ پایان</label>
                <DatePicker
                  value={editEndValue}
                  onChange={setEditEndValue}
                  calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">ذخیره</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showKRModal && (
        <div className="modal-overlay" onClick={() => setShowKRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>اضافه کردن نتیجه کلیدی</h3>
            <form onSubmit={handleAddKR}>
              <div className="form-group">
                <label>عنوان</label>
                <input
                  type="text"
                  value={krFormData.title}
                  onChange={(e) => setKrFormData({ ...krFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>مقدار اولیه</label>
                <input
                  type="number"
                  value={krFormData.initial_value}
                  onChange={(e) => setKrFormData({ ...krFormData, initial_value: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>مقدار هدف</label>
                <input
                  type="number"
                  value={krFormData.target_value}
                  onChange={(e) => setKrFormData({ ...krFormData, target_value: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">اضافه کردن</button>
                <button type="button" className="btn-secondary" onClick={() => setShowKRModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && reportData && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>گزارش: {reportData.title}</h3>
            
            <div className="report-header">
              <p><strong>تاریخ شروع:</strong> {reportData.start_date}</p>
              <p><strong>تاریخ پایان:</strong> {reportData.end_date}</p>
              <p><strong>تعداد نتایج کلیدی:</strong> {reportData.total_key_results}</p>
            </div>

            <div className="report-krs">
              {reportData.key_results?.map(kr => (
                <div key={kr.id} className="report-kr-card">
                  <h4>{kr.title}</h4>
                  <div className="kr-stats">
                    <p>پیشرفت: <strong>{kr.progress_percentage}%</strong></p>
                    <p>وظایف: {kr.completed_tasks} / {kr.total_tasks}</p>
                    <p>مقدار: {kr.initial_value} → {kr.target_value}</p>
                  </div>

                  {kr.tasks && kr.tasks.length > 0 && (
                    <div className="kr-tasks">
                      <h5>وظایف:</h5>
                      {kr.tasks.map(task => (
                        <div key={task.id} className="task-item">
                          <span>{task.title}</span>
                          <span className={`status ${task.status}`}>{task.status}</span>
                          <span className="type">{task.type === 'special' ? '⭐' : '📌'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="btn-secondary" onClick={() => setShowReportModal(false)}>
              بستن
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>حذف هدف</h3>
            <p>آیا مطمئن هستید که می‌خواهید این هدف را حذف کنید؟</p>
            <div className="form-actions">
              <button
                className="btn-delete"
                onClick={() => handleDeleteObjective(deleteConfirm)}
              >
                حذف
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="objectives-list">
        {objectives.map(obj => (
          <div key={obj.id} className="objective-card">
            <div className="objective-header">
              <h3>{obj.title}</h3>
              <div className="objective-actions">
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setSelectedObjective(obj);
                    setFormData({ title: obj.title, start_date: obj.start_date, end_date: obj.end_date });
                    setEditStartValue(new Date(obj.start_date));
                    setEditEndValue(new Date(obj.end_date));
                    setShowEditModal(true);
                  }}
                >
                  ویرایش
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => fetchReport(obj.id)}
                >
                  گزارش
                </button>
                <button
                  className="btn-delete"
                  onClick={() => setDeleteConfirm(obj.id)}
                >
                  حذف
                </button>
              </div>
            </div>

            <div className="objective-info">
              <p>📅 {obj.start_date} تا {obj.end_date}</p>
              <p>📊 {obj.key_results?.length || 0} نتیجه کلیدی</p>
            </div>

            {obj.key_results && obj.key_results.length > 0 && (
              <div className="krs-list">
                {obj.key_results.map(kr => (
                  <div key={kr.id} className="kr-item">
                    <div className="kr-title">{kr.title}</div>
                    <div className="kr-progress">
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${kr.progress || 0}%` }}
                        />
                      </div>
                      <span className="progress-text">{kr.progress || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button
              className="btn-primary"
              onClick={() => {
                setSelectedObjective(obj.id);
                setShowKRModal(true);
              }}
            >
              + نتیجه کلیدی
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Objectives;
