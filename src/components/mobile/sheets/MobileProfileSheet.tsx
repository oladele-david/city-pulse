import { useState, useEffect } from "react";
import {
    Drawer,
    DrawerContent,
    DrawerHeader,
    DrawerTitle,
    DrawerDescription
} from "@/components/ui/drawer";
import { cn } from "@/lib/utils";
import { HugeiconsIcon } from "@hugeicons/react";
import {
    UserCircleIcon,
    Shield01Icon,
    Settings02Icon,
    InformationCircleIcon,
    GlobalIcon,
    Notification01Icon,
    FingerPrintIcon,
    FileSecurityIcon
} from "@hugeicons/core-free-icons";
import { Switch } from "@/components/ui/switch";

interface MobileProfileSheetProps {
    type: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export const MobileProfileSheet = ({ type, isOpen, onClose }: MobileProfileSheetProps) => {
    // State for Security & Privacy toggles
    const [toggles, setToggles] = useState({
        biometric: true,
        location: true,
        sharing: false
    });

    const handleToggle = (key: keyof typeof toggles) => {
        setToggles(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const getContent = () => {
        switch (type) {
            case "Personal Information":
                return {
                    title: "Personal Information",
                    description: "Manage your identity and contact details",
                    icon: UserCircleIcon,
                    items: [
                        { label: "Full Name", value: "Ahmed Al-Maktoum" },
                        { label: "Email", value: "ahmed.m@dubai.gov.ae" },
                        { label: "Phone", value: "+971 50 123 4567" },
                        { label: "District", value: "Downtown Dubai" }
                    ]
                };
            case "Security & Privacy":
                return {
                    title: "Security & Privacy",
                    description: "Control your data and account safety",
                    icon: Shield01Icon,
                    items: [
                        {
                            label: "Biometric Login",
                            value: toggles.biometric ? "Enabled" : "Disabled",
                            icon: FingerPrintIcon,
                            isToggle: true,
                            checked: toggles.biometric,
                            onToggle: () => handleToggle('biometric')
                        },
                        {
                            label: "Location Privacy",
                            value: toggles.location ? "Precise" : "Approximate",
                            icon: GlobalIcon,
                            isToggle: true,
                            checked: toggles.location,
                            onToggle: () => handleToggle('location')
                        },
                        {
                            label: "Data Sharing",
                            value: toggles.sharing ? "Shared" : "Anonymous",
                            icon: FileSecurityIcon,
                            isToggle: true,
                            checked: toggles.sharing,
                            onToggle: () => handleToggle('sharing')
                        }
                    ]
                };
            case "Settings":
                return {
                    title: "App Settings",
                    description: "Customize your CityPulse experience",
                    icon: Settings02Icon,
                    items: [
                        { label: "Language", value: "English (UK)", icon: GlobalIcon },
                        { label: "Notifications", value: "Critical Only", icon: Notification01Icon },
                        { label: "Theme", value: "System", icon: Settings02Icon }
                    ]
                };
            case "Help & Support":
                return {
                    title: "Help & Support",
                    description: "Get assistance from our team",
                    icon: InformationCircleIcon,
                    items: [
                        { label: "Version", value: "v1.0.0 (Beta)" },
                        { label: "Contact Support", value: "Support Hub" },
                        { label: "Terms of Service", value: "View Document" }
                    ]
                };
            default:
                return null;
        }
    };

    const content = getContent();
    if (!content) return null;

    return (
        <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DrawerContent className="max-w-md mx-auto rounded-t-2xl">
                <DrawerHeader className="text-left border-b pb-4 pt-6">
                    <div className="w-12 h-12 rounded-2xl bg-muted/30 flex items-center justify-center mb-4 border">
                        <HugeiconsIcon icon={content.icon} className="w-6 h-6 text-foreground" />
                    </div>
                    <DrawerTitle className="text-xl font-bold">{content.title}</DrawerTitle>
                    <DrawerDescription className="text-sm">
                        {content.description}
                    </DrawerDescription>
                </DrawerHeader>

                <div className="p-6 space-y-4">
                    {content.items.map((item: any, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 bg-muted/20 border rounded-2xl hover:bg-muted/30 transition-colors">
                            <div className="flex items-center gap-3">
                                {item.icon && <HugeiconsIcon icon={item.icon} className="w-4 h-4 text-muted-foreground" />}
                                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.label}</span>
                            </div>
                            {item.isToggle ? (
                                <div className="flex items-center gap-3">
                                    <span className={cn(
                                        "text-[13px] font-medium transition-colors",
                                        item.checked ? "text-primary" : "text-muted-foreground"
                                    )}>
                                        {item.value}
                                    </span>
                                    <Switch
                                        checked={item.checked}
                                        onCheckedChange={item.onToggle}
                                    />
                                </div>
                            ) : (
                                <span className="text-sm font-bold text-foreground">{item.value}</span>
                            )}
                        </div>
                    ))}

                    <div className="pt-4">
                        <button
                            onClick={onClose}
                            className="w-full h-12 bg-primary text-white rounded-2xl font-bold text-sm active:scale-[0.98] transition-all shadow-lg shadow-primary/20"
                        >
                            Done
                        </button>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    );
};
