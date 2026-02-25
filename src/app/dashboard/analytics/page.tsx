"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { ArrowLeft } from "lucide-react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: string;
  location?: string;
  salary?: string;
  notes?: string;
  appliedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  Applied: "#3b82f6",
  Interview: "#eab308",
  Offer: "#10b981",
  Rejected: "#ef4444",
};

export default function AnalyticsPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      const res = await fetch("/api/applications");
      if (!res.ok) {
        console.error("Failed to fetch applications");
        setApplications([]);
        setLoading(false);
        return;
      }
      const data = await res.json();
      setApplications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching applications:", error);
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  // Calculate timeline data (applications per week)
  const getTimelineData = () => {
    const weeks: Record<string, number> = {};
    
    applications.forEach((app) => {
      const date = new Date(app.appliedAt);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toISOString().split("T")[0];
      weeks[weekKey] = (weeks[weekKey] || 0) + 1;
    });

    return Object.entries(weeks)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([week, count]) => ({
        week: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        applications: count,
      }))
      .slice(-12); // Last 12 weeks
  };

  // Calculate status distribution
  const getStatusDistribution = () => {
    const statuses = ["Applied", "Interview", "Offer", "Rejected"];
    return statuses.map((status) => ({
      name: status,
      value: applications.filter((a) => a.status === status).length,
    })).filter(s => s.value > 0);
  };

  // Calculate success metrics
  const totalApplications = applications.length;
  const interviews = applications.filter(a => a.status === "Interview").length;
  const offers = applications.filter(a => a.status === "Offer").length;
  const rejected = applications.filter(a => a.status === "Rejected").length;
  
  const interviewRate = totalApplications > 0 ? ((interviews + offers) / totalApplications * 100).toFixed(1) : 0;
  const offerRate = totalApplications > 0 ? (offers / totalApplications * 100).toFixed(1) : 0;

  const timelineData = getTimelineData();
  const statusData = getStatusDistribution();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Background gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <div className="border-b border-white/10 px-6 lg:px-12 py-6">
          <div className="max-w-[1400px] mx-auto flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5 h-10 w-10 p-0">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold">Analytics</h1>
              <p className="text-white/50 text-sm mt-1">Your job search insights</p>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 space-y-10">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <p className="text-white/60 text-sm mb-2">Total Applications</p>
              <p className="text-4xl font-bold">{totalApplications}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <p className="text-white/60 text-sm mb-2">Interview Rate</p>
              <p className="text-4xl font-bold text-yellow-400">{interviewRate}%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <p className="text-white/60 text-sm mb-2">Offer Rate</p>
              <p className="text-4xl font-bold text-green-400">{offerRate}%</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <p className="text-white/60 text-sm mb-2">Rejection Rate</p>
              <p className="text-4xl font-bold text-red-400">{totalApplications > 0 ? (rejected / totalApplications * 100).toFixed(1) : 0}%</p>
            </div>
          </div>

          {/* Charts */}
          {loading ? (
            <p className="text-white/60 text-center py-20">Loading...</p>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Timeline Chart */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 col-span-1 lg:col-span-2">
                <h3 className="text-xl font-bold mb-6">Applications Over Time</h3>
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="week" stroke="rgba(255,255,255,0.5)" />
                      <YAxis stroke="rgba(255,255,255,0.5)" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="#60a5fa"
                        dot={{ fill: "#60a5fa", r: 5 }}
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/50 text-center py-12">No data available</p>
                )}
              </div>

              {/* Status Distribution */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6">Status Distribution</h3>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#000",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                        }}
                        labelStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-white/50 text-center py-12">No data available</p>
                )}
              </div>

              {/* Application Breakdown */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
                <h3 className="text-xl font-bold mb-6">Application Breakdown</h3>
                <div className="space-y-4">
                  {[
                    { label: "Applied", value: applications.filter(a => a.status === "Applied").length, color: "bg-blue-500/20 text-blue-400" },
                    { label: "Interview", value: interviews, color: "bg-yellow-500/20 text-yellow-400" },
                    { label: "Offers", value: offers, color: "bg-green-500/20 text-green-400" },
                    { label: "Rejected", value: rejected, color: "bg-red-500/20 text-red-400" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between">
                      <span className="text-white/70">{item.label}</span>
                      <div className="flex items-center gap-3">
                        <div className={`px-4 py-1.5 rounded-lg font-semibold ${item.color}`}>
                          {item.value}
                        </div>
                        {totalApplications > 0 && (
                          <span className="text-white/40 text-sm w-12 text-right">
                            {((item.value / totalApplications) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}