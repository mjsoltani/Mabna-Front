import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Key, User as UserIcon, Users as UsersIcon } from 'lucide-react';
import API_BASE_URL from '../config';
import './Users.css';

function Users({ token, currentUser }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [organization, setOrganization] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
    fetchOrganization();
  }, []);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/organizations/default`);
      if (response.ok) {
        const data = await response.json();
        setOrganization(data);
      }
    } catch (error) {
      console.error('Error fetching organization:', error);
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/list`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      // استفاده از API register چون API ایجاد کاربر هنوز در backend وجود ندارد
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        password: formData.password,
        organization_id: organization?.id || 'default-org-afagh-saram'
      };

      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('کاربر با موفقیت ایجاد شد. توجه: نقش کاربر به صورت پیش‌فرض "member" است. برای تغییر نقش، لطفاً با تیم backend تماس بگیرید.');
        await fetchUsers();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert('خطا در ایجاد کاربر: ' + (error.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('خطا در ارتباط با سرور');
    }
  };

  const handleUpdateUser = async () => {
    alert('⚠️ API ویرایش کاربر هنوز در backend پیاده‌سازی نشده است. لطفاً با تیم backend تماس بگیرید.');
    return;
    
    /* کد زیر زمانی فعال می‌شود که backend API را پیاده‌سازی کند
    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role
      };

      // فقط اگر رمز عبور وارد شده باشد، آن را ارسال کن
      if (formData.password) {
        payload.password = formData.password;
      }

      const response = await fetch(`${API_BASE_URL}/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        await fetchUsers();
        setIsDialogOpen(false);
        resetForm();
      } else {
        const error = await response.json();
        alert('خطا در ویرایش کاربر: ' + (error.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error updating user:', error);
      alert('خطا در ارتباط با سرور');
    }
    */
  };

  const handleDeleteUser = async (userId) => {
    alert('⚠️ API حذف کاربر هنوز در backend پیاده‌سازی نشده است. لطفاً با تیم backend تماس بگیرید.');
    return;
    
    /* کد زیر زمانی فعال می‌شود که backend API را پیاده‌سازی کند
    if (!confirm('آیا از حذف این کاربر اطمینان دارید؟')) return;

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        await fetchUsers();
      } else {
        const error = await response.json();
        alert('خطا در حذف کاربر: ' + (error.message || 'خطای نامشخص'));
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('خطا در ارتباط با سرور');
    }
    */
  };

  const openCreateDialog = () => {
    setIsCreating(true);
    setSelectedUser(null);
    resetForm();
    setIsDialogOpen(true);
  };

  const openEditDialog = (user) => {
    setIsCreating(false);
    setSelectedUser(user);
    setFormData({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'user'
    });
    setSelectedUser(null);
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
            <Key className="w-3 h-3" />
            Super Admin
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
            <UserIcon className="w-3 h-3" />
            Admin
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
            <UsersIcon className="w-3 h-3" />
            User
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    );
  }

  return (
    <div className="users-container" dir="rtl">
      {/* Backend API Warning */}
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start gap-3">
          <span className="text-2xl">⚠️</span>
          <div>
            <h3 className="font-semibold text-yellow-800 mb-1">توجه: محدودیت‌های موقت</h3>
            <p className="text-sm text-yellow-700">
              API های ویرایش و حذف کاربر هنوز در backend پیاده‌سازی نشده‌اند. 
              فعلاً فقط می‌توانید کاربر جدید ایجاد کنید (با نقش پیش‌فرض member).
            </p>
          </div>
        </div>
      </div>

      <div className="users-header">
        <div>
          <h2 className="text-2xl font-semibold">مدیریت کاربران</h2>
          <p className="text-muted-foreground mt-1">
            {organization ? `سازمان: ${organization.name}` : 'مدیریت کاربران سیستم'}
          </p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="w-4 h-4 ml-2" />
          کاربر جدید
        </Button>
      </div>

      <Card className="mt-6">
        <div className="overflow-x-auto">
          <table className="users-table">
            <thead>
              <tr>
                <th>نام کامل</th>
                <th>ایمیل</th>
                <th>نقش</th>
                <th>عملیات</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.user_id || user.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm">
                        {user.full_name.charAt(0)}
                      </div>
                      {user.full_name}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      {user.role !== 'super_admin' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditDialog(user)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteUser(user.user_id || user.id)}
                            disabled={(user.user_id || user.id) === (currentUser.user_id || currentUser.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {user.role === 'super_admin' && (
                        <span className="text-xs text-muted-foreground">غیرقابل ویرایش</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Dialog for Create/Edit User */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'ایجاد کاربر جدید' : 'ویرایش کاربر'}
            </DialogTitle>
            <DialogDescription>
              {isCreating 
                ? `کاربر جدید به سازمان ${organization?.name || 'افاق سرام'} اضافه خواهد شد`
                : 'اطلاعات کاربر را ویرایش کنید'
              }
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">نام کامل</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="علی احمدی"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">ایمیل</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="ali@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">
                رمز عبور {!isCreating && '(برای تغییر رمز عبور پر کنید)'}
              </Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder={isCreating ? 'حداقل 6 کاراکتر' : 'رمز عبور جدید'}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">نقش</Label>
              <Select
                value={formData.role}
                onValueChange={(value) => setFormData({ ...formData, role: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="انتخاب نقش" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User (کاربر عادی)</SelectItem>
                  <SelectItem value="admin">Admin (مدیر)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                توجه: نمی‌توانید Super Admin ایجاد کنید
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false);
                resetForm();
              }}
            >
              لغو
            </Button>
            <Button onClick={isCreating ? handleCreateUser : handleUpdateUser}>
              {isCreating ? 'ایجاد' : 'ذخیره'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default Users;
