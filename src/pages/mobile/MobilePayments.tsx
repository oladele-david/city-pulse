import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { PaymentRecord } from "@/types/api";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  succeeded: "text-emerald-700 bg-emerald-50",
  initialized: "text-amber-700 bg-amber-50",
  pending: "text-amber-700 bg-amber-50",
  failed: "text-rose-700 bg-rose-50",
};

const MobilePayments = () => {
  const navigate = useNavigate();
  const { session } = useCitizenAuth();
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);

  const paymentsQuery = useQuery({
    queryKey: ["mobile-payments", session?.user.id],
    queryFn: () => api.getMyPaymentsHistory(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const payments = useMemo(() => paymentsQuery.data ?? [], [paymentsQuery.data]);

  const stats = useMemo(() => {
    const pending = payments.filter((p) => p.status === "initialized" || p.status === "pending").length;
    const succeeded = payments.filter((p) => p.status === "succeeded").length;
    const failed = payments.filter((p) => p.status === "failed").length;
    return { pending, succeeded, failed };
  }, [payments]);

  return (
    <div className="bg-white px-4 pb-28 pt-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform active:scale-95"
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Payments</h1>
          <p className="text-xs text-muted-foreground">History and receipts.</p>
        </div>
      </div>

      {/* Summary card — activity-page style */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-primary p-4 text-white">
        <div className="relative z-10">
          <p className="text-[10px] font-bold text-white/60">Total payments</p>
          <p className="mt-1 text-3xl font-semibold">{payments.length}</p>

          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
              <span className="block text-[9px] font-bold text-white/60">Success</span>
              <span className="text-lg font-semibold">{stats.succeeded}</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
              <span className="block text-[9px] font-bold text-white/60">Pending</span>
              <span className="text-lg font-semibold">{stats.pending}</span>
            </div>
            <div className="rounded-2xl border border-white/5 bg-white/10 p-3">
              <span className="block text-[9px] font-bold text-white/60">Failed</span>
              <span className="text-lg font-semibold">{stats.failed}</span>
            </div>
          </div>
        </div>
        <div className="absolute -bottom-16 -right-16 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
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
            <button
              key={payment.id}
              onClick={() => setSelectedPayment(payment)}
              className="flex items-center gap-3 py-3.5 first:pt-0 last:pb-0 w-full text-left"
            >
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
            </button>
          ))}
        </div>
      )}

      {/* Receipt drawer */}
      <Drawer open={!!selectedPayment} onOpenChange={(open) => !open && setSelectedPayment(null)}>
        <DrawerContent className="mx-auto max-w-md rounded-t-2xl border-t max-h-[80vh] flex flex-col">
          <DrawerHeader className="flex items-center justify-between px-4 pt-4 pb-3 border-b shrink-0">
            <DrawerTitle className="text-base font-bold">Receipt</DrawerTitle>
            <button onClick={() => setSelectedPayment(null)} className="rounded-full p-1 hover:bg-muted">
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            </button>
          </DrawerHeader>

          {selectedPayment && (
            <>
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {/* Receipt body — dashed lines */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-xs text-muted-foreground">Title</span>
                    <span className="text-sm font-semibold text-right max-w-[60%] truncate">
                      {selectedPayment.levy?.title ?? selectedPayment.paymentType.replace(/_/g, " ")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-xs text-muted-foreground">Amount</span>
                    <span className="text-sm font-bold">₦{selectedPayment.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-xs text-muted-foreground">Status</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", statusStyle[selectedPayment.status] ?? "bg-muted")}>
                      {selectedPayment.status}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-dashed">
                    <span className="text-xs text-muted-foreground">Date</span>
                    <span className="text-xs font-medium">{format(new Date(selectedPayment.createdAt), "dd MMM yyyy, h:mm a")}</span>
                  </div>
                  <div className="flex items-start justify-between py-2 border-b border-dashed">
                    <span className="text-xs text-muted-foreground shrink-0">Reference</span>
                    <span className="text-xs font-medium text-right break-all ml-4">{selectedPayment.reference}</span>
                  </div>
                  {(selectedPayment.providerReference || selectedPayment.providerPaymentReference) && (
                    <div className="flex items-start justify-between py-2 border-b border-dashed">
                      <span className="text-xs text-muted-foreground shrink-0">Provider ref</span>
                      <span className="text-xs font-medium text-right break-all ml-4">
                        {selectedPayment.providerPaymentReference ?? selectedPayment.providerReference}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <DrawerFooter className="flex-row gap-2 border-t px-4 pb-6 pt-3 shrink-0">
                <Button asChild className="flex-1 h-10 rounded-xl text-sm">
                  <Link to={`/mobile/payments/${selectedPayment.reference}`}>Full receipt</Link>
                </Button>
                {selectedPayment.levyId && (
                  <Button asChild variant="outline" className="flex-1 h-10 rounded-xl text-sm">
                    <Link to={`/mobile/levies/${selectedPayment.levyId}`}>View levy</Link>
                  </Button>
                )}
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
};

export default MobilePayments;
