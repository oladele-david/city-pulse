import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { Wallet } from "lucide-react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { openInterswitchCheckout } from "@/lib/interswitch";

const MobileLevyDetail = () => {
  const { levyId = "" } = useParams();
  const navigate = useNavigate();
  const { session } = useCitizenAuth();

  const levyQuery = useQuery({
    queryKey: ["mobile-levy", levyId],
    queryFn: () => api.getMyLevy(levyId, session!.accessToken),
    enabled: Boolean(session?.accessToken && levyId),
  });

  const payMutation = useMutation({
    mutationFn: () => api.initializeLevyPayment(levyId, session!.accessToken),
    onSuccess: async (payment) => {
      try {
        await openInterswitchCheckout(payment.checkout, () => {
          navigate(`/payment/callback?reference=${payment.reference}`);
        });
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not open checkout.");
      }
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not start payment.");
    },
  });

  if (levyQuery.isLoading) {
    return (
      <div className="bg-white px-4 pt-6 pb-28 space-y-5">
        <Skeleton className="h-9 w-9 rounded-full" />
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!levyQuery.data) {
    return (
      <div className="bg-white px-4 pt-6 pb-28">
        <button onClick={() => navigate(-1)} className="flex h-9 w-9 items-center justify-center rounded-full border mb-4">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4" />
        </button>
        <p className="text-sm text-muted-foreground">Levy not found.</p>
      </div>
    );
  }

  const levy = levyQuery.data;
  const targetName = levy.targetType === "community"
    ? levy.targetCommunity?.name ?? levy.targetCommunityId
    : levy.targetLga?.name ?? levy.targetLgaId;

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
          <h1 className="text-xl font-bold">Levy</h1>
        </div>
        <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-1 text-[11px] font-bold text-amber-800 capitalize">
          {levy.targetType}
        </span>
      </div>

      {/* Title + description */}
      <div>
        <h2 className="text-lg font-bold text-foreground">{levy.title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{levy.description}</p>
      </div>

      {/* Details — dashed lines */}
      <div className="space-y-0">
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Amount</span>
          <span className="text-base font-bold">₦{levy.amount.toLocaleString()}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Due date</span>
          <span className="text-sm font-medium">{format(new Date(levy.dueDate), "dd MMM yyyy")}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Applies to</span>
          <span className="text-sm font-medium">{targetName}</span>
        </div>
        <div className="flex items-center justify-between py-3 border-b border-dashed">
          <span className="text-xs text-muted-foreground">Type</span>
          <span className="text-sm font-medium capitalize">{levy.levyType.replace(/_/g, " ")}</span>
        </div>
      </div>

      {/* Demo card info */}
      <div className="rounded-xl border border-sky-200 bg-sky-50/50 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-slate-900">Demo test card</p>
          <span className="rounded-full border border-sky-200 bg-white/80 px-2 py-0.5 text-[10px] font-bold text-sky-700">Demo</span>
        </div>
        <div className="grid grid-cols-3 gap-2 text-[11px]">
          <div>
            <p className="text-muted-foreground">Card</p>
            <p className="font-semibold">5123 4500 0000 0008</p>
          </div>
          <div>
            <p className="text-muted-foreground">Expiry</p>
            <p className="font-semibold">01/39</p>
          </div>
          <div>
            <p className="text-muted-foreground">CVV</p>
            <p className="font-semibold">100</p>
          </div>
          <div>
            <p className="text-muted-foreground">PIN</p>
            <p className="font-semibold">1111</p>
          </div>
          <div>
            <p className="text-muted-foreground">OTP</p>
            <p className="font-semibold">123456</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="pt-1">
        <Button
          className="w-full h-10 rounded-xl text-sm gap-2"
          onClick={() => payMutation.mutate()}
          disabled={payMutation.isPending}
        >
          <Wallet className="h-4 w-4" />
          {payMutation.isPending ? "Preparing..." : "Pay now"}
        </Button>
      </div>
    </div>
  );
};

export default MobileLevyDetail;
