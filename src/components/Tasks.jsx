import { useState, useEffect } from 'react';
import API_BASE_URL from '../config';

function Tasks({ token }) {
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [keyResults, setKeyResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    assignee_id: '',
    key_result_ids: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, usersRes, krsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/users/list`, {
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
        setFormData({ title: '', assignee_id: '', key_result_ids: [] });
      }
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const toggleKR = (krId) => {
    setFormData(prev => ({
      ...prev,
      key_result_ids: prev.key_result_ids.includes(krId)
        ? prev.key_result_ids.filter(id => id !== krId)
        : [...prev.key_result_ids, krId]
    }));
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
          <div key={task.id} className="card">
            <div className="card-header">
              <div>
                <h3 className="card-title">{task.title}</h3>
                <p className="card-date">
                  مسئول: {task.assignee?.full_name}
                </p>
              </div>
            </div>
            
            {task.key_results && task.key_results.length > 0 && (
              <div className="kr-list">
                <h4 style={{ marginBottom: '10px', color: '#666' }}>مرتبط با نتایج کلیدی:</h4>
                {task.key_results.map(kr => (
                  <div key={kr.id} className="kr-item">
                    <div className="kr-title">{kr.title}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

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
                    <option key={user.id} value={user.id}>
                      {user.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>نتایج کلیدی مرتبط (حداقل یکی)</label>
                <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e0e0e0', borderRadius: '6px', padding: '10px' }}>
                  {keyResults.length === 0 ? (
                    <p style={{ color: '#999', textAlign: 'center' }}>ابتدا نتایج کلیدی ایجاد کنید</p>
                  ) : (
                    keyResults.map(kr => (
                      <label key={kr.id} style={{ display: 'block', padding: '8px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={formData.key_result_ids.includes(kr.id)}
                          onChange={() => toggleKR(kr.id)}
                          style={{ marginLeft: '8px' }}
                        />
                        {kr.title} ({kr.objective_title})
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
    </div>
  );
}

export default Tasks;
