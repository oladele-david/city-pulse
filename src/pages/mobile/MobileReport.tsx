import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    RoadIcon,
    BlackHole01Icon,
    IdeaIcon,
    VolumeHighIcon,
    ThermometerWarmIcon
} from "@hugeicons/core-free-icons";
import { toast } from '@/components/ui/sonner';

// Refactored sub-components
import { ReportProgress } from '@/components/mobile/reporting/ReportProgress';
import { CategoryStep } from '@/components/mobile/reporting/CategoryStep';
import { LocationStep } from '@/components/mobile/reporting/LocationStep';
import { DetailsStep } from '@/components/mobile/reporting/DetailsStep';
import { SuccessStep } from '@/components/mobile/reporting/SuccessStep';

const DUMMY_USER_LOCATION = {
    latitude: 25.1972,
    longitude: 55.2744
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
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        setImagePreview(null);
    };

    const handleSubmit = () => {
        setIsSubmitting(true);
        setTimeout(() => {
            setIsSubmitting(false);
            setStep(4);
        }, 1500);
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
                        onLocationChange={setMarkerLocation}
                        onBack={handleBack}
                        onNext={handleNext}
                    />
                )}

                {step === 3 && (
                    <DetailsStep
                        note={note}
                        onNoteChange={setNote}
                        imagePreview={imagePreview}
                        onImageChange={setImagePreview}
                        onBack={handleBack}
                        onSubmit={handleSubmit}
                        isSubmitting={isSubmitting}
                    />
                )}

                {step === 4 && <SuccessStep onReset={resetFlow} />}
            </div>
        </div>
    );
};

export default MobileReport;
