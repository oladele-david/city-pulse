import { useRef } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Camera01Icon,
  Note01Icon,
  VideoReplayIcon,
} from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ReportActions } from "./ReportActions";
import { IssueSeverity } from "@/types/api";

interface DetailsStepProps {
  note: string;
  severity: IssueSeverity;
  imagePreviews: string[];
  videoPreview: string | null;
  onNoteChange: (val: string) => void;
  onSeverityChange: (severity: IssueSeverity) => void;
  onImageFilesChange: (files: File[]) => void;
  onImagePreviewsChange: (value: string[]) => void;
  onVideoFileChange: (file: File | null) => void;
  onVideoPreviewChange: (value: string | null) => void;
  onBack: () => void;
  onSubmit: () => void;
  isSubmitting: boolean;
}

async function filesToDataUrls(files: File[]) {
  const reads = files.map(
    (file) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result ?? ""));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      }),
  );

  return Promise.all(reads);
}

export const DetailsStep = ({
  note,
  severity,
  imagePreviews,
  videoPreview,
  onNoteChange,
  onSeverityChange,
  onImageFilesChange,
  onImagePreviewsChange,
  onVideoFileChange,
  onVideoPreviewChange,
  onBack,
  onSubmit,
  isSubmitting,
}: DetailsStepProps) => {
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const nextFiles = Array.from(event.target.files ?? []).slice(0, 5);
    if (nextFiles.length === 0) {
      return;
    }

    const previews = await filesToDataUrls(nextFiles);
    onImageFilesChange(nextFiles);
    onImagePreviewsChange(previews);
  };

  const handleVideoChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const [preview] = await filesToDataUrls([file]);
    onVideoFileChange(file);
    onVideoPreviewChange(preview);
  };

  return (
    <div className="flex flex-col gap-6 px-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="space-y-1">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Add details
        </h2>
        <p className="text-sm font-medium text-muted-foreground">
          Add notes plus up to 5 images or a short video to help confirm the issue.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(event) => void handleImageChange(event)}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(event) => void handleVideoChange(event)}
        />

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            className="rounded-3xl border-2 border-dashed border-border/60 bg-muted/30 p-4 text-left transition-all active:bg-muted/50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
              <HugeiconsIcon
                icon={Camera01Icon}
                className="h-5 w-5 text-muted-foreground"
              />
            </div>
            <p className="text-sm font-bold text-foreground">Upload images</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Add street-level photos, damage close-ups, or context shots.
            </p>
          </button>

          <button
            type="button"
            onClick={() => videoInputRef.current?.click()}
            className="rounded-3xl border-2 border-dashed border-border/60 bg-muted/30 p-4 text-left transition-all active:bg-muted/50"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border/60 bg-background shadow-sm">
              <HugeiconsIcon
                icon={VideoReplayIcon}
                className="h-5 w-5 text-muted-foreground"
              />
            </div>
            <p className="text-sm font-bold text-foreground">Upload video</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              One short clip can show motion, traffic buildup, or flood spread.
            </p>
          </button>
        </div>

        {imagePreviews.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Images
              </span>
              <button
                type="button"
                onClick={() => {
                  onImageFilesChange([]);
                  onImagePreviewsChange([]);
                  if (imageInputRef.current) {
                    imageInputRef.current.value = "";
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Clear
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {imagePreviews.map((preview, index) => (
                <div
                  key={`${preview}-${index}`}
                  className="relative overflow-hidden rounded-2xl border border-border/50"
                >
                  <img
                    src={preview}
                    alt={`Issue preview ${index + 1}`}
                    className="h-24 w-full object-cover"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {videoPreview && (
          <div className="space-y-2">
            <div className="flex items-center justify-between px-1">
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Video
              </span>
              <button
                type="button"
                onClick={() => {
                  onVideoFileChange(null);
                  onVideoPreviewChange(null);
                  if (videoInputRef.current) {
                    videoInputRef.current.value = "";
                  }
                }}
                className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
              >
                Remove
              </button>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-border/50">
              <video
                src={videoPreview}
                controls
                className="h-48 w-full bg-black object-cover"
              />
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="mb-1 flex items-center gap-2 px-1">
            <HugeiconsIcon icon={Note01Icon} className="h-4 w-4 text-primary" />
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Additional Notes
            </span>
          </div>
          <textarea
            value={note}
            onChange={(event) => onNoteChange(event.target.value.slice(0, 240))}
            placeholder="Explain what is happening, how long it has lasted, and who it affects."
            className="h-32 w-full resize-none rounded-2xl border-2 border-border/60 bg-muted/20 p-5 text-[15px] font-medium outline-none transition-all placeholder:text-muted-foreground/50 focus:border-primary/30 focus:bg-background"
          />
          <div className="flex justify-between px-2">
            <span className="text-[10px] font-medium text-muted-foreground">
              More context improves verification confidence.
            </span>
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                note.length >= 200 ? "text-amber-500" : "text-muted-foreground/40",
              )}
            >
              {note.length}/240
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
              Severity
            </span>
            <span className="text-[10px] text-muted-foreground">
              Helps operators prioritize faster
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(["low", "medium", "high"] as IssueSeverity[]).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => onSeverityChange(value)}
                className={cn(
                  "h-12 rounded-2xl border text-sm font-bold capitalize transition-all",
                  severity === value
                    ? "border-primary bg-primary text-white shadow-lg shadow-primary/20"
                    : "border-border/60 bg-background text-foreground",
                )}
              >
                {value === "high" ? "High" : value === "medium" ? "Medium" : "Low"}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ReportActions
        step={3}
        onBack={onBack}
        onNext={onSubmit}
        isSubmitting={isSubmitting}
        disabled={note.trim().length < 5}
      />
    </div>
  );
};
