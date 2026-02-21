import { useState, useEffect } from 'react';
import { addProgressUpdate, fetchProgressHistory } from '../services/keyResultService';
import './KeyResultProgressModal.css';

function KeyResultProgressModal({ isOpen, onClose, keyResult, token, onSuccess }) {
  const [progressValue, setProgressValue] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    if (isOpen && keyResult) {
      loadHistory();
    }
  }, [isOpen, keyResult]);

  const loadHistory = async () => {
    try {
      setLoadingHistory(true);
      const data = await fetchProgressHistory(keyResult.id, token);
      setHistory(data.progress_updates || []);
    } catch (error) {
      console.error('Error loading progress history:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!progressValue || isNaN(progressValue)) {
      alert('لطفاً مقدار معتبر وارد کنید');
      return;
    }

    const value = parseFloat(progressValue);
    if (value > keyResult.target_value) {
      alert(`مقدار نمی‌تواند بیشتر از ${keyResult.target_value} باشد`);
      return;
    }

    try {
      setLoading(true);
      await addProgressUpdate(keyResult.id, { value, note: note || undefined }, token);
      setProgressValue('');
      setNote('');
      await loadHistory();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error adding progress:', error);
      alert('خطا در ثبت پیشرفت');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content progress-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>پیشرفت: {keyResult?.title}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="kr-info">
          <div className="info-item">
            <span className="label">مقدار فعلی:</span>
            <span className="value">{keyResult?.current_value || keyResult?.initial_value || 0}</span>
          </div>
          <div className="info-item">
            <span className="label">مقدار هدف:</span>
            <span className="value">{keyResult?.target_value}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="progress-form">
          <div className="form-group">
            <label>مقدار جدید <span className="required">*</span></label>
            <input
              type="number"
              step="0.01"
              value={progressValue}
              onChange={(e) => setProgressValue(e.target.value)}
              placeholder="مقدار پیشرفت"
              required
            />
          </div>

          <div className="form-group">
            <label>یادداشت (اختیاری)</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="توضیحات در مورد این پیشرفت..."
              rows="3"
            />
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'در حال ثبت...' : 'ثبت پیشرفت'}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              انصراف
            </button>
          </div>
        </form>

        <div className="progress-history">
          <h4>تاریخچه پیشرفت</h4>
          {loadingHistory ? (
            <div className="loading-text">در حال بارگذاری...</div>
          ) : history.length === 0 ? (
            <div className="empty-state">
              <p>هنوز هیچ آپدیت پیشرفتی ثبت نشده است</p>
            </div>
          ) : (
            <div className="history-timeline">
              {history.map((item, index) => (
                <div key={item.id} className="timeline-item">
                  <div className="timeline-marker" />
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <span className="timeline-value">
                        {item.value}
                        {index > 0 && (
                          <span className={`value-diff ${item.value > history[index - 1].value ? 'positive' : 'negative'}`}>
                            ({item.value > history[index - 1].value ? '+' : ''}
                            {(item.value - history[index - 1].value).toFixed(2)})
                          </span>
                        )}
                      </span>
                      <span className="timeline-date">
                        {new Date(item.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    {item.note && <p className="timeline-note">{item.note}</p>}
                    <div className="timeline-meta">
                      <span>توسط {item.updated_by?.full_name || 'کاربر'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default KeyResultProgressModal;
