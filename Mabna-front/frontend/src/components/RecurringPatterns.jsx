import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import CreateRecurringPattern from './CreateRecurringPattern';
import EditRecurringPattern from './EditRecurringPattern';
import './RecurringPatterns.css';

function RecurringPatterns({ token }) {
  const [patterns, setPatterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editPatternId, setEditPatternId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    fetchPatterns();
  }, []);

  const fetchPatterns = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recurring-patterns`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setPatterns(await response.json());
      }
    } catch (error) {
      console.error('Error fetching patterns:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (patternId, currentStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recurring-patterns/${patternId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      if (response.ok) {
        fetchPatterns();
      }
    } catch (error) {
      console.error('Error toggling pattern:', error);
    }
  };

  const deletePattern = async (patternId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recurring-patterns/${patternId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        fetchPatterns();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting pattern:', error);
    }
  };

  const generateTask = async (patternId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/recurring-patterns/${patternId}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
      });
      if (response.ok) {
        alert('✅ Task با موفقیت ساخته شد!');
        fetchPatterns();
      }
    } catch (error) {
      console.error('Error generating task:', error);
      alert('❌ خطا در ساخت task');
    }
  };

  const getFrequencyText = (pattern) => {
    if (pattern.frequency === 'daily') {
      return pattern.interval === 1 ? 'هر روز' : `هر ${pattern.interval} روز`;
    } else if (pattern.frequency === 'weekly') {
      const days = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه'];
      const dayName = days[pattern.day_of_week];
      return pattern.interval === 1 ? `هر ${dayName}` : `هر ${pattern.interval} هفته - ${dayName}`;
    } else if (pattern.frequency === 'monthly') {
      return pattern.interval === 1 
        ? `هر ماه روز ${pattern.day_of_month}` 
        : `هر ${pattern.interval} ماه روز ${pattern.day_of_month}`;
    }
  };

  const getFrequencyIcon = (frequency) => {
    switch (frequency) {
      case 'daily': return '📅';
      case 'weekly': return '📆';
      case 'monthly': return '🗓️';
      default: return '🔄';
    }
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  return (
    <div className="recurring-patterns-container">
      <div className="patterns-header">
        <div>
          <h2>الگوهای تکرار</h2>
          <p className="subtitle">مدیریت وظایف تکرارشونده</p>
        </div>
        <button className="btn-create" onClick={() => setShowCreateModal(true)}>
          + الگوی جدید
        </button>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CreateRecurringPattern
              token={token}
              onSuccess={() => {
                setShowCreateModal(false);
                fetchPatterns();
              }}
              onCancel={() => setShowCreateModal(false)}
            />
          </div>
        </div>
      )}

      {showEditModal && editPatternId && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <EditRecurringPattern
              token={token}
              patternId={editPatternId}
              onSuccess={() => {
                setShowEditModal(false);
                setEditPatternId(null);
                fetchPatterns();
              }}
              onCancel={() => {
                setShowEditModal(false);
                setEditPatternId(null);
              }}
            />
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content small" onClick={(e) => e.stopPropagation()}>
            <h3>حذف الگوی تکرار</h3>
            <p>آیا مطمئن هستید؟ Tasks ساخته شده حذف نمی‌شوند.</p>
            <div className="modal-actions">
              <button className="btn-danger" onClick={() => deletePattern(deleteConfirm)}>
                حذف
              </button>
              <button className="btn-secondary" onClick={() => setDeleteConfirm(null)}>
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      {patterns.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔄</div>
          <h3>هیچ الگوی تکراری وجود ندارد</h3>
          <p>برای ساخت وظایف خودکار، یک الگوی تکرار ایجاد کنید</p>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>
            ساخت اولین الگو
          </button>
        </div>
      ) : (
        <div className="patterns-grid">
          {patterns.map(pattern => (
            <div key={pattern.id} className={`pattern-card ${!pattern.is_active ? 'inactive' : ''}`}>
              <div className="pattern-header">
                <div className="pattern-title-row">
                  <span className="frequency-icon">{getFrequencyIcon(pattern.frequency)}</span>
                  <h3>{pattern.title}</h3>
                </div>
                <span className={`status-badge ${pattern.is_active ? 'active' : 'inactive'}`}>
                  {pattern.is_active ? 'فعال' : 'غیرفعال'}
                </span>
              </div>

              {pattern.description && (
                <p className="pattern-description">{pattern.description}</p>
              )}

              <div className="pattern-info">
                <div className="info-item">
                  <span className="label">🔄 تکرار:</span>
                  <span className="value">{getFrequencyText(pattern)}</span>
                </div>
                <div className="info-item">
                  <span className="label">📍 شروع:</span>
                  <span className="value">
                    {new Date(pattern.start_date).toLocaleDateString('fa-IR')}
                  </span>
                </div>
                {pattern.end_date && (
                  <div className="info-item">
                    <span className="label">🏁 پایان:</span>
                    <span className="value">
                      {new Date(pattern.end_date).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
                {pattern.last_generated && (
                  <div className="info-item">
                    <span className="label">⏱️ آخرین ساخت:</span>
                    <span className="value">
                      {new Date(pattern.last_generated).toLocaleDateString('fa-IR')}
                    </span>
                  </div>
                )}
              </div>

              {pattern.subtask_templates.length > 0 && (
                <div className="subtasks-preview">
                  <strong>📋 Subtasks پیش‌فرض:</strong>
                  <ul>
                    {pattern.subtask_templates.map(st => (
                      <li key={st.id}>✓ {st.title}</li>
                    ))}
                  </ul>
                </div>
              )}

              {pattern.recent_tasks.length > 0 && (
                <div className="recent-tasks">
                  <strong>📝 آخرین tasks:</strong>
                  <ul>
                    {pattern.recent_tasks.slice(0, 3).map(task => (
                      <li key={task.id}>
                        <span className={`task-status ${task.status}`}>
                          {task.status === 'done' ? '✅' : task.status === 'in_progress' ? '🔄' : '⏳'}
                        </span>
                        {new Date(task.created_at).toLocaleDateString('fa-IR')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pattern-actions">
                <button 
                  className="btn-action btn-generate" 
                  onClick={() => generateTask(pattern.id)}
                  title="ساخت دستی task"
                >
                  ⚡ ساخت Task
                </button>
                <button 
                  className="btn-action btn-edit" 
                  onClick={() => {
                    setEditPatternId(pattern.id);
                    setShowEditModal(true);
                  }}
                  title="ویرایش"
                >
                  ✏️
                </button>
                <button 
                  className="btn-action btn-toggle" 
                  onClick={() => toggleActive(pattern.id, pattern.is_active)}
                  title={pattern.is_active ? 'غیرفعال کردن' : 'فعال کردن'}
                >
                  {pattern.is_active ? '⏸️' : '▶️'}
                </button>
                <button 
                  className="btn-action btn-delete" 
                  onClick={() => setDeleteConfirm(pattern.id)}
                  title="حذف"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default RecurringPatterns;
