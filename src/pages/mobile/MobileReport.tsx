import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
    RoadIcon,
    BlackHole01Icon,
    IdeaIcon,
    VolumeHighIcon,
    ThermometerWarmIcon
} from "@hugeicons/core-free-icons";
import { toast } from '@/components/ui/sonner';
import { api, ApiError } from '@/lib/api';
import { IssueSeverity } from '@/types/api';

// Refactored sub-components
import { ReportProgress } from '@/components/mobile/reporting/ReportProgress';
import { CategoryStep } from '@/components/mobile/reporting/CategoryStep';
import { LocationStep } from '@/components/mobile/reporting/LocationStep';
import { DetailsStep } from '@/components/mobile/reporting/DetailsStep';
import { SuccessStep } from '@/components/mobile/reporting/SuccessStep';

const DUMMY_USER_LOCATION = {
    latitude: 6.6018,
    longitude: 3.3515
};

const CATEGORIES = [
    { id: 'road', name: 'Roads & Potholes', icon: RoadIcon },
    { id: 'drainage', name: 'Drainage & Water', icon: BlackHole01Icon },
    { id: 'lighting', name: 'Street Lighting', icon: IdeaIcon },
    { id: 'noise', name: 'Noise Complaint', icon: VolumeHighIcon },
    { id: 'heat', name: 'Heat Island/AC', icon: ThermometerWarmIcon },
];

const MobileReport = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [markerLocation, setMarkerLocation] = useState(DUMMY_USER_LOCATION);
    const [note, setNote] = useState('');
    const [severity, setSeverity] = useState<IssueSeverity>('medium');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [submittedIssueId, setSubmittedIssueId] = useState<string | null>(null);

    const resolvedLocationQuery = useQuery({
        queryKey: ['resolved-location', markerLocation.latitude, markerLocation.longitude],
        queryFn: () => api.resolveLocation({
            latitude: markerLocation.latitude,
            longitude: markerLocation.longitude,
        }),
    });

    const submitIssueMutation = useMutation({
        mutationFn: async () => {
            if (!selectedCategory) {
                throw new Error('Issue category is missing.');
            }
            if (!resolvedLocationQuery.data) {
                throw new Error('Location is still being resolved.');
            }

            const citizenSession = await api.ensureCitizenSession();
            const resolvedLocation = resolvedLocationQuery.data;
            const categoryName = CATEGORIES.find((item) => item.id === selectedCategory)?.name ?? selectedCategory;
            const streetLabel = resolvedLocation.street ?? resolvedLocation.community.name;

            return api.createIssue({
                type: selectedCategory,
                title: `${categoryName} reported near ${streetLabel}`,
                description: note.trim(),
                severity,
                lgaId: resolvedLocation.lga.id,
                communityId: resolvedLocation.community.id,
                streetOrLandmark: streetLabel,
                latitude: markerLocation.latitude,
                longitude: markerLocation.longitude,
                imageFile,
            }, citizenSession.accessToken);
        },
        onSuccess: (issue) => {
            setSubmittedIssueId(issue.id);
            setStep(4);
            toast.success('Your issue has been submitted to CityPulse.');
        },
        onError: (error) => {
            toast.error(
                error instanceof ApiError ? error.message : 'Unable to submit your report right now.',
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
        if (step === 2 && !markerLocation) {
            toast.error("Required", {
                description: "Please set a location for the report.",
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
            navigate('/mobile');
        } else {
            setStep(step - 1);
        }
    };

    const resetFlow = () => {
        setStep(1);
        setSelectedCategory(null);
        setMarkerLocation(DUMMY_USER_LOCATION);
        setNote('');
        setSeverity('medium');
        setImagePreview(null);
        setImageFile(null);
        setSubmittedIssueId(null);
    };

    const handleSubmit = () => {
        submitIssueMutation.mutate();
    };

    return (
        <div className="flex flex-col h-full bg-background overflow-y-auto custom-scrollbar">
            {/* Header progress */}
            <ReportProgress step={step} />

            {/* Main content area */}
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
                        isResolvingLocation={resolvedLocationQuery.isLoading || resolvedLocationQuery.isFetching}
                        onLocationChange={setMarkerLocation}
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
                        imagePreview={imagePreview}
                        onImageFileChange={setImageFile}
                        onImageChange={setImagePreview}
                        onBack={handleBack}
                        onSubmit={handleSubmit}
                        isSubmitting={submitIssueMutation.isPending}
                    />
                )}

                {step === 4 && (
                    <SuccessStep
                        onReset={resetFlow}
                        issueId={submittedIssueId ?? undefined}
                        locationLabel={resolvedLocationQuery.data
                            ? `${resolvedLocationQuery.data.community.name}, ${resolvedLocationQuery.data.lga.name}`
                            : undefined}
                    />
                )}
            </div>
        </div>
    );
};

export default MobileReport;
