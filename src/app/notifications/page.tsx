'use client'

import { toast } from "react-hot-toast";
import { useEffect, useState, useTransition, Fragment } from "react";
import NotificationAction, { NotificationUpdateAction } from "@/actions/notification";
import { Calendar, User, UserPlus, UserX, RotateCcw, X, Clock, CheckCircle, Circle, Bell, Filter, MoreVertical } from 'lucide-react'
import { Tab } from '@headlessui/react'
import { useNotificationStore } from "@/store/useNotificationStore";
import { format, parseISO, isValid } from "date-fns";


type Notification = {
  id: string;
  title: 
    | 'new_booking' 
    | 'new_regular_booking'
    | 'new_onetime_booking'
    | 'full_cancellation'
    | 'single_cancellation'
    | 'reschedule'
    | 'new_customer'
    | 'update_customer'
    | 'renew'
    | string;      // fallback for unknowns
  metadata: Record<string, any>;
  createdAt: string;
  read?: boolean;
};

type CurrentViewComponentProps = {
  notifications: Notification[];
  markAsRead: (id: string) => void;
};

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'new_booking': return <Calendar className="h-4 w-4" />
    case 'single_cancellation': return <X className="h-4 w-4" />
    case 'full_cancellation': return <X className="h-4 w-4" />
    case 'reschedule': return <RotateCcw className="h-4 w-4" />
    case 'new_customer': return <UserPlus className="h-4 w-4" />
    case 'update_customer': return <User className="h-4 w-4" />
    case 'renew': return <CheckCircle className="h-4 w-4" />
    default: return <Bell className="h-4 w-4" />
  }
}

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'new_booking': return 'bg-green-500'
    case 'full_cancellation': return 'bg-red-500'
    case 'single_cancellation': return 'bg-red-500'
    case 'reschedule': return 'bg-yellow-500'
    case 'new_customer': return 'bg-blue-500'
    case 'update_customer': return 'bg-purple-500'
    case 'renew': return 'bg-emerald-500'
    default: return 'bg-gray-500'
  }
}

// Custom Badge Component
function Badge({ children, variant = 'default', className = '' }: { 
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
  className?: string 
}) {
  const baseClasses = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium'
  const variantClasses = {
    default: 'bg-blue-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    outline: 'border border-gray-300 text-gray-700',
    destructive: 'bg-red-100 text-red-800'
  }
  
  return (
    <span className={`${baseClasses} ${variantClasses[variant]} ${className}`}>
      {children}
    </span>
  )
}

// Custom Button Component
function Button({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  className = ''
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'default' | 'sm'
  disabled?: boolean
  className?: string
}) {
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none'
  
  const variantClasses = {
    default: 'bg-blue-600 text-white hover:bg-blue-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-700 hover:bg-gray-100'
  }
  
  const sizeClasses = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  )
}

function DateFormat(date: string) {
  const dt = parseISO(date);
  return isValid(dt) ? format(dt, "MMM d, yyyy h:mm a") : "—";
}


// UI Design 1: Timeline View
function TimelineView({ notifications, markAsRead }: CurrentViewComponentProps) {
  const sortedNotifications = [...notifications].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Activity Timeline</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        <div className="space-y-6">
          {sortedNotifications.map((notification, index) => (
            <div key={notification.id} className="relative flex items-start gap-4">
              <div className={`relative z-10 p-2 rounded-full ${getNotificationColor(notification.title)} text-white`}>
                {getNotificationIcon(notification.title)}
              </div>
              
              <div className={`flex-1 bg-white rounded-lg border shadow-sm ${!notification.read ? 'ring-2 ring-blue-200' : 'border-gray-200'}`}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        {notification.title}
                        {!notification.read && <Badge variant="secondary">New</Badge>}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleString()}
                      </span>
                      {!notification.read && (
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => markAsRead(notification.id)}
                        >
                          Mark read
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="px-4 pb-4">
                  <div className="space-y-2">
                    {Object.entries(notification.metadata).map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        <Badge variant="outline">
                          {key.replace('_', ' ')}
                        </Badge>
                        <span className="text-gray-900">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// UI Design 2: Tabbed Interface
function TabbedView({ notifications, markAsRead }: CurrentViewComponentProps) {
  
  const categories = [...new Set(notifications.map(n => n.title))]
  const unreadCount = notifications.filter(n => !n.read).length

  const getNotificationsByType = (type: string) => 
    notifications.filter(n => n.title === type)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Notifications Center</h1>
        <Badge variant="destructive">{unreadCount} unread</Badge>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {categories.map(category => {
            const categoryNotifications = getNotificationsByType(category)
            const unreadInCategory = categoryNotifications.filter(n => !n.read).length
            
            return (
              <Tab key={category} as={Fragment}>
                {({ selected }) => (
                  <button
                    className={`w-full rounded-lg py-2.5 px-3 text-sm font-medium leading-5 relative transition-all ${
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                    }`}
                  >
                    <span className="capitalize">{category.replace('_', ' ')}</span>
                    {unreadInCategory > 0 && (
                      <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadInCategory}
                      </span>
                    )}
                  </button>
                )}
              </Tab>
            )
          })}
        </Tab.List>

        <Tab.Panels className="mt-6">
          {categories.map(category => (
            <Tab.Panel key={category} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 capitalize flex items-center gap-2">
                  {getNotificationIcon(category)}
                  {category.replace('_', ' ')} Notifications
                </h2>
              </div>

              <div className="h-[600px] overflow-y-auto space-y-3">
                {getNotificationsByType(category).map(notification => (
                  <div 
                    key={notification.id} 
                    className={`bg-white rounded-lg border shadow-sm ${!notification.read ? 'bg-blue-50/50 border-blue-200' : 'border-gray-200'}`}
                  >
                    <div className="p-4 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          {!notification.read ? (
                            <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
                          ) : (
                            <CheckCircle className="h-3 w-3 text-gray-400" />
                          )}
                          <div>
                            <h3 className="text-base font-semibold text-gray-900">{notification.title}</h3>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">
                            {DateFormat(notification.createdAt)}
                          </span>
                          {!notification.read && (
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => markAsRead(notification.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="px-4 pb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {Object.entries(notification.metadata).map(([key, value]) => (
                          <div key={key} className="p-2 bg-gray-50 rounded">
                            <div className="font-medium text-xs text-gray-500 uppercase tracking-wide">
                              {key.replace('_', ' ')}
                            </div>
                            <div className="font-medium text-gray-900">{value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

// UI Design 3: Compact List View
function CompactListView({ notifications, markAsRead }: CurrentViewComponentProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const toggleExpanded = (id: string) => {
    setExpandedId(expandedId === id ? null : id)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">All Notifications</h1>
        <div className="flex gap-2">
          <Badge variant="outline">
            {notifications.length} total
          </Badge>
          <Badge variant="destructive">
            {notifications.filter(n => !n.read).length} unread
          </Badge>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        {notifications.map((notification, index) => (
          <div key={notification.id}>
            <div 
              className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50 border-l-4 border-l-blue-500' : ''}`}
              onClick={() => toggleExpanded(notification.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full ${getNotificationColor(notification.title)} text-white`}>
                    {getNotificationIcon(notification.title)}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">{notification.title}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {notification.title.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {DateFormat(notification.createdAt)}
                  </span>
                  {!notification.read && (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      // onClick={(e: any) => {
                      //   e.stopPropagation()
                      //   markAsRead(notification.id)
                      // }}
                    >
                      <Circle className="h-3 w-3 fill-blue-500 text-blue-500" />
                    </Button>
                  )}
                </div>
              </div>

              {expandedId === notification.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {Object.entries(notification.metadata).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <div className="text-gray-500 capitalize">
                          {key.replace('_', ' ')}
                        </div>
                        <div className="font-medium text-gray-900">{value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {index < notifications.length - 1 && <div className="border-b border-gray-200" />}
          </div>
        ))}
      </div>
    </div>
  )
}

// Main component with view switcher
export default function NotificationsPage() {
  const [currentView, setCurrentView] = useState('grouped')
  // const [notifications, setNotifications] = useState<Notification[]>([])
    const {
    notifications,
    setNotifications,
    fetchNextPage,
    hasMore,
    markAllAsRead,
  } = useNotificationStore();
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const fetchInitial = async () => {
      try {
        const res = await NotificationAction()
        if (!cancelled) setNotifications(res.data)
      } catch (e) {
        toast.error("Failed to load Notifications")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchInitial()
    return () => { cancelled = true }
  }, [setNotifications])

  const markAsRead = (id: string | number) => {
    const next = notifications.map(n => (n.id === id ? {...n, read: true} : n))
    setNotifications(next)
  }

  async function handleMarkRead(id: string) {
    try { 
      const res = await NotificationUpdateAction({id})
    }
    finally { markAsRead(id); } // keep UI snappy even if API is slow
  }

  async function handleMarkAll() {
    try { 
      const res = await NotificationUpdateAction({all: true})
    }
    finally { markAllAsRead(); }
  }

  const views = [
    { id: 'timeline', name: 'Timeline', component: TimelineView },
    { id: 'tabbed', name: 'Tabbed', component: TabbedView },
    { id: 'compact', name: 'Compact List', component: CompactListView }
  ]

  // const CurrentViewComponent = views.find(v => v.id === currentView)?.component || GroupedCardsView
  const CurrentViewComponent: React.FC<{
    notifications: Notification[];
    markAsRead: (id: string) => void;
  }> = views.find(v => v.id === currentView)?.component || TimelineView;

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-4xl font-bold text-gray-900">Notifications</h1>
          <div className="flex gap-2">
            {views.map(view => (
              <Button
                key={view.id}
                variant={currentView === view.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setCurrentView(view.id)}
              >
                {view.name}
              </Button>
            ))}
          </div>
        </div>

        { loading ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading...</p>
            </div>
          </div>
          ) : (
            <CurrentViewComponent notifications={notifications} markAsRead={handleMarkRead} />
          )}
      </div>
    </div>
  )
}
