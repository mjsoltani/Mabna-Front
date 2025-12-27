import { useState, useEffect } from 'react';
import './Dashboard.css';
import Objectives from './Objectives';
import ObjectivesModern from './ObjectivesModern';
import AdminDashboard from './AdminDashboard';
import TasksV2 from './TasksV2';
import Invitations from './Invitations';
import ModernDashboard from './ModernDashboard';
import Teams from './Teams';
import RecurringPatterns from './RecurringPatterns';
import Profile from './Profile';
import Calendar from './Calendar';
import API_BASE_URL from '../config';
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar';
import { DashboardNavbar } from '@/components/ui/dashboard-navbar';
import { 
  LayoutDashboard, 
  Target, 
  BarChart3, 
  Users, 
  CheckSquare, 
  RefreshCw, 
  UserCircle, 
  Mail, 
  LogOut,
  Calendar as CalendarIcon
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

function Dashboard({ user, token, onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [focusTaskId, setFocusTaskId] = useState(null);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/notifications?unreadOnly=true`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/notifications/unread-count`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (notifRes.ok) {
        const data = await notifRes.json();
        setNotifications(data.slice(0, 5)); // فقط 5 تای اول
      }
      if (countRes.ok) {
        const data = await countRes.json();
        setUnreadCount(data.count || 0);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      // علامت‌گذاری به عنوان خوانده شده
      await fetch(`${API_BASE_URL}/api/notifications/${notif.id}/read`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // اگر نوتیفیکیشن مربوط به وظیفه است، به تب وظایف برو
      if (notif.task_id) {
        setActiveTab('tasks');
        setFocusTaskId(notif.task_id);
      }

      // به‌روزرسانی لیست
      fetchNotifications();
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleTaskClick = (taskId) => {
    setActiveTab('tasks');
    setFocusTaskId(taskId);
  };

  const handleObjectiveClick = (objectiveId) => {
    setActiveTab('objectives');
  };

  const links = [
    {
      label: 'داشبورد',
      href: '#',
      icon: <LayoutDashboard className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'dashboard',
    },
    {
      label: 'اهداف',
      href: '#',
      icon: <Target className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'objectives',
    },
    {
      label: 'نتایج کلیدی',
      href: '#',
      icon: <BarChart3 className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'keyresults',
    },
    {
      label: 'تیم‌ها',
      href: '#',
      icon: <Users className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'teams',
    },
    {
      label: 'وظایف',
      href: '#',
      icon: <CheckSquare className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'tasks',
    },
    {
      label: 'تقویم',
      href: '#',
      icon: <CalendarIcon className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'calendar',
    },
    {
      label: 'الگوهای تکرار',
      href: '#',
      icon: <RefreshCw className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'recurring',
    },
  ];

  // فقط برای admin ها منوی دعوت کاربران را اضافه کن
  if (user && user.role === 'admin') {
    links.push({
      label: 'دعوت کاربران',
      href: '#',
      icon: <Mail className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
      tab: 'invitations',
    });
  }

  return (
    <div className={cn(
      "flex flex-col md:flex-row bg-gray-100 w-full flex-1 mx-auto border border-neutral-200 overflow-hidden",
      "h-screen"
    )}>
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2">
              {links.map((link, idx) => (
                <SidebarLink 
                  key={idx} 
                  link={link}
                  onClick={() => setActiveTab(link.tab)}
                  className={activeTab === link.tab ? 'bg-neutral-200 rounded-md' : ''}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 py-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white flex-shrink-0">
                {user.full_name.charAt(0)}
              </div>
              <motion.div
                animate={{
                  display: open ? "block" : "none",
                  opacity: open ? 1 : 0,
                }}
                className="flex flex-col"
              >
                <span className="text-sm font-medium text-neutral-700">
                  {user.full_name}
                </span>
                <span className="text-xs text-neutral-500">
                  {user.team?.name || user.organization?.name || '-'}
                </span>
              </motion.div>
            </div>
            <SidebarLink
              link={{
                label: 'خروج',
                href: '#',
                icon: <LogOut className="text-neutral-700 h-5 w-5 flex-shrink-0" />,
              }}
              onClick={onLogout}
            />
          </div>
        </SidebarBody>
      </Sidebar>

      <div className="flex flex-1 flex-col">
        <div className="border-b bg-white px-4 md:px-10 py-4">
          <DashboardNavbar
            user={user}
            notificationCount={unreadCount}
            notifications={notifications.map(n => ({
              id: n.id,
              title: n.type === 'task_assigned' ? 'وظیفه جدید' : 
                     n.type === 'task_completed' ? 'وظیفه تکمیل شد' :
                     n.type === 'objective_updated' ? 'هدف به‌روز شد' :
                     n.type === 'comment_added' ? 'نظر جدید' : 'اعلان',
              message: n.message,
              time: new Date(n.created_at).toLocaleDateString('fa-IR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }),
              task_id: n.task_id
            }))}
            onNotificationClick={handleNotificationClick}
            onProfileClick={() => setActiveTab('profile')}
            onSettingsClick={() => setActiveTab('profile')}
            onLogout={onLogout}
          />
        </div>
        
        <div className="p-2 md:p-10 bg-white flex flex-col gap-2 flex-1 w-full h-full overflow-auto">
          <div className="flex-1">
            {activeTab === 'dashboard' && user && user.role === 'admin' && (
              <AdminDashboard token={token} user={user} />
            )}
            {activeTab === 'dashboard' && user && user.role !== 'admin' && (
              <ModernDashboard 
                token={token} 
                onObjectiveClick={(objectiveId) => {
                  setActiveTab('objectives');
                }}
                onTaskClick={handleTaskClick}
              />
            )}
            {activeTab === 'objectives' && <ObjectivesModern token={token} />}
            {activeTab === 'keyresults' && <ObjectivesModern token={token} showOnlyKRs={true} />}
            {activeTab === 'tasks' && <TasksV2 token={token} user={user} focusTaskId={focusTaskId} />}
            {activeTab === 'calendar' && <Calendar token={token} />}
            {activeTab === 'recurring' && <RecurringPatterns token={token} />}
            {activeTab === 'profile' && (
              <Profile 
                token={token} 
                user={user} 
                onTaskClick={handleTaskClick}
                onObjectiveClick={handleObjectiveClick}
              />
            )}
            {activeTab === 'teams' && <Teams token={token} user={user} />}
            {activeTab === 'invitations' && <Invitations token={token} />}
          </div>
        </div>
      </div>
    </div>
  );
}

const Logo = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre mr-2"
      >
        مبنا
      </motion.span>
    </div>
  );
};

const LogoIcon = () => {
  return (
    <div className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20">
      <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </div>
  );
};

export default Dashboard;
