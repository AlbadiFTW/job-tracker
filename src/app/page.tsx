import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Shield, TrendingUp } from "lucide-react";

export default async function Home() {
  const session = await getServerSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Gradient background effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Nav */}
        <nav className="px-6 lg:px-12 py-8 flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="text-2xl font-bold tracking-tight">
            JobTrackr
          </div>
          <div className="flex gap-4">
            <Link href="/login">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                Sign in
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-white text-black hover:bg-white/90 font-semibold">
                Get started
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section className="px-6 lg:px-12 py-20 max-w-[1400px] mx-auto">
          <div className="max-w-5xl mx-auto text-center space-y-10 w-full">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-5 py-2 rounded-full">
              <Sparkles className="w-4 h-4 text-blue-400" />
              <span className="text-sm text-white/80">Your career command center</span>
            </div>

            {/* Main heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-tight tracking-tight">
              Own your <span className="text-blue-400">job search</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl lg:text-2xl text-white/60 max-w-2xl mx-auto font-light">
              Never lose track of a job application again.
              <br />
              Stay organized. Land faster.
            </p>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/register">
                <Button 
                  size="lg" 
                  className="bg-white text-black hover:bg-white/90 text-lg px-10 py-7 font-semibold group"
                >
                  Start for free
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 lg:px-12 py-32 max-w-[1400px] mx-auto">
          <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
            <div className="space-y-6 group">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold">Visual Pipeline</h3>
              <p className="text-xl text-white/50 leading-relaxed">
                See your entire job search at a glance with real-time analytics.
              </p>
            </div>

            <div className="space-y-6 group">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold">Smart Tracking</h3>
              <p className="text-xl text-white/50 leading-relaxed">
                Log applications in seconds. Track every stage effortlessly.
              </p>
            </div>

            <div className="space-y-6 group">
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-3xl font-bold">Private & Secure</h3>
              <p className="text-xl text-white/50 leading-relaxed">
                Your data stays yours. Encrypted, private, no tracking.
              </p>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="px-6 lg:px-12 py-32 max-w-[1400px] mx-auto">
          <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-white/10 rounded-3xl p-12 lg:p-20 text-center backdrop-blur-sm">
            <h2 className="text-5xl lg:text-6xl font-bold mb-6">
              Ready to win?
            </h2>
            <p className="text-2xl text-white/60 mb-10 max-w-2xl mx-auto">
              Join professionals using JobTrackr to land their dream roles.
            </p>
            <Link href="/register">
              <Button 
                size="lg" 
                className="bg-white text-black hover:bg-white/90 text-lg px-12 py-7 font-semibold"
              >
                Create free account
              </Button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 py-12 text-center text-white/40">
          <div className="px-6">
            <p className="text-sm">© 2026 JobTrackr. Built for serious job seekers.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}