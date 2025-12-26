import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Target, CheckSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import API_BASE_URL from '../config'
import moment from 'moment-jalaali'
import './Calendar.css'

// تنظیم moment برای تقویم شمسی
moment.loadPersian({ usePersianDigits: false, dialect: 'persian-modern' })

function Calendar({ token }) {
  const [events, setEvents] = useState([])
  const [tasks, setTasks] = useState([])
  const [objectives, setObjectives] = useState([])
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(moment())
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    startTime: '',
    endTime: '',
    color: 'blue',
    category: 'رویداد',
    assignedUsers: [],
    assignedTeams: [],
  })

  const colors = [
    { name: "آبی", value: "blue", bg: "bg-blue-500" },
    { name: "سبز", value: "green", bg: "bg-green-500" },
    { name: "بنفش", value: "purple", bg: "bg-purple-500" },
    { name: "نارنجی", value: "orange", bg: "bg-orange-500" },
    { name: "صورتی", value: "pink", bg: "bg-pink-500" },
    { name: "قرمز", value: "red", bg: "bg-red-500" },
  ]

  const categories = ["رویداد", "جلسه", "وظیفه", "هدف", "یادآوری"]

  useEffect(() => {
    fetchAllData()
    fetchUsersAndTeams()
  }, [])

  const fetchAllData = async () => {
    setLoading(true)
    try {
      await Promise.all([
        fetchTasks(),
        fetchObjectives(),
        fetchEvents()
      ])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsersAndTeams = async () => {
    try {
      const [usersRes, teamsRes] = await Promise.all([
        fetch(`${API_BASE_URL}/api/users/list`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`${API_BASE_URL}/api/teams/members`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ])

      if (usersRes.ok) {
        const usersData = await usersRes.json()
        setUsers(usersData)
      }
      if (teamsRes.ok) {
        const teamsData = await teamsRes.json()
        setTeams(teamsData)
      }
    } catch (error) {
      console.error('Error fetching users and teams:', error)
    }
  }

  const fetchTasks = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
  }

  const fetchObjectives = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/objectives`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setObjectives(data)
      }
    } catch (error) {
      console.error('Error fetching objectives:', error)
    }
  }

  const fetchEvents = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        // بکند آرایه events را مستقیماً برمی‌گرداند
        setEvents(data.events || data)
      } else {
        // اگر API events وجود نداشت، از آرایه خالی استفاده کن
        setEvents([])
      }
    } catch (error) {
      console.error('Error fetching events:', error)
      setEvents([])
    }
  }

  // تبدیل وظایف به رویدادهای تقویم
  const convertTasksToEvents = () => {
    return tasks.map(task => ({
      id: `task-${task.id}`,
      title: task.title,
      description: task.description || '',
      startTime: task.created_at ? new Date(task.created_at) : new Date(),
      endTime: task.due_date ? new Date(task.due_date) : new Date(task.created_at || new Date()),
      color: getTaskColor(task.status),
      category: 'وظیفه',
      type: 'task',
      status: task.status,
      assignee: task.assignee,
      originalData: task
    }))
  }

  // تبدیل اهداف به رویدادهای تقویم
  const convertObjectivesToEvents = () => {
    return objectives.map(objective => ({
      id: `objective-${objective.id}`,
      title: objective.title,
      description: objective.description || '',
      startTime: objective.start_date ? new Date(objective.start_date) : new Date(),
      endTime: objective.end_date ? new Date(objective.end_date) : new Date(),
      color: 'purple',
      category: 'هدف',
      type: 'objective',
      originalData: objective
    }))
  }

  // تعیین رنگ بر اساس وضعیت وظیفه
  const getTaskColor = (status) => {
    switch (status) {
      case 'done': return 'green'
      case 'in_progress': return 'orange'
      case 'todo': return 'blue'
      default: return 'blue'
    }
  }

  // ترکیب همه رویدادها
  const getAllEvents = () => {
    const taskEvents = convertTasksToEvents()
    const objectiveEvents = convertObjectivesToEvents()
    return [...events, ...taskEvents, ...objectiveEvents]
  }

  const navigateDate = (direction) => {
    setCurrentDate(prev => {
      const newDate = moment(prev)
      newDate.add(direction === 'next' ? 1 : -1, 'month')
      return newDate
    })
  }

  const getColorClasses = (colorValue) => {
    const color = colors.find(c => c.value === colorValue)
    return color || colors[0]
  }

  const handleCreateEvent = async () => {
    if (!newEvent.title || !newEvent.startTime || !newEvent.endTime) return

    const event = {
      title: newEvent.title,
      description: newEvent.description,
      start_time: new Date(newEvent.startTime).toISOString(),
      end_time: new Date(newEvent.endTime).toISOString(),
      color: newEvent.color,
      category: newEvent.category,
      assigned_user_ids: newEvent.assignedUsers,
      assigned_team_ids: newEvent.assignedTeams,
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(event)
      })
      
      if (response.ok) {
        const responseData = await response.json()
        // بکند رویداد را در فیلد event برمی‌گرداند
        const newEventFromAPI = responseData.event || responseData
        setEvents(prev => [...prev, newEventFromAPI])
      } else {
        const errorData = await response.json()
        console.error('Error creating event:', errorData)
        alert('خطا در ایجاد رویداد: ' + (errorData.message || 'خطای نامشخص'))
        return
      }
    } catch (error) {
      console.error('Error creating event:', error)
      alert('خطا در ارتباط با سرور')
      return
    }

    setIsDialogOpen(false)
    setIsCreating(false)
    setNewEvent({
      title: '',
      description: '',
      startTime: '',
      endTime: '',
      color: 'blue',
      category: 'رویداد',
      assignedUsers: [],
      assignedTeams: [],
    })
  }

  const handleUpdateEvent = async () => {
    if (!selectedEvent || selectedEvent.isReadOnly) return

    const updateData = {
      title: selectedEvent.title,
      description: selectedEvent.description,
      start_time: new Date(selectedEvent.startTime).toISOString(),
      end_time: new Date(selectedEvent.endTime).toISOString(),
      color: selectedEvent.color,
      category: selectedEvent.category,
      assigned_user_ids: selectedEvent.assignedUsers || [],
      assigned_team_ids: selectedEvent.assignedTeams || [],
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${selectedEvent.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      })
      
      if (response.ok) {
        const responseData = await response.json()
        const updatedEvent = responseData.event || responseData
        setEvents(prev => prev.map(e => 
          e.id === selectedEvent.id ? updatedEvent : e
        ))
      } else {
        const errorData = await response.json()
        console.error('Error updating event:', errorData)
        alert('خطا در ویرایش رویداد: ' + (errorData.message || 'خطای نامشخص'))
        return
      }
    } catch (error) {
      console.error('Error updating event:', error)
      alert('خطا در ارتباط با سرور')
      return
    }

    setIsDialogOpen(false)
    setSelectedEvent(null)
  }

  const handleDeleteEvent = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (response.ok) {
        setEvents(prev => prev.filter(e => e.id !== id))
      } else {
        const errorData = await response.json()
        console.error('Error deleting event:', errorData)
        alert('خطا در حذف رویداد: ' + (errorData.message || 'خطای نامشخص'))
        return
      }
    } catch (error) {
      console.error('Error deleting event:', error)
      alert('خطا در ارتباط با سرور')
      return
    }

    setIsDialogOpen(false)
    setSelectedEvent(null)
  }

  // تولید روزهای ماه
  const generateCalendarDays = () => {
    const startOfMonth = moment(currentDate).startOf('jMonth')
    const endOfMonth = moment(currentDate).endOf('jMonth')
    const startDate = moment(startOfMonth).startOf('week')
    const endDate = moment(endOfMonth).endOf('week')
    
    const days = []
    const current = moment(startDate)
    
    while (current.isSameOrBefore(endDate)) {
      days.push(moment(current))
      current.add(1, 'day')
    }
    
    return days
  }

  const getEventsForDay = (date) => {
    const allEvents = getAllEvents()
    return allEvents.filter(event => {
      // برای رویدادهای API بکند از start_time استفاده کن، برای بقیه از startTime
      const eventDate = event.start_time ? 
        moment(event.start_time) : 
        moment(event.startTime)
      return eventDate.isSame(date, 'day')
    })
  }

  const handleEventClick = (event) => {
    if (event.type === 'task') {
      // برای وظایف، اطلاعات بیشتری نمایش دهیم
      setSelectedEvent({
        ...event,
        title: `وظیفه: ${event.title}`,
        description: `${event.description}\n\nوضعیت: ${getStatusText(event.status)}\nمسئول: ${event.assignee?.full_name || 'تعیین نشده'}`,
        isReadOnly: true
      })
    } else if (event.type === 'objective') {
      // برای اهداف
      setSelectedEvent({
        ...event,
        title: `هدف: ${event.title}`,
        description: `${event.description}\n\nتاریخ شروع: ${moment(event.startTime).format('jYYYY/jMM/jDD')}\nتاریخ پایان: ${moment(event.endTime).format('jYYYY/jMM/jDD')}`,
        isReadOnly: true
      })
    } else {
      // برای رویدادهای معمولی - تطبیق با ساختار API جدید بکند
      let assignmentInfo = ''
      if (event.assigned_users && event.assigned_users.length > 0) {
        assignmentInfo += `\n\nکاربران اختصاص داده شده:\n${event.assigned_users.map(u => u.full_name).join(', ')}`
      }
      if (event.assigned_teams && event.assigned_teams.length > 0) {
        assignmentInfo += `\n\nتیم‌های اختصاص داده شده:\n${event.assigned_teams.map(t => t.name).join(', ')}`
      }
      
      setSelectedEvent({
        ...event,
        // تبدیل فیلدهای API بکند به فرمت مورد انتظار فرانت
        startTime: event.start_time ? new Date(event.start_time) : event.startTime,
        endTime: event.end_time ? new Date(event.end_time) : event.endTime,
        description: `${event.description}${assignmentInfo}`,
        assignedUsers: event.assigned_users ? event.assigned_users.map(u => u.id) : [],
        assignedTeams: event.assigned_teams ? event.assigned_teams.map(t => t.id) : [],
        // اضافه کردن فیلد is_creator برای کنترل مجوزها
        isReadOnly: !event.is_creator
      })
    }
    setIsDialogOpen(true)
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'todo': return 'انجام نشده'
      case 'in_progress': return 'در حال انجام'
      case 'done': return 'انجام شده'
      default: return 'نامشخص'
    }
  }

  const renderEventCard = (event) => {
    const colorClasses = getColorClasses(event.color)
    
    return (
      <div
        key={event.id}
        onClick={() => handleEventClick(event)}
        className={cn(
          "cursor-pointer rounded px-2 py-1 text-xs font-medium text-white truncate mb-1",
          colorClasses.bg,
          "hover:scale-105 transition-transform flex items-center gap-1"
        )}
      >
        {event.type === 'task' && <CheckSquare className="w-3 h-3" />}
        {event.type === 'objective' && <Target className="w-3 h-3" />}
        {!event.type && <CalendarIcon className="w-3 h-3" />}
        <span className="truncate">{event.title}</span>
      </div>
    )
  }

  const days = generateCalendarDays()
  const persianWeekDays = ["شنبه", "یکشنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">در حال بارگذاری...</div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 sm:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-semibold">{currentDate.format('jMMMM jYYYY')}</h2>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigateDate('prev')} className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(moment())}>
              امروز
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigateDate('next')} className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={() => {
            setIsCreating(true)
            setIsDialogOpen(true)
          }}
          className="w-full sm:w-auto"
        >
          <Plus className="ml-2 h-4 w-4" />
          رویداد جدید
        </Button>
      </div>

      {/* Calendar Grid */}
      <Card className="overflow-hidden">
        {/* Week Days Header */}
        <div className="grid grid-cols-7 border-b">
          {persianWeekDays.map((day, index) => (
            <div key={index} className="border-l p-3 text-center text-sm font-medium last:border-l-0">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day)
            const isCurrentMonth = day.jMonth() === currentDate.jMonth()
            const isToday = day.isSame(moment(), 'day')

            return (
              <div
                key={index}
                className={cn(
                  "min-h-24 border-b border-l p-2 transition-colors last:border-l-0",
                  !isCurrentMonth && "bg-muted/30",
                  "hover:bg-accent/50"
                )}
              >
                <div
                  className={cn(
                    "mb-2 flex h-6 w-6 items-center justify-center rounded-full text-sm",
                    isToday && "bg-primary text-primary-foreground font-semibold"
                  )}
                >
                  {day.format('jD')}
                </div>
                
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => renderEventCard(event))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground">
                      +{dayEvents.length - 3} بیشتر
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </Card>

      {/* Event Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'ایجاد رویداد جدید' : 
               selectedEvent?.isReadOnly ? 'جزئیات' : 'ویرایش رویداد'}
            </DialogTitle>
            <DialogDescription>
              {isCreating ? 'رویداد جدیدی به تقویم خود اضافه کنید' : 
               selectedEvent?.isReadOnly ? 'مشاهده جزئیات' : 'مشاهده و ویرایش جزئیات رویداد'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">عنوان</Label>
              <Input
                id="title"
                value={isCreating ? newEvent.title : selectedEvent?.title || ''}
                onChange={(e) =>
                  isCreating
                    ? setNewEvent(prev => ({ ...prev, title: e.target.value }))
                    : setSelectedEvent(prev => prev ? { ...prev, title: e.target.value } : null)
                }
                placeholder="عنوان رویداد"
                disabled={selectedEvent?.isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">توضیحات</Label>
              <Textarea
                id="description"
                value={isCreating ? newEvent.description : selectedEvent?.description || ''}
                onChange={(e) =>
                  isCreating
                    ? setNewEvent(prev => ({ ...prev, description: e.target.value }))
                    : setSelectedEvent(prev => prev ? { ...prev, description: e.target.value } : null)
                }
                placeholder="توضیحات رویداد"
                rows={selectedEvent?.isReadOnly ? 6 : 3}
                disabled={selectedEvent?.isReadOnly}
              />
            </div>

            {!selectedEvent?.isReadOnly && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime">زمان شروع</Label>
                    <Input
                      id="startTime"
                      type="datetime-local"
                      value={isCreating ? newEvent.startTime : selectedEvent ? moment(selectedEvent.startTime).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={(e) => {
                        isCreating
                          ? setNewEvent(prev => ({ ...prev, startTime: e.target.value }))
                          : setSelectedEvent(prev => prev ? { ...prev, startTime: new Date(e.target.value) } : null)
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endTime">زمان پایان</Label>
                    <Input
                      id="endTime"
                      type="datetime-local"
                      value={isCreating ? newEvent.endTime : selectedEvent ? moment(selectedEvent.endTime).format('YYYY-MM-DDTHH:mm') : ''}
                      onChange={(e) => {
                        isCreating
                          ? setNewEvent(prev => ({ ...prev, endTime: e.target.value }))
                          : setSelectedEvent(prev => prev ? { ...prev, endTime: new Date(e.target.value) } : null)
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">دسته‌بندی</Label>
                    <Select
                      value={isCreating ? newEvent.category : selectedEvent?.category || ''}
                      onValueChange={(value) =>
                        isCreating
                          ? setNewEvent(prev => ({ ...prev, category: value }))
                          : setSelectedEvent(prev => prev ? { ...prev, category: value } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب دسته‌بندی" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="color">رنگ</Label>
                    <Select
                      value={isCreating ? newEvent.color : selectedEvent?.color || ''}
                      onValueChange={(value) =>
                        isCreating
                          ? setNewEvent(prev => ({ ...prev, color: value }))
                          : setSelectedEvent(prev => prev ? { ...prev, color: value } : null)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب رنگ" />
                      </SelectTrigger>
                      <SelectContent>
                        {colors.map(color => (
                          <SelectItem key={color.value} value={color.value}>
                            <div className="flex items-center gap-2">
                              <div className={cn("h-4 w-4 rounded", color.bg)} />
                              {color.name}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* اختصاص به کاربران و تیم‌ها */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="assignedUsers">اختصاص به کاربران</Label>
                    <Select
                      value=""
                      onValueChange={(userId) => {
                        if (isCreating) {
                          if (!newEvent.assignedUsers.includes(userId)) {
                            setNewEvent(prev => ({
                              ...prev,
                              assignedUsers: [...prev.assignedUsers, userId]
                            }))
                          }
                        } else if (selectedEvent) {
                          const currentIds = selectedEvent.assignedUsers || []
                          if (!currentIds.includes(userId)) {
                            setSelectedEvent(prev => prev ? {
                              ...prev,
                              assignedUsers: [...currentIds, userId]
                            } : null)
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب کاربر برای اختصاص" />
                      </SelectTrigger>
                      <SelectContent>
                        {users.map(user => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.full_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* نمایش کاربران انتخاب شده */}
                    <div className="flex flex-wrap gap-2">
                      {(isCreating ? newEvent.assignedUsers : selectedEvent?.assignedUsers || []).map(userId => {
                        const user = users.find(u => u.id === userId)
                        return user ? (
                          <div key={userId} className="flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                            {user.full_name}
                            <button
                              type="button"
                              onClick={() => {
                                if (isCreating) {
                                  setNewEvent(prev => ({
                                    ...prev,
                                    assignedUsers: prev.assignedUsers.filter(id => id !== userId)
                                  }))
                                } else if (selectedEvent) {
                                  setSelectedEvent(prev => prev ? {
                                    ...prev,
                                    assignedUsers: (prev.assignedUsers || []).filter(id => id !== userId)
                                  } : null)
                                }
                              }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="assignedTeams">اختصاص به تیم‌ها</Label>
                    <Select
                      value=""
                      onValueChange={(teamId) => {
                        if (isCreating) {
                          if (!newEvent.assignedTeams.includes(teamId)) {
                            setNewEvent(prev => ({
                              ...prev,
                              assignedTeams: [...prev.assignedTeams, teamId]
                            }))
                          }
                        } else if (selectedEvent) {
                          const currentIds = selectedEvent.assignedTeams || []
                          if (!currentIds.includes(teamId)) {
                            setSelectedEvent(prev => prev ? {
                              ...prev,
                              assignedTeams: [...currentIds, teamId]
                            } : null)
                          }
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="انتخاب تیم برای اختصاص" />
                      </SelectTrigger>
                      <SelectContent>
                        {teams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {/* نمایش تیم‌های انتخاب شده */}
                    <div className="flex flex-wrap gap-2">
                      {(isCreating ? newEvent.assignedTeams : selectedEvent?.assignedTeams || []).map(teamId => {
                        const team = teams.find(t => t.id === teamId)
                        return team ? (
                          <div key={teamId} className="flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                            {team.name}
                            <button
                              type="button"
                              onClick={() => {
                                if (isCreating) {
                                  setNewEvent(prev => ({
                                    ...prev,
                                    assignedTeams: prev.assignedTeams.filter(id => id !== teamId)
                                  }))
                                } else if (selectedEvent) {
                                  setSelectedEvent(prev => prev ? {
                                    ...prev,
                                    assignedTeams: (prev.assignedTeams || []).filter(id => id !== teamId)
                                  } : null)
                                }
                              }}
                              className="ml-1 text-green-600 hover:text-green-800"
                            >
                              ×
                            </button>
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            {!isCreating && !selectedEvent?.isReadOnly && selectedEvent?.is_creator && (
              <Button 
                variant="destructive" 
                onClick={() => selectedEvent && handleDeleteEvent(selectedEvent.id)}
              >
                حذف
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => {
                setIsDialogOpen(false)
                setIsCreating(false)
                setSelectedEvent(null)
              }}
            >
              {selectedEvent?.isReadOnly ? 'بستن' : 'لغو'}
            </Button>
            {!selectedEvent?.isReadOnly && (selectedEvent?.is_creator || isCreating) && (
              <Button onClick={isCreating ? handleCreateEvent : handleUpdateEvent}>
                {isCreating ? 'ایجاد' : 'ذخیره'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default Calendar