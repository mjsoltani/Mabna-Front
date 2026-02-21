import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { toJalali } from '../utils/dateUtils';
import './DashboardStats.css';

function DashboardStats({ token, onObjectiveClick, onTaskClick }) {
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all'); // all, week, month, quarter

  useEffect(() => {
    fetchData();
  }, [timeFilter]);

  const fetchData = async () => {
    try {
      const params = new URLSearchParams();
      if (timeFilter !== 'all') {
        params.append('period', timeFilter);
      }
      
      const [statsRes, dashboardRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/dashboard/stats?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/dashboard?${params}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
      if (dashboardRes.ok) {
        const data = await dashboardRes.json();
        setDashboard(data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری آمار...</div>;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="dashboard-container">
      {/* فیلتر زمانی */}
      <div className="time-filter-section">
        <h2 className="section-title">داشبورد</h2>
        <div className="time-filter-buttons">
          <button 
            className={`filter-btn ${timeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTimeFilter('all')}
          >
            همه
          </button>
          <button 
            className={`filter-btn ${timeFilter === 'week' ? 'active' : ''}`}
            onClick={() => setTimeFilter('week')}
          >
            هفته اخیر
          </button>
          <button 
            className={`filter-btn ${timeFilter === 'month' ? 'active' : ''}`}
            onClick={() => setTimeFilter('month')}
          >
            ماه اخیر
          </button>
          <button 
            className={`filter-btn ${timeFilter === 'quarter' ? 'active' : ''}`}
            onClick={() => setTimeFilter('quarter')}
          >
            سه ماه اخیر
          </button>
        </div>
      </div>

      {/* کارت‌های آمار */}
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🎯</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_objectives || 0}</div>
            <div className="stat-label">اهداف</div>
          </div>
        </div>

        <div className="stat-card green">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_key_results || 0}</div>
            <div className="stat-label">شاخص‌های کلیدی</div>
          </div>
        </div>

        <div className="stat-card purple">
          <div className="stat-icon">✅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.total_tasks || 0}</div>
            <div className="stat-label">وظایف</div>
          </div>
        </div>

        <div className="stat-card orange">
          <div className="stat-icon">📈</div>
          <div className="stat-content">
            <div className="stat-value">{stats.completion_rate || 0}%</div>
            <div className="stat-label">نرخ تکمیل</div>
          </div>
        </div>
      </div>

      {/* پیشرفت اهداف */}
      {dashboard && dashboard.objectives && dashboard.objectives.length > 0 && (
        <div className="objectives-progress-section">
          <h2 className="section-title">پیشرفت اهداف</h2>
          <div className="objectives-list">
            {dashboard.objectives.map(obj => {
              const krList = Array.isArray(obj.key_results) ? obj.key_results : [];
              const krProgresses = krList.map(k => typeof k.progress === 'number' ? k.progress : 0);
              const avgProgress = krProgresses.length > 0 
                ? Math.round(krProgresses.reduce((a,b)=>a+b,0) / krProgresses.length)
                : 0;
              const progress = typeof obj.progress === 'number' ? obj.progress : avgProgress;
              const status = progress >= 70 ? 'ontrack' : progress >= 40 ? 'atrisk' : 'behind';
              const completedKRs = krList.filter(k => (k.progress || 0) >= 100).length;
              return (
                <div 
                  key={obj.id} 
                  className="objective-progress-card clickable"
                  onClick={() => onObjectiveClick && onObjectiveClick(obj.id)}
                >
                  <div className="objective-header">
                    <h3 className="objective-title">{obj.title}</h3>
                    <div className={`status-chip ${status}`}>
                      {status === 'ontrack' ? 'روی روال' : status === 'atrisk' ? 'در معرض خطر' : 'عقب‌مانده'}
                    </div>
                  </div>
                  <div className="progress-bar-container">
                    <div 
                      className="progress-bar-fill"
                      style={{ width: `${progress}%` }}
                    >
                      <span className="progress-label">{progress}%</span>
                    </div>
                  </div>
                  <div className="objective-meta">
                    <span className="meta-item">📊 {krList.length} شاخص کلیدی</span>
                    <span className="meta-item">✅ {completedKRs}/{krList.length} تکمیل</span>
                    <span className="meta-item">📅 {toJalali(obj.start_date)} تا {toJalali(obj.end_date)}</span>
                  </div>

                  {/* شاخص‌های کلیدی */}
                  {krList.length > 0 && (
                    <div className="kr-progress-list">
                      {krList.map(kr => (
                        <div key={kr.id} className="kr-progress-item">
                          <div className="kr-info">
                            <span className="kr-name">{kr.title}</span>
                            <span className="kr-percentage">{kr.progress || 0}%</span>
                          </div>
                          <div className="kr-progress-bar">
                            <div 
                              className="kr-progress-fill"
                              style={{ width: `${kr.progress || 0}%` }}
                            ></div>
                          </div>
                          <div className="kr-values">
                            {kr.initial_value} → {kr.target_value}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* آمار وضعیت وظایف */}
      {stats.tasks_by_status && (
        <div className="tasks-status-section">
          <h2 className="section-title">وضعیت وظایف</h2>
          <div className="status-cards">
            <div className="status-card todo">
              <div className="status-icon">⏳</div>
              <div className="status-info">
                <div className="status-value">{stats.tasks_by_status.todo || 0}</div>
                <div className="status-label">انجام نشده</div>
              </div>
            </div>
            <div className="status-card progress">
              <div className="status-icon">🔄</div>
              <div className="status-info">
                <div className="status-value">{stats.tasks_by_status.in_progress || 0}</div>
                <div className="status-label">در حال انجام</div>
              </div>
            </div>
            <div className="status-card done">
              <div className="status-icon">✅</div>
              <div className="status-info">
                <div className="status-value">{stats.tasks_by_status.done || 0}</div>
                <div className="status-label">انجام شده</div>
              </div>
            </div>
          </div>

          {/* وظایف اخیر */}
          {dashboard?.recent_tasks && dashboard.recent_tasks.length > 0 && (
            <div className="recent-tasks-section" style={{ marginTop: '24px' }}>
              <h3 className="section-subtitle">وظایف اخیر</h3>
              <div className="tasks-list">
                {dashboard.recent_tasks.slice(0, 5).map(task => (
                  <div 
                    key={task.id} 
                    className="task-item clickable"
                    onClick={() => onTaskClick && onTaskClick(task.id)}
                    style={{ 
                      padding: '16px',
                      background: '#f9fafb',
                      borderRadius: '12px',
                      border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      marginBottom: '12px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#e0e7ff';
                      e.currentTarget.style.borderColor = '#818cf8';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#f9fafb';
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>
                        {task.priority === 'high' ? '🔴' : task.priority === 'medium' ? '🟡' : '🟢'}
                      </span>
                      <strong style={{ flex: 1 }}>{task.title}</strong>
                      <span className={`status-badge ${task.status}`} style={{
                        padding: '4px 12px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {task.status === 'done' ? 'انجام شده' : task.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                      </span>
                    </div>
                    {task.description && (
                      <p style={{ fontSize: '13px', color: '#6b7280', margin: '8px 0' }}>
                        {task.description.length > 80 ? task.description.substring(0, 80) + '...' : task.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', gap: '16px', fontSize: '12px', color: '#9ca3af', flexWrap: 'wrap' }}>
                      {task.assignee && <span>👤 {task.assignee.full_name}</span>}
                      {task.deadline && <span>⏰ {new Date(task.deadline).toLocaleDateString('fa-IR')}</span>}
                      {task.subtasks && task.subtasks.total > 0 && (
                        <span>📝 {task.subtasks.completed}/{task.subtasks.total} زیروظیفه</span>
                      )}
                      {task.is_creator && <span style={{ color: '#6366f1' }}>سازنده</span>}
                      {task.is_assignee && <span style={{ color: '#10b981' }}>مسئول</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* نمودار میله‌ای */}
          <div className="chart-container">
            <h3 className="chart-title">نمودار توزیع وظایف</h3>
            <div className="bar-chart">
              <div className="bar-item">
                <div className="bar-label">انجام نشده</div>
                <div className="bar-wrapper">
                  <div 
                    className="bar-fill todo-bar"
                    style={{ 
                      width: `${stats.total_tasks > 0 ? ((stats.tasks_by_status.todo || 0) / stats.total_tasks * 100) : 0}%` 
                    }}
                  >
                    <span className="bar-value">{stats.tasks_by_status.todo || 0}</span>
                  </div>
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-label">در حال انجام</div>
                <div className="bar-wrapper">
                  <div 
                    className="bar-fill progress-bar"
                    style={{ 
                      width: `${stats.total_tasks > 0 ? ((stats.tasks_by_status.in_progress || 0) / stats.total_tasks * 100) : 0}%` 
                    }}
                  >
                    <span className="bar-value">{stats.tasks_by_status.in_progress || 0}</span>
                  </div>
                </div>
              </div>
              <div className="bar-item">
                <div className="bar-label">انجام شده</div>
                <div className="bar-wrapper">
                  <div 
                    className="bar-fill done-bar"
                    style={{ 
                      width: `${stats.total_tasks > 0 ? ((stats.tasks_by_status.done || 0) / stats.total_tasks * 100) : 0}%` 
                    }}
                  >
                    <span className="bar-value">{stats.tasks_by_status.done || 0}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* نمودار دایره‌ای پیشرفت کلی */}
      <div className="overall-progress-section">
        <h2 className="section-title">پیشرفت کلی سازمان</h2>
        <div className="progress-grid">
          <div className="circular-progress-card">
            <div className="circular-chart-wrapper">
              <svg className="circular-chart" viewBox="0 0 200 200">
                <circle className="circle-bg" cx="100" cy="100" r="80" />
                <circle 
                  className="circle-progress"
                  cx="100" 
                  cy="100" 
                  r="80"
                  style={{
                    strokeDasharray: `${(stats.completion_rate || 0) * 5.02} 502`,
                    stroke: '#2563eb'
                  }}
                />
                <text x="100" y="95" className="circle-text-value">{stats.completion_rate || 0}%</text>
                <text x="100" y="115" className="circle-text-label">تکمیل شده</text>
              </svg>
            </div>
            <div className="progress-details">
              <div className="detail-item">
                <span className="detail-label">وظایف انجام شده</span>
                <span className="detail-value">{stats.tasks_by_status?.done || 0} از {stats.total_tasks || 0}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">وظایف باقی‌مانده</span>
                <span className="detail-value">{(stats.tasks_by_status?.todo || 0) + (stats.tasks_by_status?.in_progress || 0)}</span>
              </div>
            </div>
          </div>

          {/* نمودار پیشرفت اهداف */}
          <div className="objectives-chart-card">
            <h3 className="chart-subtitle">پیشرفت اهداف</h3>
            <div className="objectives-mini-chart">
              {dashboard?.objectives?.map((obj, index) => {
                const colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6'];
                return (
                  <div key={obj.id} className="mini-objective-bar">
                    <div className="mini-obj-header">
                      <span className="mini-obj-title">{obj.title}</span>
                      <span className="mini-obj-percent">{obj.progress || 0}%</span>
                    </div>
                    <div className="mini-progress-bar">
                      <div 
                        className="mini-progress-fill"
                        style={{ 
                          width: `${obj.progress || 0}%`,
                          background: colors[index % colors.length]
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* آمار تفصیلی */}
      <div className="detailed-stats-section">
        <h2 className="section-title">آمار تفصیلی</h2>
        
        {/* خلاصه وظایف */}
        {dashboard?.tasks_summary && (
          <div className="tasks-summary-grid" style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div className="summary-card" style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{dashboard.tasks_summary.total}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>کل وظایف</div>
            </div>
            <div className="summary-card" style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{dashboard.tasks_summary.my_tasks}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>وظایف من</div>
            </div>
            <div className="summary-card" style={{
              padding: '20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              borderRadius: '16px',
              color: 'white',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}>
              <div style={{ fontSize: '32px', fontWeight: '700' }}>{dashboard.tasks_summary.created_by_me}</div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>ساخته شده توسط من</div>
            </div>
          </div>
        )}

        <div className="detailed-grid">
          <div className="detail-card">
            <div className="detail-header">
              <span className="detail-icon">🎯</span>
              <span className="detail-title">اهداف فعال</span>
            </div>
            <div className="detail-body">
              <div className="big-number">{stats.total_objectives || 0}</div>
              <div className="detail-progress-bar">
                <div 
                  className="detail-progress-fill blue-fill"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="detail-footer">
                <span>📊 {stats.total_key_results || 0} نتیجه کلیدی</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-header">
              <span className="detail-icon">✅</span>
              <span className="detail-title">وظایف تکمیل شده</span>
            </div>
            <div className="detail-body">
              <div className="big-number">{stats.tasks_by_status?.done || 0}</div>
              <div className="detail-progress-bar">
                <div 
                  className="detail-progress-fill green-fill"
                  style={{ 
                    width: `${stats.total_tasks > 0 ? ((stats.tasks_by_status?.done || 0) / stats.total_tasks * 100) : 0}%` 
                  }}
                />
              </div>
              <div className="detail-footer">
                <span>از {stats.total_tasks || 0} وظیفه</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-header">
              <span className="detail-icon">🔄</span>
              <span className="detail-title">در حال انجام</span>
            </div>
            <div className="detail-body">
              <div className="big-number">{stats.tasks_by_status?.in_progress || 0}</div>
              <div className="detail-progress-bar">
                <div 
                  className="detail-progress-fill blue-fill"
                  style={{ 
                    width: `${stats.total_tasks > 0 ? ((stats.tasks_by_status?.in_progress || 0) / stats.total_tasks * 100) : 0}%` 
                  }}
                />
              </div>
              <div className="detail-footer">
                <span>در دست اقدام</span>
              </div>
            </div>
          </div>

          <div className="detail-card">
            <div className="detail-header">
              <span className="detail-icon">⏳</span>
              <span className="detail-title">در انتظار</span>
            </div>
            <div className="detail-body">
              <div className="big-number">{stats.tasks_by_status?.todo || 0}</div>
              <div className="detail-progress-bar">
                <div 
                  className="detail-progress-fill orange-fill"
                  style={{ 
                    width: `${stats.total_tasks > 0 ? ((stats.tasks_by_status?.todo || 0) / stats.total_tasks * 100) : 0}%` 
                  }}
                />
              </div>
              <div className="detail-footer">
                <span>نیاز به شروع</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardStats;
