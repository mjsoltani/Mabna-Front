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

function TasksV2({ token, focusTaskId }) {
  const [users, setUsers] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCommentsModal, setShowCommentsModal] = useState(false);
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

  useEffect(() => {
    fetchData();
  }, []);

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

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  const handleKanbanTaskClick = (task) => {
    openTaskModal(task);
  };

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
            >
              <option value="todo">انجام نشده</option>
              <option value="in_progress">در حال انجام</option>
              <option value="done">انجام شده</option>
            </select>
          </div>

          <div className="detail-row">
            <span className="label">نوع:</span>
            <select
              value={selectedTask.type || 'routine'}
              onChange={(e) => handleTypeChange(selectedTask.id, e.target.value)}
              className="type-select"
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
              <button
                className="btn-edit-description"
                onClick={() => {
                  setEditingDescription(selectedTask.id);
                  setTempDescription(selectedTask.description || '');
                }}
              >
                ✏️ ویرایش توضیحات
              </button>
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

        <TasksKanban 
          token={token} 
          onTaskClick={handleKanbanTaskClick}
          onNewTask={() => setShowModal(true)}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {showModal && renderCreateModal()}
      {showCommentsModal && selectedTask && renderDetailsModal()}
    </div>
  );
}

export default TasksV2;
