import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreVerticalIcon,
  ViewIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  Tick02Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { formatLevyType, getStatusColor, getTargetName } from "./levy-utils";
import { ApiError } from "@/lib/api";
import { LevyRecord } from "@/types/api";

interface LevyTableProps {
  levies: LevyRecord[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRowClick: (levy: LevyRecord) => void;
  onAction: (levyId: string, action: "publish" | "unpublish" | "close") => void;
  actionPending: boolean;
}

export const LevyTable = ({
  levies,
  isLoading,
  isError,
  error,
  onRowClick,
  onAction,
  actionPending,
}: LevyTableProps) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-[#fbfcff] border-b">
          <tr>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Title</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Type</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Target</th>
            <th className="text-right py-3 px-4 text-xs font-semibold text-muted-foreground">Amount</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Status</th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-muted-foreground">Due Date</th>
            <th className="text-center py-3 px-4 text-xs font-semibold text-muted-foreground w-[60px]">Actions</th>
          </tr>
        </thead>
        <tbody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3 px-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-36" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                </td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-28" /></td>
                <td className="py-3 px-4 text-right"><Skeleton className="h-4 w-20 ml-auto" /></td>
                <td className="py-3 px-4"><Skeleton className="h-5 w-16 rounded-full" /></td>
                <td className="py-3 px-4"><Skeleton className="h-4 w-24" /></td>
                <td className="py-3 px-4 text-center"><Skeleton className="h-6 w-6 rounded-full mx-auto" /></td>
              </tr>
            ))}

          {isError && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-red-600">
                {error instanceof ApiError
                  ? error.message
                  : "Unable to load levies right now."}
              </td>
            </tr>
          )}

          {!isLoading && !isError && levies.length === 0 && (
            <tr>
              <td colSpan={7} className="px-4 py-12 text-center text-sm text-muted-foreground">
                No levies match your current filters.
              </td>
            </tr>
          )}

          {levies.map((levy) => (
            <tr
              key={levy.id}
              className="border-b last:border-0 hover:bg-muted/5 transition-colors group cursor-pointer"
              onClick={() => onRowClick(levy)}
            >
              <td className="py-3 px-4 max-w-[220px]">
                <div className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <p className="text-sm font-medium text-foreground truncate">{levy.title}</p>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p className="max-w-[300px]">{levy.title}</p>
                    </TooltipContent>
                  </Tooltip>
                  <p className="text-xs text-muted-foreground truncate">
                    {levy.description}
                  </p>
                </div>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {formatLevyType(levy.levyType)}
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {getTargetName(levy)}
              </td>
              <td className="py-3 px-4 text-sm font-medium text-foreground text-right">
                ₦{levy.amount.toLocaleString()}
              </td>
              <td className="py-3 px-4">
                <span
                  className={cn(
                    "inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
                    getStatusColor(levy.status),
                  )}
                >
                  {levy.status}
                </span>
              </td>
              <td className="py-3 px-4 text-sm text-muted-foreground">
                {format(new Date(levy.dueDate), "d MMMM yyyy")}
              </td>
              <td className="py-3 px-4 text-center" onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" disabled={actionPending}>
                      <HugeiconsIcon icon={MoreVerticalIcon} className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      className="gap-2 cursor-pointer"
                      onClick={() => onRowClick(levy)}
                    >
                      <HugeiconsIcon icon={ViewIcon} className="w-4 h-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {levy.status !== "published" && (
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => onAction(levy.id, "publish")}
                      >
                        <HugeiconsIcon icon={ArrowUpIcon} className="w-4 h-4" />
                        Publish
                      </DropdownMenuItem>
                    )}
                    {levy.status === "published" && (
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer"
                        onClick={() => onAction(levy.id, "unpublish")}
                      >
                        <HugeiconsIcon icon={ArrowDownIcon} className="w-4 h-4" />
                        Unpublish
                      </DropdownMenuItem>
                    )}
                    {levy.status !== "closed" && (
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => onAction(levy.id, "close")}
                      >
                        <HugeiconsIcon icon={Tick02Icon} className="w-4 h-4" />
                        Close
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
