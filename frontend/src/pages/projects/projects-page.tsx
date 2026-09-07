import { useState } from "react";
import { ChevronLeft, ChevronRight, FolderKanban, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardSkeleton, EmptyState } from "@/components/ui/feedback";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ProjectCard } from "@/components/project/project-card";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { useWorkspaceContext } from "@/context/workspace-context";
import { useDeleteProject, useProjects } from "@/hooks/use-projects";
import { getApiErrorMessage, hasPermission } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectsPage() {
  const { workspaceId, myRole } = useWorkspaceContext();
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [deleteProject, setDeleteProject] = useState<Project | null>(null);

  const projectsQuery = useProjects(workspaceId, page, 9);
  const deleteMutation = useDeleteProject(workspaceId);

  const canCreate = hasPermission(myRole, "CREATE_PROJECT");
  const canEdit = hasPermission(myRole, "EDIT_PROJECT");
  const canDelete = hasPermission(myRole, "DELETE_PROJECT");

  const projects = projectsQuery.data?.projects ?? [];
  const pagination = projectsQuery.data?.pagination;
  const isLoading = projectsQuery.isPending;

  const handleDelete = async () => {
    if (!deleteProject) return;
    try {
      await deleteMutation.mutateAsync(deleteProject._id);
      toast.success("Project deleted");
      setDeleteProject(null);
      if (projects.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not delete the project"));
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            All projects in this workspace.
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => setCreateOpen(true)}
            leftIcon={<Plus className="h-4 w-4" />}
          >
            New project
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="h-6 w-6" />}
          title="No projects yet"
          description={
            canCreate
              ? "Create a project to start tracking tasks and milestones."
              : "Projects created in this workspace will show up here."
          }
          action={
            canCreate ? (
              <Button onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" /> Create project
              </Button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const creator =
              typeof project.createdBy === "string" ? null : project.createdBy;
            return (
              <ProjectCard
                key={project._id}
                project={project}
                creator={creator}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={() => setEditProject(project)}
                onDelete={() => setDeleteProject(project)}
              />
            );
          })}
        </div>
      )}

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-border pt-4">
          <p className="text-sm text-muted-foreground">
            Page {pagination.pageNumber} of {pagination.totalPages} ·{" "}
            {pagination.totalCount} project{pagination.totalCount === 1 ? "" : "s"}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1 || isLoading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages || isLoading}
              onClick={() => setPage((p) => p + 1)}
              leftIcon={<ChevronRight className="h-4 w-4" />}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <CreateProjectModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreateSuccess={() => {
          setPage(1);
        }}
      />
      <CreateProjectModal
        open={Boolean(editProject)}
        onClose={() => setEditProject(null)}
        project={editProject}
      />
      <ConfirmDialog
        open={Boolean(deleteProject)}
        onClose={() => setDeleteProject(null)}
        title="Delete this project?"
        description={
          deleteProject
            ? `"${deleteProject.name}" and all of its tasks will be permanently deleted.`
            : undefined
        }
        loading={deleteMutation.isPending}
        onConfirm={() => void handleDelete()}
      />
    </div>
  );
}
