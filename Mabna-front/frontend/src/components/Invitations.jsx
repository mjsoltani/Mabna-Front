import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import './Invitations.css';

function Invitations({ token }) {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchInvitations();
  }, []);

  const fetchInvitations = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/invitations`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setInvitations(data);
      }
    } catch (error) {
      console.error('Error fetching invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/invitations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess('دعوت‌نامه با موفقیت ارسال شد');
        setEmail('');
        setShowModal(false);
        await fetchInvitations();
      } else {
        setError(data.error || 'خطا در ارسال دعوت‌نامه');
      }
    } catch (error) {
      setError('خطا در اتصال به سرور');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { text: 'در انتظار', class: 'badge-pending' },
      accepted: { text: 'پذیرفته شده', class: 'badge-accepted' },
      expired: { text: 'منقضی شده', class: 'badge-expired' }
    };
    const badge = badges[status] || badges.pending;
    return <span className={`status-badge ${badge.class}`}>{badge.text}</span>;
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div>
      <div className="section-header">
        <h2>دعوت کاربران</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + دعوت کاربر جدید
        </button>
      </div>

      {success && (
        <div className="success-message" style={{ marginBottom: '20px' }}>
          {success}
        </div>
      )}

      {invitations.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '64px', opacity: 0.3, marginBottom: '20px' }}>📧</div>
          <p>هنوز دعوت‌نامه‌ای ارسال نشده است</p>
        </div>
      ) : (
        <div className="invitations-list">
          {invitations.map(inv => (
            <div key={inv.id} className="card">
              <div className="card-header">
                <div>
                  <h3 className="card-title">{inv.email}</h3>
                  <p className="card-date">
                    ارسال شده در: {new Date(inv.created_at).toLocaleDateString('fa-IR')}
                  </p>
                </div>
                {getStatusBadge(inv.status)}
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>دعوت کاربر جدید</h3>
            {error && <div className="error-message">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>ایمیل کاربر</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="example@email.com"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  انصراف
                </button>
                <button type="submit" className="btn-primary">
                  ارسال دعوت‌نامه
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Invitations;
