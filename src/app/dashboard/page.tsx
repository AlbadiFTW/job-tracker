"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PlusCircle, Briefcase, Clock, CheckCircle, XCircle, LogOut, BarChart2, Edit2 } from "lucide-react";

type Application = {
  id: string;
  company: string;
  role: string;
  status: "Applied" | "Interview" | "Offer" | "Rejected";
  location?: string;
  salary?: string;
  notes?: string;
  appliedAt: string;
};

const STATUS_COLORS: Record<string, string> = {
  Applied: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  Interview: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  Offer: "bg-green-500/20 text-green-400 border-green-500/30",
  Rejected: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const [applications, setApplications] = useState<Application[]>([]);
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<{
    company: string;
    role: string;
    status: "Applied" | "Interview" | "Offer" | "Rejected";
    location: string;
    salary: string;
    notes: string;
  }>({
    company: "", role: "", status: "Applied",
    location: "", salary: "", notes: "",
  });

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

  async function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault();
    const loadingToast = toast.loading("Adding application...");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to add application");
      toast.success("Application added successfully!", { id: loadingToast });
      setForm({
        company: "", role: "", status: "Applied",
        location: "", salary: "", notes: "",
      });
      setAddOpen(false);
      fetchApplications();
    } catch (error) {
      toast.error("Failed to add application", { id: loadingToast });
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editingId) return;
    const loadingToast = toast.loading("Updating application...");
    try {
      const res = await fetch(`/api/applications/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to update application");
      toast.success("Application updated successfully!", { id: loadingToast });
      setForm({
        company: "", role: "", status: "Applied",
        location: "", salary: "", notes: "",
      });
      setEditOpen(false);
      setEditingId(null);
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update application", { id: loadingToast });
    }
  }

  async function handleStatusChange(id: string, status: string) {
    const loadingToast = toast.loading("Updating status...");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      toast.success("Status updated!", { id: loadingToast });
      fetchApplications();
    } catch (error) {
      toast.error("Failed to update status", { id: loadingToast });
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm("Are you sure you want to delete this application?");
    if (!confirmed) return;
    
    const loadingToast = toast.loading("Deleting application...");
    try {
      const res = await fetch(`/api/applications/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete application");
      toast.success("Application deleted!", { id: loadingToast });
      fetchApplications();
    } catch (error) {
      toast.error("Failed to delete application", { id: loadingToast });
    }
  }

  function openEditModal(app: Application) {
    setEditingId(app.id);
    setForm({
      company: app.company,
      role: app.role,
      status: app.status as "Applied" | "Interview" | "Offer" | "Rejected",
      location: app.location || "",
      salary: app.salary || "",
      notes: app.notes || "",
    });
    setEditOpen(true);
  }

  const filtered = applications.filter(a => {
    const matchesStatus = filter === "All" || a.status === filter;
    const matchesSearch = search === "" || 
      a.company.toLowerCase().includes(search.toLowerCase()) ||
      a.role.toLowerCase().includes(search.toLowerCase()) ||
      (a.location?.toLowerCase().includes(search.toLowerCase()) ?? false);
    return matchesStatus && matchesSearch;
  });

  const stats = {
    total: applications.length,
    interview: applications.filter(a => a.status === "Interview").length,
    offer: applications.filter(a => a.status === "Offer").length,
    rejected: applications.filter(a => a.status === "Rejected").length,
  };

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
          <div className="max-w-[1400px] mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">JobTrackr</h1>
              <p className="text-white/50 text-sm mt-1">Welcome back, {session?.user?.name}</p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/analytics">
                <Button variant="ghost" className="text-white/70 hover:text-white hover:bg-white/5">
                  <BarChart2 className="w-4 h-4 mr-2" /> Analytics
                </Button>
              </Link>
              <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}
                className="text-white/70 hover:text-white hover:bg-white/5">
                <LogOut className="w-4 h-4 mr-2" /> Sign out
              </Button>
            </div>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6 lg:px-12 py-12 space-y-10">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
            {[
              { label: "Total Applied", value: stats.total, icon: Briefcase, color: "from-blue-500 to-blue-600" },
              { label: "Interviews", value: stats.interview, icon: Clock, color: "from-yellow-500 to-yellow-600" },
              { label: "Offers", value: stats.offer, icon: CheckCircle, color: "from-green-500 to-green-600" },
              { label: "Rejected", value: stats.rejected, icon: XCircle, color: "from-red-500 to-red-600" },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/60 text-sm mb-2">{stat.label}</p>
                    <p className="text-4xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                    <stat.icon className="w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div>
            <Input
              placeholder="Search by company, role, or location..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white/5 border-white/10 text-white h-12 placeholder:text-white/40 focus:border-white/30 text-base"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex gap-2 flex-wrap">
              {["All", "Applied", "Interview", "Offer", "Rejected"].map((s) => (
                <Button key={s} variant={filter === s ? "default" : "ghost"}
                  size="sm" onClick={() => setFilter(s)}
                  className={filter === s ? "bg-white text-black hover:bg-white/90" : "text-white/60 hover:text-white hover:bg-white/5"}>
                  {s}
                </Button>
              ))}
            </div>

            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger asChild>
                <Button className="bg-white text-black hover:bg-white/90 font-semibold">
                  <PlusCircle className="w-4 h-4 mr-2" /> Add Application
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-black border-white/10 text-white">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold">New Application</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">Company *</Label>
                      <Input required value={form.company}
                        onChange={e => setForm({ ...form, company: e.target.value })}
                        className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                        placeholder="Google" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Role *</Label>
                      <Input required value={form.role}
                        onChange={e => setForm({ ...form, role: e.target.value })}
                        className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                        placeholder="Frontend Engineer" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white/80">Location</Label>
                      <Input value={form.location}
                        onChange={e => setForm({ ...form, location: e.target.value })}
                        className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                        placeholder="Dubai, UAE" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Salary</Label>
                      <Input value={form.salary}
                        onChange={e => setForm({ ...form, salary: e.target.value })}
                        className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                        placeholder="15,000 AED" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Status</Label>
                    <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as "Applied" | "Interview" | "Offer" | "Rejected" })}>
                      <SelectTrigger className="bg-white/5 border-white/10 h-11 focus:border-white/30">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-white/10">
                        {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Notes</Label>
                    <Input value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                      placeholder="Any notes..." />
                  </div>
                  <Button type="submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold">
                    Add Application
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Applications List */}
          {loading ? (
            <p className="text-white/60 text-center py-20">Loading...</p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-white/60 text-lg">No applications yet</p>
              <p className="text-white/40 text-sm mt-1">Add your first one to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map((app) => (
                <div key={app.id} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/[0.07] transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center font-bold text-white text-lg">
                        {app.company[0]}
                      </div>
                      <div>
                        <p className="font-semibold text-lg">{app.role}</p>
                        <p className="text-white/50 text-sm">{app.company}
                          {app.location && <span> · {app.location}</span>}
                          {app.salary && <span> · {app.salary}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white/40 text-sm hidden sm:block">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      <Select value={app.status} onValueChange={v => handleStatusChange(app.id, v)}>
                        <SelectTrigger className={`w-32 text-xs border ${STATUS_COLORS[app.status]} bg-transparent h-8`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-900 border-white/10">
                          {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm"
                        onClick={() => openEditModal(app)}
                        className="text-white/40 hover:text-white hover:bg-white/5 h-8 w-8 p-0">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm"
                        onClick={() => handleDelete(app.id)}
                        className="text-white/40 hover:text-red-400 hover:bg-red-500/10 h-8 w-8 p-0">
                        ✕
                      </Button>
                    </div>
                  </div>
                  {app.notes && <p className="text-white/50 text-sm mt-3 ml-16">{app.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {/* Edit Modal */}
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogContent className="bg-black border-white/10 text-white">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Edit Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Company *</Label>
                    <Input required value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                      placeholder="Google" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Role *</Label>
                    <Input required value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                      placeholder="Frontend Engineer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-white/80">Location</Label>
                    <Input value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                      placeholder="Dubai, UAE" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-white/80">Salary</Label>
                    <Input value={form.salary}
                      onChange={e => setForm({ ...form, salary: e.target.value })}
                      className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                      placeholder="15,000 AED" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v as "Applied" | "Interview" | "Offer" | "Rejected" })}>
                    <SelectTrigger className="bg-white/5 border-white/10 h-11 focus:border-white/30">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10">
                      {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-white/80">Notes</Label>
                  <Input value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="bg-white/5 border-white/10 h-11 focus:border-white/30"
                    placeholder="Any notes..." />
                </div>
                <Button type="submit" className="w-full h-11 bg-white text-black hover:bg-white/90 font-semibold">
                  Save Changes
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}