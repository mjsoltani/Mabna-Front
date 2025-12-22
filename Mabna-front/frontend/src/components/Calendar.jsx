import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Target, CheckSquare } from 'lucide-react';
import DatePicker, { DateObject } from 'react-multi-date-picker';
import persian from 'react-date-object/calendars/persian';
import persian_fa from 'react-date-object/locales/persian_fa';
import API_BASE_URL from '../config';
import './Calendar.css';

function Calendar({ token }) {
  const [selectedDate, setSelectedDate] = useState(new DateObject({ calendar: persian, locale: persian_fa }));
  const [objectives, setObjectives] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [objectivesRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/objectives`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/tasks`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (objectivesRes.ok) {
        setObjectives(await objectivesRes.json());
      }
      if (tasksRes.ok) {
        setTasks(await tasksRes.json());
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // فیلتر اهداف و وظایف بر اساس تاریخ انتخاب شده
  const getItemsForDate = (date) => {
    const selectedDateObj = new Date(date.toDate());
    selectedDateObj.setHours(0, 0, 0, 0);

    const filteredObjectives = objectives.filter(obj => {
      const endDate = new Date(obj.end_date);
      endDate.setHours(0, 0, 0, 0);
      return endDate >= selectedDateObj;
    });

    const filteredTasks = tasks.filter(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline >= selectedDateObj;
    });

    return { objectives: filteredObjectives, tasks: filteredTasks };
  };

  const { objectives: dateObjectives, tasks: dateTasks } = getItemsForDate(selectedDate);

  // تابع برای رنگ‌آمیزی روزهایی که دارای deadline هستند
  const mapDays = ({ date }) => {
    const dateObj = new Date(date.toDate());
    dateObj.setHours(0, 0, 0, 0);

    const hasObjective = objectives.some(obj => {
      const endDate = new Date(obj.end_date);
      endDate.setHours(0, 0, 0, 0);
      return endDate.getTime() === dateObj.getTime();
    });

    const hasTask = tasks.some(task => {
      if (!task.deadline) return false;
      const deadline = new Date(task.deadline);
      deadline.setHours(0, 0, 0, 0);
      return deadline.getTime() === dateObj.getTime();
    });

    const className = [];
    if (hasObjective) className.push('has-objective');
    if (hasTask) className.push('has-task');

    return {
      className: className.join(' '),
    };
  };

  const getDaysUntilDeadline = (deadline) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const deadlineDate = new Date(deadline);
    deadlineDate.setHours(0, 0, 0, 0);
    const diff = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return diff;
  };

  if (loading) {
    return <div className="loading">در حال بارگذاری...</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <div>
          <h1 className="calendar-title">تقویم</h1>
          <p className="calendar-subtitle">مشاهده اهداف و وظایف در تقویم شمسی</p>
        </div>
      </div>

      <div className="calendar-content">
        {/* تقویم */}
        <div className="calendar-picker-section">
          <DatePicker
            value={selectedDate}
            onChange={setSelectedDate}
            calendar={persian}
            locale={persian_fa}
            mapDays={mapDays}
            className="custom-calendar"
            inline
          />
          
          <div className="calendar-legend">
            <div className="legend-item">
              <span className="legend-dot objective"></span>
              <span>اهداف</span>
            </div>
            <div className="legend-item">
              <span className="legend-dot task"></span>
              <span>وظایف</span>
            </div>
          </div>
        </div>

        {/* لیست اهداف و وظایف */}
        <div className="calendar-items-section">
          <div className="selected-date-header">
            <CalendarIcon size={20} />
            <h3>{selectedDate.format('D MMMM YYYY')}</h3>
          </div>

          {/* اهداف */}
          {dateObjectives.length > 0 && (
            <div className="items-group">
              <div className="items-group-header">
                <Target size={18} />
                <h4>اهداف ({dateObjectives.length})</h4>
              </div>
              <div className="items-list">
                {dateObjectives.map(obj => {
                  const daysLeft = getDaysUntilDeadline(obj.end_date);
                  return (
                    <div key={obj.id} className="calendar-item objective-item">
                      <div className="item-header">
                        <h5>{obj.title}</h5>
                        <span className={`days-badge ${daysLeft < 7 ? 'urgent' : daysLeft < 30 ? 'warning' : 'normal'}`}>
                          {daysLeft === 0 ? 'امروز' : daysLeft < 0 ? `${Math.abs(daysLeft)} روز گذشته` : `${daysLeft} روز مانده`}
                        </span>
                      </div>
                      {obj.description && (
                        <p className="item-description">{obj.description}</p>
                      )}
                      <div className="item-meta">
                        <span>تاریخ پایان: {new Date(obj.end_date).toLocaleDateString('fa-IR')}</span>
                        {obj.key_results && (
                          <span>{obj.key_results.length} نتیجه کلیدی</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* وظایف */}
          {dateTasks.length > 0 && (
            <div className="items-group">
              <div className="items-group-header">
                <CheckSquare size={18} />
                <h4>وظایف ({dateTasks.length})</h4>
              </div>
              <div className="items-list">
                {dateTasks.map(task => {
                  const daysLeft = getDaysUntilDeadline(task.deadline);
                  return (
                    <div key={task.id} className="calendar-item task-item">
                      <div className="item-header">
                        <div className="task-title-row">
                          <span className={`priority-dot ${task.priority}`}></span>
                          <h5>{task.title}</h5>
                        </div>
                        <span className={`days-badge ${daysLeft < 3 ? 'urgent' : daysLeft < 7 ? 'warning' : 'normal'}`}>
                          {daysLeft === 0 ? 'امروز' : daysLeft < 0 ? `${Math.abs(daysLeft)} روز گذشته` : `${daysLeft} روز مانده`}
                        </span>
                      </div>
                      {task.description && (
                        <p className="item-description">{task.description}</p>
                      )}
                      <div className="item-meta">
                        <span className={`status-badge ${task.status}`}>
                          {task.status === 'done' ? 'انجام شده' : task.status === 'in_progress' ? 'در حال انجام' : 'در انتظار'}
                        </span>
                        {task.assignee && (
                          <span>{task.assignee.full_name}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* حالت خالی */}
          {dateObjectives.length === 0 && dateTasks.length === 0 && (
            <div className="empty-state">
              <CalendarIcon size={48} className="empty-icon" />
              <p>هیچ هدف یا وظیفه‌ای برای این تاریخ وجود ندارد</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Calendar;
