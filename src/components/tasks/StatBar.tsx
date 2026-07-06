import type { SystemStat } from "@/lib/types";

export function StatBar({ stats }: { stats: SystemStat[] }) {
  return (
    <div className="flex gap-8 py-4 border-b border-border">
      {stats.map((stat) => (
        <div key={stat.label}>
          <p className="text-lg font-semibold leading-tight">{stat.value}</p>
          <p className="text-xs text-muted">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}
