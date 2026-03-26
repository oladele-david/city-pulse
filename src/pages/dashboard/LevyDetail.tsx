import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LevyForm } from "@/components/levies/LevyForm";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { CreateLevyPayload, PaymentRecord } from "@/types/api";

const LevyDetail = () => {
  const { levyId = "" } = useParams();
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [paymentStatus, setPaymentStatus] = useState<PaymentRecord["status"] | "all">("all");

  const levyQuery = useQuery({
    queryKey: ["admin-levy", levyId],
    queryFn: () => api.getAdminLevy(levyId, session!.accessToken),
    enabled: Boolean(session?.accessToken && levyId),
  });

  const dashboardQuery = useQuery({
    queryKey: ["admin-levy-dashboard", levyId],
    queryFn: () => api.getLevyDashboard(levyId, session!.accessToken),
    enabled: Boolean(session?.accessToken && levyId),
  });

  const paymentsQuery = useQuery({
    queryKey: ["admin-levy-payments", levyId, paymentStatus],
    queryFn: () =>
      api.getLevyPayments(
        levyId,
        session!.accessToken,
        paymentStatus === "all" ? undefined : paymentStatus,
      ),
    enabled: Boolean(session?.accessToken && levyId),
  });

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<CreateLevyPayload>) =>
      api.updateLevy(levyId, payload, session!.accessToken),
    onSuccess: async () => {
      toast.success("Levy updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-levy", levyId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-levies"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not update levy.");
    },
  });

  const cards = useMemo(
    () => [
      {
        title: "Total Collected",
        value: `NGN ${(dashboardQuery.data?.totalCollectedAmount ?? 0).toLocaleString()}`,
      },
      {
        title: "Successful Payments",
        value: String(dashboardQuery.data?.successfulPaymentCount ?? 0),
      },
      {
        title: "Pending Payments",
        value: String(dashboardQuery.data?.pendingPaymentCount ?? 0),
      },
      {
        title: "Failed Payments",
        value: String(dashboardQuery.data?.failedPaymentCount ?? 0),
      },
      {
        title: "Unique Payers",
        value: String(dashboardQuery.data?.payerCount ?? 0),
      },
    ],
    [dashboardQuery.data],
  );

  if (levyQuery.isLoading) {
    return <div className="text-sm text-muted-foreground">Loading levy details...</div>;
  }

  if (!levyQuery.data) {
    return <div className="text-sm text-muted-foreground">Levy not found.</div>;
  }

  const levy = levyQuery.data;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">{levy.title}</h1>
        <p className="text-muted-foreground">
          {levy.status} levy for{" "}
          {levy.targetType === "community"
            ? levy.targetCommunity?.name ?? levy.targetCommunityId
            : levy.targetLga?.name ?? levy.targetLgaId}{" "}
          due {format(new Date(levy.dueDate), "dd MMM yyyy")}.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-5">
        {cards.map((card) => (
          <Card key={card.title}>
            <CardHeader className="pb-3">
              <CardDescription>{card.title}</CardDescription>
            </CardHeader>
            <CardContent className="text-2xl font-semibold">{card.value}</CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Levy</CardTitle>
          <CardDescription>Adjust levy details while preserving the current targeting rules.</CardDescription>
        </CardHeader>
        <CardContent>
          <LevyForm
            initialValue={levy}
            submitLabel="Save changes"
            onSubmit={(payload) => updateMutation.mutateAsync(payload)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Payment Records</CardTitle>
            <CardDescription>Collections for this levy grouped by payment status.</CardDescription>
          </div>

          <div className="flex items-center gap-3">
            <Select
              value={paymentStatus}
              onValueChange={(value) => setPaymentStatus(value as typeof paymentStatus)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter payments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All payments</SelectItem>
                <SelectItem value="initialized">Initialized</SelectItem>
                <SelectItem value="succeeded">Succeeded</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {(paymentsQuery.data ?? []).map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 md:flex-row md:items-center md:justify-between"
            >
              <div>
                <div className="font-medium">{payment.user?.fullName ?? payment.reference}</div>
                <div className="text-sm text-muted-foreground">
                  {payment.user?.email} • {payment.reference}
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold">NGN {payment.amount.toLocaleString()}</div>
                <div className="text-sm uppercase text-muted-foreground">
                  {payment.status}
                </div>
              </div>
            </div>
          ))}
          {!paymentsQuery.data?.length ? (
            <div className="rounded-2xl border border-dashed p-5 text-sm text-muted-foreground">
              No payments match the current filter yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
};

export default LevyDetail;
