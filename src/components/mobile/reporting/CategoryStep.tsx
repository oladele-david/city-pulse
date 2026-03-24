import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { ReportActions } from "./ReportActions";

interface Category {
    id: string;
    name: string;
    icon: any;
}

interface CategoryStepProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelect: (id: string) => void;
    onNext: () => void;
}

export const CategoryStep = ({
    categories,
    selectedCategory,
    onSelect,
    onNext
}: CategoryStepProps) => {
    return (
        <div className="flex flex-col gap-6 px-4 pt-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-1">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">What's the issue?</h2>
                <p className="text-sm text-muted-foreground font-medium">Select a category that best describes the problem.</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => onSelect(cat.id)}
                        className={cn(
                            "flex flex-col items-start justify-center gap-2 h-24 p-4 rounded-2xl border-2 transition-all active:scale-[0.98] relative",
                            selectedCategory === cat.id
                                ? "border-primary bg-primary/5 shadow-sm"
                                : "border-border/40 bg-background hover:bg-muted/5"
                        )}
                    >
                        <div className={cn(
                            "w-10 h-10 flex items-center justify-center shrink-0 transition-colors",
                            selectedCategory === cat.id ? "text-primary" : "text-muted-foreground/60"
                        )}>
                            <HugeiconsIcon icon={cat.icon} className="w-7 h-7" />
                        </div>
                        <span className={cn(
                            "text-[12px] font-semibold text-left leading-tight transition-colors",
                            selectedCategory === cat.id ? "text-primary" : "text-foreground"
                        )}>{cat.name}</span>
                    </button>
                ))}
            </div>

            <ReportActions
                step={1}
                onBack={() => { }}
                onNext={onNext}
                showBack={false}
                disabled={!selectedCategory}
            />
        </div>
    );
};
