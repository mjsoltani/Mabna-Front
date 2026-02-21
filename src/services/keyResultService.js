import API_BASE_URL from '../config';

// دریافت تاریخچه پیشرفت
export const fetchProgressHistory = async (krId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/progress`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch progress history');
  return response.json();
};

// اضافه کردن آپدیت پیشرفت
export const addProgressUpdate = async (krId, data, token) => {
  const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/progress`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to add progress update');
  return response.json();
};

// دریافت لیست فایل‌ها
export const fetchAttachments = async (krId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/attachments`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to fetch attachments');
  return response.json();
};

// آپلود فایل
export const uploadAttachment = async (krId, file, token) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${API_BASE_URL}/api/keyresults/${krId}/attachments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  if (!response.ok) throw new Error('Failed to upload attachment');
  return response.json();
};

// حذف فایل
export const deleteAttachment = async (attachmentId, token) => {
  const response = await fetch(`${API_BASE_URL}/api/keyresults/attachments/${attachmentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) throw new Error('Failed to delete attachment');
  return response.json();
};
