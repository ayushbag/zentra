import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { Select } from "@/components/ui/select";
import { useWorkspaceContext } from "@/context/workspace-context";
import { useCreateTask, useUpdateTask } from "@/hooks/use-tasks";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_CONFIG,
  TASK_STATUSES,
  TASK_STATUS_CONFIG,
} from "@/lib/constants";
import { getApiErrorMessage, memberUser } from "@/lib/utils";
import type { Task, TaskPriority, TaskStatus } from "@/types";

const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(255),
  description: z.string().trim().max(5000).optional().or(z.literal("")),
  status: z.enum(["BACKLOG", "TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
});

type TaskFormValues = z.infer<typeof taskSchema>;

export type TaskModalMode =
  | { type: "create"; projectId: string; defaultStatus?: TaskStatus }
  | { type: "edit"; task: Task };

interface TaskModalProps {
  open: boolean;
  onClose: () => void;
  mode: TaskModalMode | null;
}

export function TaskModal({ open, onClose, mode }: TaskModalProps) {
  const isEdit = mode?.type === "edit";
  const task = mode?.type === "edit" ? mode.task : null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit ${task?.taskCode ?? "task"}` : "Create task"}
      description={isEdit ? "Update the details of this task." : "Add a task to this project."}
      size="lg"
    >
      {mode && (
        <TaskForm
          key={
            mode.type === "edit"
              ? `edit-${mode.task._id}`
              : `create-${mode.defaultStatus ?? "TODO"}`
          }
          mode={mode}
          onClose={onClose}
        />
      )}
    </Modal>
  );
}

function TaskForm({
  mode,
  onClose,
}: {
  mode: TaskModalMode;
  onClose: () => void;
}) {
  const { workspaceId, members } = useWorkspaceContext();

  const isEdit = mode.type === "edit";
  const task = isEdit ? mode.task : null;
  const projectId = isEdit
    ? (() => {
        const p = task!.project;
        return typeof p === "string" ? p : p._id;
      })()
    : mode.projectId;

  const createMutation = useCreateTask(workspaceId);
  const updateMutation = useUpdateTask(workspaceId);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: isEdit
      ? {
          title: task!.title,
          description: task!.description ?? "",
          status: task!.status,
          priority: task!.priority,
          assignedTo:
            typeof task!.assignedTo === "string"
              ? task!.assignedTo
              : (task!.assignedTo?._id ?? ""),
          dueDate: task!.dueDate ? task!.dueDate.slice(0, 10) : "",
        }
      : {
          title: "",
          description: "",
          status: mode.defaultStatus ?? "TODO",
          priority: "MEDIUM",
          assignedTo: "",
          dueDate: "",
        },
  });

  const busy = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: TaskFormValues) => {
    const payload = {
      title: values.title,
      description: values.description?.trim() || undefined,
      status: values.status as TaskStatus,
      priority: values.priority as TaskPriority,
      assignedTo: values.assignedTo?.trim() ? values.assignedTo.trim() : null,
      dueDate: values.dueDate ? new Date(values.dueDate).toISOString() : null,
    };

    try {
      if (isEdit && task) {
        await updateMutation.mutateAsync({ taskId: task._id, projectId, payload });
        toast.success("Task updated");
      } else {
        await createMutation.mutateAsync({ projectId, payload });
        toast.success("Task created");
      }
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the task"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Title" htmlFor="task-title" required error={errors.title?.message}>
        <Input
          id="task-title"
          placeholder="e.g. Implement login page"
          {...register("title")}
          error={Boolean(errors.title)}
        />
      </Field>

      <Field label="Description" htmlFor="task-desc" error={errors.description?.message}>
        <Textarea
          id="task-desc"
          placeholder="Add more context, acceptance criteria…"
          {...register("description")}
          className="min-h-[90px]"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Status" htmlFor="task-status">
          <Select id="task-status" {...register("status")}>
            {TASK_STATUSES.map((s) => (
              <option key={s} value={s}>
                {TASK_STATUS_CONFIG[s].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Priority" htmlFor="task-priority">
          <Select id="task-priority" {...register("priority")}>
            {TASK_PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_CONFIG[p].label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Assignee" htmlFor="task-assignee">
          <Select id="task-assignee" {...register("assignedTo")}>
            <option value="">Unassigned</option>
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
        <Field label="Due date" htmlFor="task-due">
          <Input id="task-due" type="date" {...register("dueDate")} />
        </Field>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {isEdit ? "Save changes" : "Create task"}
        </Button>
      </div>
    </form>
  );
}
