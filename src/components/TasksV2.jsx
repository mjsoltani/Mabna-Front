import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import './TasksV2.css';
import MentionTextarea from './MentionTextarea';
import DescriptionWithMentions from './DescriptionWithMentions';
import { getDeadlineStatus, formatDateToPersian } from '../utils/deadlineUtils';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import TasksKanban from './TasksKanban';
import { CheckSquare } from 'lucide-react';

function TasksV2({ token, user, focusTaskId }) {
  const [users, setUsers] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // فیلترهای جدید
  const [activeFilter, setActiveFilter] = useState('all'); // all, my_tasks, user_specific
  const [selectedUserId, setSelectedUserId] = useState('');
  const [approvalFilter, setApprovalFilter] = useState('all'); // all, approved, not_approved
  const [taskCounts, setTaskCounts] = useState({
    all: 0,
    my_tasks: 0,
    approved: 0,
    not_approved: 0
  });
  const [showModal, setShowModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [attachmentsLoading, setAttachmentsLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    key_result_ids: [],
    status: 'todo',
    type: 'routine',
    subtasks: [],
    due_date: ''
  });
  const [dueDateValue, setDueDateValue] = useState(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [editingDescription, setEditingDescription] = useState(null);
  const [tempDescription, setTempDescription] = useState('');
  const [editFormData, setEditFormData] = useState({
    title: '',
    description: '',
    assignee_id: '',
    key_result_ids: [],
    status: 'todo',
    type: 'routine',
    due_date: ''
  });
  const [editDueDateValue, setEditDueDateValue] = useState(null);

  useEffect(() => {
    fetchData();
    fetchTaskCounts();
  }, []);

  // رفرش کردن تعداد تسک‌ها وقتی فیلترها تغییر می‌کنند
  useEffect(() => {
    fetchTaskCounts();
  }, [activeFilter, selectedUserId, approvalFilter]);

  const fetchTaskCounts = async () => {
    try {
      // دریافت تعداد همه تسک‌ها
      const allRes = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // دریافت تعداد تسک‌های من
      const myRes = await fetch(`${API_BASE_URL}/api/tasks?assigned_to_me=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // دریافت تعداد تسک‌های تأیید شده
      const approvedRes = await fetch(`${API_BASE_URL}/api/tasks?approved=true`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // دریافت تعداد تسک‌های تأیید نشده
      const notApprovedRes = await fetch(`${API_BASE_URL}/api/tasks?approved=false`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const counts = {
        all: 0,
        my_tasks: 0,
        approved: 0,
        not_approved: 0
      };

      if (allRes.ok) {
        const allTasks = await allRes.json();
        counts.all = allTasks.length;
      }
      
      if (myRes.ok) {
        const myTasks = await myRes.json();
        counts.my_tasks = myTasks.length;
      }
      
      if (approvedRes.ok) {
        const approvedTasks = await approvedRes.json();
        counts.approved = approvedTasks.length;
      }
      
      if (notApprovedRes.ok) {
        const notApprovedTasks = await notApprovedRes.json();
        counts.not_approved = notApprovedTasks.length;
      }

      setTaskCounts(counts);
    } catch (error) {
      console.error('Error fetching task counts:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [usersRes, krsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/keyresults`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (krsRes.ok) setKeyResults(await krsRes.json());
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
        setShowModal(false);
        setFormData({ title: '', description: '', assignee_id: '', key_result_ids: [], status: 'todo', type: 'routine', subtasks: [], due_date: '' });
        setNewSubtaskTitle('');
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${selectedTask.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
        setShowEditModal(false);
        setSelectedTask(null);
        setEditFormData({ title: '', description: '', assignee_id: '', key_result_ids: [], status: 'todo', type: 'routine', due_date: '' });
        setEditDueDateValue(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        // آپدیت selectedTask برای نمایش فوری تغییرات در مودال
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({ ...selectedTask, status: newStatus });
        }
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  const handleTypeChange = async (taskId, newType) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type: newType })
      });
      if (response.ok) {
        // آپدیت selectedTask برای نمایش فوری تغییرات در مودال
        if (selectedTask && selectedTask.id === taskId) {
          setSelectedTask({ ...selectedTask, type: newType });
        }
        setRefreshTrigger(prev => prev + 1);
      }
    } catch (error) {
      console.error('Error updating task type:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
        setShowCommentsModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const fetchComments = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/task/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        setComments(await response.json());
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const fetchAttachments = async (taskId) => {
    setAttachmentsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/attachments`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setAttachments(await res.json());
      }
    } catch (error) {
      console.error('Error fetching attachments:', error);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          task_id: selectedTask.id,
          content: newComment
        })
      });
      if (response.ok) {
        setNewComment('');
        await fetchComments(selectedTask.id);
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchComments(selectedTask.id);
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setUploadError('');
    try {
      const form = new FormData();
      form.append('file', selectedFile);
      const res = await fetch(`${API_BASE_URL}/api/tasks/${selectedTask.id}/attachments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: form
      });
      if (res.ok) {
        setSelectedFile(null);
        await fetchAttachments(selectedTask.id);
      } else {
        setUploadError('خطا در آپلود فایل');
      }
    } catch (error) {
      setUploadError('خطا در آپلود فایل');
      console.error('Error uploading file:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadAttachment = async (attachmentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attachments/${attachmentId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'attachment';
        a.click();
      }
    } catch (error) {
      console.error('Error downloading attachment:', error);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/attachments/${attachmentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await fetchAttachments(selectedTask.id);
      }
    } catch (error) {
      console.error('Error deleting attachment:', error);
    }
  };

  const handleUpdateDescription = async (taskId, description) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description })
      });
      if (response.ok) {
        await fetchData();
        setEditingDescription(null);
        setTempDescription('');
      }
    } catch (error) {
      console.error('Error updating description:', error);
    }
  };

  const handleToggleSubtask = async (subtaskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subtasks/${subtaskId}/toggle`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error toggling subtask:', error);
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/subtasks/${subtaskId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        await fetchData();
      }
    } catch (error) {
      console.error('Error deleting subtask:', error);
    }
  };

  const handleAddSubtask = () => {
    if (newSubtaskTitle.trim()) {
      setFormData({
        ...formData,
        subtasks: [...formData.subtasks, { title: newSubtaskTitle.trim() }]
      });
      setNewSubtaskTitle('');
    }
  };

  const handleRemoveSubtask = (index) => {
    setFormData({
      ...formData,
      subtasks: formData.subtasks.filter((_, i) => i !== index)
    });
  };

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowCommentsModal(true);
    fetchComments(task.id);
    fetchAttachments(task.id);
  };

  const handleApproveTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approval_note: 'تأیید شده از طریق جزئیات وظیفه'
        })
      });
      
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
        setShowCommentsModal(false);
        alert('وظیفه با موفقیت تأیید نهایی شد');
      } else {
        const errorData = await response.json();
        alert('خطا در تأیید وظیفه: ' + (errorData.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error approving task:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const handleUnapproveTask = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/approve`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        setRefreshTrigger(prev => prev + 1);
        setShowCommentsModal(false);
        alert('تأیید وظیفه لغو شد');
      } else {
        const errorData = await response.json();
        alert('خطا در لغو تأیید: ' + (errorData.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error unapproving task:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const buildFilterQuery = () => {
    const params = new URLSearchParams();
    
    // فیلتر اصلی
    if (activeFilter === 'my_tasks') {
      params.append('assigned_to_me', 'true');
    } else if (activeFilter === 'user_specific' && selectedUserId) {
      params.append('assigned_to_user_id', selectedUserId);
    }
    
    // فیلتر تأیید
    if (approvalFilter === 'approved') {
      params.append('approved', 'true');
    } else if (approvalFilter === 'not_approved') {
      params.append('approved', 'false');
    }
    
    return params.toString();
  };

  const handleFilterChange = (newFilter) => {
    setActiveFilter(newFilter);
    if (newFilter !== 'user_specific') {
      setSelectedUserId('');
    }
  };

  const handleUserFilterChange = (userId) => {
    setSelectedUserId(userId);
    if (userId) {
      setActiveFilter('user_specific');
    }
  };

  const handleKanbanTaskClick = (task) => {
    openTaskModal(task);
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  const renderFilters = () => (
    <div className="filters-section mb-6">
      {/* تب‌های اصلی */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => handleFilterChange('all')}
        >
          همه وظایف
          <span className="task-count">{taskCounts.all}</span>
        </button>
        
        <button
          className={`filter-tab ${activeFilter === 'my_tasks' ? 'active' : ''}`}
          onClick={() => handleFilterChange('my_tasks')}
        >
          وظایف من
          <span className="task-count">{taskCounts.my_tasks}</span>
        </button>
        
        {/* فیلتر کاربران - فقط برای مدیران */}
        {user && user.role === 'admin' && (
          <div className="user-filter">
            <select
              value={selectedUserId}
              onChange={(e) => handleUserFilterChange(e.target.value)}
              className="user-select"
            >
              <option value="">انتخاب کاربر...</option>
              {users.map(u => (
                <option key={u.user_id} value={u.user_id}>
                  {u.full_name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
      
      {/* فیلتر تأیید */}
      <div className="approval-filters">
        <button
          className={`approval-filter ${approvalFilter === 'all' ? 'active' : ''}`}
          onClick={() => setApprovalFilter('all')}
        >
          همه
        </button>
        
        <button
          className={`approval-filter ${approvalFilter === 'approved' ? 'active' : ''}`}
          onClick={() => setApprovalFilter('approved')}
        >
          تأیید شده
          <span className="task-count">{taskCounts.approved}</span>
        </button>
        
        <button
          className={`approval-filter ${approvalFilter === 'not_approved' ? 'active' : ''}`}
          onClick={() => setApprovalFilter('not_approved')}
        >
          تأیید نشده
          <span className="task-count">{taskCounts.not_approved}</span>
        </button>
      </div>
    </div>
  );

  // تابع‌های رندر مودال‌ها
  const renderCreateModal = () => (
    <div className="modal-overlay" onClick={() => setShowModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>ایجاد وظیفه جدید</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>عنوان وظیفه</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="عنوان وظیفه را وارد کنید"
            />
          </div>

          <div className="form-group">
            <label>توضیحات (اختیاری)</label>
            <MentionTextarea
              value={formData.description}
              onChange={(text) => setFormData({ ...formData, description: text })}
              users={users}
              placeholder="توضیحات کامل وظیفه را وارد کنید... (برای mention کردن @ بزنید)"
              rows={4}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              💡 برای mention کردن کاربران، @ بزنید
            </small>
          </div>

          <div className="form-group">
            <label>نوع وظیفه</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            >
              <option value="routine">معمولی</option>
              <option value="special">ویژه</option>
            </select>
          </div>

          <div className="form-group">
            <label>تخصیص به</label>
            <select
              value={formData.assignee_id}
              onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
              required
            >
              <option value="">انتخاب کاربر</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>{user.full_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>نتایج کلیدی (اختیاری)</label>
            <select
              multiple
              value={formData.key_result_ids}
              onChange={(e) => setFormData({
                ...formData,
                key_result_ids: Array.from(e.target.selectedOptions, option => option.value)
              })}
            >
              {keyResults.map(kr => (
                <option key={kr.id} value={kr.id}>{kr.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>سررسید (اختیاری)</label>
            <DatePicker
              value={dueDateValue}
              onChange={(date) => {
                setDueDateValue(date);
                if (date) {
                  const d = date.toDate();
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setFormData({ ...formData, due_date: `${y}-${m}-${day}` });
                } else {
                  setFormData({ ...formData, due_date: '' });
                }
              }}
              calendar={persian}
              locale={persian_fa}
              placeholder="انتخاب تاریخ سررسید"
              format="YYYY/MM/DD"
              style={{ width: '100%' }}
            />
            {dueDateValue && (
              <button
                type="button"
                className="btn-clear-date"
                onClick={() => {
                  setDueDateValue(null);
                  setFormData({ ...formData, due_date: '' });
                }}
              >
                ✕ حذف سررسید
              </button>
            )}
          </div>

          <div className="form-group">
            <label>چک‌لیست (اختیاری)</label>
            <div className="subtasks-input">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="مثال: طراحی UI"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSubtask();
                  }
                }}
              />
              <button type="button" className="btn-add-subtask" onClick={handleAddSubtask}>
                + افزودن
              </button>
            </div>
            {formData.subtasks.length > 0 && (
              <ul className="subtasks-preview">
                {formData.subtasks.map((st, idx) => (
                  <li key={idx}>
                    <span>✓ {st.title}</span>
                    <button type="button" onClick={() => handleRemoveSubtask(idx)}>✕</button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">ایجاد</button>
            <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderEditModal = () => (
    <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>ویرایش وظیفه</h3>
        <form onSubmit={handleEditSubmit}>
          <div className="form-group">
            <label>عنوان وظیفه</label>
            <input
              type="text"
              value={editFormData.title}
              onChange={(e) => setEditFormData({ ...editFormData, title: e.target.value })}
              required
              placeholder="عنوان وظیفه را وارد کنید"
            />
          </div>

          <div className="form-group">
            <label>توضیحات (اختیاری)</label>
            <MentionTextarea
              value={editFormData.description}
              onChange={(text) => setEditFormData({ ...editFormData, description: text })}
              users={users}
              placeholder="توضیحات کامل وظیفه را وارد کنید... (برای mention کردن @ بزنید)"
              rows={4}
            />
            <small style={{ color: '#6b7280', fontSize: '12px', marginTop: '4px', display: 'block' }}>
              💡 برای mention کردن کاربران، @ بزنید
            </small>
          </div>

          <div className="form-group">
            <label>نوع وظیفه</label>
            <select
              value={editFormData.type}
              onChange={(e) => setEditFormData({ ...editFormData, type: e.target.value })}
            >
              <option value="routine">معمولی</option>
              <option value="special">ویژه</option>
            </select>
          </div>

          <div className="form-group">
            <label>وضعیت</label>
            <select
              value={editFormData.status}
              onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
            >
              <option value="todo">انجام نشده</option>
              <option value="in_progress">در حال انجام</option>
              <option value="done">انجام شده</option>
            </select>
          </div>

          <div className="form-group">
            <label>تخصیص به</label>
            <select
              value={editFormData.assignee_id}
              onChange={(e) => setEditFormData({ ...editFormData, assignee_id: e.target.value })}
              required
            >
              <option value="">انتخاب کاربر</option>
              {users.map(user => (
                <option key={user.user_id} value={user.user_id}>{user.full_name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>نتایج کلیدی (اختیاری)</label>
            <select
              multiple
              value={editFormData.key_result_ids}
              onChange={(e) => setEditFormData({
                ...editFormData,
                key_result_ids: Array.from(e.target.selectedOptions, option => option.value)
              })}
            >
              {keyResults.map(kr => (
                <option key={kr.id} value={kr.id}>{kr.title}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>سررسید (اختیاری)</label>
            <DatePicker
              value={editDueDateValue}
              onChange={(date) => {
                setEditDueDateValue(date);
                if (date) {
                  const d = date.toDate();
                  const y = d.getFullYear();
                  const m = String(d.getMonth() + 1).padStart(2, '0');
                  const day = String(d.getDate()).padStart(2, '0');
                  setEditFormData({ ...editFormData, due_date: `${y}-${m}-${day}` });
                } else {
                  setEditFormData({ ...editFormData, due_date: '' });
                }
              }}
              calendar={persian}
              locale={persian_fa}
              placeholder="انتخاب تاریخ سررسید"
              format="YYYY/MM/DD"
              style={{ width: '100%' }}
            />
            {editDueDateValue && (
              <button
                type="button"
                className="btn-clear-date"
                onClick={() => {
                  setEditDueDateValue(null);
                  setEditFormData({ ...editFormData, due_date: '' });
                }}
              >
                ✕ حذف سررسید
              </button>
            )}
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-primary">ذخیره تغییرات</button>
            <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
              انصراف
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderDetailsModal = () => (
    <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
      <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
        <h3>{selectedTask.title}</h3>

        <div className="task-details">
          <div className="detail-row">
            <span className="label">وضعیت:</span>
            <select
              value={selectedTask.status}
              onChange={(e) => handleStatusChange(selectedTask.id, e.target.value)}
              className="status-select"
              disabled={selectedTask.is_approved}
            >
              <option value="todo">انجام نشده</option>
              <option value="in_progress">در حال انجام</option>
              <option value="done">انجام شده</option>
            </select>
          </div>

          {selectedTask.is_approved && (
            <div className="detail-row">
              <span className="label">تأیید نهایی:</span>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: 'white',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600'
              }}>
                ✅ تأیید شده توسط {selectedTask.approved_by?.full_name || 'مدیر'}
                {selectedTask.approved_at && (
                  <span style={{ fontSize: '12px', opacity: '0.9' }}>
                    ({new Date(selectedTask.approved_at).toLocaleDateString('fa-IR')})
                  </span>
                )}
              </div>
            </div>
          )}

          <div className="detail-row">
            <span className="label">نوع:</span>
            <select
              value={selectedTask.type || 'routine'}
              onChange={(e) => handleTypeChange(selectedTask.id, e.target.value)}
              className="type-select"
              disabled={selectedTask.is_approved}
            >
              <option value="routine">معمولی</option>
              <option value="special">ویژه</option>
            </select>
          </div>
        </div>

        <div className="description-section">
          <h4>توضیحات</h4>
          {editingDescription === selectedTask.id ? (
            <div className="description-edit">
              <MentionTextarea
                value={tempDescription}
                onChange={setTempDescription}
                users={users}
                placeholder="توضیحات وظیفه را وارد کنید... (برای mention کردن @ بزنید)"
                rows={5}
              />
              <div className="description-actions">
                <button
                  className="btn-primary"
                  onClick={() => handleUpdateDescription(selectedTask.id, tempDescription)}
                >
                  ذخیره
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setEditingDescription(null);
                    setTempDescription('');
                  }}
                >
                  لغو
                </button>
              </div>
            </div>
          ) : (
            <div className="description-view">
              {selectedTask.description ? (
                <DescriptionWithMentions description={selectedTask.description} />
              ) : (
                <p className="no-description">توضیحاتی وجود ندارد</p>
              )}
              {selectedTask.is_creator && (
                <button
                  className="btn-edit-description"
                  onClick={() => {
                    setEditingDescription(selectedTask.id);
                    setTempDescription(selectedTask.description || '');
                  }}
                >
                  ✏️ ویرایش توضیحات
                </button>
              )}
            </div>
          )}
        </div>

        <div className="comments-section">
          <h4>کامنت‌ها</h4>
          <div className="comments-list">
            {comments.map(comment => (
              <div key={comment.id} className="comment-item">
                <div className="comment-header">
                  <span className="comment-author">{comment.user?.full_name}</span>
                  <span className="comment-date">{new Date(comment.created_at).toLocaleDateString('fa-IR')}</span>
                </div>
                <p className="comment-content">{comment.content}</p>
                <button
                  className="btn-delete-comment"
                  onClick={() => handleDeleteComment(comment.id)}
                >
                  حذف
                </button>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddComment} className="comment-form">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="کامنت خود را بنویسید..."
              required
            />
            <button type="submit" className="btn-primary">ارسال</button>
          </form>
        </div>

        <div className="attachments-section">
          <h4>پیوست‌ها</h4>
          {attachmentsLoading ? (
            <p>در حال بارگذاری...</p>
          ) : (
            <div className="attachments-list">
              {attachments.map(a => (
                <div key={a.id} className="attachment-item">
                  <span className="attachment-name">{a.file_name}</span>
                  <div className="attachment-actions">
                    <button
                      className="btn-secondary"
                      onClick={() => handleDownloadAttachment(a.id)}
                    >
                      دانلود
                    </button>
                    <button
                      className="btn-delete-attachment"
                      onClick={() => handleDeleteAttachment(a.id)}
                    >
                      حذف
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="file-upload">
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files?.[0])}
              disabled={uploading}
            />
            <button
              onClick={handleFileUpload}
              disabled={!selectedFile || uploading}
              className="btn-primary"
            >
              {uploading ? 'در حال آپلود...' : 'آپلود'}
            </button>
            {uploadError && <p className="error">{uploadError}</p>}
          </div>
        </div>

        <div className="modal-footer">
          {/* دکمه‌های تأیید نهایی - فقط برای مدیران */}
          {user && user.role === 'admin' && selectedTask.status === 'done' && !selectedTask.is_approved && (
            <button
              className="btn-approve"
              onClick={() => {
                if (confirm('آیا مطمئن هستید که می‌خواهید این وظیفه را تأیید نهایی کنید؟')) {
                  handleApproveTask(selectedTask.id);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ✅ تأیید نهایی
            </button>
          )}
          
          {/* دکمه لغو تأیید - فقط برای مدیران */}
          {user && user.role === 'admin' && selectedTask.is_approved && (
            <button
              className="btn-unapprove"
              onClick={() => {
                if (confirm('آیا مطمئن هستید که می‌خواهید تأیید این وظیفه را لغو کنید؟')) {
                  handleUnapproveTask(selectedTask.id);
                }
              }}
              style={{
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                color: 'white',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              ❌ لغو تأیید
            </button>
          )}

          {selectedTask.is_creator && (
            <>
              <button
                className="btn-primary"
                onClick={() => {
                  setEditFormData({
                    title: selectedTask.title,
                    description: selectedTask.description || '',
                    assignee_id: selectedTask.assignee?.user_id || '',
                    key_result_ids: selectedTask.key_results?.map(kr => kr.id) || [],
                    status: selectedTask.status,
                    type: selectedTask.type || 'routine',
                    due_date: selectedTask.due_date || ''
                  });
                  setEditDueDateValue(selectedTask.due_date ? new Date(selectedTask.due_date) : null);
                  setShowEditModal(true);
                }}
              >
                ویرایش وظیفه
              </button>
              <button
                className="btn-delete"
                onClick={() => {
                  if (confirm('آیا مطمئن هستید که می‌خواهید این وظیفه را حذف کنید؟')) {
                    handleDeleteTask(selectedTask.id);
                  }
                }}
              >
                حذف وظیفه
              </button>
            </>
          )}
          <button
            className="btn-secondary"
            onClick={() => setShowCommentsModal(false)}
          >
            بستن
          </button>
        </div>
      </div>
    </div>
  );

  // فقط نمای کانبان
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-white mb-2">
              وظایف
            </h1>
            <p className="text-zinc-600 dark:text-zinc-400">
              مدیریت و پیگیری وظایف روزانه
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-3 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 
              rounded-2xl font-medium hover:scale-105 transition-transform duration-200
              flex items-center gap-2"
          >
            <CheckSquare className="w-5 h-5" />
            وظیفه جدید
          </button>
        </div>

        {/* فیلترها */}
        {renderFilters()}

        <TasksKanban 
          token={token} 
          onTaskClick={handleKanbanTaskClick}
          onNewTask={() => setShowModal(true)}
          refreshTrigger={refreshTrigger}
          filterQuery={buildFilterQuery()}
          onTaskCountsChange={setTaskCounts}
        />
      </div>

      {showModal && renderCreateModal()}
      {showEditModal && renderEditModal()}
      {showCommentsModal && selectedTask && renderDetailsModal()}
    </div>
  );
}

export default TasksV2;
