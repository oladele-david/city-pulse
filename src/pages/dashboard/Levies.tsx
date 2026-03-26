import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { toast } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { LevyForm } from "@/components/levies/LevyForm";
import { useAuth } from "@/hooks/use-auth";
import { api, ApiError } from "@/lib/api";
import { CreateLevyPayload, LevyRecord } from "@/types/api";

const Levies = () => {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<LevyRecord["status"] | "all">("all");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const leviesQuery = useQuery({
    queryKey: ["admin-levies", status],
    queryFn: () =>
      api.listAdminLevies(
        session!.accessToken,
        status === "all" ? undefined : status,
      ),
    enabled: Boolean(session?.accessToken),
  });

  const createMutation = useMutation({
    mutationFn: (payload: CreateLevyPayload) => api.createLevy(payload, session!.accessToken),
    onSuccess: async () => {
      toast.success("Levy created.");
      setIsCreateOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["admin-levies"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not create levy.");
    },
  });

  const actionMutation = useMutation({
    mutationFn: async ({ levyId, action }: { levyId: string; action: "publish" | "unpublish" | "close" }) => {
      if (action === "publish") {
        return api.publishLevy(levyId, session!.accessToken);
      }
      if (action === "unpublish") {
        return api.unpublishLevy(levyId, session!.accessToken);
      }
      return api.closeLevy(levyId, session!.accessToken);
    },
    onSuccess: async (_, variables) => {
      const actionLabels = {
        publish: "published",
        unpublish: "unpublished",
        close: "closed",
      } as const;
      toast.success(`Levy ${actionLabels[variables.action]}.`);
      await queryClient.invalidateQueries({ queryKey: ["admin-levies"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-levy", variables.levyId] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : "Could not update levy state.");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Levies</h1>
          <p className="text-muted-foreground">
            Create, publish, and track civic levies by community or LGA.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Select value={status} onValueChange={(value) => setStatus(value as typeof status)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button>Create Levy</Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl">
              <DialogHeader>
                <DialogTitle>Create Levy</DialogTitle>
              </DialogHeader>
              <LevyForm
                submitLabel="Create levy"
                onCancel={() => setIsCreateOpen(false)}
                onSubmit={(payload) => createMutation.mutateAsync(payload)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {leviesQuery.isLoading ? (
        <Card>
          <CardContent className="py-10 text-sm text-muted-foreground">
            Loading levies...
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {(leviesQuery.data ?? []).map((levy) => (
            <Card key={levy.id} className="border-white/70 bg-white/95 shadow-sm">
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={levy.status === "published" ? "default" : "secondary"}>
                      {levy.status}
                    </Badge>
                    <Badge variant="outline">{levy.targetType}</Badge>
                    <Badge variant="outline">{levy.levyType.replace(/_/g, " ")}</Badge>
                  </div>
                  <CardTitle>{levy.title}</CardTitle>
                  <CardDescription>{levy.description}</CardDescription>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-semibold">NGN {levy.amount.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    Due {format(new Date(levy.dueDate), "dd MMM yyyy")}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="text-sm text-muted-foreground">
                  Target:{" "}
                  {levy.targetType === "community"
                    ? levy.targetCommunity?.name ?? levy.targetCommunityId
                    : levy.targetLga?.name ?? levy.targetLgaId}
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link to={`/console/dashboard/levies/${levy.id}`}>View Details</Link>
                  </Button>
                  {levy.status !== "published" ? (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        actionMutation.mutate({ levyId: levy.id, action: "publish" })
                      }
                    >
                      Publish
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      onClick={() =>
                        actionMutation.mutate({ levyId: levy.id, action: "unpublish" })
                      }
                    >
                      Unpublish
                    </Button>
                  )}
                  {levy.status !== "closed" ? (
                    <Button
                      variant="destructive"
                      onClick={() =>
                        actionMutation.mutate({ levyId: levy.id, action: "close" })
                      }
                    >
                      Close
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Levies;
