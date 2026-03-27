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

  const initials =
    session?.user.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "CP";

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
    <div className="flex h-full flex-col bg-background">
      <div className="px-4 py-8">
        <div className="rounded-3xl border border-border/50 p-5">
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-accent/50 bg-background ring-1 ring-border/30">
                <img
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(session?.user.fullName ?? "CityPulse")}`}
                  alt={session?.user.fullName ?? "CityPulse Citizen"}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute bottom-0 right-1 h-5 w-5 rounded-full border-2 border-background bg-green-500" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl font-bold text-foreground">
                {session?.user.fullName ?? "CityPulse Citizen"}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {session?.user.email ?? "citizen@citypulse.ng"}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                <HugeiconsIcon
                  icon={CheckmarkBadge01Icon}
                  className="h-5 w-5 text-accent"
                />
                {session?.user.rank ?? "Citizen"} Citizen
              </p>
              <p className="mt-2 text-xs font-semibold text-muted-foreground">
                {session?.user.streetOrArea ?? "Lagos"} • {initials}
              </p>
            </div>
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Award01Icon} className="h-4 w-4 text-amber-700" />
                <p className="text-[10px] font-bold text-amber-700">
                  Community standing
                </p>
              </div>
              <button
                onClick={() => navigate("/mobile/leaderboard")}
                className="rounded-full border border-amber-200 bg-white/70 px-3 py-1 text-[9px] font-bold text-amber-700"
              >
                See More
              </button>
            </div>
            <p className="mt-2 text-lg font-bold text-amber-950">
              {leaderboard.spotlightRank ? `#${leaderboard.spotlightRank} in Lagos` : "Syncing leaderboard"}
            </p>
            <p className="mt-1 text-xs text-amber-900/70">
              {leaderboard.spotlightEntry?.communityName ?? session?.user.streetOrArea}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4">
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex flex-col items-center rounded-3xl border border-border/50 bg-muted/20 p-4 transition-all hover:bg-muted/30"
            >
              <div className="mb-3 flex h-9 w-9 items-center justify-center">
                <HugeiconsIcon icon={stat.icon} className="h-4.5 w-4.5" />
              </div>
              <span className="text-base font-bold text-foreground">{stat.value}</span>
              <span className="mt-0.5 text-[10px] font-bold text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 px-4">
        <div className="h-px w-full bg-border/40" />
      </div>

      <div className="mt-8 space-y-2.5 px-4 pb-24">
        <p className="mb-4 ml-1 text-[10px] font-bold text-muted-foreground">
          Account & Governance
        </p>
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveSheet(item.label)}
            className="group flex w-full items-center gap-4 rounded-2xl border border-border/40 bg-background p-4.5 shadow-sm/0 transition-all active:scale-[0.98] hover:bg-muted/5"
          >
            <div className="flex h-11 w-11 items-center justify-center border border-transparent text-muted-foreground transition-colors">
              <HugeiconsIcon icon={item.icon} className="h-5 w-5" />
            </div>
            <span className="flex-1 text-left text-[14px] font-bold text-foreground">
              {item.label}
            </span>
          </button>
        ))}

        <button
          onClick={() => {
            logout();
            navigate("/", { replace: true });
          }}
          className="mt-4 flex w-full items-center gap-4 rounded-2xl border border-red-100 bg-red-50 p-4.5 transition-all active:scale-[0.98]"
        >
          <div className="flex h-11 w-11 items-center justify-center border border-transparent text-red-600 transition-colors">
            <HugeiconsIcon icon={Logout01Icon} className="h-5 w-5" />
          </div>
          <span className="flex-1 text-left text-[14px] font-bold text-red-600">
            Sign Out
          </span>
        </button>
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
