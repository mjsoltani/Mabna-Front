import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, Target, CheckSquare, Grid3X3, List, Filter, X } from 'lucide-react'
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
  const [viewMode, setViewMode] = useState('month') // 'month' یا 'day'
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    categories: [],
    colors: [],
    types: [],
    assignees: []
  })
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
  const eventTypes = [
    { value: 'event', label: 'رویدادها', icon: CalendarIcon },
    { value: 'task', label: 'وظایف', icon: CheckSquare },
    { value: 'objective', label: 'اهداف', icon: Target }
  ]

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

  // ترکیب همه رویدادها با اعمال فیلترها
  const getAllEvents = () => {
    const taskEvents = convertTasksToEvents()
    const objectiveEvents = convertObjectivesToEvents()
    let allEvents = [...events, ...taskEvents, ...objectiveEvents]

    // اعمال فیلترها
    if (filters.types.length > 0) {
      allEvents = allEvents.filter(event => {
        if (filters.types.includes('event') && !event.type) return true
        if (filters.types.includes('task') && event.type === 'task') return true
        if (filters.types.includes('objective') && event.type === 'objective') return true
        return false
      })
    }

    if (filters.categories.length > 0) {
      allEvents = allEvents.filter(event => 
        filters.categories.includes(event.category)
      )
    }

    if (filters.colors.length > 0) {
      allEvents = allEvents.filter(event => 
        filters.colors.includes(event.color)
      )
    }

    if (filters.assignees.length > 0) {
      allEvents = allEvents.filter(event => {
        // برای وظایف
        if (event.type === 'task' && event.assignee) {
          return filters.assignees.includes(event.assignee.id)
        }
        // برای رویدادها
        if (event.assigned_users) {
          return event.assigned_users.some(user => 
            filters.assignees.includes(user.id)
          )
        }
        return filters.assignees.length === 0
      })
    }

    return allEvents
  }

  // توابع مدیریت فیلترها
  const toggleFilter = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(item => item !== value)
        : [...prev[filterType], value]
    }))
  }

  const clearAllFilters = () => {
    setFilters({
      categories: [],
      colors: [],
      types: [],
      assignees: []
    })
  }

  const getActiveFiltersCount = () => {
    return Object.values(filters).reduce((count, filterArray) => count + filterArray.length, 0)
  }

  const navigateDate = (direction) => {
    setCurrentDate(prev => {
      const newDate = moment(prev)
      if (viewMode === 'month') {
        newDate.add(direction === 'next' ? 1 : -1, 'month')
      } else {
        newDate.add(direction === 'next' ? 1 : -1, 'day')
      }
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

  // رندر Day View
  const renderDayView = () => {
    const dayEvents = getEventsForDay(currentDate)
    const hours = Array.from({ length: 24 }, (_, i) => i)
    
    // گروه‌بندی رویدادها بر اساس ساعت
    const eventsByHour = {}
    dayEvents.forEach(event => {
      const eventDate = event.start_time ? 
        moment(event.start_time) : 
        moment(event.startTime)
      const hour = eventDate.hour()
      if (!eventsByHour[hour]) {
        eventsByHour[hour] = []
      }
      eventsByHour[hour].push(event)
    })

    return (
      <Card className="overflow-hidden">
        <div className="p-4 border-b bg-muted/30">
          <h3 className="text-lg font-semibold">
            {currentDate.format('dddd، jD jMMMM jYYYY')}
          </h3>
          <p className="text-sm text-muted-foreground">
            {dayEvents.length} رویداد برای امروز
          </p>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {hours.map(hour => (
            <div key={hour} className="flex border-b">
              {/* ستون ساعت */}
              <div className="w-16 p-3 text-sm text-muted-foreground border-l bg-muted/20">
                {hour.toString().padStart(2, '0')}:00
              </div>
              
              {/* ستون رویدادها */}
              <div className="flex-1 p-3 min-h-12">
                {eventsByHour[hour] && (
                  <div className="space-y-2">
                    {eventsByHour[hour].map(event => (
                      <div
                        key={event.id}
                        onClick={() => handleEventClick(event)}
                        className={cn(
                          "cursor-pointer rounded-lg p-3 text-white transition-all hover:scale-[1.02]",
                          getColorClasses(event.color).bg
                        )}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          {event.type === 'task' && <CheckSquare className="w-4 h-4" />}
                          {event.type === 'objective' && <Target className="w-4 h-4" />}
                          {!event.type && <CalendarIcon className="w-4 h-4" />}
                          <span className="font-medium">{event.title}</span>
                        </div>
                        
                        {event.description && (
                          <p className="text-sm opacity-90 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 mt-2 text-xs opacity-80">
                          <span>
                            {moment(event.start_time || event.startTime).format('HH:mm')} - 
                            {moment(event.end_time || event.endTime).format('HH:mm')}
                          </span>
                          <span className="bg-white/20 px-2 py-1 rounded">
                            {event.category}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {dayEvents.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">
            <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>هیچ رویدادی برای این روز وجود ندارد</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setIsCreating(true)
                setIsDialogOpen(true)
                // تنظیم تاریخ پیش‌فرض برای رویداد جدید
                const defaultStart = moment(currentDate).hour(9).minute(0).format('YYYY-MM-DDTHH:mm')
                const defaultEnd = moment(currentDate).hour(10).minute(0).format('YYYY-MM-DDTHH:mm')
                setNewEvent(prev => ({
                  ...prev,
                  startTime: defaultStart,
                  endTime: defaultEnd
                }))
              }}
            >
              <Plus className="w-4 h-4 ml-2" />
              رویداد جدید
            </Button>
          </div>
        )}
      </Card>
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
          <h2 className="text-2xl font-semibold">
            {viewMode === 'month' 
              ? currentDate.format('jMMMM jYYYY')
              : currentDate.format('dddd، jD jMMMM jYYYY')
            }
          </h2>
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
        
        <div className="flex items-center gap-2">
          {/* Filter Button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="relative"
          >
            <Filter className="w-4 h-4 ml-1" />
            فیلتر
            {getActiveFiltersCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getActiveFiltersCount()}
              </span>
            )}
          </Button>

          {/* View Mode Selector */}
          <div className="flex items-center border rounded-lg p-1">
            <Button
              variant={viewMode === 'month' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('month')}
              className="h-8"
            >
              <Grid3X3 className="w-4 h-4 ml-1" />
              ماهانه
            </Button>
            <Button
              variant={viewMode === 'day' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('day')}
              className="h-8"
            >
              <List className="w-4 h-4 ml-1" />
              روزانه
            </Button>
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
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">فیلترها</h3>
            <div className="flex items-center gap-2">
              {getActiveFiltersCount() > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearAllFilters}
                >
                  <X className="w-4 h-4 ml-1" />
                  پاک کردن همه
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* فیلتر نوع رویداد */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">نوع رویداد</Label>
              <div className="space-y-2">
                {eventTypes.map(type => {
                  const Icon = type.icon
                  return (
                    <div key={type.value} className="flex items-center space-x-2 space-x-reverse">
                      <input
                        type="checkbox"
                        id={`type-${type.value}`}
                        checked={filters.types.includes(type.value)}
                        onChange={() => toggleFilter('types', type.value)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={`type-${type.value}`} className="flex items-center gap-2 text-sm cursor-pointer">
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* فیلتر دسته‌بندی */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">دسته‌بندی</Label>
              <div className="space-y-2">
                {categories.map(category => (
                  <div key={category} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`category-${category}`}
                      checked={filters.categories.includes(category)}
                      onChange={() => toggleFilter('categories', category)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`category-${category}`} className="text-sm cursor-pointer">
                      {category}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* فیلتر رنگ */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">رنگ</Label>
              <div className="space-y-2">
                {colors.map(color => (
                  <div key={color.value} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`color-${color.value}`}
                      checked={filters.colors.includes(color.value)}
                      onChange={() => toggleFilter('colors', color.value)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`color-${color.value}`} className="flex items-center gap-2 text-sm cursor-pointer">
                      <div className={cn("w-4 h-4 rounded", color.bg)} />
                      {color.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* فیلتر مسئول */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">مسئول</Label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {users.map(user => (
                  <div key={user.id} className="flex items-center space-x-2 space-x-reverse">
                    <input
                      type="checkbox"
                      id={`assignee-${user.id}`}
                      checked={filters.assignees.includes(user.id)}
                      onChange={() => toggleFilter('assignees', user.id)}
                      className="rounded border-gray-300"
                    />
                    <label htmlFor={`assignee-${user.id}`} className="text-sm cursor-pointer">
                      {user.full_name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* نمایش فیلترهای فعال */}
          {getActiveFiltersCount() > 0 && (
            <div className="mt-4 pt-4 border-t">
              <Label className="text-sm font-medium mb-2 block">فیلترهای فعال:</Label>
              <div className="flex flex-wrap gap-2">
                {filters.types.map(type => {
                  const typeObj = eventTypes.find(t => t.value === type)
                  return (
                    <span key={type} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                      {typeObj?.label}
                      <button onClick={() => toggleFilter('types', type)} className="ml-1 hover:text-blue-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
                {filters.categories.map(category => (
                  <span key={category} className="inline-flex items-center gap-1 bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                    {category}
                    <button onClick={() => toggleFilter('categories', category)} className="ml-1 hover:text-green-600">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {filters.colors.map(colorValue => {
                  const colorObj = colors.find(c => c.value === colorValue)
                  return (
                    <span key={colorValue} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">
                      <div className={cn("w-3 h-3 rounded", colorObj?.bg)} />
                      {colorObj?.name}
                      <button onClick={() => toggleFilter('colors', colorValue)} className="ml-1 hover:text-purple-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
                {filters.assignees.map(userId => {
                  const user = users.find(u => u.id === userId)
                  return (
                    <span key={userId} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                      {user?.full_name}
                      <button onClick={() => toggleFilter('assignees', userId)} className="ml-1 hover:text-orange-600">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )
                })}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Calendar Views */}
      {viewMode === 'month' ? (
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
      ) : (
        renderDayView()
      )}

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