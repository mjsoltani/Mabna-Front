import { useState } from 'react';
import './Dashboard.css';
import Objectives from './Objectives';
import TasksV2 from './TasksV2';
import Invitations from './Invitations';
import DashboardStats from './DashboardStats';
import Notifications from './Notifications';
import Teams from './Teams';
import NotificationBell from './NotificationBell';

function Dashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [focusTaskId, setFocusTaskId] = useState(null);

  return (
    <div className="dashboard">
      <aside className="sidebar">
        <div className="sidebar-header">
          <h2>مبنا</h2>
          <p className="sidebar-subtitle">مدیریت برنامه‌ریزی</p>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={activeTab === 'dashboard' ? 'nav-item active' : 'nav-item'} 
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📈</span>
            <span>داشبورد</span>
          </button>
          <button 
            className={activeTab === 'objectives' ? 'nav-item active' : 'nav-item'} 
            onClick={() => setActiveTab('objectives')}
          >
            <span className="nav-icon">🎯</span>
            <span>اهداف</span>
          </button>
          <button 
            className={activeTab === 'keyresults' ? 'nav-item active' : 'nav-item'} 
            onClick={() => setActiveTab('keyresults')}
          >
            <span className="nav-icon">📊</span>
            <span>نتایج کلیدی</span>
          </button>
          <button 
            className={activeTab === 'teams' ? 'nav-item active' : 'nav-item'} 
            onClick={() => setActiveTab('teams')}
          >
            <span className="nav-icon">👥</span>
            <span>تیم‌ها</span>
          </button>
          <button 
            className={activeTab === 'tasks' ? 'nav-item active' : 'nav-item'} 
            onClick={() => setActiveTab('tasks')}
          >
            <span className="nav-icon">✅</span>
            <span>وظایف</span>
          </button>
          {user.role === 'admin' && (
            <button 
              className={activeTab === 'invitations' ? 'nav-item active' : 'nav-item'} 
              onClick={() => setActiveTab('invitations')}
            >
              <span className="nav-icon">📧</span>
              <span>دعوت کاربران</span>
            </button>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.full_name.charAt(0)}</div>
            <div className="user-details">
              <div className="user-name">{user.full_name}</div>
              <div className="org-name">نام تیم: {user.team?.name || user.organization?.name || '-'}</div>
            </div>
          </div>
          <button onClick={onLogout} className="btn-logout">
            <span>خروج</span>
            <span>←</span>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="content-header">
          <div className="header-row">
            <h1>
              {activeTab === 'dashboard' && 'داشبورد'}
              {activeTab === 'objectives' && 'اهداف'}
              {activeTab === 'keyresults' && 'نتایج کلیدی'}
              {activeTab === 'tasks' && 'وظایف'}
              {activeTab === 'teams' && 'تیم‌ها'}
              {activeTab === 'invitations' && 'دعوت کاربران'}
            </h1>
            <div className="header-actions">
              <NotificationBell 
                token={token}
                onTaskClick={(taskId) => {
                  setActiveTab('tasks');
                  setFocusTaskId(taskId);
                }}
              />
              <Notifications 
                token={token} 
                onNavigateToTask={(taskId) => {
                  setActiveTab('tasks');
                  setFocusTaskId(taskId);
                }}
              />
            </div>
          </div>
        </header>

        <div className="content-body">
          {activeTab === 'dashboard' && <DashboardStats token={token} />}
          {activeTab === 'objectives' && <Objectives token={token} />}
          {activeTab === 'keyresults' && <Objectives token={token} showOnlyKRs={true} />}
          {activeTab === 'tasks' && <TasksV2 token={token} focusTaskId={focusTaskId} />}
          {activeTab === 'teams' && <Teams token={token} user={user} />}
          {activeTab === 'invitations' && <Invitations token={token} />}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
