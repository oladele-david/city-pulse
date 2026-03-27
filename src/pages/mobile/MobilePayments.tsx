import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { MoreVerticalIcon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  succeeded: "text-emerald-700 bg-emerald-50",
  initialized: "text-amber-700 bg-amber-50",
  pending: "text-amber-700 bg-amber-50",
  failed: "text-rose-700 bg-rose-50",
};

const MobilePayments = () => {
  const { session } = useCitizenAuth();

  const paymentsQuery = useQuery({
    queryKey: ["mobile-payments", session?.user.id],
    queryFn: () => api.getMyPaymentsHistory(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const payments = paymentsQuery.data ?? [];

  const stats = useMemo(() => {
    const pending = payments.filter((p) => p.status === "initialized" || p.status === "pending").length;
    const succeeded = payments.filter((p) => p.status === "succeeded").length;
    const failed = payments.filter((p) => p.status === "failed").length;
    return { pending, succeeded, failed };
  }, [payments]);

  return (
    <div className="bg-white px-4 pb-28 pt-6 space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold">Payments</h1>
        <p className="mt-1 text-xs text-muted-foreground">Your payment history and receipts.</p>
      </div>

      {/* Summary card — activity-page style */}
      <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[10px] text-white/60">Total payments</p>
            <p className="mt-1 text-2xl font-bold">{payments.length}</p>
          </div>
          <div className="flex gap-2">
            <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
              <p className="text-lg font-bold">{stats.succeeded}</p>
              <p className="text-[9px] text-white/60">Success</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
              <p className="text-lg font-bold">{stats.pending}</p>
              <p className="text-[9px] text-white/60">Pending</p>
            </div>
            <div className="rounded-xl bg-white/10 px-3 py-2 text-center">
              <p className="text-lg font-bold">{stats.failed}</p>
              <p className="text-[9px] text-white/60">Failed</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment list */}
      {paymentsQuery.isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="py-3 space-y-2">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-3 w-28" />
            </div>
          ))}
        </div>
      ) : payments.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Your payment history will appear here.
        </p>
      ) : (
        <div className="divide-y divide-border/60">
          {payments.map((payment) => (
            <div key={payment.id} className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-foreground truncate">
                  {payment.levy?.title ?? payment.paymentType.replace(/_/g, " ")}
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className={cn("rounded-full px-1.5 py-0.5 text-[10px] font-bold", statusStyle[payment.status] ?? "bg-muted text-muted-foreground")}>
                    {payment.status}
                  </span>
                  <span>{format(new Date(payment.createdAt), "dd MMM yyyy")}</span>
                </div>
              </div>

              <span className="text-sm font-bold text-foreground shrink-0">
                ₦{payment.amount.toLocaleString()}
              </span>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full shrink-0">
                    <HugeiconsIcon icon={MoreVerticalIcon} className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link to={`/mobile/payments/${payment.reference}`}>Open receipt</Link>
                  </DropdownMenuItem>
                  {payment.levyId && (
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link to={`/mobile/levies/${payment.levyId}`}>View levy</Link>
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MobilePayments;
