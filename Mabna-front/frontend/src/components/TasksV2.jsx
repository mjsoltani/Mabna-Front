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
  const [formData, setFormData] = useState({
    title: '',
    assignee_id: '',
    key_result_ids: [],
    status: 'todo'
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
        setFormData({ title: '', assignee_id: '', key_result_ids: [], status: 'todo' });
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

  const fetchComments = async (taskId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/comments/task/${taskId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setComments(data);
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
        const data = await res.json();
        setAttachments(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      setAttachments([]);
    } finally {
      setAttachmentsLoading(false);
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

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

  const openCommentsModal = async (task) => {
    setSelectedTask(task);
    setShowCommentsModal(true);
    await fetchComments(task.id);
    await fetchAttachments(task.id);
  };

  const toggleKR = (krId) => {
    setFormData(prev => ({
      ...prev,
      key_result_ids: prev.key_result_ids.includes(krId)
        ? prev.key_result_ids.filter(id => id !== krId)
        : [...prev.key_result_ids, krId]
    }));
  };

  const getStatusBadge = (status) => {
    const badges = {
      todo: { text: 'انجام نشده', emoji: '⏳', class: 'status-todo' },
      in_progress: { text: 'در حال انجام', emoji: '🔄', class: 'status-progress' },
      done: { text: 'انجام شده', emoji: '✅', class: 'status-done' }
    };
    const badge = badges[status] || badges.todo;
    return (
      <span className={`task-status ${badge.class}`}>
        <span>{badge.emoji}</span>
        <span>{badge.text}</span>
      </span>
    );
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div>
      <div className="section-header">
        <h2>وظایف</h2>
        <button className="btn-add" onClick={() => setShowModal(true)}>
          + افزودن وظیفه جدید
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '64px', opacity: 0.3, marginBottom: '20px' }}>✅</div>
          <p>هنوز وظیفه‌ای ثبت نشده است</p>
        </div>
      ) : (
        tasks.map(task => (
          <div key={task.id} id={`task-${task.id}`} className={`task-card${highlightTaskId === task.id ? ' focused' : ''}`}>
            <div className="task-header">
              <div className="task-info">
                <h3 className="task-title">{task.title}</h3>
                <p className="task-assignee">مسئول: {task.assignee?.full_name}</p>
              </div>
              <div className="task-actions">
                {getStatusBadge(task.status)}
                <select
                  className="status-select"
                  value={task.status}
                  onChange={(e) => handleStatusChange(task.id, e.target.value)}
                >
                  <option value="todo">انجام نشده</option>
                  <option value="in_progress">در حال انجام</option>
                  <option value="done">انجام شده</option>
                </select>
              </div>
            </div>

            {task.key_results && task.key_results.length > 0 && (
              <div className="task-krs">
                {task.key_results.map(kr => (
                  <span key={kr.id} className="kr-badge">{kr.title}</span>
                ))}
              </div>
            )}

            <div className="task-footer">
              <button 
                className="btn-comments"
                onClick={() => openCommentsModal(task)}
              >
                💬 کامنت‌ها
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal افزودن وظیفه */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>افزودن وظیفه جدید</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>عنوان وظیفه</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="مثال: پیاده‌سازی صفحه لندینگ"
                />
              </div>

              <div className="form-group">
                <label>مسئول انجام</label>
                <select
                  value={formData.assignee_id}
                  onChange={(e) => setFormData({...formData, assignee_id: e.target.value})}
                  required
                >
                  <option value="">انتخاب کنید</option>
                  {users.map(user => (
                    <option key={user.user_id} value={user.user_id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>وضعیت</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                >
                  <option value="todo">انجام نشده</option>
                  <option value="in_progress">در حال انجام</option>
                  <option value="done">انجام شده</option>
                </select>
              </div>

              <div className="form-group">
                <label>نتایج کلیدی مرتبط (حداقل یکی)</label>
                <div className="kr-checkbox-list">
                  {keyResults.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center' }}>ابتدا نتایج کلیدی ایجاد کنید</p>
                  ) : (
                    keyResults.map(kr => (
                      <label key={kr.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={formData.key_result_ids.includes(kr.id)}
                          onChange={() => toggleKR(kr.id)}
                        />
                        <span>{kr.title} ({kr.objective_title})</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  انصراف
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={formData.key_result_ids.length === 0}
                >
                  ذخیره
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal کامنت‌ها */}
      {showCommentsModal && selectedTask && (
        <div className="modal-overlay" onClick={() => setShowCommentsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>کامنت‌های وظیفه: {selectedTask.title}</h3>
            
            <div className="comments-list">
              {comments.length === 0 ? (
                <p className="no-comments">هنوز کامنتی ثبت نشده است</p>
              ) : (
                comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <span className="comment-author">{comment.user_name}</span>
                      <span className="comment-date">
                        {new Date(comment.created_at).toLocaleDateString('fa-IR')}
                      </span>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                    <button 
                      className="btn-delete-comment"
                      onClick={() => handleDeleteComment(comment.id)}
                    >
                      حذف
                    </button>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={handleAddComment} className="comment-form">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="کامنت خود را بنویسید..."
                rows="3"
              />
              <button type="submit" className="btn-primary">
                افزودن کامنت
              </button>
            </form>

            <div className="attachments-section">
              <h4 className="attachments-title">پیوست‌ها</h4>
              <div className="attachments-actions">
                <input type="file" onChange={(e) => {
                  const file = e.target.files?.[0];
                  setUploadError('');
                  if (!file) return;
                  if (file.size > 10 * 1024 * 1024) {
                    setUploadError('حداکثر حجم فایل 10MB است');
                    e.target.value = '';
                    return;
                  }
                  setSelectedFile(file);
                }} />
                <button 
                  className="btn-secondary" 
                  onClick={async () => {
                    if (!selectedFile || !selectedTask) return;
                    setUploading(true);
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
                      }
                    } catch (e) {}
                    finally {
                      setUploading(false);
                    }
                  }}
                  disabled={uploading || !selectedFile}
                >
                  {uploading ? 'در حال آپلود...' : 'آپلود فایل'}
                </button>
              </div>
              {uploadError && (
                <div className="error-inline">{uploadError}</div>
              )}
              <div className="attachments-list">
                {attachmentsLoading ? (
                  <div className="loading">در حال بارگذاری...</div>
                ) : attachments.length === 0 ? (
                  <p className="no-attachments">فایلی پیوست نشده است</p>
                ) : (
                  attachments.map(a => (
                    <div key={a.id} className="attachment-item">
                      <div className="attachment-info">
                        <div className="attachment-name">{a.filename || a.name || 'فایل'}</div>
                        <div className="attachment-meta">
                          <span>{a.size ? `${(a.size/1024).toFixed(1)} KB` : ''}</span>
                          <span>{a.created_at ? new Date(a.created_at).toLocaleString('fa-IR') : ''}</span>
                          <span>{a.uploader_name || a.uploaded_by || ''}</span>
                        </div>
                      </div>
                      <div className="attachment-actions">
                        <button className="btn-secondary" onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/attachments/${a.id}`, {
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              const blob = await res.blob();
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement('a');
                              link.href = url;
                              link.download = a.filename || a.name || 'attachment';
                              document.body.appendChild(link);
                              link.click();
                              link.remove();
                              URL.revokeObjectURL(url);
                            }
                          } catch (e) {}
                        }}>دانلود</button>
                        <button className="btn-delete-attachment" onClick={async () => {
                          try {
                            const res = await fetch(`${API_BASE_URL}/api/attachments/${a.id}`, {
                              method: 'DELETE',
                              headers: { 'Authorization': `Bearer ${token}` }
                            });
                            if (res.ok) {
                              await fetchAttachments(selectedTask.id);
                            }
                          } catch (e) {}
                        }}>حذف</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <button 
              className="btn-secondary" 
              onClick={() => setShowCommentsModal(false)}
              style={{ marginTop: '16px', width: '100%' }}
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default TasksV2;
