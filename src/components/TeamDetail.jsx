import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ArrowRight, Plus, Trash2, Users, Crown } from 'lucide-react';
import API_BASE_URL from '../config';
import './TeamDetail.css';

function TeamDetail({ token, teamId, onBack, currentUser }) {
  const [team, setTeam] = useState(null);
  const [members, setMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');

  useEffect(() => {
    if (teamId) {
      fetchTeamDetails();
      fetchAllUsers();
    }
  }, [teamId]);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setTeam(data);
        setMembers(data.members || []);
      }
    } catch (error) {
      console.error('Error fetching team details:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    // فیلتر کاربرانی که عضو این تیم نیستند
    const memberIds = members.map(m => m.id);
    const available = allUsers.filter(user => !memberIds.includes(user.id));
    setAvailableUsers(available);
  }, [members, allUsers]);

  const handleAddMember = async () => {
    if (!selectedUserId) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_id: selectedUserId,
          role: selectedRole
        })
      });

      if (response.ok) {
        await fetchTeamDetails();
        setIsDialogOpen(false);
        setSelectedUserId('');
        setSelectedRole('member');
      } else {
        const error = await response.json();
        alert('خطا در افزودن عضو: ' + (error.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!confirm('آیا از حذف این عضو از تیم اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/teams/${teamId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchTeamDetails();
      } else {
        const error = await response.json();
        alert('خطا در حذف عضو: ' + (error.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const canManageTeam = currentUser && (currentUser.role === 'super_admin' || currentUser.role === 'admin');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">تیم یافت نشد</div>
      </div>
    );
  }

  return (
    <div className="team-detail-container" dir="rtl">
      <div className="team-detail-header">
        <Button variant="ghost" onClick={onBack}>
          <ArrowRight className="w-4 h-4 ml-2" />
          بازگشت
        </Button>
      </div>

      <Card className="mt-4 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white text-2xl">
            <Users className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold">{team.name}</h2>
            <p className="text-muted-foreground">
              {members.length} عضو
            </p>
          </div>
        </div>

        {team.description && (
          <p className="text-muted-foreground mb-6">{team.description}</p>
        )}

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">اعضای تیم</h3>
          {canManageTeam && (
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="w-4 h-4 ml-2" />
              افزودن عضو
            </Button>
          )}
        </div>

        {members.length === 0 ? (
          <Card className="p-8 text-center bg-muted/30">
            <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">این تیم هنوز عضوی ندارد</h3>
            <p className="text-muted-foreground mb-4">
              برای شروع، اولین عضو را به تیم اضافه کنید
            </p>
            {canManageTeam && (
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="w-4 h-4 ml-2" />
                اولین عضو را اضافه کنید
              </Button>
            )}
          </Card>
        ) : (
          <div className="members-list">
            {members.map(member => (
              <Card key={member.id} className="member-card">
                <div className="member-info">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                    {member.full_name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.full_name}</span>
                      {member.team_role === 'leader' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Crown className="w-3 h-3" />
                          رهبر تیم
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-muted-foreground">{member.email}</span>
                  </div>
                </div>
                {canManageTeam && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </Card>

      {/* Dialog for Adding Member */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>افزودن عضو به تیم</DialogTitle>
            <DialogDescription>
              یک کاربر را انتخاب کنید و نقش او در تیم را مشخص کنید
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="user">انتخاب کاربر</Label>
              {availableUsers.length === 0 ? (
                <p className="text-sm text-muted-foreground p-4 bg-muted rounded">
                  همه کاربران عضو این تیم هستند یا کاربری برای افزودن وجود ندارد
                </p>
              ) : (
                <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                  <SelectTrigger>
                    <SelectValue placeholder="یک کاربر را انتخاب کنید" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.full_name} ({user.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">نقش در تیم</Label>
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">عضو عادی</SelectItem>
                  <SelectItem value="leader">رهبر تیم</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                setSelectedUserId('');
                setSelectedRole('member');
              }}
            >
              لغو
            </Button>
            <Button 
              onClick={handleAddMember}
              disabled={!selectedUserId || availableUsers.length === 0}
            >
              افزودن
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TeamDetail;
