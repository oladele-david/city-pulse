import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const MobilePayments = () => {
  const { session } = useCitizenAuth();

  const paymentsQuery = useQuery({
    queryKey: ["mobile-payments", session?.user.id],
    queryFn: () => api.getMyPaymentsHistory(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  return (
    <div className="space-y-4 bg-background px-4 pb-28 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Payments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track payment outcomes and open receipts after backend confirmation.
        </p>
      </div>

      {(paymentsQuery.data ?? []).map((payment) => (
        <Link key={payment.id} to={`/mobile/payments/${payment.reference}`}>
          <Card className="rounded-3xl border-white/70 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">
                {payment.levy?.title ?? payment.paymentType.replace(/_/g, " ")}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                {format(new Date(payment.createdAt), "dd MMM yyyy")}
              </div>
              <div className="text-right">
                <div className="font-semibold">NGN {payment.amount.toLocaleString()}</div>
                <div className="uppercase text-muted-foreground">{payment.status}</div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}

      {!paymentsQuery.data?.length ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Your payment history will appear here after you start paying levies.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default MobilePayments;
