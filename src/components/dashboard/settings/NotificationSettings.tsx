import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export const NotificationSettings = () => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h2 className="text-lg font-semibold">Notifications</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Manage how you receive notifications
                    </p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-6">
                {/* Email Notifications */}
                <div>
                    <h3 className="text-sm font-semibold mb-4">Email Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">High Severity Issues</Label>
                                <p className="text-xs text-muted-foreground">
                                    Receive email alerts for high severity issues
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Daily Summary</Label>
                                <p className="text-xs text-muted-foreground">
                                    Daily digest of all issues and updates
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Status Updates</Label>
                                <p className="text-xs text-muted-foreground">
                                    Notifications when issue status changes
                                </p>
                            </div>
                            <Switch />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">New Issues</Label>
                                <p className="text-xs text-muted-foreground">
                                    Alert when new issues are reported
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </div>
                </div>

                {/* In-App Notifications */}
                <div className="pt-6 border-t">
                    <h3 className="text-sm font-semibold mb-4">In-App Notifications</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Desktop Notifications</Label>
                                <p className="text-xs text-muted-foreground">
                                    Show browser notifications for urgent issues
                                </p>
                            </div>
                            <Switch defaultChecked />
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-medium">Sound Alerts</Label>
                                <p className="text-xs text-muted-foreground">
                                    Play sound for high priority notifications
                                </p>
                            </div>
                            <Switch />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
