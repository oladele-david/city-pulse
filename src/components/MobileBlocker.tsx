import { ComputerIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

export const MobileBlocker = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center p-4 sm:p-6 z-50">
            <div className="max-w-md w-full bg-white rounded-xl sm:rounded-2xl shadow-2xl p-6 sm:p-8 text-center">
                <div className="mb-4 sm:mb-6 flex justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <HugeiconsIcon icon={ComputerIcon} className="w-8 h-8 sm:w-10 sm:h-10 text-primary" />
                    </div>
                </div>

                <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-2 sm:mb-3">
                    Desktop Experience Required
                </h1>

                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
                    CityPulse is optimized for desktop and larger screens to provide you with the best experience.
                    Please access this application from a desktop computer or laptop.
                </p>

                <div className="bg-muted/30 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-muted-foreground">
                    <p className="font-medium mb-1">Minimum screen width required:</p>
                    <p className="text-xs">1024px (Desktop/Laptop)</p>
                </div>

                <div className="mt-4 sm:mt-6 pt-4 sm:pt-6 border-t">
                    <p className="text-xs text-muted-foreground">
                        Thank you for your understanding
                    </p>
                </div>
            </div>
        </div>
    );
};
