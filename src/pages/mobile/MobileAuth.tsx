import { useEffect, useState } from "react";
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
    defaultValues: { email: "", password: "" },
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
      toast({ title: "Welcome back", description: "You're signed in." });
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast({ title: "Sign in failed", description: getApiErrorMessage(error), variant: "destructive" });
    },
  });

  const registerMutation = useMutation({
    mutationFn: api.registerCitizen,
    onSuccess: (session) => {
      login(session);
      toast({ title: "Account created", description: "You're signed in." });
      navigate(redirectTo, { replace: true });
    },
    onError: (error) => {
      toast({ title: "Registration failed", description: getApiErrorMessage(error), variant: "destructive" });
    },
  });

  const lgaOptions = lgasQuery.data ?? [];
  const communityOptions = communitiesQuery.data ?? [];
  const isLoadingLocations = lgasQuery.isLoading || lgasQuery.isFetching;
  const locationError = lgasQuery.isError || communitiesQuery.isError;

  return (
    <div className="flex flex-col min-h-screen bg-background max-w-md mx-auto border-x shadow-2xl">
      {/* Header with gradient */}
      <div className="bg-gradient-to-b from-primary via-primary/80 to-background px-5 pt-7 pb-10">
        <div className="flex items-center justify-between">
          <Link
            to="/mobile"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/15"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="h-4 w-4 text-white" />
          </Link>
          <img src="/assets/logo-inverse.svg" alt="CityPulse" className="h-7 w-auto" />
        </div>

        <div className="mt-8">
          <h1 className="text-2xl font-semibold text-white">
            {activeTab === "login" ? "Welcome back" : "Create your account"}
          </h1>
          <p className="mt-0 text-sm text-white/70">
            {activeTab === "login"
              ? "Sign in to report and track issues."
              : "Join CityPulse to start reporting."}
          </p>
        </div>
      </div>

      {/* Form area */}
      <div className="flex-1 px-5 -mt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="grid h-11 w-full grid-cols-2 rounded-2xl bg-muted/40 p-1">
            <TabsTrigger value="login" className="rounded-xl text-sm font-semibold">
              Sign In
            </TabsTrigger>
            <TabsTrigger value="register" className="rounded-xl text-sm font-semibold">
              Register
            </TabsTrigger>
          </TabsList>

          {/* Login Tab */}
          <TabsContent value="login" className="mt-0">
            <Form {...loginForm}>
              <form
                onSubmit={loginForm.handleSubmit((values) => loginMutation.mutate(values))}
                className="space-y-4"
              >
                <FormField
                  control={loginForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Email</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HugeiconsIcon icon={Mail02Icon} className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="email" placeholder="citizen@citypulse.ng" className="h-10 rounded-xl pl-9 text-xs placeholder:text-xs" />
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
                      <FormLabel className="text-xs">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HugeiconsIcon icon={LockIcon} className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input {...field} type="password" placeholder="Enter your password" className="h-10 rounded-xl pl-9 text-xs placeholder:text-xs" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                >
                  {loginMutation.isPending ? "Signing in..." : "Sign In"}
                  {!loginMutation.isPending && (
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 h-4 w-4" />
                  )}
                </Button>

                {/* OR divider */}
                <div className="flex items-center gap-3">
                  <div className="h-px flex-1 bg-border" />
                  <span className="text-xs text-muted-foreground">OR</span>
                  <div className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                  disabled={loginMutation.isPending}
                  onClick={() => {
                    loginForm.setValue("email", "citizen@citypulse.ng");
                    loginForm.setValue("password", "CitizenPass123!");
                    loginForm.handleSubmit((values) => loginMutation.mutate(values))();
                  }}
                >
                  Use Demo Account
                </Button>
              </form>
            </Form>
          </TabsContent>

          {/* Register Tab */}
          <TabsContent value="register" className="mt-0">
            <Form {...registerForm}>
              <form
                onSubmit={registerForm.handleSubmit((values) => {
                  const { confirmPassword: _confirmPassword, ...payload } = values;
                  registerMutation.mutate(payload);
                })}
                className="space-y-4"
              >
                <FormField
                  control={registerForm.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Full Name</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <HugeiconsIcon icon={UserIcon} className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                          <Input {...field} placeholder="Aisha Bello" className="h-10 rounded-xl pl-9 text-xs placeholder:text-xs" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={registerForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Email</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <HugeiconsIcon icon={Mail02Icon} className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="email" placeholder="aisha@example.com" className="h-10 rounded-xl pl-9 text-xs placeholder:text-xs" />
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
                        <FormLabel className="text-xs">Street / Area</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Obafemi Awolowo Way" className="h-10 rounded-xl text-xs placeholder:text-xs" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={registerForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <HugeiconsIcon icon={LockIcon} className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="password" placeholder="StrongPass123!" className="h-10 rounded-xl pl-9 text-xs placeholder:text-xs" />
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
                        <FormLabel className="text-xs">Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <HugeiconsIcon icon={LockIcon} className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input {...field} type="password" placeholder="Repeat password" className="h-10 rounded-xl pl-9 text-xs placeholder:text-xs" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* LGA + Community on the same row */}
                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={registerForm.control}
                    name="lgaId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs">LGA</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isLoadingLocations || lgasQuery.isError}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl">
                              <div className="flex items-center gap-2">
                                <HugeiconsIcon icon={MapsLocation01Icon} className="h-3.5 w-3.5 text-muted-foreground" />
                                <SelectValue placeholder="Select LGA" />
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
                        <FormLabel className="text-xs">Community</FormLabel>
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={!selectedLgaId || communitiesQuery.isLoading}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10 rounded-xl">
                              <SelectValue placeholder={selectedLgaId ? "Select community" : "Select LGA first"} />
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
                  <div className="rounded-xl border border-destructive/20 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
                    Could not load location options. Check that the API is running.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={registerMutation.isPending || isLoadingLocations}
                  className="h-11 w-full rounded-xl text-sm font-semibold"
                >
                  {registerMutation.isPending ? "Creating account..." : "Create Account"}
                  {!registerMutation.isPending && (
                    <HugeiconsIcon icon={ArrowRight01Icon} className="ml-1 h-4 w-4" />
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileAuth;
