import { Link } from "react-router-dom";
import { CalendarDays, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { DropdownMenu, DropdownItem } from "@/components/ui/dropdown-menu";
import { Avatar } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Project, UserLite } from "@/types";

interface ProjectCardProps {
  project: Project;
  creator?: UserLite | null;
  canEdit: boolean;
  canDelete: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ProjectCard({
  project,
  creator,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: ProjectCardProps) {
  const showMenu = (canEdit || canDelete) && (onEdit || onDelete);

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card shadow-xs transition-all hover:-translate-y-0.5 hover:border-ring/60 hover:shadow-md">
      <Link
        to={`/workspace/${project.workspace}/projects/${project._id}`}
        className="flex flex-1 flex-col p-5"
      >
        <div className="flex items-start justify-between gap-2 pr-6">
          <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-muted text-2xl">
            {project.emoji}
          </span>
        </div>
        <h3 className="mt-4 truncate font-semibold text-foreground">
          {project.name}
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted-foreground">
          {project.description || "No description yet."}
        </p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground/80">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="h-3.5 w-3.5" />
            {formatDate(project.createdAt)}
          </span>
          {creator && (
            <span className="inline-flex items-center gap-1.5">
              <Avatar name={creator.name} src={creator.profilePicture} size="xs" />
              {creator.name.split(" ")[0]}
            </span>
          )}
        </div>
      </Link>

      {showMenu && (
        <div className="absolute top-3 right-3">
          <DropdownMenu
            trigger={({ toggle }) => (
              <button
                type="button"
                onClick={toggle}
                className="rounded-md p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-accent-foreground group-hover:opacity-100 focus:opacity-100"
                aria-label="Project actions"
              >
                <MoreHorizontal className="h-4.5 w-4.5" />
              </button>
            )}
          >
            {({ close }) => (
              <div>
                {canEdit && (
                  <DropdownItem
                    onClick={() => {
                      close();
                      onEdit?.();
                    }}
                  >
                    <Pencil className="h-4 w-4 text-muted-foreground" />
                    Edit project
                  </DropdownItem>
                )}
                {canDelete && (
                  <DropdownItem
                    danger
                    onClick={() => {
                      close();
                      onDelete?.();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete project
                  </DropdownItem>
                )}
              </div>
            )}
          </DropdownMenu>
        </div>
      )}
    </div>
  );
}
