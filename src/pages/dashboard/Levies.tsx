import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  SearchIcon,
  FilterHorizontalIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LevyForm } from "@/components/levies/LevyForm";
import { LevyTable } from "@/components/levies/LevyTable";
import { LevyDrawer } from "@/components/levies/LevyDrawer";
import { ITEMS_PER_PAGE } from "@/components/levies/levy-utils";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { CreateLevyPayload, LevyRecord } from "@/types/api";

const Levies = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<LevyRecord["status"] | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedLevy, setSelectedLevy] = useState<LevyRecord | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const leviesQuery = useQuery({
    queryKey: ["admin-levies", statusFilter],
    queryFn: () =>
      api.listAdminLevies(
        session!.accessToken,
        statusFilter === "all" ? undefined : statusFilter,
      ),
    enabled: Boolean(session?.accessToken),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateLevyPayload) => api.createLevy(payload, session!.accessToken),
    onSuccess: async () => {
      toast.success("Levy created.");
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-levies"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not create levy.");
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ levyId, action }: { levyId: string; action: "publish" | "unpublish" | "close" }) => {
      if (action === "publish") return api.publishLevy(levyId, session!.accessToken);
      if (action === "unpublish") return api.unpublishLevy(levyId, session!.accessToken);
      return api.closeLevy(levyId, session!.accessToken);
    },
    onSuccess: async (_, variables) => {
      const labels = { publish: "published", unpublish: "unpublished", close: "closed" } as const;
      toast.success(`Levy ${labels[variables.action]}.`);
      await queryClient.invalidateQueries({ queryKey: ["admin-levies"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-levy", variables.levyId] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not update levy state.");
    },
  });

  const levies = leviesQuery.data ?? [];

  const filteredLevies = levies.filter((levy) => {
    const q = searchQuery.toLowerCase();
    return (
      levy.title.toLowerCase().includes(q) ||
      levy.description.toLowerCase().includes(q) ||
      levy.id.toLowerCase().includes(q)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filteredLevies.length / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLevies = filteredLevies.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  return (
    <div className="space-y-6">
      {/* Create Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
          <DialogHeader className="px-6 pt-6 pb-4 border-b">
            <DialogTitle>Create Levy</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5">
            <LevyForm
              submitLabel="Create levy"
              onCancel={() => setIsCreateOpen(false)}
              onSubmit={(payload) => createMutation.mutateAsync(payload)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <div className="rounded-2xl border bg-card shadow-sm overflow-hidden bg-white">
        {/* Toolbar */}
        <div className="px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b bg-white">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Levies</h1>
            <p className="text-xs text-muted-foreground">
              Create, publish, and track civic levies
            </p>
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
                onChange={(e) => {
                  setCurrentPage(1);
                  setSearchQuery(e.target.value);
                }}
                className="pl-9 h-8 text-xs rounded-2xl bg-background border-input focus-visible:ring-0"
              />
            </div>

            <Select
              value={statusFilter}
              onValueChange={(value) => {
                setCurrentPage(1);
                setStatusFilter(value as typeof statusFilter);
              }}
            >
              <SelectTrigger className="w-auto min-w-[90px] h-8 text-xs rounded-2xl gap-2 px-3 border-input bg-background font-medium focus:ring-0 focus:ring-offset-0">
                <HugeiconsIcon icon={FilterHorizontalIcon} className="w-3.5 h-3.5" />
                <span>Filter</span>
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Button size="sm" className="h-8 text-xs rounded-2xl gap-2 px-3" onClick={() => setIsCreateOpen(true)}>
              Create Levy
            </Button>
          </div>
        </div>

        {/* Table */}
        <LevyTable
          levies={currentLevies}
          isLoading={leviesQuery.isLoading}
          isError={leviesQuery.isError}
          error={leviesQuery.error}
          onRowClick={(levy) => {
            setSelectedLevy(levy);
            setIsDrawerOpen(true);
          }}
          onAction={(levyId, action) => actionMutation.mutate({ levyId, action })}
          actionPending={actionMutation.isPending}
        />

        {/* Pagination */}
        <div className="px-4 py-3 border-t flex items-center justify-between bg-white">
          <p className="text-xs text-muted-foreground">
            Showing {currentLevies.length} of {filteredLevies.length} levies
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 rounded-2xl"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      <LevyDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        levy={selectedLevy}
      />
    </div>
  );
};

export default Levies;
