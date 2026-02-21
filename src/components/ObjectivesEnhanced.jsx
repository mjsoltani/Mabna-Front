import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';
import EnhancedKeyResultForm from './EnhancedKeyResultForm';
import EnhancedKeyResultCard from './EnhancedKeyResultCard';
import { Target } from 'lucide-react';
import DatePicker from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import { toJalali } from '../utils/dateUtils';
import './ObjectivesModern.css';

function ObjectivesEnhanced({ token, showOnlyKRs }) {
  const [objectives, setObjectives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showKRModal, setShowKRModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState(null);
  const [selectedKR, setSelectedKR] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleteKRConfirm, setDeleteKRConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: ''
  });
  const [startValue, setStartValue] = useState(null);
  const [endValue, setEndValue] = useState(null);
  const [editStartValue, setEditStartValue] = useState(null);
  const [editEndValue, setEditEndValue] = useState(null);

  useEffect(() => {
    fetchObjectives();
  }, []);

  const fetchObjectives = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives`, {
        headers: { 'Authorization': `Bearer ${token}` }
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
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        start_date: toYMD(startValue),
        end_date: toYMD(endValue)
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
        setFormData({ title: '', description: '', start_date: '', end_date: '' });
        setStartValue(null);
        setEndValue(null);
      }
    } catch (error) {
      console.error('Error creating objective:', error);
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        start_date: toYMD(editStartValue),
        end_date: toYMD(editEndValue)
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
      }
    } catch (error) {
      console.error('Error updating objective:', error);
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

  const handleAddKR = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives/${selectedObjective}/keyresults`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchObjectives();
        setShowKRModal(false);
        setSelectedObjective(null);
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ایجاد شاخص کلیدی');
      }
    } catch (error) {
      console.error('Error adding key result:', error);
      alert('خطا در ایجاد شاخص کلیدی');
    }
  };

  const handleEditKR = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/keyresults/${selectedKR.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        await fetchObjectives();
        setSelectedKR(null);
      } else {
        const error = await response.json();
        alert(error.error || 'خطا در ویرایش شاخص کلیدی');
      }
    } catch (error) {
      console.error('Error updating key result:', error);
      alert('خطا در ویرایش شاخص کلیدی');
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
        alert(error.error || 'خطا در حذف شاخص کلیدی');
      }
    } catch (error) {
      console.error('Error deleting key result:', error);
    }
  };

  if (loading) return <div className="loading">در حال بارگذاری...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-zinc-900 mb-2">
              {showOnlyKRs ? 'شاخص‌های کلیدی' : 'اهداف'}
            </h1>
            <p className="text-zinc-600">
              مدیریت و پیگیری اهداف و شاخص‌های کلیدی با قابلیت‌های پیشرفته
            </p>
          </div>
          {!showOnlyKRs && (
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-zinc-900 text-white 
                rounded-2xl font-medium hover:scale-105 transition-transform duration-200
                flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              هدف جدید
            </button>
          )}
        </div>

        {!showOnlyKRs && objectives.length === 0 && (
          <div className="text-center py-20">
            <Target className="w-20 h-20 mx-auto text-zinc-300 mb-4" />
            <h3 className="text-2xl font-semibold text-zinc-700 mb-2">
              هنوز هدفی ایجاد نشده
            </h3>
            <p className="text-zinc-500 mb-6">
              برای شروع، اولین هدف خود را ایجاد کنید
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="px-6 py-3 bg-zinc-900 text-white 
                rounded-2xl font-medium hover:scale-105 transition-transform duration-200
                inline-flex items-center gap-2"
            >
              <Target className="w-5 h-5" />
              ایجاد هدف جدید
            </button>
          </div>
        )}

        <div className="space-y-8">
          {objectives.map(obj => (
            <div key={obj.id} className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-zinc-900 mb-2">{obj.title}</h2>
                  {obj.description && (
                    <p className="text-zinc-600 mb-3">{obj.description}</p>
                  )}
                  <p className="text-sm text-zinc-500">
                    📅 {toJalali(obj.start_date)} تا {toJalali(obj.end_date)}
                  </p>
                </div>
                {obj.is_creator && (
                  <div className="flex gap-2">
                    <button
                      className="btn-secondary"
                      onClick={() => {
                        setSelectedObjective(obj);
                        setFormData({
                          title: obj.title,
                          description: obj.description || '',
                          start_date: obj.start_date,
                          end_date: obj.end_date
                        });
                        setEditStartValue(new Date(obj.start_date));
                        setEditEndValue(new Date(obj.end_date));
                        setShowEditModal(true);
                      }}
                    >
                      ویرایش
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => setDeleteConfirm(obj.id)}
                    >
                      حذف
                    </button>
                  </div>
                )}
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-lg font-semibold text-zinc-800">
                    شاخص‌های کلیدی ({obj.key_results?.length || 0})
                  </h3>
                  {obj.is_creator && (
                    <button
                      className="btn-primary"
                      onClick={() => {
                        setSelectedObjective(obj.id);
                        setShowKRModal(true);
                      }}
                    >
                      + شاخص کلیدی جدید
                    </button>
                  )}
                </div>

                {obj.key_results && obj.key_results.length > 0 ? (
                  <div className="space-y-3">
                    {obj.key_results.map(kr => (
                      <EnhancedKeyResultCard
                        key={kr.id}
                        keyResult={kr}
                        token={token}
                        isCreator={obj.is_creator}
                        onEdit={() => setSelectedKR(kr)}
                        onDelete={() => setDeleteKRConfirm(kr.id)}
                        onUpdate={fetchObjectives}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-zinc-500">
                    هنوز شاخص کلیدی اضافه نشده است
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal ایجاد هدف */}
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

      {/* Modal ویرایش هدف */}
      {showEditModal && selectedObjective && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>ویرایش هدف</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label>عنوان هدف</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
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
                  value={editStartValue}
                  onChange={setEditStartValue}
                  calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="form-group">
                <label>تاریخ پایان</label>
                <DatePicker
                  value={editEndValue}
                  onChange={setEditEndValue}
                  calendar={persian}
                  locale={persian_fa}
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">ذخیره</button>
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>
                  انصراف
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal ایجاد/ویرایش شاخص کلیدی */}
      <EnhancedKeyResultForm
        isOpen={showKRModal || !!selectedKR}
        onClose={() => {
          setShowKRModal(false);
          setSelectedKR(null);
        }}
        onSubmit={selectedKR ? handleEditKR : handleAddKR}
        initialData={selectedKR}
        token={token}
        objectiveId={selectedObjective}
      />

      {/* Modal تأیید حذف هدف */}
      {deleteConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>حذف هدف</h3>
            <p>آیا مطمئن هستید که می‌خواهید این هدف را حذف کنید؟</p>
            <div className="form-actions">
              <button
                className="btn-delete"
                onClick={() => handleDeleteObjective(deleteConfirm)}
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

      {/* Modal تأیید حذف شاخص کلیدی */}
      {deleteKRConfirm && (
        <div className="modal-overlay" onClick={() => setDeleteKRConfirm(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>حذف شاخص کلیدی</h3>
            <p>آیا مطمئن هستید که می‌خواهید این شاخص کلیدی را حذف کنید؟</p>
            <p className="warning-text">⚠️ ارتباط با وظایف قطع می‌شود ولی خود وظایف حذف نمی‌شوند.</p>
            <div className="form-actions">
              <button
                className="btn-delete"
                onClick={() => handleDeleteKR(deleteKRConfirm)}
              >
                حذف
              </button>
              <button
                className="btn-secondary"
                onClick={() => setDeleteKRConfirm(null)}
              >
                انصراف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ObjectivesEnhanced;
