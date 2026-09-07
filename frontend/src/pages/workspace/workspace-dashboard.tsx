import { Link } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle2,
  CircleDashed,
  FolderKanban,
  Timer,
  Users,
} from "lucide-react";
import { useWorkspaceContext } from "@/context/workspace-context";
import { useProjects } from "@/hooks/use-projects";
import { useTasks } from "@/hooks/use-tasks";
import { useWorkspaceAnalytics } from "@/hooks/use-workspaces";
import { CardSkeleton, Skeleton } from "@/components/ui/feedback";
import { cn } from "@/lib/utils";

export function WorkspaceDashboardPage() {
  const { workspace, workspaceId, members } = useWorkspaceContext();

  const analyticsQuery = useWorkspaceAnalytics(workspaceId);
  const projectsQuery = useProjects(workspaceId, 1, 5);
  const tasksQuery = useTasks(workspaceId);

  const analytics = analyticsQuery.data;
  const recentProjects = projectsQuery.data?.projects ?? [];
  const projectsLoading = projectsQuery.isPending;
  const allTasks = tasksQuery.data?.tasks ?? [];

  const memberCount = members.length;

  const stats = [
    {
      label: "Total tasks",
      value: analytics?.totalTasks ?? 0,
      icon: CircleDashed,
      iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-950/60 dark:text-blue-300",
      loading: analyticsQuery.isPending,
    },
    {
      label: "Completed",
      value: analytics?.completedTasks ?? 0,
      icon: CheckCircle2,
      iconClass: "bg-green-100 text-green-600 dark:bg-green-950/60 dark:text-green-300",
      loading: analyticsQuery.isPending,
    },
    {
      label: "Overdue",
      value: analytics?.overdueTasks ?? 0,
      icon: Timer,
      iconClass: "bg-red-100 text-red-600 dark:bg-red-950/60 dark:text-red-300",
      loading: analyticsQuery.isPending,
    },
    {
      label: "Members",
      value: memberCount,
      icon: Users,
      iconClass: "bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300",
      loading: false,
    },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{workspace.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {workspace.description || "Overview of your workspace."}
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon, iconClass, loading }) => (
          <div
            key={label}
            className="rounded-xl border border-border bg-card p-5 shadow-xs"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-muted-foreground">{label}</p>
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-lg",
                  iconClass
                )}
              >
                <Icon className="h-4 w-4" />
              </span>
            </div>
            {loading ? (
              <Skeleton className="mt-3 h-8 w-16" />
            ) : (
              <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent projects */}
        <div className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-base font-semibold text-foreground">
              Recent projects
            </h2>
            <Link
              to="projects"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:text-primary/80"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {projectsLoading ? (
            <div className="space-y-3">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-card/50 px-6 py-10 text-center">
              <FolderKanban className="mx-auto h-8 w-8 text-muted-foreground/50" />
              <p className="mt-2 text-sm font-medium text-foreground">
                No projects yet
              </p>
              <p className="text-xs text-muted-foreground">
                Create your first project to start tracking tasks.
              </p>
              <Link
                to="projects"
                className="mt-3 inline-block text-sm font-semibold text-primary hover:text-primary/80"
              >
                Create a project →
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {recentProjects.map((project) => {
                const projectTaskCount = allTasks.filter(
                  (t) =>
                    typeof t.project === "string"
                      ? t.project === project._id
                      : t.project._id === project._id
                ).length;
                return (
                  <li key={project._id}>
                    <Link
                      to={`projects/${project._id}`}
                      className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-ring/60"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-muted text-xl">
                        {project.emoji}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium text-foreground">
                          {project.name}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {project.description || "No description"}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-medium text-muted-foreground">
                        {projectTaskCount} task{projectTaskCount === 1 ? "" : "s"}
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Quick links */}
        <div className="space-y-3">
          <h2 className="text-base font-semibold text-foreground">Quick links</h2>
          <Link
            to="projects"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-ring/60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderKanban className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Projects
              </span>
              <span className="block text-xs text-muted-foreground">
                Manage projects in this workspace
              </span>
            </span>
          </Link>
          <Link
            to="members"
            className="flex items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-xs transition-colors hover:border-ring/60"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600 dark:bg-violet-950/60 dark:text-violet-300">
              <Users className="h-4.5 w-4.5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-foreground">
                Members
              </span>
              <span className="block text-xs text-muted-foreground">
                {memberCount} member{memberCount === 1 ? "" : "s"} · roles &
                invites
              </span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
