import { HugeiconsIcon } from "@hugeicons/react";
import { Location01Icon } from "@hugeicons/core-free-icons";
import { cn } from "@/lib/utils";
import { Issue } from "@/data/mockIssues";

interface IssueHeaderProps {
    issue: Issue;
}

export const IssueHeader = ({ issue }: IssueHeaderProps) => {
    return (
        <div className="space-y-4">
            {/* Issue Type & Severity */}
            <div className="flex gap-2">
                <span className="px-2.5 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                    {issue.type}
                </span>
                <span className={cn(
                    "px-2.5 py-1 text-xs font-medium rounded-full",
                    issue.severity === "high" ? "bg-red-100 text-red-700" :
                        issue.severity === "medium" ? "bg-orange-100 text-orange-700" :
                            "bg-blue-100 text-blue-700"
                )}>
                    {issue.severity} severity
                </span>
            </div>

            {/* Location */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <HugeiconsIcon icon={Location01Icon} className="w-4 h-4 text-muted-foreground" />
                    <h4 className="text-sm font-medium text-muted-foreground">Location</h4>
                </div>
                <p className="text-sm font-medium pl-6">{issue.location_name}</p>
            </div>

            {/* Reports & Confidence */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Reports</p>
                    <p className="text-2xl font-bold">{issue.reports_count}</p>
                </div>
                <div>
                    <p className="text-xs text-muted-foreground mb-1">Confidence</p>
                    <p className="text-2xl font-bold">{Math.round(issue.confidence * 100)}%</p>
                </div>
            </div>
        </div>
    );
};
