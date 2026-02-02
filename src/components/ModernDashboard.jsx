import { useState, useEffect } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, CheckCircle, Clock, Users, Activity, ClipboardList, AlertCircle, Circle, User, FileText } from 'lucide-react';
import API_BASE_URL from '../config';
import { toJalali } from '../utils/dateUtils';
import './ModernDashboard.css';

function ModernDashboard({ token, onObjectiveClick, onTaskClick }) {
  const [stats, setStats] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');

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
    return (
      <div className="modern-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>در حال بارگذاری داشبورد...</p>
      </div>
    );
  }

  if (!stats) return null;

  // داده برای نمودار خطی (پیشرفت در طول زمان)
  const progressData = dashboard?.objectives?.map((obj, index) => ({
    name: obj.title.substring(0, 15) + '...',
    progress: obj.progress || 0,
    target: 100
  })) || [];

  // داده برای نمودار دایره‌ای (توزیع وظایف)
  const taskDistribution = [
    { name: 'تکمیل شده', value: stats.tasks_by_status?.done || 0, color: '#10b981' },
    { name: 'در حال انجام', value: stats.tasks_by_status?.in_progress || 0, color: '#3b82f6' },
    { name: 'در انتظار', value: stats.tasks_by_status?.todo || 0, color: '#f59e0b' }
  ];

  // داده برای نمودار میله‌ای (اهداف برتر)
  const topObjectives = dashboard?.objectives?.slice(0, 5).map(obj => ({
    name: obj.title.substring(0, 20),
    progress: obj.progress || 0,
    krs: obj.key_results?.length || 0
  })) || [];

  return (
    <div className="modern-dashboard">
      {/* Hero Section با کارت‌های متریک */}
      <div className="dashboard-hero">
        <div className="hero-header">
          <div>
            <h1 className="hero-title">داشبورد مبنا</h1>
            <p className="hero-subtitle">نمای کلی عملکرد و پیشرفت</p>
          </div>
          
          <div className="time-filter-modern">
            <button 
              className={`filter-chip ${timeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setTimeFilter('all')}
            >
              همه
            </button>
            <button 
              className={`filter-chip ${timeFilter === 'week' ? 'active' : ''}`}
              onClick={() => setTimeFilter('week')}
            >
              هفته
            </button>
            <button 
              className={`filter-chip ${timeFilter === 'month' ? 'active' : ''}`}
              onClick={() => setTimeFilter('month')}
            >
              ماه
            </button>
            <button 
              className={`filter-chip ${timeFilter === 'quarter' ? 'active' : ''}`}
              onClick={() => setTimeFilter('quarter')}
            >
              فصل
            </button>
          </div>
        </div>

        <div className="metrics-grid">
          <div className="metric-card glass-card">
            <div className="metric-icon blue-glow">
              <Target className="icon" />
            </div>
            <div className="metric-content">
              <p className="metric-label">اهداف فعال</p>
              <h3 className="metric-value">{stats.total_objectives || 0}</h3>
              <p className="metric-change positive">
                <TrendingUp className="change-icon" />
                <span>+12% از ماه قبل</span>
              </p>
            </div>
          </div>

          <div className="metric-card glass-card">
            <div className="metric-icon green-glow">
              <CheckCircle className="icon" />
            </div>
            <div className="metric-content">
              <p className="metric-label">نرخ تکمیل</p>
              <h3 className="metric-value">{stats.completion_rate || 0}%</h3>
              <p className="metric-change positive">
                <TrendingUp className="change-icon" />
                <span>+8% از ماه قبل</span>
              </p>
            </div>
          </div>

          <div className="metric-card glass-card">
            <div className="metric-icon purple-glow">
              <Activity className="icon" />
            </div>
            <div className="metric-content">
              <p className="metric-label">نتایج کلیدی</p>
              <h3 className="metric-value">{stats.total_key_results || 0}</h3>
              <p className="metric-change neutral">
                <span>در حال پیگیری</span>
              </p>
            </div>
          </div>

          <div className="metric-card glass-card">
            <div className="metric-icon orange-glow">
              <Clock className="icon" />
            </div>
            <div className="metric-content">
              <p className="metric-label">وظایف فعال</p>
              <h3 className="metric-value">{stats.total_tasks || 0}</h3>
              <p className="metric-change neutral">
                <span>{stats.tasks_by_status?.done || 0} تکمیل شده</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* بخش نمودارها */}
      <div className="charts-section">
        <div className="chart-row">
          {/* نمودار خطی پیشرفت */}
          <div className="chart-card glass-card">
            <div className="chart-header">
              <h3 className="chart-title">پیشرفت اهداف</h3>
              <span className="chart-subtitle">نمای کلی عملکرد</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topObjectives}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="progress" fill="url(#colorProgress)" radius={[8, 8, 0, 0]} />
                <defs>
                  <linearGradient id="colorProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* نمودار دایره‌ای توزیع وظایف */}
          <div className="chart-card glass-card">
            <div className="chart-header">
              <h3 className="chart-title">توزیع وظایف</h3>
              <span className="chart-subtitle">وضعیت کلی</span>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={taskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {taskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* لیست اهداف اخیر */}
      <div className="recent-objectives">
        <div className="section-header">
          <h3 className="section-title">اهداف فعال</h3>
          <button className="view-all-btn">مشاهده همه</button>
        </div>

        {/* وظایف اخیر */}
        {dashboard?.recent_tasks && dashboard.recent_tasks.length > 0 && (
          <div className="recent-tasks-modern" style={{ marginBottom: '32px' }}>
            <h4 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '16px', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ClipboardList size={18} style={{ color: '#6366f1' }} />
              وظایف اخیر
            </h4>
            <div style={{ display: 'grid', gap: '12px' }}>
              {dashboard.recent_tasks.slice(0, 5).map(task => (
                <div 
                  key={task.id}
                  className="task-item-modern glass-card clickable"
                  onClick={() => onTaskClick && onTaskClick(task.id)}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    border: '1px solid rgba(255,255,255,0.1)',
                    background: 'rgba(255,255,255,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(99, 102, 241, 0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      {task.priority === 'high' ? (
                        <AlertCircle size={20} style={{ color: '#ef4444' }} />
                      ) : task.priority === 'medium' ? (
                        <Circle size={20} style={{ color: '#f59e0b', fill: '#f59e0b' }} />
                      ) : (
                        <Circle size={20} style={{ color: '#10b981', fill: '#10b981' }} />
                      )}
                    </span>
                    <strong style={{ flex: 1, fontSize: '14px' }}>{task.title}</strong>
                    <span className={`status-badge ${task.status === 'done' ? 'success' : task.status === 'in_progress' ? 'warning' : 'neutral'}`} style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      {task.status === 'done' ? 'تکمیل' : task.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#94a3b8', flexWrap: 'wrap', alignItems: 'center' }}>
                    {task.assignee && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} />
                        {task.assignee.full_name}
                      </span>
                    )}
                    {task.deadline && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={14} />
                        {new Date(task.deadline).toLocaleDateString('fa-IR')}
                      </span>
                    )}
                    {task.subtasks && task.subtasks.total > 0 && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <FileText size={14} />
                        {task.subtasks.completed}/{task.subtasks.total}
                      </span>
                    )}
                    {task.is_creator && <span style={{ color: '#6366f1' }}>سازنده</span>}
                    {task.is_assignee && <span style={{ color: '#10b981' }}>مسئول</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="objectives-grid">
          {dashboard?.objectives?.slice(0, 6).map(obj => {
            const progress = obj.progress || 0;
            const status = progress >= 70 ? 'success' : progress >= 40 ? 'warning' : 'danger';
            
            return (
              <div 
                key={obj.id} 
                className="objective-card-modern glass-card clickable"
                onClick={() => onObjectiveClick && onObjectiveClick(obj.id)}
              >
                <div className="objective-card-header">
                  <h4 className="objective-card-title">{obj.title}</h4>
                  <span className={`status-badge ${status}`}>
                    {progress}%
                  </span>
                </div>
                
                <div className="objective-card-meta">
                  <span className="meta-item">
                    <Target className="meta-icon" />
                    {obj.key_results?.length || 0} KR
                  </span>
                  <span className="meta-item">
                    <Clock className="meta-icon" />
                    {toJalali(obj.end_date)}
                  </span>
                </div>
                
                <div className="progress-bar-modern">
                  <div 
                    className={`progress-fill-modern ${status}`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ModernDashboard;
