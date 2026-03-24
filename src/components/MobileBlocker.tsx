import { ComputerIcon, SmartPhone01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { Link } from "react-router-dom";

export const MobileBlocker = () => {
    return (
        <div className="fixed inset-0 bg-gradient-to-br from-primary to-primary/90 flex items-center justify-center p-4 sm:p-6 z-[9999]">
            <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center animate-in fade-in zoom-in duration-300">
                <div className="mb-6 flex justify-center">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center">
                        <HugeiconsIcon icon={ComputerIcon} className="w-10 h-10 text-primary" />
                    </div>
                </div>

                <h1 className="text-2xl font-bold text-slate-900 mb-3">
                    Desktop Operations Dashboard
                </h1>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    You are currently accessing the <strong>Government Operations Dashboard</strong>, designed for city administration and real-time monitoring. For technical reasons, this interface is restricted to desktop screens.
                </p>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 mb-6 text-center">
                    <div className="flex justify-center mb-3 text-primary">
                        <HugeiconsIcon icon={SmartPhone01Icon} className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900 mb-1">Looking for the Citizen App?</p>
                    <p className="text-xs text-slate-500 mb-4">You can simulate the mobile reporting experience here:</p>
                    <Link
                        to="/mobile"
                        className="inline-flex items-center justify-center h-10 px-6 bg-primary text-white text-xs font-bold rounded-lg active:scale-95 transition-all shadow-lg shadow-primary/20"
                    >
                        Enter Mobile Simulation
                    </Link>
                </div>

                <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                        Requires 1024px+ Screen Width
                    </p>
                </div>
            </div>
        </div>
    );
};
