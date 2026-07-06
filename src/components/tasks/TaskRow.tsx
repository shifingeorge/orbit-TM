import { cn, formatRelativeTime, initials } from "@/lib/utils";
import type { Task, TaskStatus, UrgencyLevel } from "@/lib/types";

const statusDot: Record<TaskStatus, string> = {
  active: "bg-success",
  pending: "bg-warning",
  blocked: "bg-danger",
  completed: "bg-neutral",
};

const urgencyStyle: Record<UrgencyLevel, string> = {
  critical: "text-danger",
  high: "text-warning",
  medium: "text-muted",
  low: "text-muted",
};

const urgencyLabel: Record<UrgencyLevel, string> = {
  critical: "Critical",
  high: "High",
  medium: "Medium",
  low: "Low",
};

interface TaskRowProps {
  task: Task;
  onClick: (task: Task) => void;
}

export function TaskRow({ task, onClick }: TaskRowProps) {
  return (
    <button
      onClick={() => onClick(task)}
      className="w-full flex items-center gap-3 px-2 py-2.5 text-left hover:bg-surface transition-colors cursor-pointer"
    >
      <span
        className={cn("w-2 h-2 rounded-full shrink-0", statusDot[task.status])}
        title={task.status}
      />
      <span
        className={cn(
          "flex-1 truncate text-[13px]",
          task.status === "completed" && "text-muted line-through"
        )}
      >
        {task.title}
      </span>
      <span className={cn("w-16 text-xs shrink-0", urgencyStyle[task.urgencyLevel])}>
        {urgencyLabel[task.urgencyLevel]}
      </span>
      <span className="w-8 shrink-0">
        {task.assignedUser ? (
          <span
            className="inline-flex w-6 h-6 rounded-full bg-surface border border-border items-center justify-center text-[10px] text-muted"
            title={task.assignedUser.name}
          >
            {initials(task.assignedUser.name)}
          </span>
        ) : (
          <span className="text-xs text-neutral">—</span>
        )}
      </span>
      <span className="w-20 text-right text-xs text-muted shrink-0">
        {formatRelativeTime(task.updatedAt)}
      </span>
    </button>
  );
}
