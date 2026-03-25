import {
  AiBrain01Icon,
  Cancel01Icon,
  CheckmarkCircle02Icon,
  MapsLocation01Icon,
  PlayIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { MapIssue } from "@/lib/map-issues";
import { cn } from "@/lib/utils";
import { ReactionType } from "@/types/api";

interface MobileIssueSheetProps {
  issue: MapIssue | null;
  isOpen: boolean;
  userReaction?: ReactionType;
  canReact: boolean;
  isSubmittingReaction?: boolean;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onDisagree: (id: string) => void;
}

export const MobileIssueSheet = ({
  issue,
  isOpen,
  userReaction = "none",
  canReact,
  isSubmittingReaction = false,
  onClose,
  onConfirm,
  onDisagree,
}: MobileIssueSheetProps) => {
  if (!issue) return null;

  const userReactionLabel =
    userReaction === "confirm"
      ? "You agreed this issue is active"
      : userReaction === "disagree"
        ? "You disagreed with this issue"
        : userReaction === "fixed_signal"
          ? "You marked this as fixed"
          : "You have not reacted yet";

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="mx-auto max-w-md rounded-t-2xl border-t">
        <DrawerHeader className="border-b pb-4 pt-6 text-left">
          <div className="mb-2 flex items-center gap-2">
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                issue.severity === "high"
                  ? "border-red-200 bg-red-50 text-red-700"
                  : issue.severity === "medium"
                    ? "border-orange-200 bg-orange-50 text-orange-700"
                    : "border-yellow-200 bg-yellow-50 text-yellow-700",
              )}
            >
              {issue.severity} Severity
            </span>
            <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
              {Math.round(issue.confidence * 100)}% Confidence
            </span>
          </div>
          <DrawerTitle className="text-xl font-bold">{issue.title}</DrawerTitle>
          <DrawerDescription className="mt-1 text-sm">
            {issue.description}
          </DrawerDescription>
        </DrawerHeader>

        <div className="space-y-6 p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                Status
              </p>
              <p className="text-sm font-bold capitalize">
                {issue.status.replace("_", " ")}
              </p>
            </div>
            <div className="rounded-2xl border border-border/50 bg-muted/30 p-3">
              <p className="mb-1 text-[10px] font-bold uppercase tracking-tight text-muted-foreground">
                Community Signals
              </p>
              <p className="text-sm font-bold">{issue.reportsCount} reports</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">
                Agree
              </p>
              <p className="mt-1 text-lg font-bold text-emerald-900">
                {issue.confirmationsCount}
              </p>
            </div>
            <div className="rounded-2xl border border-rose-100 bg-rose-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-rose-700">
                Disagree
              </p>
              <p className="mt-1 text-lg font-bold text-rose-900">
                {issue.disagreementsCount}
              </p>
            </div>
            <div className="rounded-2xl border border-sky-100 bg-sky-50 p-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-sky-700">
                Fixed
              </p>
              <p className="mt-1 text-lg font-bold text-sky-900">
                {issue.fixedSignalsCount}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-dashed bg-muted/20 p-3 text-muted-foreground">
            <div className="flex items-center gap-3">
              <HugeiconsIcon
                icon={MapsLocation01Icon}
                className="h-5 w-5 flex-shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-foreground">
                  {issue.locationName}
                </span>
                <span className="text-[10px]">
                  {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}
                </span>
              </div>
            </div>
          </div>

          {(issue.photoUrls.length > 0 || issue.videoUrl) && (
            <div className="space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
                Evidence
              </p>
              {issue.photoUrls.length > 0 && (
                <div className="grid grid-cols-3 gap-2">
                  {issue.photoUrls.slice(0, 3).map((photoUrl) => (
                    <img
                      key={photoUrl}
                      src={photoUrl}
                      alt="Issue evidence"
                      className="h-24 w-full rounded-2xl border border-border/40 object-cover"
                    />
                  ))}
                </div>
              )}
              {issue.videoUrl && (
                <a
                  href={issue.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 rounded-2xl border border-border/50 bg-muted/20 p-3"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-white">
                    <HugeiconsIcon icon={PlayIcon} className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-foreground">View uploaded video</p>
                    <p className="text-xs text-muted-foreground">
                      Open the attached clip in a new tab
                    </p>
                  </div>
                </a>
              )}
            </div>
          )}

          <div className="pt-2">
            <div className="flex gap-3 border-t border-dashed pt-4">
              <HugeiconsIcon
                icon={AiBrain01Icon}
                className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground/90"
              />
              <div className="space-y-2">
                <p className="text-[10px] font-medium leading-relaxed text-muted-foreground/90">
                  <span className="mr-1 font-bold text-foreground">
                    Verify this incident:
                  </span>
                  Your agreement or disagreement changes the issue confidence score
                  and helps responders sort real signals faster.
                </p>
                <div
                  className={cn(
                    "inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest",
                    userReaction === "confirm"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : userReaction === "disagree"
                        ? "border-rose-200 bg-rose-50 text-rose-700"
                        : "border-border/60 bg-background text-muted-foreground",
                  )}
                >
                  {userReactionLabel}
                </div>
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="flex-row gap-3 border-t px-6 pb-8 pt-2">
          <Button
            variant="outline"
            className={cn(
              "h-12 flex-1 gap-2 rounded-2xl border-red-200 hover:bg-red-50 hover:text-red-700",
              userReaction === "disagree" && "bg-red-50 text-red-700",
            )}
            onClick={() => onDisagree(issue.id)}
            disabled={!canReact || isSubmittingReaction}
          >
            <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
            <span className="font-bold">Disagree</span>
          </Button>
          <Button
            className={cn(
              "h-12 flex-1 gap-2 rounded-2xl bg-primary text-white",
              userReaction === "confirm" && "ring-2 ring-primary/20",
            )}
            onClick={() => onConfirm(issue.id)}
            disabled={!canReact || isSubmittingReaction}
          >
            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
            <span className="font-bold">Agree</span>
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
