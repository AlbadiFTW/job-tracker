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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold">Analytics</h1>
            <p className="text-slate-400 text-sm">Your job application metrics</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm">Total Applications</p>
              <p className="text-3xl font-bold mt-2">{totalApplications}</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm">Interview Rate</p>
              <p className="text-3xl font-bold mt-2 text-yellow-400">{interviewRate}%</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm">Offer Rate</p>
              <p className="text-3xl font-bold mt-2 text-green-400">{offerRate}%</p>
            </CardContent>
          </Card>
          <Card className="bg-slate-900 border-slate-800">
            <CardContent className="pt-6">
              <p className="text-slate-400 text-sm">Rejection Rate</p>
              <p className="text-3xl font-bold mt-2 text-red-400">{totalApplications > 0 ? (rejected / totalApplications * 100).toFixed(1) : 0}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        {loading ? (
          <p className="text-slate-400 text-center py-12">Loading...</p>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Timeline Chart */}
            <Card className="bg-slate-900 border-slate-800 col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Applications Over Time</CardTitle>
              </CardHeader>
              <CardContent>
                {timelineData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timelineData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="week" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                      <Line
                        type="monotone"
                        dataKey="applications"
                        stroke="#3b82f6"
                        dot={{ fill: "#3b82f6", r: 5 }}
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-center py-12">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Status Distribution */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {statusData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={STATUS_COLORS[entry.name]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          borderRadius: "8px",
                        }}
                        labelStyle={{ color: "#e2e8f0" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-center py-12">No data available</p>
                )}
              </CardContent>
            </Card>

            {/* Application Breakdown */}
            <Card className="bg-slate-900 border-slate-800">
              <CardHeader>
                <CardTitle>Application Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Applied", value: applications.filter(a => a.status === "Applied").length, color: "bg-blue-500/20" },
                  { label: "Interview", value: interviews, color: "bg-yellow-500/20" },
                  { label: "Offers", value: offers, color: "bg-green-500/20" },
                  { label: "Rejected", value: rejected, color: "bg-red-500/20" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center justify-between">
                    <span className="text-slate-400">{item.label}</span>
                    <div className="flex items-center gap-3">
                      <div className={`px-3 py-1 rounded ${item.color}`}>
                        {item.value}
                      </div>
                      {totalApplications > 0 && (
                        <span className="text-slate-500 text-sm">
                          {((item.value / totalApplications) * 100).toFixed(0)}%
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}