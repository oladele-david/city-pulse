import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import * as z from "zod";
import { HugeiconsIcon } from "@hugeicons/react";
import { Mail02Icon, LockIcon, ArrowRight01Icon, ViewIcon, ViewOffIcon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid government email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
});

export const LoginForm = () => {
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const redirectTo = typeof location.state?.from === "string"
        ? location.state.from
        : "/console/dashboard";

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    const loginMutation = useMutation({
        mutationFn: api.loginAdmin,
        onSuccess: (session) => {
            login(session);
            toast({
                title: "Welcome back",
                description: "You are now connected to the live CityPulse admin backend.",
            });
            navigate(redirectTo, { replace: true });
        },
        onError: (error) => {
            const message = error instanceof ApiError
                ? error.message
                : "Unable to sign in right now. Please try again.";

            toast({
                title: "Authentication Failed",
                description: message,
                variant: "destructive",
            });
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        loginMutation.mutate(values);
    }

    const isLoading = loginMutation.isPending;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground">
                    Login
                </h1>
                <p className="text-muted-foreground text-lg">
                    Sign in with your CityPulse admin account to access live operations data.
                </p>
                <div className="rounded-2xl border border-primary/10 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
                    Demo admin: <span className="font-semibold text-foreground">admin@citypulse.ng</span> / <span className="font-semibold text-foreground">AdminPass123!</span>
                </div>
            </div>

            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <HugeiconsIcon icon={Mail02Icon} className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            placeholder="admin@citypulse.ng"
                                            className="pl-10 h-11 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 focus-visible:border-accent"
                                            {...field}
                                        />
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Password</FormLabel>
                                <FormControl>
                                    <div className="relative">
                                        <HugeiconsIcon icon={LockIcon} className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="AdminPass123!"
                                            className="pl-10 pr-10 h-11 focus-visible:ring-1 focus-visible:ring-accent focus-visible:ring-offset-0 focus-visible:border-accent"
                                            {...field}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            <HugeiconsIcon icon={showPassword ? ViewIcon : ViewOffIcon} className="h-5 w-5" />
                                        </button>
                                    </div>
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <Button
                        type="submit"
                        className="w-full h-11 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300"
                        disabled={isLoading}
                    >
                        {isLoading ? "Authenticating..." : "Sign In"}
                        {!isLoading && <HugeiconsIcon icon={ArrowRight01Icon} className="ml-2 h-5 w-5" />}
                    </Button>
                </form>
            </Form>
        </div>
    );
};
