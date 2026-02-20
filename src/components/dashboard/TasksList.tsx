import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { MoreHorizontal, Calendar, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const tasks = [
  {
    id: 1,
    title: "Review project documentation",
    project: "Website Redesign",
    dueDate: "Today",
    priority: "high",
    status: "ongoing",
    completed: false,
  },
  {
    id: 2,
    title: "Update employee handbook",
    project: "HR Operations",
    dueDate: "Tomorrow",
    priority: "medium",
    status: "ongoing",
    completed: false,
  },
  {
    id: 3,
    title: "Finalize Q4 budget report",
    project: "Finance",
    dueDate: "Dec 15",
    priority: "high",
    status: "completed",
    completed: true,
  },
  {
    id: 4,
    title: "Conduct team performance review",
    project: "HR Operations",
    dueDate: "Dec 20",
    priority: "medium",
    status: "ongoing",
    completed: false,
  },
  {
    id: 5,
    title: "Prepare client presentation",
    project: "Website Redesign",
    dueDate: "Overdue",
    priority: "high",
    status: "overdue",
    completed: false,
  },
];

const priorityColors = {
  high: "bg-destructive/10 text-destructive",
  medium: "bg-warning/10 text-warning",
  low: "bg-success/10 text-success",
};

const statusColors = {
  ongoing: "status-info",
  completed: "status-success",
  overdue: "status-destructive",
};

export function TasksList() {
  return (
    <div className="bg-card rounded-xl border border-border/50 shadow-sm">
      <div className="p-5 border-b border-border/50 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-foreground">My Tasks</h3>
          <p className="text-sm text-muted-foreground">Your upcoming tasks</p>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>
      <div className="divide-y divide-border/50">
        {tasks.map((task) => (
          <div key={task.id} className="p-4 flex items-start gap-3 table-row-hover">
            <Checkbox 
              checked={task.completed} 
              className="mt-1"
            />
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm font-medium",
                task.completed ? "text-muted-foreground line-through" : "text-foreground"
              )}>
                {task.title}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{task.project}</p>
              <div className="flex items-center gap-3 mt-2">
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  <span className={task.status === 'overdue' ? 'text-destructive' : ''}>{task.dueDate}</span>
                </div>
                <Badge className={cn("status-pill", priorityColors[task.priority as keyof typeof priorityColors])}>
                  {task.priority}
                </Badge>
              </div>
            </div>
            <Badge className={cn("status-pill", statusColors[task.status as keyof typeof statusColors])}>
              {task.status}
            </Badge>
          </div>
        ))}
      </div>
      <div className="p-4">
        <Button variant="ghost" className="w-full text-primary hover:text-primary hover:bg-primary/5">
          View All Tasks
        </Button>
      </div>
    </div>
  );
}
