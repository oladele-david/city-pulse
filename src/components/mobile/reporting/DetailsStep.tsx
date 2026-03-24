import { useState, useRef } from 'react';
import { HugeiconsIcon } from "@hugeicons/react";
import { Camera01Icon, Note01Icon, Delete02Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { ReportActions } from "./ReportActions";

interface DetailsStepProps {
    note: string;
    onNoteChange: (val: string) => void;
    imagePreview: string | null;
    onImageChange: (val: string | null) => void;
    onBack: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export const DetailsStep = ({
    note,
    onNoteChange,
    imagePreview,
    onImageChange,
    onBack,
    onSubmit,
    isSubmitting
}: DetailsStepProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                onImageChange(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        onImageChange(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="flex flex-col gap-6 px-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">Add details</h2>
                <p className="text-sm text-muted-foreground font-medium">Include a photo or note to help verify the issue.</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*"
                    className="hidden"
                />

                <div
                    onClick={handleImageClick}
                    onKeyDown={(e) => e.key === 'Enter' && handleImageClick()}
                    role="button"
                    tabIndex={0}
                    className={cn(
                        "h-48 bg-muted/30 border-2 border-dashed border-border/60 rounded-2xl flex flex-col items-center justify-center gap-3 active:bg-muted/50 transition-all overflow-hidden relative group cursor-pointer outline-none focus:ring-2 focus:ring-primary/20",
                        imagePreview && "border-solid border-primary/40 bg-background"
                    )}
                >
                    {imagePreview ? (
                        <>
                            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-white font-bold text-sm">Change Photo</span>
                            </div>
                            <button
                                onClick={removeImage}
                                type="button"
                                className="absolute top-3 right-3 w-8 h-8 bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center text-white active:scale-90 transition-all z-10"
                            >
                                <HugeiconsIcon icon={Delete02Icon} className="w-4 h-4" />
                            </button>
                        </>
                    ) : (
                        <>
                            <div className="w-14 h-14 bg-background rounded-2xl flex items-center justify-center shadow-sm border border-border/60">
                                <HugeiconsIcon icon={Camera01Icon} className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <span className="text-sm font-bold text-muted-foreground">Upload or take photo</span>
                        </>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-1 px-1">
                        <HugeiconsIcon icon={Note01Icon} className="w-4 h-4 text-primary" />
                        <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Additional Notes</span>
                    </div>
                    <textarea
                        value={note}
                        onChange={(e) => onNoteChange(e.target.value.slice(0, 120))}
                        placeholder="Explain the situation briefly..."
                        className="w-full h-32 p-5 rounded-2xl bg-muted/20 border-2 border-border/60 focus:border-primary/30 focus:bg-background transition-all resize-none text-[15px] font-medium placeholder:text-muted-foreground/50 outline-none"
                    />
                    <div className="flex justify-end px-2">
                        <span className={cn(
                            "text-[10px] font-bold tracking-widest uppercase",
                            note.length >= 100 ? "text-amber-500" : "text-muted-foreground/40"
                        )}>
                            {note.length}/120
                        </span>
                    </div>
                </div>
            </div>

            <ReportActions
                step={3}
                onBack={onBack}
                onNext={onSubmit}
                isSubmitting={isSubmitting}
                disabled={!imagePreview || note.length < 5}
            />
        </div>
    );
};
