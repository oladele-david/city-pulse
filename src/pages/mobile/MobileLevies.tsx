import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useCitizenAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api";

const MobileLevies = () => {
  const { session } = useCitizenAuth();

  const leviesQuery = useQuery({
    queryKey: ["mobile-levies", session?.user.id],
    queryFn: () => api.listMyLevies(session!.accessToken),
    enabled: Boolean(session?.accessToken),
  });

  return (
    <div className="space-y-4 bg-[linear-gradient(180deg,#fffdf8_0%,#f8fafc_60%,#ffffff_100%)] px-4 pb-28 pt-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">My Levies</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Published levies for your community and LGA appear here.
        </p>
      </div>

      {leviesQuery.isLoading ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Loading your levy feed...
          </CardContent>
        </Card>
      ) : (
        <>
          {(leviesQuery.data ?? []).map((levy) => (
            <Card key={levy.id} className="rounded-3xl border-white/70 shadow-sm">
              <CardHeader>
                <CardDescription className="uppercase tracking-[0.18em]">
                  {levy.targetType}
                </CardDescription>
                <CardTitle className="text-xl">{levy.title}</CardTitle>
                <CardDescription>{levy.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3">
                  <div>
                    <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Amount
                    </div>
                    <div className="text-lg font-semibold">
                      NGN {levy.amount.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    Due {format(new Date(levy.dueDate), "dd MMM")}
                  </div>
                </div>

                <Button asChild className="w-full rounded-full">
                  <Link to={`/mobile/levies/${levy.id}`}>View levy</Link>
                </Button>
              </CardContent>
            </Card>
          ))}

          {!leviesQuery.data?.length ? (
            <Card>
              <CardContent className="py-8 text-sm text-muted-foreground">
                No active levies are currently assigned to your location.
              </CardContent>
            </Card>
          ) : null}
        </>
      )}
    </div>
  );
};

export default MobileLevies;
