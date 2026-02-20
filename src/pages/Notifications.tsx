import { useState } from "react";
import { 
  Bell, 
  UserPlus, 
  CheckCircle, 
  AlertCircle, 
  Calendar, 
  MessageSquare,
  FileText,
  Settings,
  Trash2,
  Check,
  Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

const notifications = [
  {
    id: 1,
    type: "new_hire",
    title: "New employee onboarded",
    description: "Sarah Wilson joined the Design team as a UI/UX Designer. Please welcome her to the team!",
    time: "2 minutes ago",
    date: "Today",
    icon: UserPlus,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    read: false,
  },
  {
    id: 2,
    type: "deadline",
    title: "Project deadline approaching",
    description: "Website Redesign project is due in 2 days. Make sure all tasks are completed before the deadline.",
    time: "1 hour ago",
    date: "Today",
    icon: AlertCircle,
    iconColor: "text-warning",
    iconBg: "bg-warning/10",
    read: false,
  },
  {
    id: 3,
    type: "approval",
    title: "Leave request approved",
    description: "Your leave request for December 25-26 has been approved by your manager.",
    time: "3 hours ago",
    date: "Today",
    icon: CheckCircle,
    iconColor: "text-primary",
    iconBg: "bg-primary/10",
    read: false,
  },
  {
    id: 4,
    type: "meeting",
    title: "Meeting scheduled",
    description: "Team standup meeting has been scheduled for tomorrow at 10:00 AM in Conference Room A.",
    time: "5 hours ago",
    date: "Today",
    icon: Calendar,
    iconColor: "text-purple",
    iconBg: "bg-purple/10",
    read: true,
  },
  {
    id: 5,
    type: "message",
    title: "New message from Michael Chen",
    description: "Hey, can you review the latest design mockups when you get a chance? Thanks!",
    time: "6 hours ago",
    date: "Today",
    icon: MessageSquare,
    iconColor: "text-info",
    iconBg: "bg-info/10",
    read: true,
  },
  {
    id: 6,
    type: "document",
    title: "Document shared with you",
    description: "Emily Rodriguez shared 'Q4 Financial Report.pdf' with you. Click to view the document.",
    time: "Yesterday",
    date: "Yesterday",
    icon: FileText,
    iconColor: "text-accent",
    iconBg: "bg-accent/10",
    read: true,
  },
  {
    id: 7,
    type: "system",
    title: "System maintenance scheduled",
    description: "The system will undergo maintenance on December 15th from 2:00 AM to 4:00 AM EST.",
    time: "Yesterday",
    date: "Yesterday",
    icon: Settings,
    iconColor: "text-muted-foreground",
    iconBg: "bg-muted",
    read: true,
  },
  {
    id: 8,
    type: "new_hire",
    title: "New employee onboarded",
    description: "James Anderson joined the Engineering team as a DevOps Engineer.",
    time: "2 days ago",
    date: "Dec 8",
    icon: UserPlus,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    read: true,
  },
  {
    id: 9,
    type: "approval",
    title: "Task completed",
    description: "David Kim completed the 'Database schema design' task in the Website Redesign project.",
    time: "2 days ago",
    date: "Dec 8",
    icon: CheckCircle,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    read: true,
  },
  {
    id: 10,
    type: "deadline",
    title: "Project milestone reached",
    description: "Security Audit project has reached 100% completion. Great work team!",
    time: "3 days ago",
    date: "Dec 7",
    icon: CheckCircle,
    iconColor: "text-success",
    iconBg: "bg-success/10",
    read: true,
  },
];

const typeLabels: Record<string, string> = {
  new_hire: "New Hire",
  deadline: "Deadline",
  approval: "Approval",
  meeting: "Meeting",
  message: "Message",
  document: "Document",
  system: "System",
};

const typeStyles: Record<string, string> = {
  new_hire: "status-success",
  deadline: "status-warning",
  approval: "status-info",
  meeting: "status-purple",
  message: "status-info",
  document: "bg-accent/10 text-accent",
  system: "bg-muted text-muted-foreground",
};

const Notifications = () => {
  const [notificationList, setNotificationList] = useState(notifications);
  const [filter, setFilter] = useState("all");
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  const unreadCount = notificationList.filter(n => !n.read).length;

  const filteredNotifications = notificationList.filter(n => {
    if (filter === "all") return true;
    if (filter === "unread") return !n.read;
    return n.type === filter;
  });

  const groupedNotifications = filteredNotifications.reduce((acc, notification) => {
    if (!acc[notification.date]) {
      acc[notification.date] = [];
    }
    acc[notification.date].push(notification);
    return acc;
  }, {} as Record<string, typeof notifications>);

  const handleMarkAllRead = () => {
    setNotificationList(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleToggleSelect = (id: number) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleDeleteSelected = () => {
    setNotificationList(prev => prev.filter(n => !selectedIds.includes(n.id)));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10">
            <Bell className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">All Notifications</h2>
            <p className="text-sm text-muted-foreground">
              You have {unreadCount} unread notification{unreadCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="new_hire">New Hire</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
              <SelectItem value="approval">Approval</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="message">Message</SelectItem>
            </SelectContent>
          </Select>
          {selectedIds.length > 0 ? (
            <Button variant="destructive" size="sm" onClick={handleDeleteSelected}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.length})
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-6">
        {Object.entries(groupedNotifications).map(([date, items]) => (
          <div key={date}>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">{date}</h3>
            <div className="bg-card rounded-xl border border-border/50 shadow-sm divide-y divide-border/50">
              {items.map((notification, index) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 flex items-start gap-4 table-row-hover opacity-0 animate-slide-up",
                    !notification.read && "bg-primary/5"
                  )}
                  style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'forwards' }}
                >
                  <Checkbox
                    checked={selectedIds.includes(notification.id)}
                    onCheckedChange={() => handleToggleSelect(notification.id)}
                    className="mt-1"
                  />
                  <div className={cn("p-2.5 rounded-xl flex-shrink-0", notification.iconBg)}>
                    <notification.icon className={cn("h-5 w-5", notification.iconColor)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className={cn(
                          "text-sm",
                          !notification.read ? "font-semibold text-foreground" : "font-medium text-foreground"
                        )}>
                          {notification.title}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {notification.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={cn("status-pill", typeStyles[notification.type])}>
                          {typeLabels[notification.type]}
                        </Badge>
                        {!notification.read && (
                          <span className="h-2 w-2 rounded-full bg-primary" />
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {filteredNotifications.length === 0 && (
        <div className="text-center py-12">
          <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium text-foreground">No notifications</h3>
          <p className="text-sm text-muted-foreground mt-1">
            You're all caught up!
          </p>
        </div>
      )}
    </div>
  );
};

export default Notifications;
