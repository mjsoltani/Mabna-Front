import { Bell, HelpCircle, Settings, User, LogOut, FileText, BookOpen, MessageCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function DashboardNavbar({ 
  user, 
  notificationCount = 0,
  notifications = [],
  onNotificationClick,
  onProfileClick,
  onSettingsClick,
  onLogout 
}) {
  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">م</span>
        </div>
        <span className="font-bold text-xl">مبنا</span>
      </div>

      <div className="flex items-center gap-2">
        {/* Info Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <HelpCircle className="h-5 w-5" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>راهنما و پشتیبانی</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <BookOpen className="mr-2 h-4 w-4" />
              <span>مستندات</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>راهنمای استفاده</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MessageCircle className="mr-2 h-4 w-4" />
              <span>پشتیبانی</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="relative p-2 rounded-lg hover:bg-accent transition-colors">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {notificationCount > 9 ? '9+' : notificationCount}
                </Badge>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>اعلان‌ها</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? (
              notifications.map((notif, index) => (
                <DropdownMenuItem 
                  key={index}
                  onClick={() => onNotificationClick && onNotificationClick(notif)}
                  className="flex flex-col items-start py-3"
                >
                  <span className="font-medium">{notif.title}</span>
                  <span className="text-xs text-muted-foreground">{notif.message}</span>
                  <span className="text-xs text-muted-foreground mt-1">{notif.time}</span>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-4 text-center text-sm text-muted-foreground">
                اعلانی وجود ندارد
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 p-1 rounded-lg hover:bg-accent transition-colors">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.full_name} />
                <AvatarFallback className="bg-primary text-white">
                  {user.full_name?.charAt(0) || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col items-start">
                <span className="text-sm font-medium">{user.full_name}</span>
                <span className="text-xs text-muted-foreground">
                  {user.team?.name || user.organization?.name || ''}
                </span>
              </div>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">{user.full_name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onProfileClick}>
              <User className="mr-2 h-4 w-4" />
              <span>پروفایل</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSettingsClick}>
              <Settings className="mr-2 h-4 w-4" />
              <span>تنظیمات</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>خروج</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
