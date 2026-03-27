import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { ArrowRight, CheckCircle2, Clock3, ReceiptText, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const formatPaymentDateTime = (value: string) =>
  format(new Date(value), "dd MMM yyyy, h:mm a");

const MobilePayments = () => {
  const { session } = useCitizenAuth();

  const paymentsQuery = useQuery({
    queryKey: ["mobile-payments", session?.user.id],
    queryFn: () => api.getMyPaymentsHistory(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  const groupedPayments = useMemo(() => {
    const payments = paymentsQuery.data ?? [];

    return [
      {
        key: "active",
        title: "Awaiting confirmation",
        description: "Payments still waiting for final backend confirmation.",
        icon: Clock3,
        accent: "border-amber-200 bg-amber-50 text-amber-800",
        items: payments.filter(
          (payment) => payment.status === "initialized" || payment.status === "pending",
        ),
      },
      {
        key: "succeeded",
        title: "Successful",
        description: "Receipts that are fully confirmed by the backend.",
        icon: CheckCircle2,
        accent: "border-emerald-200 bg-emerald-50 text-emerald-800",
        items: payments.filter((payment) => payment.status === "succeeded"),
      },
      {
        key: "failed",
        title: "Needs attention",
        description: "Payments that did not complete successfully.",
        icon: XCircle,
        accent: "border-rose-200 bg-rose-50 text-rose-800",
        items: payments.filter((payment) => payment.status === "failed"),
      },
    ];
  }, [paymentsQuery.data]);

  return (
    <div className="min-h-full space-y-5 bg-[linear-gradient(180deg,#f8fafc_0%,#ffffff_100%)] px-4 pb-[calc(9rem+env(safe-area-inset-bottom))] pt-6">
      <div>
        <h1 className="text-2xl font-bold">Payments</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Track payment outcomes and open receipts after backend confirmation.
        </p>
      </div>

      <Card className="overflow-hidden rounded-[2rem] border-none bg-[linear-gradient(135deg,#111827_0%,#0f172a_50%,#2563eb_100%)] text-white shadow-xl shadow-slate-200/80">
        <CardContent className="grid grid-cols-3 gap-3 p-5">
          {groupedPayments.map((group) => (
            <div key={group.key} className="rounded-3xl border border-white/10 bg-white/10 px-3 py-4 text-center">
              <div className="text-xs text-white/60 [text-wrap:balance]">
                {group.title}
              </div>
              <div className="mt-2 text-2xl font-semibold">{group.items.length}</div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-5">
        {groupedPayments.map((group) => {
          const Icon = group.icon;

          if (!group.items.length) {
            return null;
          }

          return (
            <section key={group.key} className="space-y-3">
              <div className="flex items-start gap-3 rounded-[1.75rem] border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`rounded-2xl border p-3 ${group.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">{group.title}</h2>
                  <p className="mt-1 text-sm text-slate-600">{group.description}</p>
                </div>
              </div>

              <div className="space-y-4">
                {group.items.map((payment) => (
                  <Card key={payment.id} className="rounded-[2rem] border-white/70 bg-white/95 shadow-sm">
                    <CardHeader className="space-y-3 pb-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <CardTitle className="text-base leading-snug">
                            {payment.levy?.title ?? payment.paymentType.replace(/_/g, " ")}
                          </CardTitle>
                          <p className="mt-2 text-sm text-muted-foreground">
                            {formatPaymentDateTime(payment.createdAt)}
                          </p>
                        </div>
                        <Badge
                          variant="outline"
                          className={`w-fit shrink-0 rounded-full px-3 py-1 text-[11px] ${group.accent}`}
                        >
                          {payment.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-3 rounded-2xl bg-slate-50 px-4 py-3">
                        <div className="min-w-0">
                          <div className="text-xs text-muted-foreground">
                            Amount
                          </div>
                          <div className="mt-2 text-lg font-semibold">
                            NGN {payment.amount.toLocaleString()}
                          </div>
                        </div>
                        <div className="min-w-0 text-left text-sm text-muted-foreground">
                          <div>Ref</div>
                          <div className="mt-1 break-all font-medium text-slate-700">
                            {payment.reference}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Button asChild className="flex-1 rounded-full bg-slate-950 text-white hover:bg-slate-800">
                          <Link to={`/mobile/payments/${payment.reference}`}>
                            <ReceiptText className="mr-2 h-4 w-4" />
                            Open receipt
                          </Link>
                        </Button>
                        {payment.levyId ? (
                          <Button asChild variant="outline" className="rounded-full border-slate-300 px-5">
                            <Link to={`/mobile/levies/${payment.levyId}`}>
                              View levy
                              <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {!paymentsQuery.data?.length ? (
        <Card className="rounded-[2rem]">
          <CardContent className="py-8 text-sm text-muted-foreground">
            Your payment history will appear here after you start paying levies.
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default MobilePayments;
