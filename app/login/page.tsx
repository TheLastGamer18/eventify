"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

const Login = () => {
  const [isSignup, setIsSignup] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignup) {
        await authClient.signUp.email(
          { email, password, name },
          {
            onSuccess: () => {
              toast.success("Account Created!", {
                description: "You have successfully signed up. Redirecting...",
              });
              setLoading(false);
              router.push("/");
            },
            onError: (ctx) => {
              toast.error("Sign Up Failed", {
                description: ctx.error.message,
              });
              setLoading(false);
            },
          },
        );
      } else {
        await authClient.signIn.email(
          { email, password },
          {
            onSuccess: () => {
              toast.success("Logged In!", {
                description: "Welcome back!",
              });
              setLoading(false);
              router.push("/");
            },
            onError: (ctx) => {
              toast.error("Login Failed", {
                description: ctx.error.message,
              });
              setLoading(false);
            },
          },
        );
      }
    } catch (error: any) {
      toast.error("An unexpected error occurred", {
        description: error.message || "Please try again later.",
      });
      setLoading(false);
    }
  };

  const inputClass =
    "brutal-border bg-card text-card-foreground focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-brutal-pink";

  return (
    <main className="mx-auto flex min-h-[calc(100vh-73px)] max-w-md items-center px-6 py-12">
      <div className="brutal-border brutal-shadow w-full rounded-lg bg-card p-8">
        <h1 className="mb-2 text-center text-3xl font-black">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h1>
        <p className="mb-8 text-center text-sm text-muted-foreground">
          {isSignup
            ? "Sign up to start creating and joining events."
            : "Log in to your Eventify account."}
        </p>

        <div className="mb-6 space-y-4">
          <button
            onClick={async () => {
              setLoading(true);
              toast.loading("Redirecting to Google...", { id: "google-signin" });
              try {
                await authClient.signIn.social({
                  provider: "google",
                  callbackURL: "/",
                });
              } catch (error) {
                console.error("Google sign in error:", error);
                setLoading(false);
                toast.error("Google Sign In Failed", {
                  description: "Please try again later.",
                  id: "google-signin",
                });
              }
            }}
            disabled={loading}
            className="brutal-border brutal-shadow brutal-hover flex w-full items-center justify-center gap-3 rounded-md bg-white py-3 text-base font-bold text-black disabled:opacity-50"
            type="button"
          >
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Continue with Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-black/20" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or continue with email
              </span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isSignup && (
            <div>
              <Label htmlFor="name" className="mb-2 block font-bold">
                Full Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                className={inputClass}
                required
              />
            </div>
          )}
          <div>
            <Label htmlFor="email" className="mb-2 block font-bold">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className={inputClass}
              required
            />
          </div>
          <div>
            <Label htmlFor="password" className="mb-2 block font-bold">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={inputClass}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="brutal-border brutal-shadow brutal-hover w-full rounded-md bg-brutal-pink py-3 text-base font-black text-foreground disabled:opacity-50"
          >
            {loading ? "Processing..." : isSignup ? "Sign Up" : "Log In"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isSignup ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => setIsSignup(!isSignup)}
            className="font-bold text-brutal-pink underline"
          >
            {isSignup ? "Log In" : "Sign Up"}
          </button>
        </p>
      </div>
    </main>
  );
};

export default Login;
