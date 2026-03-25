import { useEffect, useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  LocationUser03Icon,
  LockIcon,
  Mail02Icon,
  MapsLocation01Icon,
  UserIcon,
} from "@hugeicons/core-free-icons";
import * as z from "zod";
import { api, ApiError } from "@/lib/api";
import { useCitizenAuth } from "@/hooks/use-auth";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

const citizenLoginSchema = z.object({
  email: z.string().email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

const citizenRegisterSchema = citizenLoginSchema
  .extend({
    fullName: z.string().min(2, "Enter your full name."),
    confirmPassword: z.string().min(8, "Confirm your password."),
    lgaId: z.string().min(1, "Select your LGA."),
    communityId: z.string().min(1, "Select your community."),
    streetOrArea: z.string().min(3, "Enter your street, area, or landmark."),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

function getApiErrorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "We could not complete that request right now.";
}

const MobileAuth = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    searchParams.get("mode") === "register" ? "register" : "login",
  );
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useCitizenAuth();
  const { toast } = useToast();
  const redirectTo =
    typeof location.state?.from === "string"
      ? location.state.from
      : "/mobile/report";

  useEffect(() => {
    setSearchParams(activeTab === "register" ? { mode: "register" } : {});
  }, [activeTab, setSearchParams]);

  const lgasQuery = useQuery({
    queryKey: ["lagos-lgas"],
    queryFn: () => api.listLgas(),
  });

  const loginForm = useForm<z.infer<typeof citizenLoginSchema>>({
    resolver: zodResolver(citizenLoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const registerForm = useForm<z.infer<typeof citizenRegisterSchema>>({
    resolver: zodResolver(citizenRegisterSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
      lgaId: "",
      communityId: "",
      streetOrArea: "",
    },
  });

  const selectedLgaId = registerForm.watch("lgaId");
  const communitiesQuery = useQuery({
    queryKey: ["lagos-communities", selectedLgaId],
    queryFn: () => api.listCommunitiesByLga(selectedLgaId),
    enabled: Boolean(selectedLgaId),
  });

  useEffect(() => {
    registerForm.setValue("communityId", "");
  }, [registerForm, selectedLgaId]);

  const loginMutation = useMutation({
    mutationFn: api.loginCitizen,
    onSuccess: (session) => {
      login(session);
      toast({
        title: "Welcome to CityPulse",
        description: "Your citizen account is now connected.",
      });
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Sign in failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.registerCitizen,
    onSuccess: (session) => {
      login(session);
      toast({
        title: "Account created",
        description: "Your citizen profile is ready and signed in.",
      });
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: getApiErrorMessage(error),
        variant: "destructive",
      });
    },
  });

  const lgaOptions = lgasQuery.data ?? [];
  const communityOptions = communitiesQuery.data ?? [];
  const isLoadingLocations = lgasQuery.isLoading || lgasQuery.isFetching;
  const locationError = lgasQuery.isError || communitiesQuery.isError;
  const infoCopy = useMemo(
    () => [
      "Track your own reports and profile standing.",
      "Keep reporting tied to your Lagos location.",
      "Use the same account across report, activity, and profile.",
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 text-foreground">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] max-w-md flex-col justify-center">
        <div className="overflow-hidden rounded-[32px] border border-border/60 bg-white shadow-xl">
          <div className="bg-primary px-6 py-6 text-primary-foreground">
            <div className="flex items-center justify-between">
              <Link
                to="/"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10"
              >
                <HugeiconsIcon icon={ArrowLeft01Icon} className="h-5 w-5" />
              </Link>
              <img src="/assets/logo-inverse.svg" alt="CityPulse" className="h-8 w-auto" />
            </div>

            <div className="mt-5 space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 text-[11px] font-bold uppercase tracking-[0.2em]">
                <HugeiconsIcon icon={LocationUser03Icon} className="h-4 w-4" />
                Citizen Access
              </div>
              <div>
                <h1 className="text-3xl font-semibold tracking-tight">
                  Sign in to report and follow issues in your area.
                </h1>
                <p className="mt-2 text-sm leading-6 text-primary-foreground/75">
                  CityPulse keeps the public flow citizen-first. Create an account
                  or sign in to submit reports, track your impact, and manage your
                  local profile.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6">
            <div className="grid gap-3 rounded-[28px] bg-muted/20 p-4">
              {infoCopy.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <div className="mt-1 h-2.5 w-2.5 rounded-full bg-primary" />
                  <p className="text-sm leading-6 text-muted-foreground">{item}</p>
                </div>
              ))}
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
              <TabsList className="grid h-12 w-full grid-cols-2 rounded-2xl bg-muted/30 p-1">
                <TabsTrigger value="login" className="rounded-xl text-sm font-semibold">
                  Citizen Login
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl text-sm font-semibold">
                  Register
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="mt-0">
                <Form {...loginForm}>
                  <form
                    onSubmit={loginForm.handleSubmit((values) =>
                      loginMutation.mutate(values),
                    )}
                    className="space-y-5"
                  >
                    <FormField
                      control={loginForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <HugeiconsIcon
                                icon={Mail02Icon}
                                className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                              />
                              <Input
                                {...field}
                                type="email"
                                placeholder="citizen@citypulse.ng"
                                className="h-12 rounded-2xl border-border/70 pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={loginForm.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <HugeiconsIcon
                                icon={LockIcon}
                                className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                              />
                              <Input
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                className="h-12 rounded-2xl border-border/70 pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      disabled={loginMutation.isPending}
                      className="h-12 w-full rounded-2xl text-base font-semibold"
                    >
                      {loginMutation.isPending ? "Signing in..." : "Continue to CityPulse"}
                      {!loginMutation.isPending && (
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
                      )}
                    </Button>

                    <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                      Demo citizen: <span className="font-semibold text-foreground">citizen@citypulse.ng</span> /{" "}
                      <span className="font-semibold text-foreground">CitizenPass123!</span>
                    </div>
                  </form>
                </Form>
              </TabsContent>

              <TabsContent value="register" className="mt-0">
                <Form {...registerForm}>
                  <form
                    onSubmit={registerForm.handleSubmit((values) => {
                      const { confirmPassword: _confirmPassword, ...payload } = values;
                      registerMutation.mutate(payload);
                    })}
                    className="space-y-5"
                  >
                    <FormField
                      control={registerForm.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <HugeiconsIcon
                                icon={UserIcon}
                                className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                              />
                              <Input
                                {...field}
                                placeholder="Aisha Bello"
                                className="h-12 rounded-2xl border-border/70 pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <HugeiconsIcon
                                  icon={Mail02Icon}
                                  className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                                />
                                <Input
                                  {...field}
                                  type="email"
                                  placeholder="aisha@example.com"
                                  className="h-12 rounded-2xl border-border/70 pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="streetOrArea"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Street or Area</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Obafemi Awolowo Way"
                                className="h-12 rounded-2xl border-border/70"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <HugeiconsIcon
                                  icon={LockIcon}
                                  className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                                />
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="StrongPass123!"
                                  className="h-12 rounded-2xl border-border/70 pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm Password</FormLabel>
                            <FormControl>
                              <div className="relative">
                                <HugeiconsIcon
                                  icon={LockIcon}
                                  className="absolute left-3 top-3 h-5 w-5 text-muted-foreground"
                                />
                                <Input
                                  {...field}
                                  type="password"
                                  placeholder="Repeat password"
                                  className="h-12 rounded-2xl border-border/70 pl-10"
                                />
                              </div>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        control={registerForm.control}
                        name="lgaId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>LGA</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={isLoadingLocations || lgasQuery.isError}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-border/70">
                                  <div className="flex items-center gap-2">
                                    <HugeiconsIcon
                                      icon={MapsLocation01Icon}
                                      className="h-4 w-4 text-muted-foreground"
                                    />
                                    <SelectValue placeholder="Select your LGA" />
                                  </div>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {lgaOptions.map((lga) => (
                                  <SelectItem key={lga.id} value={lga.id}>
                                    {lga.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={registerForm.control}
                        name="communityId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Community</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                              disabled={!selectedLgaId || communitiesQuery.isLoading}
                            >
                              <FormControl>
                                <SelectTrigger className="h-12 rounded-2xl border-border/70">
                                  <SelectValue
                                    placeholder={
                                      selectedLgaId
                                        ? "Select your community"
                                        : "Choose an LGA first"
                                    }
                                  />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {communityOptions.map((community) => (
                                  <SelectItem key={community.id} value={community.id}>
                                    {community.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {locationError && (
                      <div className="rounded-2xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                        We could not load Lagos location options. Check that the API is
                        running and try again.
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={registerMutation.isPending || isLoadingLocations}
                      className="h-12 w-full rounded-2xl text-base font-semibold"
                    >
                      {registerMutation.isPending ? "Creating account..." : "Create Citizen Account"}
                      {!registerMutation.isPending && (
                        <HugeiconsIcon icon={ArrowRight01Icon} className="h-5 w-5" />
                      )}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileAuth;
