import { FilterX, Search } from "lucide-react";
import { Field, Input } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useWorkspaceContext } from "@/context/workspace-context";
import { TASK_PRIORITIES, TASK_PRIORITY_CONFIG } from "@/lib/constants";
import { memberUser } from "@/lib/utils";

export interface TaskFilters {
  keyword: string;
  priority: string;
  assignedTo: string;
}

interface TaskFilterBarProps {
  filters: TaskFilters;
  onChange: (filters: TaskFilters) => void;
}

export function TaskFilterBar({ filters, onChange }: TaskFilterBarProps) {
  const { members } = useWorkspaceContext();

  const update = (patch: Partial<TaskFilters>) =>
    onChange({ ...filters, ...patch });

  const hasFilters =
    Boolean(filters.keyword) || Boolean(filters.priority) || Boolean(filters.assignedTo);

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-[220px] flex-1">
        <Field label="Search">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={filters.keyword}
              onChange={(e) => update({ keyword: e.target.value })}
              placeholder="Search tasks…"
              className="pl-9"
            />
          </div>
        </Field>
      </div>
      <Field label="Priority">
        <Select
          value={filters.priority}
          onChange={(e) => update({ priority: e.target.value })}
          className="w-36"
        >
          <option value="">All priorities</option>
          {TASK_PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {TASK_PRIORITY_CONFIG[p].label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Assignee">
        <Select
          value={filters.assignedTo}
          onChange={(e) => update({ assignedTo: e.target.value })}
          className="w-44"
        >
          <option value="">Everyone</option>
          {members.map((m) => {
            const info = memberUser(m);
            if (!info) return null;
            return (
              <option key={info._id} value={info._id}>
                {info.name}
              </option>
            );
          })}
        </Select>
      </Field>
      {hasFilters && (
        <div className="pb-0.5">
          <Badge
            className="cursor-pointer bg-muted py-1.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            onClick={() => onChange({ keyword: "", priority: "", assignedTo: "" })}
          >
            <FilterX className="h-3 w-3" />
            Clear
          </Badge>
        </div>
      )}
    </div>
  );
}
