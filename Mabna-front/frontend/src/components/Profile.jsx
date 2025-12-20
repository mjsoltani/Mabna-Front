import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import './Profile.css';

function Profile({ token, user, onTaskClick, onObjectiveClick }) {
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [editMode, setEditMode] = useState(false);
  const [changePasswordMode, setChangePasswordMode] = useState(false);

  // Edit Profile State
  const [editForm, setEditForm] = useState({
    full_name: '',
    email: ''
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');

  // Change Password State
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
    fetchActivity();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditForm({
          full_name: data.user.full_name,
          email: data.user.email
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivity = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/activity?limit=5`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setActivity(await response.json());
      }
    } catch (error) {
      console.error('Error fetching activity:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editForm)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'خطا در آپدیت پروفایل');
      }

      await fetchProfile();
      setEditMode(false);
    } catch (err) {
      setEditError(err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (passwordForm.new_password.length < 6) {
      setPasswordError('رمز عبور جدید باید حداقل 6 کاراکتر باشد');
      return;
    }

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setPasswordError('رمز عبور جدید و تکرار آن یکسان نیستند');
      return;
    }

    setPasswordLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/profile/change-password`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'خطا در تغییر رمز عبور');
      }

      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: ''
      });
      setPasswordSuccess(true);
      setTimeout(() => {
        setChangePasswordMode(false);
        setPasswordSuccess(false);
      }, 2000);
    } catch (err) {
      setPasswordError(err.message);
    } finally {
      setPasswordLoading(false);
    }
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;
  if (!profile) return <div className="error">خطا در بارگذاری پروفایل</div>;

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="avatar-large">
          {profile.user.full_name.charAt(0)}
        </div>
        <div className="user-info">
          <h1>{profile.user.full_name}</h1>
          <p className="email">{profile.user.email}</p>
          <div className="badges">
            <span className={`role-badge ${profile.user.role}`}>
              {profile.user.role === 'admin' ? '👑 مدیر' : '👤 کاربر'}
            </span>
            <span className="date-badge">
              📅 عضو از {new Date(profile.user.created_at).toLocaleDateString('fa-IR')}
            </span>
          </div>
        </div>
        <div className="header-actions">
          <button className="btn-edit" onClick={() => setEditMode(true)}>
            ✏️ ویرایش پروفایل
          </button>
          <button className="btn-password" onClick={() => setChangePasswordMode(true)}>
            🔒 تغییر رمز عبور
          </button>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {editMode && (
        <div className="modal-overlay" onClick={() => setEditMode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ویرایش پروفایل</h3>
            {editError && <div className="error-message">{editError}</div>}
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>نام و نام خانوادگی</label>
                <input
                  type="text"
                  value={editForm.full_name}
                  onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>ایمیل</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={editLoading}>
                  {editLoading ? 'در حال ذخیره...' : 'ذخیره تغییرات'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditMode(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {changePasswordMode && (
        <div className="modal-overlay" onClick={() => setChangePasswordMode(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>تغییر رمز عبور</h3>
            {passwordError && <div className="error-message">{passwordError}</div>}
            {passwordSuccess && <div className="success-message">✅ رمز عبور با موفقیت تغییر کرد</div>}
            <form onSubmit={handlePasswordSubmit}>
              <div className="form-group">
                <label>رمز عبور فعلی</label>
                <input
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({...passwordForm, current_password: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>رمز عبور جدید</label>
                <input
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                  required
                  minLength={6}
                />
                <small>حداقل 6 کاراکتر</small>
              </div>
              <div className="form-group">
                <label>تکرار رمز عبور جدید</label>
                <input
                  type="password"
                  value={passwordForm.confirm_password}
                  onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                  required
                />
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={passwordLoading}>
                  {passwordLoading ? 'در حال تغییر...' : 'تغییر رمز عبور'}
                </button>
                <button type="button" className="btn-secondary" onClick={() => setChangePasswordMode(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={activeTab === 'overview' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('overview')}
        >
          📊 نمای کلی
        </button>
        <button 
          className={activeTab === 'activity' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('activity')}
        >
          📝 فعالیت‌ها
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'overview' && (
          <>
            <div className="info-section">
              <h2>🏢 اطلاعات سازمان</h2>
              <div className="info-card">
                <div className="info-item">
                  <span className="label">نام سازمان:</span>
                  <span className="value">{profile.organization.name}</span>
                </div>
              </div>
            </div>

            {profile.teams.length > 0 && (
              <div className="teams-section">
                <h2>👥 تیم‌ها</h2>
                <div className="teams-grid">
                  {profile.teams.map(team => (
                    <div key={team.id} className="team-card">
                      <h3>{team.name}</h3>
                      {team.description && <p>{team.description}</p>}
                      <div className="team-footer">
                        <span className="team-role">{team.role}</span>
                        <span className="team-date">
                          {new Date(team.joined_at).toLocaleDateString('fa-IR')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="stats-section">
              <h2>📈 آمار فعالیت</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📋</div>
                  <div className="stat-value">{profile.stats.tasks.total}</div>
                  <div className="stat-label">کل وظایف</div>
                </div>
                <div className="stat-card todo">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-value">{profile.stats.tasks.todo}</div>
                  <div className="stat-label">در انتظار</div>
                </div>
                <div className="stat-card progress">
                  <div className="stat-icon">🔄</div>
                  <div className="stat-value">{profile.stats.tasks.in_progress}</div>
                  <div className="stat-label">در حال انجام</div>
                </div>
                <div className="stat-card done">
                  <div className="stat-icon">✅</div>
                  <div className="stat-value">{profile.stats.tasks.done}</div>
                  <div className="stat-label">تکمیل شده</div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-icon">⚠️</div>
                  <div className="stat-value">{profile.stats.tasks.upcoming}</div>
                  <div className="stat-label">نزدیک به موعد</div>
                </div>
                <div className="stat-card danger">
                  <div className="stat-icon">🔴</div>
                  <div className="stat-value">{profile.stats.tasks.overdue}</div>
                  <div className="stat-label">گذشته از موعد</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💬</div>
                  <div className="stat-value">{profile.stats.comments}</div>
                  <div className="stat-label">نظرات</div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🔔</div>
                  <div className="stat-value">{profile.stats.unread_notifications}</div>
                  <div className="stat-label">اعلان‌های جدید</div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'activity' && activity && (
          <div className="activity-container">
            <div className="activity-section">
              <h2>📋 آخرین وظایف</h2>
              {activity.recent_tasks.length === 0 ? (
                <p className="empty-state">وظیفه‌ای وجود ندارد</p>
              ) : (
                <div className="activity-list">
                  {activity.recent_tasks.map(task => (
                    <div 
                      key={task.id} 
                      className="activity-item clickable"
                      onClick={() => onTaskClick && onTaskClick(task.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="activity-icon">📋</div>
                      <div className="activity-content">
                        <strong>{task.title}</strong>
                        <span className={`status-badge ${task.status}`}>
                          {task.status === 'done' ? 'انجام شده' : task.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                        </span>
                        <small>{new Date(task.createdAt).toLocaleDateString('fa-IR')}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="activity-section">
              <h2>💬 آخرین نظرات</h2>
              {activity.recent_comments.length === 0 ? (
                <p className="empty-state">نظری وجود ندارد</p>
              ) : (
                <div className="activity-list">
                  {activity.recent_comments.map(comment => (
                    <div 
                      key={comment.id} 
                      className="activity-item clickable"
                      onClick={() => onTaskClick && comment.task && onTaskClick(comment.task.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="activity-icon">💬</div>
                      <div className="activity-content">
                        <p>{comment.content}</p>
                        <small>در وظیفه: {comment.task.title}</small>
                        <small>{new Date(comment.createdAt).toLocaleDateString('fa-IR')}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="activity-section">
              <h2>🔔 آخرین اعلان‌ها</h2>
              {activity.recent_notifications.length === 0 ? (
                <p className="empty-state">اعلانی وجود ندارد</p>
              ) : (
                <div className="activity-list">
                  {activity.recent_notifications.map(notif => (
                    <div key={notif.id} className={`activity-item ${!notif.isRead ? 'unread' : ''}`}>
                      <div className="activity-icon">🔔</div>
                      <div className="activity-content">
                        <strong>{notif.title}</strong>
                        <p>{notif.message}</p>
                        <small>{new Date(notif.createdAt).toLocaleDateString('fa-IR')}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
