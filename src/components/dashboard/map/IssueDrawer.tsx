import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Cancel01Icon,
    Location01Icon,
    Time02Icon,
    CheckmarkCircle02Icon,
    AiBrain01Icon,
    SparklesIcon
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { cn } from "@/lib/utils";
import { Issue } from "@/data/mockIssues";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

interface IssueDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    issue: Issue | null;
}

export const IssueDrawer = ({ isOpen, onClose, issue }: IssueDrawerProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [currentStatus, setCurrentStatus] = useState<string>("");

    // Simulate loading and state sync when issue changes
    useEffect(() => {
        if (issue) {
            setIsLoading(true);
            setCurrentStatus(issue.status);
            // Simulate network delay for "loading" fresh data
            const timer = setTimeout(() => {
                setIsLoading(false);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [issue]);

    const handleStatusChange = (value: string) => {
        setCurrentStatus(value);
        toast.success(`Status updated to ${value === 'in_progress' ? 'In Progress' : value.charAt(0).toUpperCase() + value.slice(1)}`);
    };

    const handleMarkResolved = () => {
        setCurrentStatus("resolved");
        toast.success("Issue marked as resolved");
        // in a real app, this would trigger an API call
    };

    if (!isOpen) return null;

    return (
        <div className="absolute top-4 bottom-4 right-4 w-96 bg-background/95 backdrop-blur-md shadow-2xl rounded-xl z-20 border border-border/10 flex flex-col overflow-hidden animate-in slide-in-from-right duration-300 ease-out">
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
                <h3 className="font-semibold">Issue Details</h3>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-background/50" onClick={onClose}>
                    <HugeiconsIcon icon={Cancel01Icon} className="w-4 h-4" />
                </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 [&::-webkit-scrollbar]:w-[2px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-border/30 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-border/50">
                {issue ? (
                    isLoading ? (
                        // Skeleton Loader
                        <div className="space-y-4">
                            <div className="flex gap-2">
                                <Skeleton className="h-5 w-24 rounded-full" />
                                <Skeleton className="h-5 w-20 rounded-full" />
                            </div>
                            <Skeleton className="h-8 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                            <div className="space-y-2 pt-4">
                                <Skeleton className="h-10 w-full" />
                            </div>
                            <div className="space-y-2 pt-2">
                                <Skeleton className="h-32 w-full" />
                            </div>
                        </div>
                    ) : (
                        // Actual Content
                        <>
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded-full text-xs font-medium border",
                                        issue.severity === 'high' ? "bg-red-50 text-red-700 border-red-200" :
                                            issue.severity === 'medium' ? "bg-orange-50 text-orange-700 border-orange-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                                    )}>
                                        {issue.severity === 'high' ? "High Severity" :
                                            issue.severity === 'medium' ? "Medium Severity" : "Low Severity"}
                                    </span>
                                    <span className="text-xs text-muted-foreground border px-2 py-0.5 rounded-full">
                                        {Math.round(issue.confidence * 100)}% Confidence
                                    </span>
                                </div>
                                <h2 className="text-xl font-bold leading-tight mb-2">{issue.title}</h2>
                                <p className="text-sm text-muted-foreground mb-3">{issue.description}</p>
                                <div className="flex items-center text-xs text-muted-foreground gap-1 bg-muted/50 p-2 rounded-lg">
                                    <HugeiconsIcon icon={Location01Icon} className="w-3.5 h-3.5" />
                                    <span>{issue.location_name} • {issue.latitude.toFixed(4)}, {issue.longitude.toFixed(4)}</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                                <Select value={currentStatus} onValueChange={handleStatusChange}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="open">Open</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="resolved">Resolved</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Timeline Section */}
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Timeline</h4>
                                <div className="relative pl-4 space-y-6">
                                    {/* Dynamic Timeline Line */}
                                    <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border/30">
                                        <div className="absolute top-0 left-0 w-full bg-primary transition-all duration-500" style={{ height: '90%' }} />
                                    </div>

                                    {issue.updates.map((update, idx) => (
                                        <div key={idx} className="relative">
                                            <div className="absolute -left-[16px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background z-10" />
                                            <p className="text-sm font-medium">{update.status}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{update.timestamp}</p>
                                            <p className="text-xs text-muted-foreground mt-1 bg-muted/30 p-2 rounded">{update.description}</p>
                                        </div>
                                    ))}
                                    <div className="relative">
                                        <div className="absolute -left-[16px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary/50 ring-4 ring-background z-10" />
                                        <p className="text-sm font-medium text-muted-foreground">Issue Created</p>
                                        <p className="text-xs text-muted-foreground mt-0.5">3 days ago</p>
                                    </div>
                                </div>
                            </div>

                            {/* AI Analysis Section */}
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <HugeiconsIcon icon={AiBrain01Icon} className="w-4 h-4 text-accent" />
                                    <h4 className="text-sm font-medium text-foreground">AI Analysis</h4>
                                </div>

                                <div className="bg-accent/5 border border-accent/50 rounded-lg p-3 space-y-3">
                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <HugeiconsIcon icon={SparklesIcon} className="w-3 h-3 text-accent" />
                                            <h5 className="text-xs font-semibold text-accent">Root Cause Prediction</h5>
                                        </div>
                                        <p className="text-xs text-accent leading-relaxed">
                                            Pattern analysis suggests 85% probability of {issue.type === 'road' ? 'sub-surface soil erosion due to recent heavy rains' : 'aging infrastructure affecting successful resource distribution'}.
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-3 h-3 text-accent" />
                                            <h5 className="text-xs font-semibold text-accent">Recommended Action</h5>
                                        </div>
                                        <p className="text-xs text-accent leading-relaxed">
                                            Dispatch {issue.type === 'road' ? 'Geo-Technical Assessment Unit' : 'Level 2 Maintenance Crew'} with ground penetrating radar within 4 hours to prevent severity escalation.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </>
                    )
                ) : (
                    <div className="flex h-full items-center justify-center text-center text-muted-foreground p-8">
                        <div>
                            <HugeiconsIcon icon={Location01Icon} className="w-12 h-12 mx-auto mb-2 opacity-20" />
                            <p>Select a marker on the map to view details</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            {issue && !isLoading && (
                <div className="p-4 border-t bg-muted/30">
                    <Button
                        className="w-full gap-2"
                        onClick={handleMarkResolved}
                        disabled={currentStatus === 'resolved'}
                        variant={currentStatus === 'resolved' ? "secondary" : "default"}
                    >
                        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="w-4 h-4" />
                        {currentStatus === 'resolved' ? "Resolved" : "Mark as Resolved"}
                    </Button>
                </div>
            )}
        </div>
    );
};
