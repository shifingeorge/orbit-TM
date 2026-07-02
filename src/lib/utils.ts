import { UrgencyLevel } from "./types";

export function cn(...classes: (string | undefined | false | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

export function urgencyToColor(urgency: UrgencyLevel): string {
  switch (urgency) {
    case "critical": return "var(--color-urgent)";
    case "high": return "var(--color-decision)";
    case "medium": return "var(--color-primary)";
    case "low": return "var(--color-muted)";
  }
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}
