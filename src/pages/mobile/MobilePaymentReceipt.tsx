import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const MobilePaymentReceipt = () => {
  const { reference = "" } = useParams();
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

  return (
    <div className="space-y-4 bg-background px-4 pb-28 pt-6">
      <Card className="rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Receipt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="rounded-2xl bg-emerald-50 px-4 py-3 font-medium text-emerald-700">
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
                {format(new Date(payment.updatedAt), "dd MMM yyyy")}
              </div>
            </div>
          </div>
          <div className="rounded-2xl border border-slate-200 p-4">
            <div className="font-medium">{payment.levy?.title ?? "Levy payment"}</div>
            <div className="mt-1 text-muted-foreground">Reference: {payment.reference}</div>
            <div className="mt-1 text-muted-foreground">
              Provider ref: {payment.providerPaymentReference ?? payment.providerReference ?? "Pending"}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobilePaymentReceipt;
