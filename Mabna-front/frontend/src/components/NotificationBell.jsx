import { useState, useEffect, useRef } from 'react';
import API_BASE_URL from '../config';
import './NotificationBell.css';

function NotificationBell({ token, onTaskClick }) {
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    
    // هر 30 ثانیه یکبار چک کن
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // بستن dropdown با کلیک بیرون
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        await fetchNotifications();
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      await Promise.all(
        unreadNotifications.map(n => 
          fetch(`${API_BASE_URL}/api/notifications/${n.id}/read`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
          })
        )
      );
      
      await fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);
    
    if (notification.taskId && onTaskClick) {
      onTaskClick(notification.taskId);
      setShowDropdown(false);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'task_mention':
        return '💬';
      case 'deadline_today':
        return '⏰';
      case 'deadline_tomorrow':
        return '📅';
      case 'deadline_overdue':
        return '⚠️';
      case 'task_assigned':
        return '📋';
      case 'task_completed':
        return '✅';
      default:
        return '🔔';
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الان';
    if (diffMins < 60) return `${diffMins} دقیقه پیش`;
    if (diffHours < 24) return `${diffHours} ساعت پیش`;
    if (diffDays < 7) return `${diffDays} روز پیش`;
    
    return date.toLocaleDateString('fa-IR');
  };

  return (
    <div className="notification-bell-container" ref={dropdownRef}>
      <button 
        className="notification-bell-button"
        onClick={() => setShowDropdown(!showDropdown)}
      >
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
        )}
      </button>

      {showDropdown && (
        <div className="notification-dropdown">
          <div className="notification-header">
            <h3>اعلان‌ها</h3>
            {unreadCount > 0 && (
              <button 
                className="mark-all-read"
                onClick={markAllAsRead}
              >
                خواندن همه
              </button>
            )}
          </div>

          <div className="notification-list">
            {notifications.length === 0 ? (
              <div className="no-notifications">
                <span className="empty-icon">🔕</span>
                <p>اعلانی وجود ندارد</p>
              </div>
            ) : (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.isRead ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-icon">
                    {getNotificationIcon(notification.type)}
                  </div>
                  <div className="notification-content">
                    <div className="notification-title">{notification.title}</div>
                    <div className="notification-message">{notification.message}</div>
                    <div className="notification-time">{formatTime(notification.createdAt)}</div>
                  </div>
                  {!notification.isRead && (
                    <div className="unread-dot"></div>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="notification-footer">
              <button 
                className="view-all-button"
                onClick={() => {
                  setShowDropdown(false);
                  // می‌تونی به صفحه notifications بری
                }}
              >
                مشاهده همه
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
