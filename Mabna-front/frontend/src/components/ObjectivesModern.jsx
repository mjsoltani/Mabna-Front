import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import { ActivityCard } from './ui/activity-card';
import { Target, TrendingUp, CheckCircle2, Calendar, Paperclip, Upload, Trash2, FileText, Image, File, User, Users } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { toJalali } from '../utils/dateUtils';
import './ObjectivesModern.css';

// کامپوننت برای نمایش نتیجه کلیدی
function KeyResultCard({ keyResult, token, onViewDetails, onCreateTask }) {
  const [cardData, setCardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKRDetails();
  }, [keyResult.id]);

  const fetchKRDetails = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${keyResult.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const krDetails = await response.json();
        const tasks = krDetails.tasks || [];
        
        // محاسبه متریک‌ها
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const metrics = [
          {
            label: "وظایف",
            value: totalTasks.toString(),
            trend: progress,
            unit: "عدد"
          },
          {
            label: "تکمیل شده",
            value: completedTasks.toString(),
            trend: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            unit: "عدد"
          },
          {
            label: "در حال انجام",
            value: inProgressTasks.toString(),
            trend: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
            unit: "عدد"
          }
        ];

        // تبدیل وظایف به اهداف روزانه
        const dailyGoals = tasks.map(task => ({
          id: task.id.toString(),
          title: task.title,
          isCompleted: task.status === 'done'
        }));

        setCardData({
          metrics,
          dailyGoals,
          krDetails
        });
      }
    } catch (error) {
      console.error('Error fetching KR details:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full rounded-3xl p-6 bg-white dark:bg-black/5 border border-zinc-200 dark:border-zinc-800 animate-pulse">
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
        <div className="grid grid-cols-3 gap-4">
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
          <div className="h-24 bg-zinc-200 dark:bg-zinc-800 rounded-full"></div>
        </div>
      </div>
    );
  }

  if (!cardData) return null;

  return (
    <ActivityCard
      category={keyResult.objective_title || "نتیجه کلیدی"}
      title={keyResult.title}
      goalsTitle="وظایف"
      metrics={cardData.metrics}
      dailyGoals={cardData.dailyGoals}
      onAddGoal={() => onCreateTask(keyResult.id)}
      onToggleGoal={(taskId) => {
        console.log('Toggle task:', taskId);
      }}
      onViewDetails={onViewDetails}
      className="h-full"
    />
  );
}

function ObjectivesModern({ token, showOnlyKRs }) {
  const [objectives, setObjectives] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKRModal, setShowKRModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showEditKRModal, setShowEditKRModal] = useState(false);
  const [showKRReportModal, setShowKRReportModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [selectedKR, setSelectedKR] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [krReportData, setKrReportData] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteKRConfirm, setDeleteKRConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    assignee_id: '',
    team_id: ''
  });
  const [startValue, setStartValue] = useState(null);
  const [endValue, setEndValue] = useState(null);
  const [editStartValue, setEditStartValue] = useState(null);
  const [editEndValue, setEditEndValue] = useState(null);
  const [krFormData, setKrFormData] = useState({
    title: '',
    initial_value: 0,
    target_value: 0
  });
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [selectedKRForTask, setSelectedKRForTask] = useState(null);
  const [taskFormData, setTaskFormData] = useState({
    title: '',
    assignee_id: ''
  });
  const [teamMembers, setTeamMembers] = useState([]);
  const [orgUsers, setOrgUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [showAttachmentsModal, setShowAttachmentsModal] = useState(false);
  const [selectedObjectiveForAttachments, setSelectedObjectiveForAttachments] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (showOnlyKRs) {
      fetchKeyResults();
    } else {
      fetchObjectives();
    }
    fetchTeamMembers();
    fetchOrgUsers();
    fetchTeams();
  }, [showOnlyKRs]);

  const fetchObjectives = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setObjectives(data);
      }
    } catch (error) {
      console.error('Error fetching objectives:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchKeyResults = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setKeyResults(data);
      }
    } catch (error) {
      console.error('Error fetching key results:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/members`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeamMembers(data);
      }
    } catch (error) {
      console.error('Error fetching team members:', error);
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
      console.error('Error fetching org users:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setTeams(data);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  // توابع مربوط به فایل‌های پیوست
  const fetchAttachments = async (objectiveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}/attachments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAttachments(data);
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    }
  };

  const handleFileUpload = async (e, objectiveId) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingFile(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        await fetchAttachments(objectiveId);
        alert('فایل با موفقیت آپلود شد');
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در آپلود فایل');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('خطا در آپلود فایل');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const handleDeleteAttachment = async (objectiveId, attachmentId) => {
    if (!confirm('آیا از حذف این فایل مطمئن هستید؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchAttachments(objectiveId);
        alert('فایل با موفقیت حذف شد');
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در حذف فایل');
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('خطا در حذف فایل');
    }
  };

  const openAttachmentsModal = async (objective) => {
    setSelectedObjectiveForAttachments(objective);
    await fetchAttachments(objective.id);
    setShowAttachmentsModal(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) return <Image className="w-5 h-5 text-blue-500" />;
    if (mimeType?.includes('pdf')) return <FileText className="w-5 h-5 text-red-500" />;
    return <File className="w-5 h-5 text-zinc-500" />;
  };

  const toYMD = (d) => {
    if (!d) return '';
    const date = d.toDate ? d.toDate() : new Date(d);
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const das = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${das}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation: حداقل یکی از assignee_id یا team_id باید انتخاب بشه
    if (!formData.assignee_id && !formData.team_id) {
      setFormError('لطفاً حداقل یک مسئول یا تیم انتخاب کنید');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        start_date: toYMD(startValue),
        end_date: toYMD(endValue),
        assignee_id: formData.assignee_id || null,
        team_id: formData.team_id || null
      };
      const response = await fetch(`${API_BASE_URL}/api/objectives`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowModal(false);
        setFormData({ title: '', description: '', start_date: '', end_date: '', assignee_id: '', team_id: '' });
        setStartValue(null);
        setEndValue(null);
        setFormError('');
      } else {
        const error = await response.json();
        setFormError(error.error || 'خطا در ایجاد هدف');
      }
    } catch (error) {
      console.error('Error creating objective:', error);
      setFormError('خطا در ایجاد هدف');
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    // Validation: حداقل یکی از assignee_id یا team_id باید انتخاب بشه
    if (!formData.assignee_id && !formData.team_id) {
      setFormError('لطفاً حداقل یک مسئول یا تیم انتخاب کنید');
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description || null,
        start_date: toYMD(editStartValue),
        end_date: toYMD(editEndValue),
        assignee_id: formData.assignee_id || null,
        team_id: formData.team_id || null
      };
      const response = await fetch(`${API_BASE_URL}/api/objectives/${selectedObjective.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowEditModal(false);
        setSelectedObjective(null);
        setFormError('');
      } else {
        const error = await response.json();
        setFormError(error.error || 'خطا در ویرایش هدف');
      }
    } catch (error) {
      console.error('Error updating objective:', error);
      setFormError('خطا در ویرایش هدف');
    }
  };

  const handleDeleteObjective = async (objectiveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchObjectives();
        setDeleteConfirm(null);
      }
    } catch (error) {
      console.error('Error deleting objective:', error);
    }
  };

  const handleAddKR = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${selectedObjective}/keyresults`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(krFormData)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowKRModal(false);
        setKrFormData({ title: '', initial_value: 0, target_value: 0 });
      }
    } catch (error) {
      console.error('Error adding key result:', error);
    }
  };

  const fetchReport = async (objectiveId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${objectiveId}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setReportData(data);
        setShowReportModal(true);
      }
    } catch (error) {
      console.error('Error fetching report:', error);
    }
  };

  const fetchKRReport = async (krId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/report`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setKrReportData(data);
        setShowKRReportModal(true);
      }
    } catch (error) {
      console.error('Error fetching KR report:', error);
    }
  };

  const handleEditKR = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${selectedKR.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(krFormData)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowEditKRModal(false);
        setSelectedKR(null);
        setKrFormData({ title: '', initial_value: 0, target_value: 0 });
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ویرایش نتیجه کلیدی');
      }
    } catch (error) {
      console.error('Error updating key result:', error);
    }
  };

  const handleDeleteKR = async (krId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchObjectives();
        setDeleteKRConfirm(null);
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در حذف نتیجه کلیدی');
      }
    } catch (error) {
      console.error('Error deleting key result:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: taskFormData.title,
          assignee_id: taskFormData.assignee_id,
          key_result_ids: [selectedKRForTask]
        })
      });
      
      if (response.ok) {
        setShowCreateTaskModal(false);
        setTaskFormData({ title: '', assignee_id: '' });
        setSelectedKRForTask(null);
        // رفرش کردن لیست نتایج کلیدی
        if (showOnlyKRs) {
          await fetchKeyResults();
        }
        alert('وظیفه با موفقیت ایجاد شد');
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ایجاد وظیفه');
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('خطا در ایجاد وظیفه');
    }
  };

  // تبدیل داده‌های اهداف به فرمت ActivityCard
  const convertObjectiveToActivityCard = (obj) => {
    const keyResults = obj.key_results || [];
    
    // محاسبه متریک‌ها
    const totalKRs = keyResults.length;
    const completedKRs = keyResults.filter(kr => kr.progress >= 100).length;
    const avgProgress = totalKRs > 0 
      ? Math.round(keyResults.reduce((sum, kr) => sum + (kr.progress || 0), 0) / totalKRs)
      : 0;

    const metrics = [
      {
        label: "نتایج کلیدی",
        value: totalKRs.toString(),
        trend: avgProgress,
        unit: "عدد"
      },
      {
        label: "تکمیل شده",
        value: completedKRs.toString(),
        trend: totalKRs > 0 ? Math.round((completedKRs / totalKRs) * 100) : 0,
        unit: "عدد"
      },
      {
        label: "پیشرفت",
        value: avgProgress.toString(),
        trend: avgProgress,
        unit: "%"
      }
    ];

    // تبدیل نتایج کلیدی به اهداف روزانه
    const dailyGoals = keyResults.map(kr => ({
      id: kr.id.toString(),
      title: kr.title,
      isCompleted: kr.progress >= 100
    }));

    return {
      metrics,
      dailyGoals,
      objective: obj
    };
  };

  // تبدیل داده‌های نتایج کلیدی به فرمت ActivityCard
  const convertKeyResultToActivityCard = async (kr) => {
    // دریافت جزئیات نتیجه کلیدی شامل tasks
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${kr.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const krDetails = await response.json();
        const tasks = krDetails.tasks || [];
        
        // محاسبه متریک‌ها
        const totalTasks = tasks.length;
        const completedTasks = tasks.filter(t => t.status === 'done').length;
        const inProgressTasks = tasks.filter(t => t.status === 'in_progress').length;
        const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        const metrics = [
          {
            label: "وظایف",
            value: totalTasks.toString(),
            trend: progress,
            unit: "عدد"
          },
          {
            label: "تکمیل شده",
            value: completedTasks.toString(),
            trend: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
            unit: "عدد"
          },
          {
            label: "در حال انجام",
            value: inProgressTasks.toString(),
            trend: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
            unit: "عدد"
          }
        ];

        // تبدیل وظایف به اهداف روزانه
        const dailyGoals = tasks.map(task => ({
          id: task.id.toString(),
          title: task.title,
          isCompleted: task.status === 'done'
        }));

        return {
          metrics,
          dailyGoals,
          keyResult: krDetails
        };
      }
    } catch (error) {
      console.error('Error fetching KR details:', error);
    }

    // اگر خطا داشت، داده‌های پایه را برگردان
    return {
      metrics: [
        { label: "مقدار اولیه", value: kr.initial_value.toString(), trend: 0, unit: "" },
        { label: "مقدار هدف", value: kr.target_value.toString(), trend: 100, unit: "" },
        { label: "پیشرفت", value: "0", trend: 0, unit: "%" }
      ],
      dailyGoals: [],
      keyResult: kr
    };
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              {showOnlyKRs ? 'نتایج کلیدی' : 'اهداف'}
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              مدیریت و پیگیری اهداف و نتایج کلیدی
            </p>
          </div>
          {!showOnlyKRs && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 
                rounded-2xl font-medium hover:scale-105 transition-transform duration-200
                flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              هدف جدید
            </button>
          )}
        </div>

        {/* Objectives Grid */}
        {!showOnlyKRs && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {objectives.map(obj => {
              const cardData = convertObjectiveToActivityCard(obj);
              
              return (
                <ActivityCard
                  key={obj.id}
                  category={`${toJalali(obj.start_date)} - ${toJalali(obj.end_date)}`}
                  title={obj.title}
                  description={obj.description}
                  assignee={obj.assignee}
                  team={obj.team}
                  goalsTitle="نتایج کلیدی"
                  metrics={cardData.metrics}
                  dailyGoals={cardData.dailyGoals}
                  attachmentsCount={obj.attachments?.length || 0}
                  onAddGoal={() => {
                    setSelectedObjective(obj.id);
                    setShowKRModal(true);
                  }}
                  onToggleGoal={(goalId) => {
                    // می‌توانید اینجا عملیات toggle را پیاده کنید
                    console.log('Toggle KR:', goalId);
                  }}
                  onViewDetails={() => fetchReport(obj.id)}
                  onViewAttachments={() => openAttachmentsModal(obj)}
                  className="h-full"
                />
              );
            })}
          </div>
        )}

        {/* Key Results Grid */}
        {showOnlyKRs && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyResults.map(kr => {
              return (
                <KeyResultCard
                  key={kr.id}
                  keyResult={kr}
                  token={token}
                  onViewDetails={() => fetchKRReport(kr.id)}
                  onCreateTask={(krId) => {
                    setSelectedKRForTask(krId);
                    setShowCreateTaskModal(true);
                  }}
                />
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!showOnlyKRs && objectives.length === 0 && (
          <div className="text-center py-20">
            <Target className="w-20 h-20 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              هنوز هدفی ایجاد نشده
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              برای شروع، اولین هدف خود را ایجاد کنید
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 
                rounded-2xl font-medium hover:scale-105 transition-transform duration-200
                inline-flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              ایجاد هدف جدید
            </button>
          </div>
        )}

        {/* Empty State for Key Results */}
        {showOnlyKRs && keyResults.length === 0 && (
          <div className="text-center py-20">
            <Target className="w-20 h-20 mx-auto text-zinc-300 dark:text-zinc-700 mb-4" />
            <h3 className="text-2xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">
              هنوز نتیجه کلیدی وجود ندارد
            </h3>
            <p className="text-zinc-500 dark:text-zinc-400 mb-6">
              ابتدا یک هدف ایجاد کنید و سپس نتایج کلیدی را اضافه کنید
            </p>
          </div>
        )}
      </div>

      {/* Modals - استفاده از مودال‌های قبلی */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ایجاد هدف جدید</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>عنوان هدف</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                  placeholder="عنوان هدف را وارد کنید"
                />
              </div>

              <div className="form-group">
                <label>توضیحات</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="توضیحات هدف (اختیاری)"
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>تاریخ شروع</label>
                <DatePicker
                  value={startValue}
                  onChange={setStartValue}
                  calendar={persian}
                  locale={persian_fa}
                  placeholder="تاریخ شروع"
                />
              </div>

              <div className="form-group">
                <label>تاریخ پایان</label>
                <DatePicker
                  value={endValue}
                  onChange={setEndValue}
                  calendar={persian}
                  locale={persian_fa}
                  placeholder="تاریخ پایان"
                />
              </div>

              {/* بخش انتساب */}
              <div className="assignment-section">
                <h4 className="assignment-title">
                  <User className="w-4 h-4" />
                  انتساب به <span className="required">*</span>
                </h4>
                
                {formError && <div className="form-error">{formError}</div>}

                <div className="form-group">
                  <label>مسئول (کاربر)</label>
                  <select
                    value={formData.assignee_id}
                    onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                  >
                    <option value="">انتخاب کنید...</option>
                    {orgUsers.map(user => (
                      <option key={user.user_id} value={user.user_id}>
                        {user.full_name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>تیم</label>
                  <select
                    value={formData.team_id}
                    onChange={(e) => setFormData({ ...formData, team_id: e.target.value })}
                  >
                    <option value="">انتخاب کنید...</option>
                    {teams.map(team => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
                  </select>
                </div>

                <p className="assignment-hint">حداقل یکی از موارد بالا باید انتخاب شود</p>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">ایجاد</button>
                <button type="button" className="btn-secondary" onClick={() => { setShowModal(false); setFormError(''); }}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showKRModal && (
        <div className="modal-overlay" onClick={() => setShowKRModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>اضافه کردن نتیجه کلیدی</h3>
            <form onSubmit={handleAddKR}>
              <div className="form-group">
                <label>عنوان</label>
                <input
                  type="text"
                  value={krFormData.title}
                  onChange={(e) => setKrFormData({ ...krFormData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>مقدار اولیه</label>
                <input
                  type="number"
                  value={krFormData.initial_value}
                  onChange={(e) => setKrFormData({ ...krFormData, initial_value: Number(e.target.value) })}
                />
              </div>

              <div className="form-group">
                <label>مقدار هدف</label>
                <input
                  type="number"
                  value={krFormData.target_value}
                  onChange={(e) => setKrFormData({ ...krFormData, target_value: Number(e.target.value) })}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">اضافه کردن</button>
                <button type="button" className="btn-secondary" onClick={() => setShowKRModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showReportModal && reportData && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3>گزارش: {reportData.title}</h3>
            
            <div className="report-header">
              <p><strong>تاریخ شروع:</strong> {toJalali(reportData.start_date)}</p>
              <p><strong>تاریخ پایان:</strong> {toJalali(reportData.end_date)}</p>
              <p><strong>تعداد نتایج کلیدی:</strong> {reportData.total_key_results}</p>
            </div>

            <div className="report-krs">
              {reportData.key_results?.map(kr => (
                <div key={kr.id} className="report-kr-card">
                  <h4>{kr.title}</h4>
                  <div className="kr-stats">
                    <p>پیشرفت: <strong>{kr.progress_percentage}%</strong></p>
                    <p>وظایف: {kr.completed_tasks} / {kr.total_tasks}</p>
                    <p>مقدار: {kr.initial_value} → {kr.target_value}</p>
                  </div>

                  {kr.tasks && kr.tasks.length > 0 && (
                    <div className="kr-tasks">
                      <h5>وظایف:</h5>
                      {kr.tasks.map(task => (
                        <div key={task.id} className="task-item">
                          <span>{task.title}</span>
                          <span className={`status ${task.status}`}>{task.status}</span>
                          <span className="type">{task.type === 'special' ? '⭐' : '📌'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button className="btn-secondary" onClick={() => setShowReportModal(false)}>
              بستن
            </button>
          </div>
        </div>
      )}

      {/* Modal ایجاد وظیفه برای نتیجه کلیدی */}
      {showCreateTaskModal && (
        <div className="modal-overlay" onClick={() => setShowCreateTaskModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ایجاد وظیفه جدید</h3>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>عنوان وظیفه</label>
                <input
                  type="text"
                  value={taskFormData.title}
                  onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                  required
                  placeholder="عنوان وظیفه را وارد کنید"
                />
              </div>

              <div className="form-group">
                <label>مسئول انجام</label>
                <select
                  value={taskFormData.assignee_id}
                  onChange={(e) => setTaskFormData({ ...taskFormData, assignee_id: e.target.value })}
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {teamMembers.map(member => (
                    <option key={member.user_id} value={member.user_id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">ایجاد وظیفه</button>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateTaskModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal فایل‌های پیوست */}
      {showAttachmentsModal && selectedObjectiveForAttachments && (
        <div className="modal-overlay" onClick={() => setShowAttachmentsModal(false)}>
          <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
            <h3 className="flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              فایل‌های پیوست: {selectedObjectiveForAttachments.title}
            </h3>

            {/* بخش آپلود */}
            <div className="upload-section">
              <label className="upload-btn">
                <input
                  type="file"
                  onChange={(e) => handleFileUpload(e, selectedObjectiveForAttachments.id)}
                  disabled={uploadingFile}
                  style={{ display: 'none' }}
                />
                <Upload className="w-5 h-5" />
                {uploadingFile ? 'در حال آپلود...' : 'آپلود فایل جدید'}
              </label>
              <p className="upload-hint">حداکثر حجم فایل: 10MB</p>
            </div>

            {/* لیست فایل‌ها */}
            <div className="attachments-list">
              {attachments.length === 0 ? (
                <div className="empty-attachments">
                  <Paperclip className="w-12 h-12 text-zinc-300" />
                  <p>هیچ فایلی پیوست نشده است</p>
                </div>
              ) : (
                attachments.map(att => (
                  <div key={att.id} className="attachment-item">
                    <div className="attachment-icon">
                      {getFileIcon(att.mime_type)}
                    </div>
                    <div className="attachment-info">
                      <a 
                        href={`${API_BASE_URL}${att.file_url}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="attachment-name"
                      >
                        {att.file_name}
                      </a>
                      <div className="attachment-meta">
                        <span>{formatFileSize(att.file_size)}</span>
                        {att.uploaded_by && (
                          <span>توسط {att.uploaded_by.full_name}</span>
                        )}
                        <span>{new Date(att.created_at).toLocaleDateString('fa-IR')}</span>
                      </div>
                    </div>
                    <button
                      className="attachment-delete"
                      onClick={() => handleDeleteAttachment(selectedObjectiveForAttachments.id, att.id)}
                      title="حذف فایل"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            <button className="btn-secondary" onClick={() => setShowAttachmentsModal(false)}>
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObjectivesModern;
