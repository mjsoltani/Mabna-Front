import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import './TasksV2.css';

function TasksV2({ token, focusTaskId }) {
  const [tasks, setTasks] = useState([]);
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
  const [highlightTaskId, setHighlightTaskId] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    assignee_id: '',
    key_result_ids: [],
    status: 'todo',
    type: 'routine'
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!focusTaskId) return;
    setHighlightTaskId(focusTaskId);
    const el = document.getElementById(`task-${focusTaskId}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [focusTaskId]);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, krsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/organization/users`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/keyresults`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (tasksRes.ok) setTasks(await tasksRes.json());
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
        await fetchData();
        setShowModal(false);
        setFormData({ title: '', assignee_id: '', key_result_ids: [], status: 'todo', type: 'routine' });
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
        await fetchData();
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
        await fetchData();
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
        await fetchData();
        setDeleteConfirm(null);
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

  const openTaskModal = (task) => {
    setSelectedTask(task);
    setShowCommentsModal(true);
    fetchComments(task.id);
    fetchAttachments(task.id);
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return '#10b981';
      case 'in_progress': return '#2563eb';
      case 'todo': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getTypeLabel = (type) => {
    return type === 'special' ? 'ویژه' : 'معمولی';
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h2>وظایف</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          + وظیفه جدید
        </button>
      </div>

      {showModal && (
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
                    <option key={user.id} value={user.id}>{user.full_name}</option>
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

              <div className="form-actions">
                <button type="submit" className="btn-primary">ایجاد</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCommentsModal && selectedTask && (
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

            <button
              className="btn-secondary"
              onClick={() => setShowCommentsModal(false)}
            >
              بستن
            </button>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>حذف وظیفه</h3>
            <p>آیا مطمئن هستید که می‌خواهید این وظیفه را حذف کنید؟</p>
            <div className="form-actions">
              <button
                className="btn-delete"
                onClick={() => handleDeleteTask(deleteConfirm)}
              >
                حذف
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteConfirm(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="tasks-grid">
        {tasks.map(task => (
          <div
            key={task.id}
            id={`task-${task.id}`}
            className={`task-card ${highlightTaskId === task.id ? 'highlight' : ''}`}
          >
            <div className="task-header">
              <h4>{task.title}</h4>
              <div className="task-badges">
                <span className="badge type-badge" title={getTypeLabel(task.type || 'routine')}>
                  {task.type === 'special' ? '⭐' : '📌'}
                </span>
                <span
                  className="badge status-badge"
                  style={{ backgroundColor: getStatusColor(task.status) }}
                >
                  {task.status === 'done' ? 'انجام شده' : task.status === 'in_progress' ? 'در حال انجام' : 'انجام نشده'}
                </span>
              </div>
            </div>

            <div className="task-actions">
              <button
                className="btn-secondary"
                onClick={() => openTaskModal(task)}
              >
                جزئیات
              </button>
              <button
                className="btn-delete"
                onClick={() => setDeleteConfirm(task.id)}
              >
                حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TasksV2;
