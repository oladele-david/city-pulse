import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  SearchIcon,
  FilterHorizontalIcon,
  ArrowLeft01Icon,
  ArrowRight01Icon,
  MoreVerticalIcon,
  Cancel01Icon,
  ViewIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LevyForm } from "@/components/levies/LevyForm";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { CreateLevyPayload, LevyRecord, PaymentRecord } from "@/types/api";

const ITEMS_PER_PAGE = 10;

function formatLevyType(type: string) {
  return type
    .split("_")
    .join(" ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "published":
      return "text-emerald-700 bg-emerald-50 border-emerald-200";
    case "draft":
      return "text-orange-700 bg-orange-50 border-orange-200";
    case "closed":
      return "text-gray-700 bg-gray-50 border-gray-200";
    default:
      return "text-gray-700 bg-gray-50 border-gray-200";
  }
};

const getTargetName = (levy: LevyRecord) => {
  if (levy.targetType === "community") {
    return levy.targetCommunity?.name ?? levy.targetCommunityId ?? "—";
  }
  return levy.targetLga?.name ?? levy.targetLgaId ?? "—";
};

/* ─── Levy Detail Drawer ─── */

interface LevyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  levy: LevyRecord | null;
}

const LevyDrawer = ({ isOpen, onClose, levy }: LevyDrawerProps) => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [paymentStatus, setPaymentStatus] = useState<PaymentRecord["status"] | "all">("all");

  const dashboardQuery = useQuery({
    queryKey: ["admin-levy-dashboard", levy?.id],
    queryFn: () => api.getLevyDashboard(levy!.id, session!.accessToken),
    enabled: Boolean(session?.accessToken && levy?.id),
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin-levy-payments", levy?.id, paymentStatus],
    queryFn: () =>
      api.getLevyPayments(
        levy!.id,
        session!.accessToken,
        paymentStatus === "all" ? undefined : paymentStatus,
      ),
    enabled: Boolean(session?.accessToken && levy?.id),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateLevyPayload>) =>
      api.updateLevy(levy!.id, payload, session!.accessToken),
    onSuccess: async () => {
      toast.success("Levy updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-levy", levy!.id] });
      await queryClient.invalidateQueries({ queryKey: ["admin-levies"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not update levy.");
    },
  });

  const cards = useMemo(
    () => [
      { title: "Collected", value: `₦${(dashboardQuery.data?.totalCollectedAmount ?? 0).toLocaleString()}` },
      { title: "Successful", value: String(dashboardQuery.data?.successfulPaymentCount ?? 0) },
      { title: "Pending", value: String(dashboardQuery.data?.pendingPaymentCount ?? 0) },
      { title: "Failed", value: String(dashboardQuery.data?.failedPaymentCount ?? 0) },
      { title: "Payers", value: String(dashboardQuery.data?.payerCount ?? 0) },
    ],
    [dashboardQuery.data],
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[480px] bg-background/95 backdrop-blur-md shadow-2xl z-50 border-l border-border/10 flex flex-col animate-in slide-in-from-right duration-300 ease-out">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-muted/30">
        <h3 className="font-semibold">Levy Details</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={onClose}>
          <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
        </Button>
      </div>

      {/* Content */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {levy ? (
            <>
              {/* Levy Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                      getStatusColor(levy.status),
                    )}
                  >
                    {levy.status}
                  </span>
                  <span className="text-xs text-muted-foreground capitalize">
                    {levy.targetType}
                  </span>
                </div>
                <h2 className="text-lg font-semibold text-foreground">{levy.title}</h2>
                <p className="text-sm text-muted-foreground">{levy.description}</p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount</p>
                    <p className="text-sm font-semibold">₦{levy.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Due Date</p>
                    <p className="text-sm font-medium">{format(new Date(levy.dueDate), "d MMMM yyyy")}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Type</p>
                    <p className="text-sm font-medium capitalize">{formatLevyType(levy.levyType)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="text-sm font-medium">{getTargetName(levy)}</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Stats */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Payment Overview</h4>
                {dashboardQuery.isLoading ? (
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Skeleton key={i} className="h-14 rounded-lg" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {cards.map((card) => (
                      <div key={card.title} className="rounded-lg border bg-muted/30 p-2.5">
                        <p className="text-[10px] text-muted-foreground">{card.title}</p>
                        <p className="text-sm font-semibold">{card.value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Edit Form */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Edit Levy</h4>
                <LevyForm
                  initialValue={levy}
                  submitLabel="Save changes"
                  onSubmit={(payload) => updateMutation.mutateAsync(payload)}
                />
              </div>

              <Separator />

              {/* Payments */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-foreground">Payment Records</h4>
                  <Select
                    value={paymentStatus}
                    onValueChange={(value) => setPaymentStatus(value as typeof paymentStatus)}
                  >
                    <SelectTrigger className="w-auto min-w-[100px] h-7 text-xs rounded-2xl gap-2 px-2.5 border-input bg-background font-medium focus:ring-0 focus:ring-offset-0">
                      <span>{paymentStatus === "all" ? "All" : paymentStatus}</span>
                    </SelectTrigger>
                    <SelectContent align="end">
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="initialized">Initialized</SelectItem>
                      <SelectItem value="succeeded">Succeeded</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {paymentsQuery.isLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <Skeleton key={i} className="h-16 rounded-lg" />
                    ))}
                  </div>
                ) : (paymentsQuery.data ?? []).length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground text-center">
                    No payments match the current filter.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(paymentsQuery.data ?? []).map((payment) => (
                      <div
                        key={payment.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/20 p-3"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {payment.user?.fullName ?? payment.reference}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {payment.user?.email} · {payment.reference}
                          </p>
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="text-sm font-semibold">₦{payment.amount.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground capitalize">{payment.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-muted-foreground p-8">
              <p>Select a levy to view details</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

/* ─── Levies Table Page ─── */

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
      const actionLabels = { publish: "published", unpublish: "unpublished", close: "closed" } as const;
      toast.success(`Levy ${actionLabels[variables.action]}.`);
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

  const handleOpenDrawer = (levy: LevyRecord) => {
    setSelectedLevy(levy);
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  return (
    <div className="space-y-6">
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Create Levy</DialogTitle>
          </DialogHeader>
          <LevyForm
            submitLabel="Create levy"
            onCancel={() => setIsCreateOpen(false)}
            onSubmit={(payload) => createMutation.mutateAsync(payload)}
          />
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
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#fbfcff] border-b">
              <tr>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Title</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Type</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Target</th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Amount</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Due Date</th>
                <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground w-[60px]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {leviesQuery.isLoading &&
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-3 px-4">
                      <div className="space-y-1.5">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-48" />
                      </div>
                    </td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                    <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                    <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                    <td className="py-3 px-4 text-center"><Skeleton className="h-6 w-6 rounded-full mx-auto" /></td>
                  </tr>
                ))}

              {leviesQuery.isError && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-red-600">
                    {leviesQuery.error instanceof ApiError
                      ? leviesQuery.error.message
                      : "Unable to load levies right now."}
                  </td>
                </tr>
              )}

              {!leviesQuery.isLoading && !leviesQuery.isError && currentLevies.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No levies match your current filters.
                  </td>
                </tr>
              )}

              {currentLevies.map((levy) => (
                <tr
                  key={levy.id}
                  className="border-b last:border-0 hover:bg-muted/5 transition-colors group cursor-pointer"
                  onClick={() => handleOpenDrawer(levy)}
                >
                  <td className="py-3 px-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">{levy.title}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[220px]">
                        {levy.description}
                      </p>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {formatLevyType(levy.levyType)}
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {getTargetName(levy)}
                  </td>
                  <td className="py-3 px-4 text-sm font-medium text-foreground text-right">
                    ₦{levy.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={cn(
                        "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                        getStatusColor(levy.status),
                      )}
                    >
                      {levy.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-muted-foreground">
                    {format(new Date(levy.dueDate), "d MMMM yyyy")}
                  </td>
                  <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full">
                          <HugeiconsIcon icon={MoreVerticalIcon} className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="gap-2 cursor-pointer"
                          onClick={() => handleOpenDrawer(levy)}
                        >
                          <HugeiconsIcon icon={ViewIcon} className="w-4 h-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {levy.status !== "published" && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => actionMutation.mutate({ levyId: levy.id, action: "publish" })}
                          >
                            <HugeiconsIcon icon={ArrowUpIcon} className="w-4 h-4" />
                            Publish
                          </DropdownMenuItem>
                        )}
                        {levy.status === "published" && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer"
                            onClick={() => actionMutation.mutate({ levyId: levy.id, action: "unpublish" })}
                          >
                            <HugeiconsIcon icon={ArrowDownIcon} className="w-4 h-4" />
                            Unpublish
                          </DropdownMenuItem>
                        )}
                        {levy.status !== "closed" && (
                          <DropdownMenuItem
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            onClick={() => actionMutation.mutate({ levyId: levy.id, action: "close" })}
                          >
                            <HugeiconsIcon icon={Tick02Icon} className="w-4 h-4" />
                            Close
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

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
        onClose={handleCloseDrawer}
        levy={selectedLevy}
      />
    </div>
  );
};

export default Levies;
