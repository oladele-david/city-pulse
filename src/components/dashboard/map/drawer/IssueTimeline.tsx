import { Issue } from "@/data/mockIssues";

interface IssueTimelineProps {
    issue: Issue;
}

export const IssueTimeline = ({ issue }: IssueTimelineProps) => {
    return (
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
    );
};
