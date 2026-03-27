import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Award01Icon,
  CheckmarkBadge01Icon,
  InformationCircleIcon,
  Logout01Icon,
  Medal02Icon,
  Settings02Icon,
  Shield01Icon,
  Task01Icon,
  UserCircleIcon,
} from "@hugeicons/core-free-icons";
import { MobileProfileSheet } from "@/components/mobile/sheets/MobileProfileSheet";
import { useCitizenAuth } from "@/hooks/use-auth";
import { useCommunityLeaderboardSpotlight } from "@/hooks/use-live-issues";

const MobileProfile = () => {
  const navigate = useNavigate();
  const { session, logout } = useCitizenAuth();
  const [activeSheet, setActiveSheet] = useState<string | null>(null);
  const leaderboard = useCommunityLeaderboardSpotlight(session?.user.communityId);

  const stats = [
    { label: "Points", value: String(session?.user.points ?? 0), icon: Medal02Icon },
    { label: "Rank", value: session?.user.rank ?? "New", icon: Task01Icon },
    {
      label: "Trust",
      value: `${session?.user.trustWeight?.toFixed(2) ?? "1.00"}x`,
      icon: CheckmarkBadge01Icon,
    },
  ];

  const menuItems = [
    { label: "Personal Information", icon: UserCircleIcon },
    { label: "Security & Privacy", icon: Shield01Icon },
    { label: "Settings", icon: Settings02Icon },
    { label: "Help & Support", icon: InformationCircleIcon },
  ];

  return (
    <div className="flex h-full flex-col bg-white">
      {/* Profile header */}
      <div className="px-4 pt-8 pb-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="relative">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-accent/50 bg-background">
              <img
                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session?.user.fullName ?? "CityPulse")}`}
                alt={session?.user.fullName ?? "CityPulse Citizen"}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {session?.user.fullName ?? "CityPulse Citizen"}
            </h1>
            <p className="mt-0.5 flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <HugeiconsIcon icon={CheckmarkBadge01Icon} className="h-3.5 w-3.5 text-accent" />
              <span className="text-[11px]">{session?.user.rank ?? "Citizen"}</span>
              <span>·</span>
              <span className="text-[11px]">{session?.user.streetOrArea ?? "Lagos"}</span>
            </p>
          </div>
        </div>

        {/* Community standing */}
        <div className="mt-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 text-amber-700" />
            <span className="text-sm font-bold text-amber-950">
              {leaderboard.spotlightRank ? `#${leaderboard.spotlightRank} in Lagos` : "--"}
            </span>
            <span className="text-xs text-amber-800/70">
              {leaderboard.spotlightEntry?.communityName ?? ""}
            </span>
          </div>
          <button
            onClick={() => navigate("/mobile/leaderboard")}
            className="text-[10px] font-bold text-amber-700"
          >
            See More
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="px-4">
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-xl border border-border/40 bg-muted/15 py-4"
            >
              <HugeiconsIcon icon={stat.icon} className="h-4 w-4 text-muted-foreground mb-2" />
              <span className="text-sm font-bold text-foreground text-center leading-tight">{stat.value}</span>
              <span className="mt-0.5 text-[10px] text-muted-foreground text-center">{stat.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Account & Governance — separator lines */}
      <div className="mt-6 px-4 pb-24">
        <p className="mb-3 text-[10px] font-bold text-muted-foreground">
          Account & Governance
        </p>
        <div className="divide-y divide-border/50">
          {menuItems.map((item) => (
            <button
              key={item.label}
              onClick={() => setActiveSheet(item.label)}
              className="flex w-full items-center gap-3 py-4 transition-all active:scale-[0.99]"
            >
              <HugeiconsIcon icon={item.icon} className="h-5 w-5 text-muted-foreground" />
              <span className="flex-1 text-left text-sm font-semibold text-foreground">
                {item.label}
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              logout();
              navigate("/", { replace: true });
            }}
            className="flex w-full items-center gap-3 py-4 transition-all active:scale-[0.99]"
          >
            <HugeiconsIcon icon={Logout01Icon} className="h-5 w-5 text-red-600" />
            <span className="flex-1 text-left text-sm font-semibold text-red-600">
              Sign Out
            </span>
          </button>
        </div>
      </div>

      <MobileProfileSheet
        type={activeSheet}
        isOpen={!!activeSheet}
        onClose={() => setActiveSheet(null)}
        session={session?.user ?? null}
      />
    </div>
  );
};

export default MobileProfile;
