import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useCreateProject, useUpdateProject } from "@/hooks/use-projects";
import { useWorkspaceContext } from "@/context/workspace-context";
import { PROJECT_EMOJIS } from "@/lib/constants";
import { cn, getApiErrorMessage } from "@/lib/utils";
import type { Project } from "@/types";

const projectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(255),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

export function CreateProjectModal({
  open,
  onClose,
  project,
  onCreateSuccess,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits an existing project. */
  project?: Project | null;
  onCreateSuccess?: () => void;
}) {
  const isEdit = Boolean(project);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit project" : "Create a new project"}
      description="Projects group related tasks inside the workspace."
    >
      <ProjectForm
        key={project?._id ?? "new-project"}
        project={project ?? null}
        isEdit={isEdit}
        onClose={onClose}
        onCreateSuccess={onCreateSuccess}
      />
    </Modal>
  );
}

function ProjectForm({
  project,
  isEdit,
  onClose,
  onCreateSuccess,
}: {
  project: Project | null;
  isEdit: boolean;
  onClose: () => void;
  onCreateSuccess?: () => void;
}) {
  const { workspaceId } = useWorkspaceContext();
  const createMutation = useCreateProject(workspaceId);
  const updateMutation = useUpdateProject(workspaceId);
  const [emoji, setEmoji] = useState(project?.emoji ?? "📊");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: project?.name ?? "",
      description: project?.description ?? "",
    },
  });

  const busy = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: ProjectFormValues) => {
    const payload = {
      name: values.name,
      description: values.description?.trim() || undefined,
      emoji,
    };
    try {
      if (isEdit && project) {
        await updateMutation.mutateAsync({ projectId: project._id, payload });
        toast.success("Project updated");
      } else {
        await createMutation.mutateAsync(payload);
        toast.success("Project created");
        onCreateSuccess?.();
      }
      onClose();
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Could not save the project"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Icon" hint="Pick an emoji for the project.">
        <div className="flex flex-wrap gap-1.5">
          {PROJECT_EMOJIS.map((e) => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-lg border text-lg transition-colors",
                emoji === e
                  ? "border-ring bg-accent ring-2 ring-ring/30"
                  : "border-border hover:bg-accent"
              )}
              aria-label={`Use ${e} icon`}
            >
              {e}
            </button>
          ))}
        </div>
      </Field>

      <Field
        label="Project name"
        htmlFor="project-name"
        required
        error={errors.name?.message}
      >
        <Input
          id="project-name"
          placeholder="e.g. Mobile App Redesign"
          {...register("name")}
          error={Boolean(errors.name)}
        />
      </Field>
      <Field label="Description" htmlFor="project-desc" error={errors.description?.message}>
        <Textarea
          id="project-desc"
          placeholder="What is this project about?"
          {...register("description")}
        />
      </Field>

      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {isEdit ? "Save changes" : "Create project"}
        </Button>
      </div>
    </form>
  );
}
