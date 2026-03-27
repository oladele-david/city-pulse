import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { LevyForm } from "./LevyForm";
import { formatLevyType, getStatusColor, getTargetName } from "./levy-utils";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { CreateLevyPayload, LevyRecord, PaymentRecord } from "@/types/api";

interface LevyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  levy: LevyRecord | null;
}

export const LevyDrawer = ({ isOpen, onClose, levy }: LevyDrawerProps) => {
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
    <div className="fixed top-4 bottom-4 right-4 w-[480px] bg-background/95 backdrop-blur-md shadow-2xl rounded-xl z-50 border border-border/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ease-out">
      <div className="p-4 border-b flex justify-between items-center bg-muted/30">
        <h3 className="font-semibold">Levy Details</h3>
        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={onClose}>
          <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
        </Button>
      </div>

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
