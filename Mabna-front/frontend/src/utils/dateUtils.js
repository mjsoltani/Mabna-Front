// تبدیل تاریخ میلادی به شمسی
export const toJalali = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return dateString;
  }
};

// تبدیل تاریخ میلادی به شمسی کوتاه (فقط عدد)
export const toJalaliShort = (dateString) => {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('fa-IR');
  } catch (error) {
    return dateString;
  }
};
