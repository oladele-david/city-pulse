import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const PaymentCallback = () => {
  const { session } = useCitizenAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reference =
    searchParams.get("reference") ?? searchParams.get("txnref") ?? "";

  const paymentQuery = useQuery({
    queryKey: ["payment-callback", reference],
    queryFn: () => api.getPaymentStatus(reference, session!.accessToken),
    enabled: Boolean(session?.accessToken && reference),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status === "initialized" || status === "pending" ? 3000 : false;
    },
  });

  useEffect(() => {
    if (paymentQuery.data?.status === "succeeded") {
      const timeout = window.setTimeout(() => {
        navigate(`/mobile/payments/${reference}`);
      }, 1800);

      return () => window.clearTimeout(timeout);
    }

    return;
  }, [navigate, paymentQuery.data?.status, reference]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-lg rounded-[2rem]">
        <CardHeader>
          <CardTitle className="text-2xl">Payment Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          {!reference ? (
            <div className="rounded-2xl border border-dashed px-4 py-3 text-muted-foreground">
              No transaction reference was provided for this callback.
            </div>
          ) : paymentQuery.isLoading ? (
            <div className="rounded-2xl border border-dashed px-4 py-3 text-muted-foreground">
              Confirming your payment with the backend...
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-slate-50 px-4 py-3">
                Reference: <span className="font-medium">{reference}</span>
              </div>
              <div
                className={`rounded-2xl px-4 py-3 font-medium ${
                  paymentQuery.data?.status === "succeeded"
                    ? "bg-emerald-50 text-emerald-700"
                    : paymentQuery.data?.status === "failed"
                      ? "bg-rose-50 text-rose-700"
                      : "border border-slate-200 text-slate-700"
                }`}
              >
                Current status:{" "}
                <span className="font-semibold uppercase">
                  {paymentQuery.data?.status ?? "unknown"}
                </span>
              </div>
            </>
          )}

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link to="/mobile/payments">View payment history</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/mobile/levies">Back to levies</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentCallback;
