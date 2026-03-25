import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  BlackHole01Icon,
  IdeaIcon,
  RoadIcon,
  ThermometerWarmIcon,
  VolumeHighIcon,
} from "@hugeicons/core-free-icons";
import { toast } from "@/components/ui/sonner";
import { api, ApiError } from "@/lib/api";
import { useCitizenAuth } from "@/hooks/use-auth";
import { useCitizenLocation } from "@/hooks/use-citizen-location";
import { issueQueryKeys } from "@/hooks/use-live-issues";
import { IssueSeverity } from "@/types/api";

import { CategoryStep } from "@/components/mobile/reporting/CategoryStep";
import { DetailsStep } from "@/components/mobile/reporting/DetailsStep";
import { LocationStep } from "@/components/mobile/reporting/LocationStep";
import { ReportProgress } from "@/components/mobile/reporting/ReportProgress";
import { SuccessStep } from "@/components/mobile/reporting/SuccessStep";

const CATEGORIES = [
  { id: "road", name: "Roads & Potholes", icon: RoadIcon },
  { id: "drainage", name: "Drainage & Water", icon: BlackHole01Icon },
  { id: "lighting", name: "Street Lighting", icon: IdeaIcon },
  { id: "noise", name: "Noise Complaint", icon: VolumeHighIcon },
  { id: "heat", name: "Heat Island/AC", icon: ThermometerWarmIcon },
];

const MobileReport = () => {
  const navigate = useNavigate();
  const { session } = useCitizenAuth();
  const location = useCitizenLocation();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [markerLocation, setMarkerLocation] = useState(location.coordinates);
  const [hasAdjustedLocation, setHasAdjustedLocation] = useState(false);
  const [note, setNote] = useState("");
  const [severity, setSeverity] = useState<IssueSeverity>("medium");
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [submittedIssueId, setSubmittedIssueId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasAdjustedLocation) {
      setMarkerLocation(location.coordinates);
    }
  }, [hasAdjustedLocation, location.coordinates]);

  const resolvedLocationQuery = useQuery({
    queryKey: ["resolved-location", markerLocation.latitude, markerLocation.longitude],
    queryFn: () =>
      api.resolveLocation({
        latitude: markerLocation.latitude,
        longitude: markerLocation.longitude,
      }),
  });

  const submitIssueMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCategory) {
        throw new Error("Issue category is missing.");
      }
      if (!resolvedLocationQuery.data) {
        throw new Error("Location is still being resolved.");
      }

      const resolvedLocation = resolvedLocationQuery.data;
      const categoryName =
        CATEGORIES.find((item) => item.id === selectedCategory)?.name ??
        selectedCategory;
      const streetLabel =
        resolvedLocation.street ?? resolvedLocation.community.name;

      if (!session?.accessToken) {
        throw new Error("Citizen session is not available.");
      }

      return api.createIssue(
        {
          type: selectedCategory,
          title: `${categoryName} reported near ${streetLabel}`,
          description: note.trim(),
          severity,
          lgaId: resolvedLocation.lga.id,
          communityId: resolvedLocation.community.id,
          streetOrLandmark: streetLabel,
          latitude: markerLocation.latitude,
          longitude: markerLocation.longitude,
          imageFiles,
          videoFile,
        },
        session.accessToken,
      );
    },
    onSuccess: (issue) => {
      queryClient.setQueriesData(
        { queryKey: issueQueryKeys.all },
        (current: unknown) => {
          if (!Array.isArray(current)) {
            return current;
          }

          const existingIssue = current.find(
            (item): item is { id: string } =>
              Boolean(item) &&
              typeof item === "object" &&
              "id" in item &&
              typeof item.id === "string" &&
              item.id === issue.id,
          );

          return existingIssue ? current : [issue, ...current];
        },
      );
      void queryClient.invalidateQueries({ queryKey: issueQueryKeys.all });
      setSubmittedIssueId(issue.id);
      setStep(4);
      toast.success("Your issue has been submitted to CityPulse.");
    },
    onError: (error) => {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "Unable to submit your report right now.",
      );
    },
  });

  const handleNext = () => {
    if (step === 1 && !selectedCategory) {
      toast.error("Required", {
        description: "Please select a category to continue.",
      });
      return;
    }
    if (step === 2 && !resolvedLocationQuery.data) {
      toast.error("Location unavailable", {
        description: "Please wait for Lagos location matching to complete.",
      });
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    if (step === 1) {
      navigate("/mobile");
    } else {
      setStep(step - 1);
    }
  };

  const resetFlow = () => {
    setStep(1);
    setSelectedCategory(null);
    setMarkerLocation(location.coordinates);
    setHasAdjustedLocation(false);
    setNote("");
    setSeverity("medium");
    setImagePreviews([]);
    setImageFiles([]);
    setVideoPreview(null);
    setVideoFile(null);
    setSubmittedIssueId(null);
  };

  const handleSubmit = () => {
    submitIssueMutation.mutate();
  };

  return (
    <div className="custom-scrollbar flex h-full flex-col overflow-y-auto bg-background">
      <ReportProgress step={step} />

      <div className="flex-1 pb-24">
        {step === 1 && (
          <CategoryStep
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onNext={handleNext}
          />
        )}

        {step === 2 && (
          <LocationStep
            markerLocation={markerLocation}
            resolvedLocation={resolvedLocationQuery.data}
            isResolvingLocation={
              resolvedLocationQuery.isLoading || resolvedLocationQuery.isFetching
            }
            locationSource={location.source}
            hasPromptedLocation={location.hasPrompted}
            canRequestLocation={location.canRequestLocation}
            locationMessage={location.locationErrorMessage}
            onRequestLocation={location.requestLocation}
            onDismissLocationPrompt={location.dismissPrompt}
            onLocationChange={(nextLocation) => {
              setHasAdjustedLocation(true);
              setMarkerLocation(nextLocation);
            }}
            onBack={handleBack}
            onNext={handleNext}
          />
        )}

        {step === 3 && (
          <DetailsStep
            note={note}
            severity={severity}
            onNoteChange={setNote}
            onSeverityChange={setSeverity}
            imagePreviews={imagePreviews}
            onImageFilesChange={setImageFiles}
            onImagePreviewsChange={setImagePreviews}
            videoPreview={videoPreview}
            onVideoFileChange={setVideoFile}
            onVideoPreviewChange={setVideoPreview}
            onBack={handleBack}
            onSubmit={handleSubmit}
            isSubmitting={submitIssueMutation.isPending}
          />
        )}

        {step === 4 && (
          <SuccessStep
            onReset={resetFlow}
            issueId={submittedIssueId ?? undefined}
            locationLabel={
              resolvedLocationQuery.data
                ? `${resolvedLocationQuery.data.community.name}, ${resolvedLocationQuery.data.lga.name}`
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default MobileReport;
