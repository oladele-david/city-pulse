import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, Wallet } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
          <div className="flex items-center justify-between gap-3">
            <Badge variant="outline" className="rounded-full border-amber-200 bg-amber-50 px-3 py-1 uppercase tracking-[0.18em] text-amber-800">
              {levy.targetType}
            </Badge>
            <Button
              variant="ghost"
              className="rounded-full px-3 text-slate-600"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
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

          <div className="rounded-[1.75rem] border border-sky-200 bg-[linear-gradient(135deg,#eff6ff_0%,#f8fafc_100%)] p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-900">Demo payment card</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-600">
                  Use these test details on the Interswitch screen for this demo build.
                </p>
              </div>
              <Badge
                variant="outline"
                className="shrink-0 rounded-full border-sky-200 bg-white/80 px-3 py-1 uppercase tracking-[0.18em] text-sky-700"
              >
                Demo Only
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Card Type
                </div>
                <div className="mt-1 font-semibold text-slate-900">Mastercard</div>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Card Number
                </div>
                <div className="mt-1 break-all font-semibold text-slate-900">
                  5123450000000008
                </div>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  Expiry
                </div>
                <div className="mt-1 font-semibold text-slate-900">01/39</div>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  CVV
                </div>
                <div className="mt-1 font-semibold text-slate-900">100</div>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  PIN
                </div>
                <div className="mt-1 font-semibold text-slate-900">1111</div>
              </div>
              <div className="rounded-2xl bg-white/80 p-3">
                <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                  OTP
                </div>
                <div className="mt-1 font-semibold text-slate-900">123456</div>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
            <Button
              className="h-12 rounded-full bg-slate-950 text-white hover:bg-slate-800"
              onClick={() => payMutation.mutate()}
              disabled={payMutation.isPending}
            >
              <Wallet className="mr-2 h-4 w-4" />
              {payMutation.isPending ? "Preparing checkout..." : "Pay with Interswitch"}
              {!payMutation.isPending ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
            </Button>
            <Button
              variant="outline"
              className="h-12 rounded-full border-slate-300 px-5"
              onClick={() => navigate("/mobile/payments")}
            >
              Payments
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileLevyDetail;
