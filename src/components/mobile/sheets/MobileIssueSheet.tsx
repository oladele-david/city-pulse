import { useState } from "react";
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
import { MediaLightbox } from "@/components/mobile/ui/MediaLightbox";
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
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!issue) return null;

  const mediaItems = [
    ...issue.photoUrls.map((url) => ({ type: "image" as const, url })),
    ...(issue.videoUrl ? [{ type: "video" as const, url: issue.videoUrl }] : []),
  ];

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const userReactionLabel =
    userReaction === "confirm"
      ? "You agreed"
      : userReaction === "disagree"
        ? "You disagreed"
        : userReaction === "fixed_signal"
          ? "Marked as fixed"
          : null;

  return (
    <>
      <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DrawerContent className="mx-auto max-w-md rounded-t-2xl border-t max-h-[75vh] flex flex-col">
          <DrawerHeader className="border-b px-4 pb-3 pt-4 text-left shrink-0">
            <div className="mb-1.5 flex items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-bold",
                  issue.severity === "high"
                    ? "border-red-200 bg-red-50 text-red-700"
                    : issue.severity === "medium"
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-yellow-200 bg-yellow-50 text-yellow-700",
                )}
              >
                {issue.severity}
              </span>
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                {Math.round(issue.confidence * 100)}%
              </span>
              <span className="rounded-full border px-2 py-0.5 text-[10px] font-bold text-muted-foreground capitalize">
                {issue.status.replace("_", " ")}
              </span>
            </div>
            <DrawerTitle className="text-base font-bold leading-tight">{issue.title}</DrawerTitle>
            <DrawerDescription className="mt-0.5 text-xs line-clamp-2">
              {issue.description}
            </DrawerDescription>
          </DrawerHeader>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {/* Stats row */}
            <div className="flex items-center gap-2">
              <div className="flex-1 rounded-xl border bg-emerald-50 border-emerald-100 px-2.5 py-2 text-center">
                <p className="text-xs font-bold text-emerald-800">{issue.confirmationsCount}</p>
                <p className="text-[9px] text-emerald-600">Agree</p>
              </div>
              <div className="flex-1 rounded-xl border bg-rose-50 border-rose-100 px-2.5 py-2 text-center">
                <p className="text-xs font-bold text-rose-800">{issue.disagreementsCount}</p>
                <p className="text-[9px] text-rose-600">Disagree</p>
              </div>
              <div className="flex-1 rounded-xl border bg-sky-50 border-sky-100 px-2.5 py-2 text-center">
                <p className="text-xs font-bold text-sky-800">{issue.fixedSignalsCount}</p>
                <p className="text-[9px] text-sky-600">Fixed</p>
              </div>
              <div className="flex-1 rounded-xl border bg-muted/30 px-2.5 py-2 text-center">
                <p className="text-xs font-bold text-foreground">{issue.reportsCount}</p>
                <p className="text-[9px] text-muted-foreground">Signals</p>
              </div>
            </div>

            {/* Location + time */}
            <div className="flex items-center gap-2 rounded-xl border border-dashed bg-muted/20 px-3 py-2">
              <HugeiconsIcon icon={MapsLocation01Icon} className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-foreground truncate">{issue.locationName}</p>
                <p className="text-[10px] text-muted-foreground">{issue.createdAtLabel} · {issue.createdAtRelative}</p>
              </div>
            </div>

            {/* Evidence — clickable thumbnails */}
            {mediaItems.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground">Evidence</p>
                <div className="flex gap-2 overflow-x-auto">
                  {mediaItems.map((item, i) => (
                    <button
                      key={item.url}
                      onClick={() => openLightbox(i)}
                      className="relative shrink-0 h-20 w-20 overflow-hidden rounded-xl border border-border/40"
                    >
                      {item.type === "image" ? (
                        <img
                          src={item.url}
                          alt={`Evidence ${i + 1}`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <HugeiconsIcon icon={PlayIcon} className="h-6 w-6 text-primary" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Reaction info */}
            <div className="flex items-start gap-2 border-t border-dashed pt-3">
              <HugeiconsIcon icon={AiBrain01Icon} className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">
                  Your reaction changes the confidence score and helps responders sort real signals faster.
                </p>
                {userReactionLabel && (
                  <span
                    className={cn(
                      "mt-1.5 inline-flex rounded-full border px-2.5 py-0.5 text-[10px] font-bold",
                      userReaction === "confirm"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : userReaction === "disagree"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : "border-border/60 bg-background text-muted-foreground",
                    )}
                  >
                    {userReactionLabel}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Footer actions */}
          <DrawerFooter className="flex-row gap-2 border-t px-4 pb-6 pt-2 shrink-0">
            <Button
              variant="outline"
              className={cn(
                "h-11 flex-1 gap-2 rounded-xl border-red-200 hover:bg-red-50 hover:text-red-700",
                userReaction === "disagree" && "bg-red-50 text-red-700",
              )}
              onClick={() => onDisagree(issue.id)}
              disabled={!canReact || isSubmittingReaction}
            >
              <HugeiconsIcon icon={Cancel01Icon} className="h-4 w-4" />
              <span className="font-bold text-sm">Disagree</span>
            </Button>
            <Button
              className={cn(
                "h-11 flex-1 gap-2 rounded-xl bg-primary text-white",
                userReaction === "confirm" && "ring-2 ring-primary/20",
              )}
              onClick={() => onConfirm(issue.id)}
              disabled={!canReact || isSubmittingReaction}
            >
              <HugeiconsIcon icon={CheckmarkCircle02Icon} className="h-4 w-4" />
              <span className="font-bold text-sm">Agree</span>
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <MediaLightbox
        items={mediaItems}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </>
  );
};
