import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Alert02Icon,
  ArrowRight01Icon,
  Cancel01Icon,
  CheckmarkBadge01Icon,
  DashboardSquare01Icon,
  Menu01Icon,
  MapsLocation01Icon,
  Notification01Icon,
  SecurityLockIcon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Globe } from "@/components/ui/globe";
import { cn } from "@/lib/utils";

const Index = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen bg-white text-foreground">
      {/* Floating sticky header */}
      <header
        className={cn(
          "fixed top-3 left-1/2 -translate-x-1/2 z-50 w-[calc(100%-1.5rem)] max-w-5xl rounded-full px-4 py-2 flex items-center justify-between transition-all duration-300",
          isScrolled
            ? "bg-white/80 backdrop-blur-xl border border-border/50 shadow-sm"
            : "bg-white/60 backdrop-blur-md border border-border/30",
        )}
      >
        <div className="flex items-center gap-2">
          <img src="/assets/logo.svg" alt="CityPulse" className="h-7 w-auto" />
        </div>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-2">
          <Link to="/mobile/auth">
            <Button variant="ghost" className="h-8 rounded-full text-xs font-semibold px-3">
              Sign In
            </Button>
          </Link>
          <Link to="/console/login">
            <Button variant="outline" className="h-8 rounded-full text-xs font-semibold px-3 border-border/60">
              Admin Console
            </Button>
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="sm:hidden flex h-8 w-8 items-center justify-center rounded-full"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <HugeiconsIcon icon={menuOpen ? Cancel01Icon : Menu01Icon} className="h-4 w-4" />
        </button>
      </header>

      {/* Mobile menu overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 bg-white/95 backdrop-blur-xl sm:hidden flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200">
          <Link to="/mobile" onClick={() => setMenuOpen(false)}>
            <Button className="h-11 rounded-full px-8 text-sm font-semibold">
              Open Citizen App
            </Button>
          </Link>
          <Link to="/mobile/auth" onClick={() => setMenuOpen(false)}>
            <Button variant="outline" className="h-11 rounded-full px-8 text-sm font-semibold">
              Sign In
            </Button>
          </Link>
          <Link to="/console/login" onClick={() => setMenuOpen(false)}>
            <Button variant="ghost" className="h-11 rounded-full px-8 text-sm font-semibold">
              Admin Console
            </Button>
          </Link>
        </div>
      )}

      {/* Hero section */}
      <section className="relative m-3 sm:m-4 rounded-2xl bg-primary/10 overflow-hidden">
        <div className="relative min-h-[95vh] flex flex-col items-center justify-center px-5 pt-20 pb-32 sm:px-8 sm:pb-40">
          <div className="relative z-10 mx-auto max-w-2xl text-center space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white border border-border/40 px-3 py-1.5 text-xs font-semibold text-primary">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live in Lagos
            </div>

            <h1 className="text-3xl font-bold text-foreground leading-tight sm:text-4xl lg:text-5xl">
              Report local issues.
              <br />
              Drive community action.
            </h1>

            <p className="mx-auto max-w-md text-sm text-muted-foreground leading-relaxed sm:text-base">
              CityPulse lets Lagos residents flag complaints,
              track responses, and hold services accountable.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link to="/mobile">
                <Button size="lg" className="h-11 rounded-full px-6 text-sm font-semibold shadow-lg shadow-primary/15">
                  Open Citizen App
                  <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/mobile/report">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-11 rounded-full border-border/60 px-6 text-sm font-semibold bg-white"
                >
                  Start a Report
                </Button>
              </Link>
            </div>
          </div>

          {/* Globe — half visible, peeking from bottom */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[40%] w-[140vw] max-w-[900px] sm:w-[90vw] sm:max-w-[800px]">
            <Globe />
          </div>
        </div>
      </section>

      {/* Features — Bento Grid */}
      <section className="bg-slate-50/50 py-16 md:py-24">
        <div className="mx-auto max-w-3xl lg:max-w-5xl px-5">
          <div className="text-center mb-10">
            <h2 className="text-xl font-bold text-foreground sm:text-2xl">How CityPulse works</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From citizen reports to government response.
            </p>
          </div>

          <div className="relative z-10 grid grid-cols-6 gap-3">
            {/* Card 1: Reporting stats */}
            <Card className="relative col-span-full flex overflow-hidden rounded-2xl border-border/40 shadow-none lg:col-span-2">
              <CardContent className="relative m-auto size-fit pt-6 text-center">
                <div className="relative flex h-24 w-56 items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-20 w-44 rounded-full bg-primary/5" />
                  </div>
                  <span className="relative text-5xl font-semibold text-foreground">100%</span>
                </div>
                <h3 className="mt-6 text-center text-xl font-semibold">Open Source</h3>
                <p className="mt-2 text-sm text-muted-foreground">Fully transparent civic infrastructure for Lagos.</p>
              </CardContent>
            </Card>

            {/* Card 2: Report issues */}
            <Card className="relative col-span-full overflow-hidden rounded-2xl border-border/40 shadow-none sm:col-span-3 lg:col-span-2">
              <CardContent className="pt-6">
                <div className="relative mx-auto flex aspect-square size-28 rounded-full border border-border/70 before:absolute before:-inset-2 before:rounded-full before:border before:border-border/70">
                  <div className="m-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <HugeiconsIcon icon={Alert02Icon} className="h-7 w-7" />
                  </div>
                </div>
                <div className="relative z-10 mt-6 space-y-2 text-center">
                  <h3 className="text-lg font-semibold">Report anything</h3>
                  <p className="text-sm text-muted-foreground">Sanitation, flooding, safety — flag any issue affecting your area.</p>
                </div>
              </CardContent>
            </Card>

            {/* Card 3: Track progress */}
            <Card className="relative col-span-full overflow-hidden rounded-2xl border-border/40 shadow-none sm:col-span-3 lg:col-span-2">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center gap-3 py-6">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
                    <HugeiconsIcon icon={Notification01Icon} className="h-5 w-5" />
                  </div>
                  <div className="h-px w-6 bg-border" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    <HugeiconsIcon icon={DashboardSquare01Icon} className="h-5 w-5" />
                  </div>
                  <div className="h-px w-6 bg-border" />
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
                  </div>
                </div>
                <div className="relative z-10 mt-2 space-y-2 text-center">
                  <h3 className="text-lg font-semibold">Track progress</h3>
                  <p className="text-sm text-muted-foreground">Follow updates as complaints move toward resolution.</p>
                </div>
              </CardContent>
            </Card>

            {/* Card 4: Community trust — wide */}
            <Card className="relative col-span-full overflow-hidden rounded-2xl border-border/40 shadow-none lg:col-span-3">
              <CardContent className="grid pt-6 sm:grid-cols-2">
                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                  <div className="relative flex aspect-square size-12 rounded-full border border-border/70 before:absolute before:-inset-2 before:rounded-full before:border before:border-border/70">
                    <HugeiconsIcon icon={CheckmarkBadge01Icon} className="m-auto h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Community trust scores</h3>
                    <p className="text-sm text-muted-foreground">Citizen credibility builds over time. Verified reports carry more weight.</p>
                  </div>
                </div>
                <div className="rounded-tl-2xl relative -mb-6 -mr-6 mt-6 border-l border-t border-border/70 p-6 sm:ml-6">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <HugeiconsIcon icon={UserIcon} className="h-4 w-4" />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold">Trust weight</p>
                        <p className="text-xs text-muted-foreground">1.0x → 2.5x</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <HugeiconsIcon icon={SecurityLockIcon} className="h-4 w-4" />
                      </div>
                      <div className="text-sm">
                        <p className="font-semibold">Verified reports</p>
                        <p className="text-xs text-muted-foreground">Higher confidence</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card 5: Citizen + Admin split — wide */}
            <Card className="relative col-span-full overflow-hidden rounded-2xl border-border/40 shadow-none lg:col-span-3">
              <CardContent className="grid h-full pt-6 sm:grid-cols-2">
                <div className="relative z-10 flex flex-col justify-between space-y-12 lg:space-y-6">
                  <div className="relative flex aspect-square size-12 rounded-full border border-border/70 before:absolute before:-inset-2 before:rounded-full before:border before:border-border/70">
                    <HugeiconsIcon icon={MapsLocation01Icon} className="m-auto h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold">Citizen + Admin split</h3>
                    <p className="text-sm text-muted-foreground">Citizens report from mobile. Admins review and respond from the console.</p>
                  </div>
                </div>
                <div className="relative mt-6 sm:-my-6 sm:-mr-6 sm:ml-6 border-l border-border/70">
                  <div className="relative flex h-full flex-col justify-center space-y-3 p-6">
                    <Link to="/mobile" className="flex items-center gap-2 rounded-xl border border-border/0 px-3 py-2 text-xs font-semibold hover:bg-muted/10 transition-colors">
                      <span className="h-2 w-2 rounded-full bg-primary" />
                      Citizen App
                    </Link>
                    <Link to="/console/login" className="flex items-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-xs font-semibold hover:bg-muted/10 transition-colors">
                      <span className="h-2 w-2 rounded-full bg-amber-500" />
                      Admin Console
                    </Link>
                    <Link to="/mobile/auth?mode=register" className="flex items-center gap-2 rounded-xl border border-border/40 px-3 py-2 text-xs font-semibold hover:bg-muted/10 transition-colors">
                      <span className="h-2 w-2 rounded-full bg-emerald-500" />
                      Create Account
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-6 px-5">
        <div className="mx-auto max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/assets/logo.svg" alt="CityPulse" className="h-5 w-auto" />
            <span className="text-[11px] text-muted-foreground">Lagos Hackathon Demo</span>
          </div>
          <p className="text-[11px] text-muted-foreground">Built for Lagos</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
