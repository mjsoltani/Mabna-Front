import { useEffect, useState } from 'react';
import API_BASE_URL from '../config';
import './Teams.css';

function Teams({ token, user }) {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);

  const [createForm, setCreateForm] = useState({ name: '', description: '', member_ids: [] });
  const [editForm, setEditForm] = useState({ name: '', description: '' });
  const [selectedTeam, setSelectedTeam] = useState(null);

  const [orgUsers, setOrgUsers] = useState([]);
  const [addMemberForm, setAddMemberForm] = useState({ user_id: '', role: 'member' });
  const [actionError, setActionError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTeams(Array.isArray(data) ? data : []);
      } else {
        setError('بارگذاری تیم‌ها ناموفق بود');
      }
    } catch (e) {
      setError('خطا در اتصال به سرور');
    } finally {
      setLoading(false);
    }
  };

  const refreshTeamDetails = async (teamId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSelectedTeam(data);
        setEditForm({ name: data.name || '', description: data.description || '' });
      } else if (res.status === 404) {
        setShowDetailsModal(false);
        setSelectedTeam(null);
        setError('تیم پیدا نشد');
        await fetchTeams();
      }
    } catch (_) {}
  };

  const openDetails = async (team) => {
    setSelectedTeam(team);
    setShowDetailsModal(true);
    await refreshTeamDetails(team.id);
  };

  const openCreate = async () => {
    setCreateForm({ name: '', description: '', member_ids: [] });
    setActionError('');
    setShowCreateModal(true);
    await fetchOrgUsers();
  };

  const fetchOrgUsers = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/organization/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrgUsers(Array.isArray(data) ? data : []);
      }
    } catch (_) {}
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!createForm.name.trim()) {
      setActionError('نام تیم نباید خالی باشد');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createForm)
      });
      const data = await res.json();
      if (res.status === 201) {
        setShowCreateModal(false);
        await fetchTeams();
      } else {
        setActionError(data.error || data.message || 'ایجاد تیم ناموفق بود');
      }
    } catch (e) {
      setActionError('خطا در اتصال به سرور');
    } finally {
      setActionLoading(false);
    }
  };

  const openEdit = () => {
    setEditForm({ name: selectedTeam?.name || '', description: selectedTeam?.description || '' });
    setActionError('');
    setShowEditModal(true);
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setActionError('');
    setActionLoading(true);
    try {
      const payload = {};
      if (editForm.name && editForm.name !== selectedTeam.name) payload.name = editForm.name;
      if (editForm.description !== undefined && editForm.description !== selectedTeam.description) payload.description = editForm.description;
      const res = await fetch(`${API_BASE_URL}/api/teams/${selectedTeam.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowEditModal(false);
        await refreshTeamDetails(selectedTeam.id);
        await fetchTeams();
      } else {
        const data = await res.json();
        setActionError(data.error || data.message || 'ویرایش تیم ناموفق بود');
      }
    } catch (e) {
      setActionError('خطا در اتصال به سرور');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!selectedTeam) return;
    const confirmed = window.confirm('آیا از حذف تیم مطمئن هستید؟');
    if (!confirmed) return;
    setActionError('');
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams/${selectedTeam.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setShowDetailsModal(false);
        setSelectedTeam(null);
        await fetchTeams();
      } else {
        const data = await res.json();
        setActionError(data.error || data.message || 'حذف تیم ناموفق بود');
      }
    } catch (e) {
      setActionError('خطا در اتصال به سرور');
    } finally {
      setActionLoading(false);
    }
  };

  const openAddMember = async () => {
    setAddMemberForm({ user_id: '', role: 'member' });
    setActionError('');
    setShowAddMemberModal(true);
    await fetchOrgUsers();
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setActionError('');
    if (!addMemberForm.user_id) {
      setActionError('انتخاب کاربر الزامی است');
      return;
    }
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams/${selectedTeam.id}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(addMemberForm)
      });
      const data = await res.json();
      if (res.status === 201) {
        setShowAddMemberModal(false);
        await refreshTeamDetails(selectedTeam.id);
      } else {
        if (res.status === 400) setActionError('کاربر قبلاً عضو تیم است');
        else if (res.status === 403) setActionError('کاربر به سازمان شما تعلق ندارد');
        else if (res.status === 404) setActionError('تیم پیدا نشد');
        else setActionError(data.error || data.message || 'افزودن عضو ناموفق بود');
      }
    } catch (e) {
      setActionError('خطا در اتصال به سرور');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveMember = async (userId) => {
    const confirmed = window.confirm('حذف این عضو از تیم؟');
    if (!confirmed) return;
    setActionError('');
    setActionLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/teams/${selectedTeam.id}/members/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        await refreshTeamDetails(selectedTeam.id);
      } else {
        const data = await res.json();
        setActionError(data.error || data.message || 'حذف عضو ناموفق بود');
      }
    } catch (e) {
      setActionError('خطا در اتصال به سرور');
    } finally {
      setActionLoading(false);
    }
  };

  const isLeadInSelectedTeam = () => {
    if (!selectedTeam || !user) return false;
    const me = (selectedTeam.members || []).find(m => m.email === user.email);
    return me?.role === 'lead';
  };

  const renderMemberAvatar = (member) => {
    const initials = (member.full_name || member.email || '?').split(' ').map(p => p[0]).join('').slice(0,2).toUpperCase();
    return <div className="avatar" title={member.full_name || member.email}>{initials}</div>;
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div className="teams-container">
      <div className="section-header">
        <h2>تیم‌ها</h2>
        {user && (user.role === 'admin' || user.role === 'leader') && (
          <button className="btn-add" onClick={openCreate}>+ تیم جدید</button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="empty-state">
          <div style={{ fontSize: '64px', opacity: 0.3, marginBottom: '20px' }}>👥</div>
          <p>هنوز تیمی ایجاد نشده است</p>
        </div>
      ) : (
        teams.map(team => (
          <div key={team.id} className="team-card">
            <div className="team-header">
              <div>
                <h3 className="team-title">{team.name}</h3>
                {team.description && <p className="team-desc">{team.description}</p>}
              </div>
              <div className="team-actions">
                <span className="members-badge">👥 {team.members_count ?? (team.members ? team.members.length : 0)}</span>
                <button className="btn-secondary" onClick={() => openDetails(team)}>مشاهده جزئیات</button>
              </div>
            </div>
            {Array.isArray(team.members) && team.members.length > 0 && (
              <div className="avatar-list">
                {team.members.slice(0,4).map(m => (
                  <div key={m.user_id} className="avatar-item">
                    {renderMemberAvatar(m)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {error && <div className="error-inline">{error}</div>}

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>ایجاد تیم جدید</h3>
            {actionError && <div className="error-inline">{actionError}</div>}
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>نام تیم</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  required
                  placeholder="مثال: تیم مارکتینگ"
                />
              </div>
              <div className="form-group">
                <label>توضیحات</label>
                <textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="اختیاری"
                  rows="3"
                />
              </div>
              <div className="form-group">
                <label>افزودن اعضا (اختیاری)</label>
                <select
                  multiple
                  value={createForm.member_ids}
                  onChange={(e) => {
                    const options = Array.from(e.target.selectedOptions).map(o => o.value);
                    setCreateForm({ ...createForm, member_ids: options });
                  }}
                >
                  {orgUsers.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.full_name || u.email}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowCreateModal(false)}>انصراف</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'در حال ایجاد...' : 'ایجاد تیم'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedTeam && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="details-header">
              <h3>{selectedTeam.name}</h3>
              <div className="details-actions">
                <button className="btn-secondary" onClick={openEdit}>ویرایش</button>
                <button className="btn-delete" onClick={handleDeleteTeam} disabled={actionLoading}>حذف</button>
              </div>
            </div>
            {selectedTeam.description && <p className="team-desc">{selectedTeam.description}</p>}
            <div className="members-section">
              <div className="section-row">
                <h4>اعضا</h4>
                {isLeadInSelectedTeam() && (
                  <button className="btn-add" onClick={openAddMember}>+ افزودن عضو</button>
                )}
              </div>
              {(selectedTeam.members || []).length === 0 ? (
                <p className="no-members">عضوی وجود ندارد</p>
              ) : (
                selectedTeam.members.map(m => (
                  <div key={m.user_id} className="member-item">
                    {renderMemberAvatar(m)}
                    <div className="member-info">
                      <div className="member-name">{m.full_name}</div>
                      <div className="member-email">{m.email}</div>
                    </div>
                    <div className="member-role">{m.role === 'lead' ? 'Lead' : 'Member'}</div>
                    {isLeadInSelectedTeam() && (
                      <button className="btn-delete-member" onClick={() => handleRemoveMember(m.user_id)} disabled={actionLoading}>حذف</button>
                    )}
                  </div>
                ))
              )}
              {actionError && <div className="error-inline" style={{ marginTop: '8px' }}>{actionError}</div>}
            </div>
            <button className="btn-secondary" onClick={() => setShowDetailsModal(false)} style={{ marginTop: '16px', width: '100%' }}>بستن</button>
          </div>
        </div>
      )}

      {showEditModal && selectedTeam && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>ویرایش تیم</h3>
            {actionError && <div className="error-inline">{actionError}</div>}
            <form onSubmit={handleEdit}>
              <div className="form-group">
                <label>نام تیم</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label>توضیحات</label>
                <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} rows="3" />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>انصراف</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'در حال ذخیره...' : 'ذخیره'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddMemberModal && selectedTeam && (
        <div className="modal-overlay" onClick={() => setShowAddMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>افزودن عضو</h3>
            {actionError && <div className="error-inline">{actionError}</div>}
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>کاربر</label>
                <select value={addMemberForm.user_id} onChange={(e) => setAddMemberForm({ ...addMemberForm, user_id: e.target.value })} required>
                  <option value="">انتخاب کنید</option>
                  {orgUsers.map(u => (
                    <option key={u.user_id} value={u.user_id}>{u.full_name || u.email}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>نقش</label>
                <div className="radio-row">
                  <label><input type="radio" name="role" value="member" checked={addMemberForm.role === 'member'} onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })} /> Member</label>
                  <label style={{ marginRight: '12px' }}><input type="radio" name="role" value="lead" checked={addMemberForm.role === 'lead'} onChange={(e) => setAddMemberForm({ ...addMemberForm, role: e.target.value })} /> Lead</label>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddMemberModal(false)}>انصراف</button>
                <button type="submit" className="btn-primary" disabled={actionLoading}>{actionLoading ? 'در حال افزودن...' : 'افزودن'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Teams;
