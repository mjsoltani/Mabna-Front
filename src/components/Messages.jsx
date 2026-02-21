import { useState, useEffect } from 'react';
import { MessageCircle, Send, X, Search, User, Circle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API_BASE_URL from '../config';
import './Messages.css';

function Messages({ token, user }) {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (isOpen) {
      fetchUsers();
      fetchUnreadCount();
    }
  }, [isOpen]);

  useEffect(() => {
    if (selectedUser) {
      fetchThread(selectedUser.user_id);
    }
  }, [selectedUser]);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        // حذف خود کاربر از لیست
        setUsers(data.filter(u => u.user_id !== user.user_id));
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/unread-count`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setUnreadCount(data.unread_count || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const fetchThread = async (userId) => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/messages/thread/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        fetchUnreadCount(); // به‌روزرسانی تعداد خوانده نشده
      }
    } catch (error) {
      console.error('Error fetching thread:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipient_id: selectedUser.user_id,
          content: newMessage,
          subject: ''
        })
      });

      if (response.ok) {
        setNewMessage('');
        fetchThread(selectedUser.user_id);
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ارسال پیام');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('خطا در ارسال پیام');
    }
  };

  const filteredUsers = users.filter(u =>
    u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getInitials = (name) => {
    return name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || '?';
  };

  return (
    <>
      {/* دکمه شناور */}
      <motion.button
        className="messages-float-button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageCircle className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="messages-badge">{unreadCount}</span>
        )}
      </motion.button>

      {/* پنل اصلی */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="messages-panel"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {!selectedUser ? (
              // لیست کاربران
              <div className="messages-users-list">
                <div className="messages-header">
                  <h3>مکاتبات</h3>
                  <button onClick={() => setIsOpen(false)} className="messages-close-btn">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="messages-search">
                  <Search className="w-4 h-4 messages-search-icon" />
                  <input
                    type="text"
                    placeholder="جستجوی کاربر..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="messages-users-scroll">
                  {filteredUsers.length === 0 ? (
                    <div className="messages-empty">
                      <User className="w-12 h-12 opacity-30" />
                      <p>کاربری یافت نشد</p>
                    </div>
                  ) : (
                    filteredUsers.map(u => (
                      <motion.div
                        key={u.user_id}
                        className="messages-user-item"
                        onClick={() => setSelectedUser(u)}
                        whileHover={{ backgroundColor: 'rgba(0,0,0,0.02)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="messages-user-avatar">
                          {getInitials(u.full_name)}
                          {u.online && <Circle className="messages-online-dot" />}
                        </div>
                        <div className="messages-user-info">
                          <div className="messages-user-name">{u.full_name}</div>
                          <div className="messages-user-email">{u.email}</div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              // پنجره چت
              <div className="messages-chat">
                <div className="messages-chat-header">
                  <button onClick={() => setSelectedUser(null)} className="messages-back-btn">
                    ←
                  </button>
                  <div className="messages-user-avatar small">
                    {getInitials(selectedUser.full_name)}
                  </div>
                  <div className="messages-chat-user-info">
                    <div className="messages-chat-user-name">{selectedUser.full_name}</div>
                    <div className="messages-chat-user-email">{selectedUser.email}</div>
                  </div>
                  <button onClick={() => setIsOpen(false)} className="messages-close-btn">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="messages-chat-body">
                  {loading ? (
                    <div className="messages-loading">در حال بارگذاری...</div>
                  ) : messages.length === 0 ? (
                    <div className="messages-empty">
                      <MessageCircle className="w-12 h-12 opacity-30" />
                      <p>هنوز پیامی وجود ندارد</p>
                      <p className="text-sm">اولین پیام را ارسال کنید</p>
                    </div>
                  ) : (
                    messages.map(msg => (
                      <div
                        key={msg.message_id}
                        className={`messages-message ${msg.is_mine ? 'mine' : 'theirs'}`}
                      >
                        <div className="messages-message-content">
                          {msg.content}
                        </div>
                        <div className="messages-message-time">
                          {new Date(msg.created_at).toLocaleString('fa-IR', {
                            hour: '2-digit',
                            minute: '2-digit',
                            year: 'numeric',
                            month: 'numeric',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <form className="messages-chat-footer" onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    placeholder="پیام خود را بنویسید..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    autoFocus
                  />
                  <button type="submit" disabled={!newMessage.trim()}>
                    <Send className="w-5 h-5" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default Messages;
