import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  CustomerSupportIcon,
  DashboardSquare01Icon,
  LocationUser03Icon,
  MapsLocation01Icon,
  Notification01Icon,
  SecurityLockIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

const landingCards = [
  {
    title: "Report anything affecting your area",
    description:
      "From sanitation and flooding to safety concerns, public facility complaints, or service delivery issues.",
    icon: Alert02Icon,
  },
  {
    title: "Pin the exact location",
    description:
      "Drop a pin, add details, and help responders understand the issue with better local context.",
    icon: MapsLocation01Icon,
  },
  {
    title: "Track community response",
    description:
      "Follow reports, confirmations, and updates as complaints move from signal to action.",
    icon: Notification01Icon,
  },
];

const quickStats = [
  { label: "Citizen Reports", value: "Live Intake" },
  { label: "Lagos Context", value: "LGA + Community" },
  { label: "Operator Access", value: "/console" },
];

const Index = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-foreground">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-5 py-5 lg:px-8 lg:py-6">
        <header className="rounded-[28px] border border-border/60 bg-white px-5 py-4 shadow-sm lg:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/assets/logo.svg" alt="CityPulse" className="h-10 w-auto" />
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary/70">
                  Lagos Hackathon Demo
                </p>
                <h1 className="text-lg font-semibold tracking-tight text-foreground">
                  CityPulse
                </h1>
              </div>
            </div>

            <Link to="/console/login">
              <Button
                variant="outline"
                className="h-11 rounded-2xl border-border/70 bg-background px-4 text-sm font-semibold"
              >
                Admin Console
              </Button>
            </Link>
          </div>
        </header>

        <main className="grid flex-1 gap-5 py-5 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="space-y-5">
            <div className="rounded-[32px] border border-border/60 bg-white p-6 shadow-sm lg:p-7">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-primary/5 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
                <HugeiconsIcon icon={LocationUser03Icon} className="h-4 w-4" />
                Citizen Entry
              </div>

              <div className="space-y-4">
                <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-foreground lg:text-5xl">
                  A calmer way for residents to raise complaints and local concerns.
                </h2>
                <p className="max-w-2xl text-base leading-7 text-muted-foreground lg:text-lg">
                  CityPulse is a citizen reporting platform for Lagos. People can submit complaints,
                  flag public concerns, identify failing services, and surface community issues that
                  need visibility, follow-up, or response.
                </p>
              </div>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link to="/mobile">
                  <Button size="lg" className="h-14 rounded-2xl px-6 text-base font-semibold shadow-lg shadow-primary/15">
                    Open Citizen App
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link to="/mobile/report">
                  <Button
                    size="lg"
                    variant="outline"
                    className="h-14 rounded-2xl border-border/70 bg-background px-6 text-base font-semibold"
                  >
                    Start a Report
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-3">
              {landingCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-[28px] border border-border/60 bg-white p-5 shadow-sm transition-colors hover:bg-muted/10"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-muted/40 text-primary">
                      <HugeiconsIcon icon={card.icon} className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold tracking-tight text-foreground">
                        {card.title}
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-5">
            <div className="rounded-[32px] border border-border/60 bg-primary p-5 text-primary-foreground shadow-sm lg:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-primary-foreground/65">
                    CityPulse Overview
                  </p>
                  <h3 className="mt-2 text-2xl font-semibold tracking-tight">
                    Public reporting with clear routing.
                  </h3>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <HugeiconsIcon icon={DashboardSquare01Icon} className="h-6 w-6" />
                </div>
              </div>

              <div className="mt-5 rounded-[28px] border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      <div className="absolute inset-0 h-2.5 w-2.5 rounded-full bg-emerald-300 animate-ping" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.18em]">
                      Citizen Flow Active
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-primary-foreground/70">
                    Lagos, Nigeria
                  </span>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  {quickStats.map((item) => (
                    <div
                      key={item.label}
                      className="rounded-[22px] bg-white px-4 py-4 text-slate-900"
                    >
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500">
                        {item.label}
                      </p>
                      <p className="mt-2 text-sm font-semibold tracking-tight text-slate-900">
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[32px] border border-border/60 bg-white p-5 shadow-sm lg:p-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <HugeiconsIcon icon={CustomerSupportIcon} className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-muted-foreground">
                    What Citizens Can Raise
                  </p>
                  <h3 className="text-lg font-semibold tracking-tight text-foreground">
                    Broader than infrastructure-only complaints
                  </h3>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[24px] bg-muted/20 p-4">
                  <p className="text-sm font-semibold text-foreground">Examples</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    Waste collection, blocked roads, broken facilities, unsafe spaces, flooding,
                    noise, public health concerns, service failures, and other community complaints.
                  </p>
                </div>
                <div className="rounded-[24px] bg-muted/20 p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm">
                      <HugeiconsIcon icon={SecurityLockIcon} className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-foreground">Admin access stays separate</p>
                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        The public experience now starts with citizens, while operators still manage
                        review and response through the console route.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default Index;
