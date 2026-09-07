import { CalendarDays, User } from "lucide-react";
import { Badge, Avatar } from "@/components/ui/badge";
import {
  TASK_PRIORITY_CONFIG,
  TASK_STATUS_CONFIG,
} from "@/lib/constants";
import { cn, formatDate, isOverdue } from "@/lib/utils";
import type { Task } from "@/types";

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const priority = TASK_PRIORITY_CONFIG[task.priority];
  const status = TASK_STATUS_CONFIG[task.status];
  const overdue = isOverdue(task);

  const assignee =
    typeof task.assignedTo === "string" ? null : task.assignedTo;
  const projectName =
    typeof task.project === "string" ? null : task.project;

  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full rounded-lg border border-border bg-card p-3 text-left shadow-xs transition-colors hover:border-ring/60 hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="truncate text-[11px] font-medium tracking-wide text-muted-foreground/80">
          {task.taskCode}
        </span>
        {priority && (
          <Badge className={priority.badge}>{priority.label}</Badge>
        )}
      </div>

      <p className="mt-1.5 line-clamp-2 text-sm font-medium text-foreground">
        {task.title}
      </p>

      {task.description && (
        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
          {task.description}
        </p>
      )}

      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground/80">
          {projectName && (
            <span className="inline-flex max-w-[90px] items-center gap-0.5 truncate">
              {projectName.emoji} {projectName.name}
            </span>
          )}
          {task.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1",
                overdue && "font-medium text-destructive"
              )}
              title={overdue ? "Overdue" : "Due date"}
            >
              <CalendarDays className="h-3 w-3" />
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {task.status === "DONE" && (
            <Badge className={status.badge}>{status.label}</Badge>
          )}
          {assignee ? (
            <Avatar
              name={assignee.name}
              src={assignee.profilePicture}
              size="xs"
              title={assignee.name}
            />
          ) : (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <User className="h-3 w-3" />
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
