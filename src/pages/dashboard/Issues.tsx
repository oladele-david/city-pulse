import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  SearchIcon,
  FilterHorizontalIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  Tick02Icon,
  File02Icon,
  Download01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { StatusUpdateModal } from "@/components/dashboard/StatusUpdateModal";
import { toast } from "sonner";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { IssueRecord, IssueStatus } from "@/types/api";

const ITEMS_PER_PAGE = 10;

function formatIssueType(type: string) {
  return type
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getIssueSignals(issue: IssueRecord) {
  return (
    issue.confirmationsCount +
    issue.disagreementsCount +
    issue.fixedSignalsCount +
    1
  );
}

const Issues = () => {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedIssues, setSelectedIssues] = useState<string[]>([]);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const issuesQuery = useQuery({
    queryKey: ["issues"],
    queryFn: () => api.listIssues(),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      issueId,
      status,
    }: {
      issueId: string;
      status: IssueStatus;
    }) => {
      if (!session?.accessToken) {
        throw new Error("Admin session not available");
      }

      return api.updateIssueStatus(issueId, status, session.accessToken);
    },
    onSuccess: (_issue, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["issues"] });
      toast.success(`Status updated to ${variables.status.replace("_", " ")}`);
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError ? error.message : "Unable to update issue status.",
      );
    },
  });

  const issues = issuesQuery.data ?? [];

  const filteredIssues = issues.filter((issue) => {
    const normalizedQuery = searchQuery.toLowerCase();
    const matchesSearch =
      issue.id.toLowerCase().includes(normalizedQuery) ||
      issue.title.toLowerCase().includes(normalizedQuery) ||
      issue.type.toLowerCase().includes(normalizedQuery) ||
      issue.streetOrLandmark.toLowerCase().includes(normalizedQuery);
    const matchesStatus =
      statusFilter === "all" || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filteredIssues.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentIssues = filteredIssues.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIssues(currentIssues.map((issue) => issue.id));
      return;
    }

    setSelectedIssues([]);
  };

  const handleSelectIssue = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIssues((previous) => [...previous, id]);
      return;
    }

    setSelectedIssues((previous) => previous.filter((itemId) => itemId !== id));
  };

  const handleBulkUpdate = async () => {
    if (!selectedIssues.length) {
      return;
    }

    try {
      await Promise.all(
        selectedIssues.map((issueId) =>
          updateStatusMutation.mutateAsync({
            issueId,
            status: "in_progress",
          }),
        ),
      );

      setSelectedIssues([]);
      setIsBulkModalOpen(false);
      toast.success(`${selectedIssues.length} issues marked as In Progress`);
    } catch {
      // Individual mutation errors already surface via toast.
    }
  };

  const handleInlineStatusChange = (id: string, newStatus: IssueStatus) => {
    updateStatusMutation.mutate({ issueId: id, status: newStatus });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-700 bg-red-50 border-red-200";
      case "medium":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "low":
        return "text-yellow-700 bg-yellow-50 border-yellow-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-emerald-700 bg-emerald-50 border-emerald-200";
      case "in_progress":
        return "text-orange-700 bg-orange-50 border-orange-200";
      case "open":
        return "text-red-700 bg-red-50 border-red-200";
      default:
        return "text-gray-700 bg-gray-50 border-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      <StatusUpdateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onConfirm={handleBulkUpdate}
        count={selectedIssues.length}
      />

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden bg-white">
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-white">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-lg font-semibold tracking-tight text-foreground">Issues</h1>
              <p className="text-xs text-muted-foreground mr-4">
                Live issue reports from the backend
              </p>
            </div>
            {selectedIssues.length > 0 && (() => {
              const allInProgress = selectedIssues.every((id) => {
                const issue = issues.find((item) => item.id === id);
                return issue?.status === "in_progress";
              });

              return (
                <Button
                  size="sm"
                  onClick={() => setIsBulkModalOpen(true)}
                  disabled={allInProgress || updateStatusMutation.isPending}
                  className="h-8 gap-2 text-xs animate-in fade-in zoom-in duration-200 rounded-2xl"
                >
                  <HugeiconsIcon icon={Tick02Icon} className="w-3.5 h-3.5" />
                  {allInProgress
                    ? "Already In Progress"
                    : `Mark ${selectedIssues.length} In Progress`}
                </Button>
              );
            })()}
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-[240px]">
              <HugeiconsIcon
                icon={SearchIcon}
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"
              />
              <Input
                placeholder="Search"
                value={searchQuery}
                onChange={(event) => {
                  setCurrentPage(1);
                  setSearchQuery(event.target.value);
                }}
                className="pl-9 h-8 text-xs rounded-2xl bg-background border-input focus-visible:ring-0"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setCurrentPage(1);
                setStatusFilter(value);
              }}
            >
              <SelectTrigger className="w-auto min-w-[90px] h-8 text-xs rounded-2xl gap-2 px-3 border-input bg-background font-medium focus:ring-0 focus:ring-offset-0">
                <HugeiconsIcon icon={FilterHorizontalIcon} className="w-3.5 h-3.5" />
                <span>Filter</span>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs rounded-2xl gap-2 px-3 border-input bg-background font-medium focus-visible:ring-0"
                >
                  <span>Export</span>
                  <HugeiconsIcon icon={ArrowRight01Icon} className="w-3.5 h-3.5 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="gap-2 cursor-pointer" disabled>
                  <HugeiconsIcon icon={File02Icon} className="w-4 h-4" />
                  Export as CSV
                </DropdownMenuItem>
                <DropdownMenuItem className="gap-2 cursor-pointer" disabled>
                  <HugeiconsIcon icon={Download01Icon} className="w-4 h-4" />
                  Export as PDF
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fbfcff] border-b">
              <tr>
                <th className="py-3 px-4 w-[40px]">
                  <Checkbox
                    checked={
                      currentIssues.length > 0 &&
                      selectedIssues.length === currentIssues.length
                    }
                    onCheckedChange={(checked) => handleSelectAll(checked as boolean)}
                  />
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Issue Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Location</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Signals</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Severity</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Confidence</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {issuesQuery.isLoading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    Loading issues from the backend...
                  </td>
                </tr>
              )}

              {issuesQuery.isError && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-red-600">
                    {issuesQuery.error instanceof ApiError
                      ? issuesQuery.error.message
                      : "Unable to load issues right now."}
                  </td>
                </tr>
              )}

              {!issuesQuery.isLoading && !issuesQuery.isError && currentIssues.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No issues match your current filters.
                  </td>
                </tr>
              )}

              {currentIssues.map((issue) => (
                <tr
                  key={issue.id}
                  className="border-b last:border-0 hover:bg-muted/5 transition-colors group"
                >
                  <td className="py-3 px-4">
                    <Checkbox
                      checked={selectedIssues.includes(issue.id)}
                      onCheckedChange={(checked) =>
                        handleSelectIssue(issue.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        {formatIssueType(issue.type)}
                      </p>
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        #{issue.id.slice(0, 8).toUpperCase()} • {issue.title}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {issue.streetOrLandmark}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground text-center">
                    {getIssueSignals(issue)}
                  </td>
                  <td className="py-3 px-4 text-left">
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                        getSeverityColor(issue.severity),
                      )}
                    >
                      {issue.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-left">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          type="button"
                          disabled={updateStatusMutation.isPending}
                          className={cn(
                            "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize cursor-pointer hover:opacity-80 transition-opacity focus:outline-none disabled:cursor-not-allowed disabled:opacity-60",
                            getStatusColor(issue.status),
                          )}
                        >
                          {issue.status === "in_progress" ? "In Progress" : issue.status}
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start">
                        <DropdownMenuItem onClick={() => handleInlineStatusChange(issue.id, "open")}>
                          Open
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInlineStatusChange(issue.id, "in_progress")}>
                          In Progress
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleInlineStatusChange(issue.id, "resolved")}>
                          Resolved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground text-center">
                    {issue.confidenceScore}%
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {format(new Date(issue.updatedAt), "d MMMM yyyy")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
          <p className="text-xs text-muted-foreground">
            Showing {currentIssues.length} of {filteredIssues.length} issues
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-2xl"
              onClick={() => setCurrentPage((previous) => Math.max(1, previous - 1))}
              disabled={currentPage === 1}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="w-4 h-4" />
            </Button>
            <span className="text-xs font-medium text-muted-foreground px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-2xl"
              onClick={() =>
                setCurrentPage((previous) => Math.min(totalPages, previous + 1))
              }
              disabled={currentPage === totalPages}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Issues;
