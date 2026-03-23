import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Issue } from "@/data/mockIssues";

interface IssueHeaderProps {
    issue: Issue;
}

export const IssueHeader = ({ issue }: IssueHeaderProps) => {
    return (
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
    );
};
