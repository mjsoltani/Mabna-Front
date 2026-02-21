import { useState, useEffect, useCallback } from 'react';
import API_BASE_URL from '../config';
import {
  KanbanBoard,
  KanbanCard,
  KanbanCards,
  KanbanHeader,
  KanbanProvider,
} from '@/components/ui/kanban';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getDeadlineStatus, formatDateToPersian } from '../utils/deadlineUtils';
import { Calendar, CheckCircle2, Shield, Archive } from 'lucide-react';
import TaskLabels from './ui/task-labels';

const statuses = [
  { id: 'todo', name: 'انجام نشده', color: '#f59e0b' },
  { id: 'in_progress', name: 'در حال انجام', color: '#3b82f6' },
  { id: 'done', name: 'انجام شده', color: '#10b981' },
  { id: 'approved', name: 'تأیید شده', color: '#8b5cf6' },
];

function TasksKanban({ token, onTaskClick, onNewTask, refreshTrigger, filterQuery, onTaskCountsChange }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    try {
      const url = `${API_BASE_URL}/api/tasks${filterQuery ? '?' + filterQuery : ''}`;
      const response = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const tasksData = await response.json();
        setTasks(tasksData);
        
        // محاسبه و ارسال تعداد تسک‌ها به کامپوننت والد
        if (onTaskCountsChange) {
          const counts = {
            all: tasksData.length,
            approved: tasksData.filter(t => t.is_approved === true).length,
            not_approved: tasksData.filter(t => t.is_approved !== true).length
          };
          onTaskCountsChange(prevCounts => ({ ...prevCounts, ...counts }));
        }
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  }, [token, filterQuery, onTaskCountsChange]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks, refreshTrigger]);

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    if (!over) return;

    const newStatus = over.id;
    const taskId = active.id;
    const task = tasks.find(t => t.id === taskId);
    
    if (!task) return;

    // اگر وظیفه به ستون approved کشیده شد
    if (newStatus === 'approved') {
      // فقط وظایف done قابل تأیید هستند
      if (task.status !== 'done') {
        alert('فقط وظایف انجام شده قابل تأیید نهایی هستند');
        return;
      }
      // تأیید نهایی وظیفه
      await handleApproveTask(taskId);
      return;
    }

    // اگر وظیفه تأیید شده به ستون دیگری کشیده شد
    if (task.is_approved && newStatus !== 'approved') {
      alert('وظایف تأیید شده قابل تغییر وضعیت نیستند');
      return;
    }

    // تغییر وضعیت معمولی
    if (task.status === newStatus) return;

    // ذخیره state قبلی برای rollback
    const previousTasks = [...tasks];

    // آپدیت optimistic
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId ? { ...t, status: newStatus } : t
    ));

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      
      if (!response.ok) {
        setTasks(previousTasks);
        console.error('Failed to update task status');
      } else {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error updating task status:', error);
      setTasks(previousTasks);
    }
  };

  const handleApproveTask = async (taskId) => {
    const previousTasks = [...tasks];

    // آپدیت optimistic
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === taskId ? { 
        ...t, 
        is_approved: true, 
        approved_at: new Date().toISOString(),
        approved_by: { full_name: 'شما' } // موقتی
      } : t
    ));

    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks/${taskId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          approval_note: 'تأیید شده از طریق kanban'
        })
      });
      
      if (!response.ok) {
        setTasks(previousTasks);
        const errorData = await response.json();
        alert('خطا در تأیید وظیفه: ' + (errorData.message || 'خطای نامشخص'));
      } else {
        await fetchTasks();
      }
    } catch (error) {
      console.error('Error approving task:', error);
      setTasks(previousTasks);
      alert('خطا در ارتباط با سرور');
    }
  };

  const getTasksByStatus = (statusId) => {
    if (statusId === 'approved') {
      // وظایف تأیید شده: done + is_approved = true
      return tasks.filter(task => task.status === 'done' && task.is_approved === true);
    } else if (statusId === 'done') {
      // وظایف انجام شده اما تأیید نشده: done + is_approved = false/null
      return tasks.filter(task => task.status === 'done' && task.is_approved !== true);
    } else {
      // سایر وضعیت‌ها
      return tasks.filter(task => task.status === statusId);
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
    <div className="kanban-wrapper" dir="rtl">
      <KanbanProvider onDragEnd={handleDragEnd} className="min-h-[500px]">
        {statuses.map((status) => {
          const statusTasks = getTasksByStatus(status.id);
          return (
            <KanbanBoard key={status.id} id={status.id}>
              <KanbanHeader 
                name={status.name} 
                color={status.color} 
                count={statusTasks.length}
              />
              <KanbanCards id={status.id}>
                {statusTasks.map((task, index) => (
                  <KanbanCard
                    key={task.id}
                    id={task.id}
                    name={task.title}
                    parent={status.id}
                    index={index}
                    onClick={() => onTaskClick && onTaskClick(task)}
                  >
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="m-0 flex-1 font-medium text-sm line-clamp-2">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-1">
                          {task.type === 'special' && (
                            <span className="text-yellow-500">⭐</span>
                          )}
                          {task.is_approved && (
                            <Archive className="w-4 h-4 text-purple-500" title="تأیید شده" />
                          )}
                        </div>
                      </div>
                      
                      {task.is_approved && (
                        <div className="flex items-center gap-1 text-xs text-purple-600 bg-purple-50 px-2 py-1 rounded">
                          <Shield className="w-3 h-3" />
                          <span>تأیید شده توسط {task.approved_by?.full_name || 'مدیر'}</span>
                        </div>
                      )}
                      
                      {task.due_date && (
                        <div className="flex items-center gap-1 text-xs">
                          {(() => {
                            const deadlineInfo = getDeadlineStatus(task.due_date);
                            const colorClass = 
                              deadlineInfo.status === 'overdue' ? 'text-red-500' :
                              deadlineInfo.status === 'today' ? 'text-orange-500' :
                              deadlineInfo.status === 'urgent' ? 'text-yellow-500' :
                              'text-muted-foreground';
                            return (
                              <span className={`flex items-center gap-1 ${colorClass}`}>
                                <Calendar className="w-3 h-3" />
                                {formatDateToPersian(task.due_date)}
                              </span>
                            );
                          })()}
                        </div>
                      )}

                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>
                            {task.subtasks.filter(st => st.isCompleted).length}/{task.subtasks.length}
                          </span>
                        </div>
                      )}

                      {/* Task Labels */}
                      {task.labels && task.labels.length > 0 && (
                        <TaskLabels 
                          labels={task.labels} 
                          size="small" 
                          maxDisplay={3}
                        />
                      )}

                      <div className="flex items-center justify-between mt-1">
                        {task.assignee && (
                          <div className="flex items-center gap-1">
                            <Avatar className="h-5 w-5">
                              <AvatarFallback className="text-[10px] bg-primary/10">
                                {task.assignee.full_name?.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                              {task.assignee.full_name}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </KanbanCard>
                ))}
              </KanbanCards>
            </KanbanBoard>
          );
        })}
      </KanbanProvider>
    </div>
  );
}

export default TasksKanban;
