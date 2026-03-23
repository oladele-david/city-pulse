import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface StatusUpdateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    count: number;
}

export const StatusUpdateModal = ({ isOpen, onClose, onConfirm, count }: StatusUpdateModalProps) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] rounded-xl">
                <DialogHeader>
                    <DialogTitle>Update Status</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to mark {count} selected issues as <strong>In Progress</strong>?
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm text-muted-foreground">
                        This action will notify the assigned teams and update the status of the selected issues.
                    </p>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} className="rounded-2xl">Cancel</Button>
                    <Button onClick={onConfirm} className="rounded-2xl">Confirm Update</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
