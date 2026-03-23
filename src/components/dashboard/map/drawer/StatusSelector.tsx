import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

interface StatusSelectorProps {
    currentStatus: string;
    onStatusChange: (value: string) => void;
}

export const StatusSelector = ({ currentStatus, onStatusChange }: StatusSelectorProps) => {
    return (
        <div className="space-y-2">
            <h4 className="text-sm font-medium text-muted-foreground">Update Status</h4>
            <Select value={currentStatus} onValueChange={onStatusChange}>
                <SelectTrigger className="w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                </SelectContent>
            </Select>
        </div>
    );
};
