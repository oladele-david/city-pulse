import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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

const formSchema = z.object({
    email: z.string().email({
        message: "Please enter a valid government email address.",
    }),
    password: z.string().min(8, {
        message: "Password must be at least 8 characters.",
    }),
});

export const LoginForm = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        setIsLoading(true);
        // Simulate login delay
        setTimeout(() => {
            console.log(values);
            setIsLoading(false);
            if (values.email === "admin@gov.ae" && values.password === "test1234") {
                toast({
                    title: "Welcome back",
                    description: "Successfully authenticated as Operator.",
                });
                navigate("/dashboard");
            } else {
                toast({
                    title: "Authentication Failed",
                    description: "Invalid credentials. Please try again.",
                    variant: "destructive",
                });
            }
        }, 1500);
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                    Login
                </h1>
                <p className="text-muted-foreground text-lg">
                    Enter your credentials to access the government operations portal.
                </p>
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
                                            placeholder="admin@gov.ae"
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
                                            placeholder="••••••••"
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
