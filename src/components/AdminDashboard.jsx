import { useState, useEffect, useMemo } from 'react';
import API_BASE_URL from '../config';
import { Users, Target, CheckSquare, TrendingUp, AlertCircle, Clock, Filter, X } from 'lucide-react';
import { toJalali } from '../utils/dateUtils';
import './AdminDashboard.css';

function AdminDashboard({ token, user }) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orgUsers, setOrgUsers] = useState([]);
  
  // فیلترها
  const [selectedTeam, setSelectedTeam] = useState('');
  const [selectedUser, setSelectedUser] = useState('');

  useEffect(() => {
    // فعلاً برای همه نمایش داده می‌شود
    fetchAdminDashboard();
    fetchOrgUsers();
  }, [user]);

  const fetchAdminDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/dashboard/admin`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setDashboardData(data);
      } else if (response.status === 403) {
        setError('شما دسترسی به این بخش ندارید. فقط ادمین‌ها می‌توانند این صفحه را مشاهده کنند.');
      } else {
        setError('خطا در دریافت اطلاعات');
      }
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      setError('خطا در برقراری ارتباط با سرور');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrgUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/list`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrgUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // فیلتر کردن داده‌ها بر اساس تیم و کاربر انتخاب شده
  const filteredData = useMemo(() => {
    if (!dashboardData) return null;

    let filteredObjectives = dashboardData.objectives || [];
    let filteredTasks = dashboardData.recent_tasks || [];
    let filteredTeams = dashboardData.teams || [];

    // فیلتر بر اساس تیم
    if (selectedTeam) {
      const teamMembers = filteredTeams.find(t => t.id === selectedTeam)?.members || [];
      const teamMemberIds = teamMembers.map(m => m.user_id);
      
      filteredObjectives = filteredObjectives.filter(obj => 
        teamMemberIds.includes(obj.createdBy?.user_id || obj.creator?.user_id)
      );
      filteredTasks = filteredTasks.filter(task => 
        teamMemberIds.includes(task.assignee?.user_id) || 
        teamMemberIds.includes(task.createdBy?.user_id || task.creator?.user_id)
      );
      filteredTeams = filteredTeams.filter(t => t.id === selectedTeam);
    }

    // فیلتر بر اساس کاربر
    if (selectedUser) {
      filteredObjectives = filteredObjectives.filter(obj => 
        (obj.createdBy?.user_id || obj.creator?.user_id) === selectedUser
      );
      filteredTasks = filteredTasks.filter(task => 
        task.assignee?.user_id === selectedUser || 
        (task.createdBy?.user_id || task.creator?.user_id) === selectedUser
      );
    }

    // محاسبه آمار فیلتر شده
    const todoTasks = filteredTasks.filter(t => t.status === 'todo').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in_progress').length;
    const doneTasks = filteredTasks.filter(t => t.status === 'done').length;
    const totalTasks = filteredTasks.length;
    const completionRate = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

    return {
      objectives: filteredObjectives,
      recent_tasks: filteredTasks,
      teams: filteredTeams,
      summary: {
        ...dashboardData.summary,
        total_objectives: filteredObjectives.length,
        total_tasks: totalTasks,
        todo_tasks: todoTasks,
        in_progress_tasks: inProgressTasks,
        done_tasks: doneTasks,
        completion_rate: completionRate,
        total_teams: filteredTeams.length
      }
    };
  }, [dashboardData, selectedTeam, selectedUser]);

  const clearFilters = () => {
    setSelectedTeam('');
    setSelectedUser('');
  };

  const hasActiveFilters = selectedTeam || selectedUser;

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">در حال بارگذاری...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-dashboard">
        <div className="error-message">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!dashboardData || !filteredData) return null;

  const { summary, objectives, recent_tasks, teams } = filteredData;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>داشبورد مدیریت</h1>
          <p>مدیریت کامل سازمان</p>
        </div>
      </div>

      {/* فیلترها */}
      <div className="filters-section">
        <div className="filters-header">
          <Filter className="w-5 h-5" />
          <span>فیلترها</span>
          {hasActiveFilters && (
            <button className="clear-filters-btn" onClick={clearFilters}>
              <X className="w-4 h-4" />
              پاک کردن فیلترها
            </button>
          )}
        </div>
        <div className="filters-grid">
          <div className="filter-item">
            <label>تیم</label>
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
              className="filter-select"
            >
              <option value="">همه تیم‌ها</option>
              {dashboardData.teams?.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-item">
            <label>کاربر</label>
            <select 
              value={selectedUser} 
              onChange={(e) => setSelectedUser(e.target.value)}
              className="filter-select"
            >
              <option value="">همه کاربران</option>
              {orgUsers.map(u => (
                <option key={u.user_id} value={u.user_id}>{u.full_name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e0e7ff' }}>
            <Users className="w-6 h-6 text-indigo-600" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.total_users}</div>
            <div className="stat-label">کاربران</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dbeafe' }}>
            <Target className="w-6 h-6 text-blue-600" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.total_objectives}</div>
            <div className="stat-label">اهداف</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#dcfce7' }}>
            <CheckSquare className="w-6 h-6 text-green-600" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.total_tasks}</div>
            <div className="stat-label">وظایف</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fef3c7' }}>
            <TrendingUp className="w-6 h-6 text-yellow-600" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.completion_rate}%</div>
            <div className="stat-label">نرخ تکمیل</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fee2e2' }}>
            <Clock className="w-6 h-6 text-red-600" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.overdue_tasks}</div>
            <div className="stat-label">وظایف عقب افتاده</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e8ff' }}>
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summary.total_teams}</div>
            <div className="stat-label">تیم‌ها</div>
          </div>
        </div>
      </div>

      {/* Tasks Status */}
      <div className="tasks-status-section">
        <h2>وضعیت وظایف</h2>
        <div className="tasks-status-grid">
          <div className="status-card todo">
            <div className="status-value">{summary.todo_tasks}</div>
            <div className="status-label">در انتظار</div>
          </div>
          <div className="status-card in-progress">
            <div className="status-value">{summary.in_progress_tasks}</div>
            <div className="status-label">در حال انجام</div>
          </div>
          <div className="status-card done">
            <div className="status-value">{summary.done_tasks}</div>
            <div className="status-label">تکمیل شده</div>
          </div>
        </div>
      </div>

      {/* Objectives Section */}
      <div className="section">
        <h2>اهداف سازمان</h2>
        <div className="objectives-list">
          {objectives && objectives.length > 0 ? (
            objectives.map(obj => (
              <div key={obj.id} className="objective-card">
                <div className="objective-header">
                  <h3>{obj.title}</h3>
                  <span className="creator-badge">
                    سازنده: {obj.createdBy?.full_name || obj.creator?.full_name || '-'}
                  </span>
                </div>
                <div className="objective-info">
                  <p>📅 {obj.start_date ? toJalali(obj.start_date) : '-'} تا {obj.end_date ? toJalali(obj.end_date) : '-'}</p>
                  <p>📊 پیشرفت: {obj.progress_percentage || 0}%</p>
                  <p>🎯 {obj.key_results?.length || 0} شاخص کلیدی</p>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${obj.progress_percentage}%` }}
                  />
                </div>
              </div>
            ))
          ) : (
            <p className="empty-state">هیچ هدفی وجود ندارد</p>
          )}
        </div>
      </div>

      {/* Recent Tasks Section */}
      <div className="section">
        <h2>وظایف اخیر</h2>
        <div className="tasks-table">
          <table>
            <thead>
              <tr>
                <th>عنوان</th>
                <th>مسئول</th>
                <th>سازنده</th>
                <th>وضعیت</th>
                <th>نوع</th>
              </tr>
            </thead>
            <tbody>
              {recent_tasks && recent_tasks.length > 0 ? (
                recent_tasks.map(task => (
                  <tr key={task.id}>
                    <td>{task.title}</td>
                    <td>{task.assignee?.full_name || '-'}</td>
                    <td>{task.createdBy?.full_name || task.creator?.full_name || '-'}</td>
                    <td>
                      <span className={`status-badge ${task.status}`}>
                        {task.status === 'done' ? 'تکمیل شده' : 
                         task.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                      </span>
                    </td>
                    <td>
                      <span className={`type-badge ${task.type}`}>
                        {task.type === 'special' ? '⭐ ویژه' : '📌 معمولی'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">هیچ وظیفه‌ای وجود ندارد</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Teams Section */}
      <div className="section">
        <h2>تیم‌های سازمان</h2>
        <div className="teams-grid">
          {teams && teams.length > 0 ? (
            teams.map(team => (
              <div key={team.id} className="team-card">
                <h3>{team.name}</h3>
                <p className="team-members-count">
                  👥 {team.members_count} عضو
                </p>
                {team.members && team.members.length > 0 && (
                  <div className="team-members">
                    {team.members.slice(0, 5).map(member => (
                      <div key={member.user_id} className="member-item">
                        {member.full_name}
                      </div>
                    ))}
                    {team.members.length > 5 && (
                      <div className="member-item more">
                        +{team.members.length - 5} نفر دیگر
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="empty-state">هیچ تیمی وجود ندارد</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
