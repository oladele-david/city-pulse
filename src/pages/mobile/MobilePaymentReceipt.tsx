import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, ReceiptText } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const formatPaymentDateTime = (value: string) =>
  format(new Date(value), "dd MMM yyyy, h:mm a");

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
    return <div className="px-4 py-8 text-sm text-muted-foreground">Loading receipt...</div>;
  }

  if (!receiptQuery.data) {
    return <div className="px-4 py-8 text-sm text-muted-foreground">Receipt not found.</div>;
  }

  const payment = receiptQuery.data;
  const backToPreviousScreen = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/mobile/payments");
  };

  const statusTone =
    payment.status === "succeeded"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : payment.status === "failed"
        ? "border-rose-200 bg-rose-50 text-rose-800"
        : "border-amber-200 bg-amber-50 text-amber-800";

  return (
    <div className="min-h-full space-y-4 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-6">
      <div className="flex items-center justify-between gap-3">
        <Button
          variant="ghost"
          className="rounded-full px-3 text-slate-700"
          onClick={backToPreviousScreen}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Badge variant="outline" className={`rounded-full px-3 py-1 uppercase tracking-[0.18em] ${statusTone}`}>
          {payment.status}
        </Badge>
      </div>

      <Card className="rounded-[2rem] border-white/70 shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-slate-950 p-3 text-white">
              <ReceiptText className="h-5 w-5" />
            </div>
            <CardTitle className="text-2xl">Payment Receipt</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className={`rounded-2xl border px-4 py-3 font-medium ${statusTone}`}>
            Status: {payment.status}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Amount
              </div>
              <div className="mt-2 font-semibold">NGN {payment.amount.toLocaleString()}</div>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Date
              </div>
              <div className="mt-2 font-semibold">
                {formatPaymentDateTime(payment.updatedAt)}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-medium">{payment.levy?.title ?? "Levy payment"}</div>
            <div className="mt-1 break-all text-muted-foreground">Reference: {payment.reference}</div>
            <div className="mt-1 text-muted-foreground">
              Provider ref: {payment.providerPaymentReference ?? payment.providerReference ?? "Pending"}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button
              className="flex-1 rounded-full bg-slate-950 text-white hover:bg-slate-800"
              onClick={backToPreviousScreen}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            <Button asChild variant="outline" className="rounded-full border-slate-300 px-5">
              <Link to="/mobile/payments">
                All payments
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {payment.levyId ? (
              <Button asChild variant="outline" className="rounded-full border-slate-300 px-5">
                <Link to={`/mobile/levies/${payment.levyId}`}>View levy</Link>
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobilePaymentReceipt;
