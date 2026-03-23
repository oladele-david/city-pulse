import { useState } from "react";
import { cn } from "@/lib/utils";
import { ProfileSettings } from "@/components/dashboard/settings/ProfileSettings";
import { NotificationSettings } from "@/components/dashboard/settings/NotificationSettings";

type SettingsTab = 'profile' | 'notifications';

const Settings = () => {
    const [activeTab, setActiveTab] = useState<SettingsTab>('profile');

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground mt-1">Manage your account settings and preferences</p>
            </div>

            {/* Standalone Tabs */}
            <div className="flex gap-0 bg-muted border rounded-full p-0.5 w-fit">
                <button
                    onClick={() => setActiveTab('profile')}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                        activeTab === 'profile'
                            ? "bg-accent text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Profile
                </button>
                <button
                    onClick={() => setActiveTab('notifications')}
                    className={cn(
                        "px-4 py-1.5 text-sm font-medium rounded-full transition-colors",
                        activeTab === 'notifications'
                            ? "bg-accent text-white shadow-sm"
                            : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    Notifications
                </button>
            </div>

            {/* Content Card */}
            <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
                <div className="p-6">
                    {activeTab === 'profile' && <ProfileSettings />}
                    {activeTab === 'notifications' && <NotificationSettings />}
                </div>
            </div>
        </div>
    );
};

export default Settings;
