import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export const ProfileSettings = () => {
    return (
        <div className="space-y-6">
            {/* Profile Header */}
            <div className="flex items-center justify-between pb-4 border-b">
                <div>
                    <h2 className="text-lg font-semibold">Profile</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        Keep your profile up-to-date and accurate
                    </p>
                </div>
                <Button className="rounded-2xl">Edit</Button>
            </div>

            {/* Profile Form - Centered */}
            <div className="max-w-2xl mx-auto space-y-6">
                {/* User Avatar */}
                <div className="space-y-2">
                    <Label className="text-sm font-medium">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                        <Avatar className="h-16 w-16 bg-accent border-2 border-white/20">
                            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                            <AvatarFallback className="bg-accent text-white font-medium">AU</AvatarFallback>
                        </Avatar>
                    </div>
                </div>

                {/* Agency Name */}
                <div className="space-y-2">
                    <Label htmlFor="agency-name" className="text-sm font-medium">
                        Agency Name
                    </Label>
                    <Input
                        id="agency-name"
                        defaultValue="CityPulse"
                        className="rounded-lg"
                        disabled
                    />
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                        Email
                    </Label>
                    <Input
                        id="email"
                        type="email"
                        defaultValue="admin@citypulse.gov.ae"
                        className="rounded-lg"
                        disabled
                    />
                </div>

                {/* Phone Number */}
                <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">
                        Phone Number
                    </Label>
                    <Input
                        id="phone"
                        defaultValue="+971 4 221 5555"
                        className="rounded-lg"
                        disabled
                    />
                </div>

                {/* Address */}
                <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-medium">
                        Address
                    </Label>
                    <Input
                        id="address"
                        defaultValue="CityPulse Building, Al Mankhool, Dubai, UAE"
                        className="rounded-lg"
                        disabled
                    />
                </div>
            </div>
        </div>
    );
};
