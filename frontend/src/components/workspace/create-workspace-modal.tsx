import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useCreateWorkspace, useUpdateWorkspace } from "@/hooks/use-workspaces";
import { getApiErrorMessage } from "@/lib/utils";
import type { Workspace } from "@/types";

const workspaceSchema = z.object({
  name: z.string().trim().min(1, "Workspace name is required").max(255),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
});

type WorkspaceFormValues = z.infer<typeof workspaceSchema>;

export function CreateWorkspaceModal({
  open,
  onClose,
  workspace,
}: {
  open: boolean;
  onClose: () => void;
  /** When provided, the modal edits an existing workspace instead of creating. */
  workspace?: Workspace | null;
}) {
  const isEdit = Boolean(workspace);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit workspace" : "Create a new workspace"}
      description={
        isEdit
          ? "Update the workspace name and description."
          : "Workspaces keep your projects and tasks organized per team."
      }
    >
      <WorkspaceForm
        key={workspace?._id ?? "new-workspace"}
        workspace={workspace ?? null}
        isEdit={isEdit}
        onClose={onClose}
      />
    </Modal>
  );
}

function WorkspaceForm({
  workspace,
  isEdit,
  onClose,
}: {
  workspace: Workspace | null;
  isEdit: boolean;
  onClose: () => void;
}) {
  const createMutation = useCreateWorkspace();
  const updateMutation = useUpdateWorkspace(workspace?._id);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<WorkspaceFormValues>({
    resolver: zodResolver(workspaceSchema),
    defaultValues: {
      name: workspace?.name ?? "",
      description: workspace?.description ?? "",
    },
  });

  const busy = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: WorkspaceFormValues) => {
    const payload = {
      name: values.name,
      description: values.description?.trim() || undefined,
    };

    try {
      if (isEdit && workspace) {
        await updateMutation.mutateAsync(payload);
        toast.success("Workspace updated");
        onClose();
        return;
      }
      const created = await createMutation.mutateAsync(payload);
      toast.success("Workspace created");
      onClose();
      window.location.assign(`/workspace/${created._id}/projects`);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Failed to save workspace"));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field label="Workspace name" htmlFor="ws-name" required error={errors.name?.message}>
        <Input
          id="ws-name"
          placeholder="e.g. Product Engineering"
          {...register("name")}
          error={Boolean(errors.name)}
        />
      </Field>
      <Field
        label="Description"
        htmlFor="ws-desc"
        hint="Optional — what is this workspace for?"
        error={errors.description?.message}
      >
        <Textarea
          id="ws-desc"
          placeholder="A short description of the workspace…"
          {...register("description")}
        />
      </Field>
      <div className="flex justify-end gap-2 pt-2">
        <Button variant="outline" onClick={onClose} disabled={busy}>
          Cancel
        </Button>
        <Button type="submit" loading={busy}>
          {isEdit ? "Save changes" : "Create workspace"}
        </Button>
      </div>
    </form>
  );
}
