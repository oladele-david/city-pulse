import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
    return <div className="px-4 py-8 text-sm text-muted-foreground">Loading levy...</div>;
  }

  if (!levyQuery.data) {
    return <div className="px-4 py-8 text-sm text-muted-foreground">Levy not found.</div>;
  }

  const levy = levyQuery.data;

  return (
    <div className="space-y-5 bg-[linear-gradient(180deg,#fff7ed_0%,#ffffff_70%)] px-4 pb-28 pt-6">
      <Card className="rounded-[2rem] border-white/70 shadow-sm">
        <CardHeader className="space-y-3">
          <CardDescription className="uppercase tracking-[0.18em]">
            {levy.targetType}
          </CardDescription>
          <CardTitle className="text-2xl">{levy.title}</CardTitle>
          <CardDescription>{levy.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Amount
              </div>
              <div className="mt-2 text-xl font-semibold">
                NGN {levy.amount.toLocaleString()}
              </div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Due Date
              </div>
              <div className="mt-2 text-lg font-semibold">
                {format(new Date(levy.dueDate), "dd MMM yyyy")}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-muted-foreground">
            Applies to{" "}
            {levy.targetType === "community"
              ? levy.targetCommunity?.name ?? levy.targetCommunityId
              : levy.targetLga?.name ?? levy.targetLgaId}
            .
          </div>

          <Button
            className="w-full rounded-full"
            onClick={() => payMutation.mutate()}
            disabled={payMutation.isPending}
          >
            {payMutation.isPending ? "Preparing checkout..." : "Pay with Interswitch"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileLevyDetail;
