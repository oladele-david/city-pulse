import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate, useParams, Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";

const statusStyle: Record<string, string> = {
  succeeded: "text-emerald-700 bg-emerald-50",
  failed: "text-rose-700 bg-rose-50",
  initialized: "text-amber-700 bg-amber-50",
  pending: "text-amber-700 bg-amber-50",
};

const MobilePaymentReceipt = () => {
  const { reference = "" } = useParams();
  const navigate = useNavigate();
  const { session } = useCitizenAuth();

  const receiptQuery = useQuery({
    queryKey: ["payment-receipt", reference],
    queryFn: () => api.getPaymentReceipt(reference, session!.accessToken),
    enabled: Boolean(session?.accessToken && reference),
  });

  if (receiptQuery.isLoading) {
    return (
      <div className="bg-white px-4 pt-6 pb-28 space-y-5">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-6 w-40" />
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!receiptQuery.data) {
    return (
      <div className="bg-white px-4 pt-6 pb-28">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full border mb-4">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </button>
        <p className="text-sm text-muted-foreground">Receipt not found.</p>
      </div>
    );
  }

  const payment = receiptQuery.data;

  return (
    <div className="bg-white px-4 pt-6 pb-28 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex h-9 w-9 items-center justify-center rounded-full border transition-transform active:scale-95"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
          </button>
          <h1 className="text-xl font-bold">Receipt</h1>
        </div>
        <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", statusStyle[payment.status] ?? "bg-muted text-muted-foreground")}>
          {payment.status}
        </span>
      </div>

      {/* Receipt body — dashed lines */}
      <div className="space-y-0">
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Title</span>
          <span className="text-sm font-semibold text-right max-w-[60%] truncate">
            {payment.levy?.title ?? "Levy payment"}
          </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Amount</span>
          <span className="text-base font-bold">₦{payment.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Status</span>
          <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", statusStyle[payment.status] ?? "bg-muted")}>
            {payment.status}
          </span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Date</span>
          <span className="text-xs font-medium">{format(new Date(payment.updatedAt), "dd MMM yyyy, h:mm a")}</span>
        </div>
        <div className="flex items-start justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground shrink-0">Reference</span>
          <span className="text-xs font-medium text-right break-all ml-4">{payment.reference}</span>
        </div>
        {(payment.providerReference || payment.providerPaymentReference) && (
          <div className="flex items-start justify-between py-3 border-b border-dashed">
            <span className="text-xs text-muted-foreground shrink-0">Provider ref</span>
            <span className="text-xs font-medium text-right break-all ml-4">
              {payment.providerPaymentReference ?? payment.providerReference}
            </span>
          </div>
        )}
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Gateway</span>
          <span className="text-xs font-medium capitalize">{payment.gatewayProvider}</span>
        </div>
      </div>

      {/* CTA */}
      {payment.levyId && (
        <div className="pt-2">
          <Button asChild className="w-full h-10 rounded-xl text-sm">
            <Link to={`/mobile/levies/${payment.levyId}`}>View levy</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobilePaymentReceipt;
