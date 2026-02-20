import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MessageSquare,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "new_hire",
    title: "New employee onboarded",
    description: "Sarah Wilson joined the Design team",
    time: "2 minutes ago",
    icon: UserPlus,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    read: false,
  },
  {
    id: 2,
    type: "deadline",
    title: "Project deadline approaching",
    description: "Website Redesign due in 2 days",
    time: "1 hour ago",
    icon: AlertCircle,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    read: false,
  },
  {
    id: 3,
    type: "leave",
    title: "Leave request approved",
    description: "Your leave for Dec 25-26 is approved",
    time: "3 hours ago",
    icon: CheckCircle,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    read: false,
  },
  {
    id: 4,
    type: "meeting",
    title: "Meeting scheduled",
    description: "Team standup at 10:00 AM tomorrow",
    time: "5 hours ago",
    icon: Calendar,
    iconColor: "text-purple",
    iconBg: "bg-purple/10",
    read: true,
  },
  {
    id: 5,
    type: "document",
    title: "Document shared",
    description: "Michael shared Q4 Report with you",
    time: "Yesterday",
    icon: FileText,
    iconColor: "text-info",
    iconBg: "bg-info/10",
    read: true,
  },
];

export function NotificationsFeed() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">Notifications</h3>
          <p className="text-sm text-muted-foreground">Recent activity</p>
        </div>
        <Button variant="link" className="text-primary p-0 h-auto">
          Mark all as read
        </Button>
      </div>
      <div className="divide-y divide-border/50">
        {notifications.map((notification) => (
          <div 
            key={notification.id} 
            className={cn(
              "p-4 flex items-start gap-3 table-row-hover",
              !notification.read && "bg-primary/5"
            )}
          >
            <div className={cn("p-2 rounded-lg", notification.iconBg)}>
              <notification.icon className={cn("h-4 w-4", notification.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm",
                !notification.read ? "font-medium text-foreground" : "text-muted-foreground"
              )}>
                {notification.title}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{notification.description}</p>
              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
            </div>
            {!notification.read && (
              <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-2" />
            )}
          </div>
        ))}
      </div>
      <div className="p-4">
        <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5">
          View All Notifications
        </Button>
      </div>
    </div>
  );
}
