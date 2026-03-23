import React from "react";

interface AuthLayoutProps {
    children: React.ReactNode;
}

export const AuthLayout = ({ children }: AuthLayoutProps) => {
    return (
        <div className="h-screen w-full flex overflow-hidden">
            {/* Left Side - Content */}
            <div className="w-full lg:w-1/2 flex flex-col justify-between p-8 lg:p-12 xl:p-16 bg-background overflow-y-auto">
                <div className="w-full max-w-[440px] mx-auto">
                    <div className="h-16 w-32 mb-12">
                        <img
                            src="/assets/logo.svg"
                            alt="CityPulse Logo"
                            className="w-full h-full object-contain object-left"
                        />
                    </div>
                </div>

                <div className="w-full max-w-[440px] mx-auto flex-1 flex flex-col justify-center">
                    {children}
                </div>

                <footer className="w-full max-w-[440px] mx-auto text-sm text-muted-foreground mt-8 text-center bg-transparent">
                    <p>© {new Date().getFullYear()} CityPulse GovOps. All rights reserved.</p>
                    <p className="text-xs mt-1 opacity-70">Authorized Personnel Only</p>
                </footer>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:block lg:w-1/2 relative p-4 pl-0 bg-background">
                <div className="h-full w-full relative rounded-2xl overflow-hidden shadow-2xl bg-muted">
                    <div className="absolute inset-0 bg-primary/20 z-10 mix-blend-multiply pointer-events-none" />
                    <img
                        src="https://i.pinimg.com/1200x/b6/2d/31/b62d31d6145b88f902241daa667023df.jpg"
                        alt="Dubai Cityscape"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-12 z-20 bg-gradient-to-t from-black/80 to-transparent text-white">
                        <h2 className="text-3xl font-bold mb-2">Operational Excellence</h2>
                        <p className="text-white/80 max-w-md">
                            Advanced civic infrastructure intelligence for a smarter, safer city.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
