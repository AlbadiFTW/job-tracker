"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password"),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error || "Something went wrong");
      setLoading(false);
    } else {
      router.push("/login");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black overflow-hidden">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-purple-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Logo/Brand */}
        <Link href="/" className="block text-center mb-12">
          <h2 className="text-3xl font-bold">JobTrackr</h2>
        </Link>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 lg:p-10">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Get started</h1>
            <p className="text-white/60">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm text-white/80">Name</Label>
              <Input
                id="name"
                name="name"
                placeholder="Your name"
                required
                className="bg-white/5 border-white/10 text-white h-12 placeholder:text-white/40 focus:border-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm text-white/80">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
                className="bg-white/5 border-white/10 text-white h-12 placeholder:text-white/40 focus:border-white/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm text-white/80">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                minLength={6}
                placeholder="Min 6 characters"
                className="bg-white/5 border-white/10 text-white h-12 placeholder:text-white/40 focus:border-white/30"
              />
            </div>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <Button type="submit" className="w-full h-12 bg-white text-black hover:bg-white/90 font-semibold" disabled={loading}>
              {loading ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-sm text-white/60 pt-2">
              Already have an account?{" "}
              <Link href="/login" className="text-white hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}