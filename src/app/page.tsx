import Link from "next/link";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Briefcase, BarChart2, Bell, Shield } from "lucide-react";

export default async function Home() {
  const session = await getServerSession();
  
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-blue-400" />
          <span className="font-bold text-lg">JobTrackr</span>
        </div>
        <div className="flex gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-slate-400 hover:text-white">Sign in</Button>
          </Link>
          <Link href="/register">
            <Button className="bg-blue-600 hover:bg-blue-700">Get started free</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 py-28 text-center space-y-6">
        <div className="inline-block bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm px-4 py-1.5 rounded-full mb-2">
          Built for UAE job seekers
        </div>
        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
          Stop losing track of your{" "}
          <span className="text-blue-400">job applications</span>
        </h1>
        <p className="text-slate-400 text-xl max-w-2xl mx-auto">
          JobTrackr helps you organize every application, track interview stages,
          and stay on top of your job search — all in one place.
        </p>
        <div className="flex gap-4 justify-center pt-2">
          <Link href="/register">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base px-8">
              Start tracking for free
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="outline" className="text-base px-8 border-slate-700 text-slate-300 hover:text-white">
              Sign in
            </Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Everything you need to land your next role</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Briefcase,
              title: "Track Applications",
              desc: "Log every job you apply to with company, role, location, and salary details.",
              color: "text-blue-400",
              bg: "bg-blue-500/10",
            },
            {
              icon: BarChart2,
              title: "Visual Stats",
              desc: "See your application pipeline at a glance with real-time stats and charts.",
              color: "text-green-400",
              bg: "bg-green-500/10",
            },
            {
              icon: Bell,
              title: "Status Workflow",
              desc: "Move applications through Applied, Interview, Offer, and Rejected stages easily.",
              color: "text-yellow-400",
              bg: "bg-yellow-500/10",
            },
            {
              icon: Shield,
              title: "Secure & Private",
              desc: "Your data is encrypted and only visible to you. No ads, no selling data.",
              color: "text-purple-400",
              bg: "bg-purple-500/10",
            },
          ].map((f) => (
            <div key={f.title} className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-3 hover:border-slate-700 transition-colors">
              <div className={`w-10 h-10 ${f.bg} rounded-lg flex items-center justify-center`}>
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-lg">{f.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-2xl mx-auto px-6 py-20 text-center space-y-6">
        <h2 className="text-3xl font-bold">Ready to get organized?</h2>
        <p className="text-slate-400">Join job seekers who use JobTrackr to stay on top of their search.</p>
        <Link href="/register">
          <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-base px-10">
            Create your free account
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 text-center text-slate-500 text-sm">
        <div className="flex items-center justify-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-400" />
          <span>JobTrackr — Built with Next.js, Prisma & PostgreSQL</span>
        </div>
      </footer>
    </div>
  );
}