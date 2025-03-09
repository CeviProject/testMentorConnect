import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useAuth } from "@/contexts/AuthContext";
import { resendVerificationEmail } from "@/lib/auth-helpers";

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
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const formSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showVerificationDialog, setShowVerificationDialog] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      setError(null);
      await login(values.email, values.password);
      navigate("/dashboard");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to login";

      // Check if the error is related to email verification
      if (
        errorMessage.includes("Email not confirmed") ||
        errorMessage.includes("Invalid login credentials") ||
        errorMessage.toLowerCase().includes("email verification")
      ) {
        setVerificationEmail(values.email);
        setShowVerificationDialog(true);
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="email@example.com" {...field} />
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
                    <Input type="password" placeholder="******" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Logging in..." : "Login"}
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Button
            variant="link"
            className="p-0"
            onClick={() => navigate("/register")}
          >
            Register
          </Button>
        </p>
      </CardFooter>

      {/* Email Verification Dialog */}
      <Dialog
        open={showVerificationDialog}
        onOpenChange={setShowVerificationDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email Verification Required</DialogTitle>
            <DialogDescription>
              Your email verification link may have expired. Would you like to
              receive a new verification email?
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              type="email"
              placeholder="Confirm your email address"
              value={verificationEmail}
              onChange={(e) => setVerificationEmail(e.target.value)}
              className="mb-4"
            />
            {verificationStatus === "success" && (
              <Alert className="bg-green-50 text-green-800 border-green-200">
                <AlertDescription>
                  Verification email sent! Please check your inbox.
                </AlertDescription>
              </Alert>
            )}
            {verificationStatus === "error" && (
              <Alert variant="destructive">
                <AlertDescription>
                  Failed to send verification email. Please try again.
                </AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowVerificationDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={async () => {
                setVerificationStatus("loading");
                const result = await resendVerificationEmail(verificationEmail);
                setVerificationStatus(result.success ? "success" : "error");
                if (result.success) {
                  setTimeout(() => setShowVerificationDialog(false), 3000);
                }
              }}
              disabled={verificationStatus === "loading"}
            >
              {verificationStatus === "loading"
                ? "Sending..."
                : "Resend Verification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
