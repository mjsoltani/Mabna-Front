import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { toJalali } from '../utils/dateUtils';
import './Objectives.css';

function Objectives({ token, showOnlyKRs }) {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKRModal, setShowKRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditKRModal, setShowEditKRModal] = useState(false);
  const [showKRReportModal, setShowKRReportModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [selectedKR, setSelectedKR] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [krReportData, setKrReportData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteKRConfirm, setDeleteKRConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
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
        description: formData.description,
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
        setFormData({ title: '', description: '', start_date: '', end_date: '' });
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
        description: formData.description,
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

  const fetchKRReport = async (krId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setKrReportData(data);
        setShowKRReportModal(true);
      }
    } catch (error) {
      console.error('Error fetching KR report:', error);
    }
  };

  const handleEditKR = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${selectedKR.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(krFormData)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowEditKRModal(false);
        setSelectedKR(null);
        setKrFormData({ title: '', initial_value: 0, target_value: 0 });
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ویرایش نتیجه کلیدی');
      }
    } catch (error) {
      console.error('Error updating key result:', error);
    }
  };

  const handleDeleteKR = async (krId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchObjectives();
        setDeleteKRConfirm(null);
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در حذف نتیجه کلیدی');
      }
    } catch (error) {
      console.error('Error deleting key result:', error);
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
                <label>توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات هدف (اختیاری)"
                  rows="3"
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
                <label>توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات هدف (اختیاری)"
                  rows="3"
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

      {showEditKRModal && selectedKR && (
        <div className="modal-overlay" onClick={() => setShowEditKRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ویرایش نتیجه کلیدی</h3>
            <form onSubmit={handleEditKR}>
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
                <button type="submit" className="btn-primary">ذخیره</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditKRModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {deleteKRConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteKRConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>حذف نتیجه کلیدی</h3>
            <p>آیا مطمئن هستید که می‌خواهید این نتیجه کلیدی را حذف کنید؟</p>
            <p className="warning-text">⚠️ ارتباط با وظایف قطع می‌شود ولی خود وظایف حذف نمی‌شوند.</p>
            <div className="form-actions">
              <button
                className="btn-delete"
                onClick={() => handleDeleteKR(deleteKRConfirm)}
              >
                حذف
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteKRConfirm(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {showKRReportModal && krReportData && (
        <div className="modal-overlay" onClick={() => setShowKRReportModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>گزارش نتیجه کلیدی: {krReportData.title}</h3>
            
            <div className="kr-report-header">
              <div className="report-badge">
                <span className="badge-label">هدف:</span>
                <span className="badge-value">{krReportData.objective.title}</span>
              </div>
              <div className="report-values">
                <span>مقدار اولیه: <strong>{krReportData.initial_value}</strong></span>
                <span>مقدار هدف: <strong>{krReportData.target_value}</strong></span>
                <span>مقدار فعلی: <strong>{krReportData.current_value}</strong></span>
              </div>
            </div>

            <div className="progress-section">
              <div className="progress-bar-large">
                <div
                  className="progress-fill-large"
                  style={{ width: `${krReportData.progress_percentage}%` }}
                >
                  {krReportData.progress_percentage}%
                </div>
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-box">
                <div className="stat-value">{krReportData.stats.total_tasks}</div>
                <div className="stat-label">کل وظایف</div>
              </div>
              <div className="stat-box success">
                <div className="stat-value">{krReportData.stats.completed_tasks}</div>
                <div className="stat-label">تکمیل شده</div>
              </div>
              <div className="stat-box warning">
                <div className="stat-value">{krReportData.stats.in_progress_tasks}</div>
                <div className="stat-label">در حال انجام</div>
              </div>
              <div className="stat-box info">
                <div className="stat-value">{krReportData.stats.todo_tasks}</div>
                <div className="stat-label">در انتظار</div>
              </div>
            </div>

            {krReportData.tasks && krReportData.tasks.length > 0 && (
              <div className="kr-tasks-section">
                <h4>وظایف مرتبط</h4>
                <div className="kr-tasks-list">
                  {krReportData.tasks.map(task => (
                    <div key={task.id} className={`kr-task-card status-${task.status}`}>
                      <div className="task-header">
                        <h5>{task.title}</h5>
                        <span className={`status-badge ${task.status}`}>
                          {task.status === 'done' ? '✅ تکمیل شده' : 
                           task.status === 'in_progress' ? '🔄 در حال انجام' : '⏳ در انتظار'}
                        </span>
                      </div>
                      <div className="task-meta">
                        <span>👤 {task.assignee?.full_name || 'بدون مسئول'}</span>
                        <span className={`type-badge ${task.type}`}>
                          {task.type === 'special' ? '⭐ ویژه' : '📌 معمولی'}
                        </span>
                        {task.due_date && (
                          <span>📅 {new Date(task.due_date).toLocaleDateString('fa-IR')}</span>
                        )}
                      </div>
                      {task.subtasks && task.subtasks.total > 0 && (
                        <div className="subtasks-info">
                          <span>📋 زیروظایف: {task.subtasks.completed}/{task.subtasks.total}</span>
                          <div className="mini-progress">
                            <div 
                              className="mini-progress-fill"
                              style={{ width: `${(task.subtasks.completed / task.subtasks.total) * 100}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button className="btn-secondary" onClick={() => setShowKRReportModal(false)}>
              بستن
            </button>
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
                    setFormData({ 
                      title: obj.title, 
                      description: obj.description || '',
                      start_date: obj.start_date, 
                      end_date: obj.end_date 
                    });
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
              <p>📅 {toJalali(obj.start_date)} تا {toJalali(obj.end_date)}</p>
              {obj.description && <p className="objective-description">📝 {obj.description}</p>}
              <p>📊 {obj.key_results?.length || 0} نتیجه کلیدی</p>
            </div>

            {obj.key_results && obj.key_results.length > 0 && (
              <div className="krs-list">
                {obj.key_results.map(kr => (
                  <div key={kr.id} className="kr-item">
                    <div className="kr-content">
                      <div className="kr-title">{kr.title}</div>
                      <div className="kr-values">
                        <span className="kr-value">اولیه: {kr.initial_value}</span>
                        <span className="kr-value">هدف: {kr.target_value}</span>
                      </div>
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
                    <div className="kr-actions">
                      <button
                        className="btn-icon"
                        onClick={() => fetchKRReport(kr.id)}
                        title="گزارش"
                      >
                        📊
                      </button>
                      <button
                        className="btn-icon"
                        onClick={() => {
                          setSelectedKR(kr);
                          setKrFormData({
                            title: kr.title,
                            initial_value: kr.initial_value,
                            target_value: kr.target_value
                          });
                          setShowEditKRModal(true);
                        }}
                        title="ویرایش"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-icon btn-danger"
                        onClick={() => setDeleteKRConfirm(kr.id)}
                        title="حذف"
                      >
                        🗑️
                      </button>
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
