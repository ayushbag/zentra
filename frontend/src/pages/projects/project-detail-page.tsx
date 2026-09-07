import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, ClipboardList, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/feedback";
import { EmptyState } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import {
  TaskFilterBar,
  type TaskFilters,
} from "@/components/task/task-filter-bar";
import { TaskCard } from "@/components/task/task-card";
import { TaskModal, type TaskModalMode } from "@/components/task/task-modal";
import { useWorkspaceContext } from "@/context/workspace-context";
import { useDeleteProject, useProject } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { TASK_STATUS_CONFIG, TASK_STATUSES } from "@/lib/constants";
import { getApiErrorMessage, hasPermission } from "@/lib/utils";
import type { Task } from "@/types";

const emptyFilters: TaskFilters = { keyword: "", priority: "", assignedTo: "" };

export function ProjectDetailPage() {
  const { projectId = "" } = useParams();
  const { workspaceId, myRole } = useWorkspaceContext();
  const navigate = useNavigate();

  const projectQuery = useProject(projectId, workspaceId);
  const tasksQuery = useTasks(workspaceId, { projectId });
  const deleteProjectMutation = useDeleteProject(workspaceId);

  const [filters, setFilters] = useState<TaskFilters>(emptyFilters);
  const [taskModal, setTaskModal] = useState<TaskModalMode | null>(null);
  const [editProjectOpen, setEditProjectOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const canCreateTask = hasPermission(myRole, "CREATE_TASK");
  const canEditTask = hasPermission(myRole, "EDIT_TASK");
  const canEditProject = hasPermission(myRole, "EDIT_PROJECT");
  const canDeleteProject = hasPermission(myRole, "DELETE_PROJECT");

  const allTasks = useMemo(() => tasksQuery.data?.tasks ?? [], [tasksQuery.data]);

  const filteredTasks = useMemo(() => {
    const keyword = filters.keyword.trim().toLowerCase();
    return allTasks.filter((task) => {
      if (filters.priority && task.priority !== filters.priority) return false;
      if (filters.assignedTo) {
        const assigneeId =
          typeof task.assignedTo === "string" ? task.assignedTo : task.assignedTo?._id;
        if (assigneeId !== filters.assignedTo) return false;
      }
      if (keyword) {
        const haystack = `${task.taskCode} ${task.title} ${task.description ?? ""}`.toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }
      return true;
    });
  }, [allTasks, filters]);

  const tasksByStatus = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const status of TASK_STATUSES) map.set(status, []);
    for (const task of filteredTasks) {
      map.get(task.status)?.push(task);
    }
    return map;
  }, [filteredTasks]);

  const hasAnyFilters = Boolean(
    filters.keyword || filters.priority || filters.assignedTo
  );

  const project = projectQuery.data;

  const handleDeleteProject = async () => {
    try {
      await deleteProjectMutation.mutateAsync(projectId);
      toast.success("Project deleted");
      navigate(`/workspace/${workspaceId}/projects`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete the project"));
    }
  };

  if (projectQuery.isPending) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (projectQuery.isError || !project) {
    return (
      <div className="mx-auto max-w-xl rounded-xl border border-border bg-card p-10 text-center shadow-xs">
        <ClipboardList className="mx-auto h-8 w-8 text-muted-foreground/50" />
        <h2 className="mt-3 text-lg font-semibold text-foreground">
          Project unavailable
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {projectQuery.error
            ? getApiErrorMessage(projectQuery.error)
            : "This project does not exist."}
        </p>
        <Link to={`/workspace/${workspaceId}/projects`} className="mt-5 inline-block">
          <Button variant="outline" leftIcon={<ArrowLeft className="h-4 w-4" />}>
            Back to projects
          </Button>
        </Link>
      </div>
    );
  }

  const headerActions = (canEditProject || canDeleteProject) && (
    <div className="flex gap-2">
      {canEditProject && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditProjectOpen(true)}
          leftIcon={<Pencil className="h-4 w-4" />}
        >
          Edit
        </Button>
      )}
      {canDeleteProject && (
        <Button
          variant="outline"
          size="sm"
          className="text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setConfirmDeleteOpen(true)}
          leftIcon={<Trash2 className="h-4 w-4" />}
        >
          Delete
        </Button>
      )}
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Link
        to={`/workspace/${workspaceId}/projects`}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Projects
      </Link>

      {/* Project header */}
      <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted text-3xl">
            {project.emoji}
          </span>
          <div>
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            <p className="mt-0.5 max-w-2xl text-sm text-muted-foreground">
              {project.description || "No description."}
            </p>
          </div>
        </div>
        {headerActions}
      </div>

      {/* Filters + create task */}
      <div className="flex flex-wrap items-end justify-between gap-4 rounded-xl border border-border bg-card p-4 shadow-xs">
        <TaskFilterBar filters={filters} onChange={setFilters} />
        {canCreateTask && (
          <Button
            onClick={() =>
              setTaskModal({ type: "create", projectId: project._id })
            }
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New task
          </Button>
        )}
      </div>

      {/* Board */}
      {tasksQuery.isPending ? (
        <div className="flex gap-4 overflow-x-auto pb-2">
          {TASK_STATUSES.map((s) => (
            <div key={s} className="w-72 shrink-0 space-y-3">
              <Skeleton className="h-8 w-28" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ))}
        </div>
      ) : allTasks.length === 0 && !tasksQuery.isError ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="No tasks in this project"
          description={
            canCreateTask
              ? "Start tracking work by creating your first task."
              : "Tasks added to this project will show up on this board."
          }
          action={
            canCreateTask ? (
              <Button
                onClick={() =>
                  setTaskModal({ type: "create", projectId: project._id })
                }
              >
                <Plus className="h-4 w-4" /> Create task
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {TASK_STATUSES.map((status) => {
            const statusConfig = TASK_STATUS_CONFIG[status];
            const tasks = tasksByStatus.get(status) ?? [];
            return (
              <div
                key={status}
                className="flex max-h-[65vh] w-72 shrink-0 flex-col rounded-xl bg-muted/60 dark:bg-muted/30"
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                    <span className="text-sm font-semibold text-foreground/80">
                      {statusConfig.label}
                    </span>
                    <span className="rounded-full bg-card px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                      {tasks.length}
                    </span>
                  </div>
                  {canCreateTask && (
                    <button
                      type="button"
                      onClick={() =>
                        setTaskModal({
                          type: "create",
                          projectId: project._id,
                          defaultStatus: status,
                        })
                      }
                      className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
                      aria-label={`Add task to ${statusConfig.label}`}
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2">
                  {tasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-xs text-muted-foreground/80">
                      {hasAnyFilters ? "No matching tasks" : "Nothing here yet"}
                    </p>
                  ) : (
                    tasks.map((task) => (
                      <TaskCard
                        key={task._id}
                        task={task}
                        onClick={() => {
                          if (!canEditTask) return;
                          setTaskModal({ type: "edit", task });
                        }}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateProjectModal
        open={editProjectOpen}
        onClose={() => setEditProjectOpen(false)}
        project={project}
      />
      <TaskModal
        open={Boolean(taskModal)}
        onClose={() => setTaskModal(null)}
        mode={taskModal}
      />
      <ConfirmDialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title="Delete this project?"
        description={`"${project.name}" and all of its tasks will be permanently deleted.`}
        loading={deleteProjectMutation.isPending}
        onConfirm={() => void handleDeleteProject()}
      />
    </div>
  );
}
