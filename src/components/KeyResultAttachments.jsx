import { useState, useEffect, useRef } from 'react';
import { fetchAttachments, uploadAttachment, deleteAttachment } from '../services/keyResultService';
import API_BASE_URL from '../config';
import './KeyResultAttachments.css';

function KeyResultAttachments({ keyResultId, token }) {
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    loadAttachments();
  }, [keyResultId]);

  const loadAttachments = async () => {
    try {
      setLoading(true);
      const data = await fetchAttachments(keyResultId, token);
      setAttachments(data.attachments || []);
    } catch (error) {
      console.error('Error loading attachments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // بررسی سایز فایل (10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم فایل نباید بیشتر از 10 مگابایت باشد');
      return;
    }

    try {
      setUploading(true);
      await uploadAttachment(keyResultId, file, token);
      await loadAttachments();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('خطا در آپلود فایل');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (attachmentId) => {
    if (!confirm('آیا از حذف این فایل مطمئن هستید؟')) return;

    try {
      await deleteAttachment(attachmentId, token);
      await loadAttachments();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('خطا در حذف فایل');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(ext)) return '🖼️';
    if (['pdf'].includes(ext)) return '📄';
    if (['doc', 'docx'].includes(ext)) return '📝';
    if (['xls', 'xlsx'].includes(ext)) return '📊';
    if (['zip', 'rar'].includes(ext)) return '📦';
    return '📎';
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="attachments-section">
      <div className="attachments-header">
        <h4>فایل‌های پیوست</h4>
      </div>

      <div
        className={`upload-area ${dragOver ? 'drag-over' : ''}`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="upload-icon">📤</div>
        <p className="upload-text">فایل را اینجا بکشید یا کلیک کنید</p>
        <p className="upload-hint">حداکثر 10 مگابایت</p>
        <input
          ref={fileInputRef}
          type="file"
          className="file-input"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </div>

      {uploading && (
        <div className="uploading-indicator">
          <div className="spinner" />
          <span>در حال آپلود...</span>
        </div>
      )}

      <div className="attachments-list">
        {loading ? (
          <div className="empty-attachments">در حال بارگذاری...</div>
        ) : attachments.length === 0 ? (
          <div className="empty-attachments">هیچ فایلی پیوست نشده است</div>
        ) : (
          attachments.map((attachment) => (
            <div key={attachment.id} className="attachment-item">
              <div className="attachment-info">
                <span className="file-icon">{getFileIcon(attachment.filename)}</span>
                <div className="attachment-details">
                  <div className="attachment-name">{attachment.filename}</div>
                  <div className="attachment-meta">
                    {formatFileSize(attachment.file_size)} • 
                    {new Date(attachment.uploaded_at).toLocaleDateString('fa-IR')} • 
                    {attachment.uploaded_by?.full_name || 'کاربر'}
                  </div>
                </div>
              </div>
              <div className="attachment-actions">
                <a
                  href={`${API_BASE_URL}${attachment.file_path}`}
                  download
                  className="btn-icon-small"
                  title="دانلود"
                >
                  ⬇️
                </a>
                <button
                  className="btn-icon-small delete"
                  onClick={() => handleDelete(attachment.id)}
                  title="حذف"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default KeyResultAttachments;
