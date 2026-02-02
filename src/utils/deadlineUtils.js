// محاسبه وضعیت deadline
export const getDeadlineStatus = (dueDate) => {
  if (!dueDate) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const deadline = new Date(dueDate);
  deadline.setHours(0, 0, 0, 0);
  
  const diffTime = deadline - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 0) {
    return { status: 'overdue', text: 'گذشته', days: Math.abs(diffDays), color: '#d32f2f' };
  } else if (diffDays === 0) {
    return { status: 'today', text: 'امروز', days: 0, color: '#c2185b' };
  } else if (diffDays <= 3) {
    return { status: 'urgent', text: 'نزدیک', days: diffDays, color: '#f57c00' };
  } else {
    return { status: 'normal', text: 'عادی', days: diffDays, color: '#1976d2' };
  }
};

// فرمت تاریخ به شمسی
export const formatDateToPersian = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('fa-IR');
};

// تبدیل تاریخ به فرمت input[type="date"]
export const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toISOString().split('T')[0];
};

// دریافت تاریخ امروز به فرمت YYYY-MM-DD
export const getTodayDate = () => {
  return new Date().toISOString().split('T')[0];
};
