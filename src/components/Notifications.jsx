import { useEffect, useState, useRef } from 'react';
import API_BASE_URL from '../config';

function Notifications({ token, onNavigateToTask }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState([]);
  const containerRef = useRef(null);

  useEffect(() => {
    fetchUnreadCount();
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('click', onClickOutside);
    return () => document.removeEventListener('click', onClickOutside);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.count || 0);
      }
    } catch {}
  };

  const fetchList = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications?unreadOnly=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
      }
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleOpen = async () => {
    const next = !open;
    setOpen(next);
    if (next) await fetchList();
  };

  const markAsRead = async (id, taskId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setItems(prev => prev.filter(n => n.id !== id));
        setUnreadCount(c => Math.max(0, c - 1));
        if (taskId) onNavigateToTask(taskId);
      }
    } catch {}
  };

  const markAllRead = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setItems([]);
        setUnreadCount(0);
      }
    } catch {}
  };

  return (
    <div ref={containerRef} className="notif-container">
      <div className="notif-bell" onClick={toggleOpen} aria-label="notifications">
        <span style={{ fontSize: 20 }}>🔔</span>
        {unreadCount > 0 && (
          <div className="notif-badge">{unreadCount}</div>
        )}
      </div>
      {open && (
        <div className="notif-dropdown">
          <div className="notif-header">
            <span style={{ fontWeight: 800, color: '#1f2937' }}>نوتیفیکیشن‌ها</span>
            <button className="btn-read-all" onClick={markAllRead}>علامت‌گذاری همه به عنوان خوانده شده</button>
          </div>
          <div className="notif-list">
            {loading ? (
              <div style={{ padding: 16, color: '#6b7280' }}>در حال بارگذاری...</div>
            ) : items.length === 0 ? (
              <div style={{ padding: 24, textAlign: 'center', color: '#9ca3af' }}>نوتیفیکیشن خوانده‌نشده‌ای وجود ندارد</div>
            ) : (
              items.map(n => (
                <div key={n.id} className="notif-item unread" onClick={() => markAsRead(n.id, n.task_id)}>
                  <div style={{ fontSize: 20 }}>📩</div>
                  <div style={{ flex: 1 }}>
                    <div className="notif-title">{n.title || 'نوتیفیکیشن'}</div>
                    <div className="notif-meta">
                      {n.created_at ? new Date(n.created_at).toLocaleString('fa-IR') : ''}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
