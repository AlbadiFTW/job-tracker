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
  status: string;
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

const defaultForm = {
  company: "", role: "", status: "Applied" as const,
  location: "", salary: "", notes: "",
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
  const [form, setForm] = useState(defaultForm);

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
      setForm(defaultForm);
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
      setForm(defaultForm);
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
      status: app.status,
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
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Job Tracker</h1>
          <p className="text-slate-400 text-sm">Welcome back, {session?.user?.name}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/analytics">
            <Button variant="ghost" className="text-slate-400 hover:text-white">
              <BarChart2 className="w-4 h-4 mr-2" /> Analytics
            </Button>
          </Link>
          <Button variant="ghost" onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-slate-400 hover:text-white">
            <LogOut className="w-4 h-4 mr-2" /> Sign out
          </Button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Applied", value: stats.total, icon: Briefcase, color: "text-blue-400" },
            { label: "Interviews", value: stats.interview, icon: Clock, color: "text-yellow-400" },
            { label: "Offers", value: stats.offer, icon: CheckCircle, color: "text-green-400" },
            { label: "Rejected", value: stats.rejected, icon: XCircle, color: "text-red-400" },
          ].map((stat) => (
            <Card key={stat.label} className="bg-slate-900 border-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                    <p className="text-3xl font-bold mt-1">{stat.value}</p>
                  </div>
                  <stat.icon className={`w-8 h-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6">
          <Input
            placeholder="Search by company, role, or location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-slate-900 border-slate-800 text-white placeholder-slate-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["All", "Applied", "Interview", "Offer", "Rejected"].map((s) => (
              <Button key={s} variant={filter === s ? "default" : "ghost"}
                size="sm" onClick={() => setFilter(s)}
                className={filter !== s ? "text-slate-400" : ""}>
                {s}
              </Button>
            ))}
          </div>

          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <PlusCircle className="w-4 h-4 mr-2" /> Add Application
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-800 text-white">
              <DialogHeader>
                <DialogTitle>New Application</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company *</Label>
                    <Input required value={form.company}
                      onChange={e => setForm({ ...form, company: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="Google" />
                  </div>
                  <div className="space-y-2">
                    <Label>Role *</Label>
                    <Input required value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="Frontend Engineer" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Location</Label>
                    <Input value={form.location}
                      onChange={e => setForm({ ...form, location: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="Dubai, UAE" />
                  </div>
                  <div className="space-y-2">
                    <Label>Salary</Label>
                    <Input value={form.salary}
                      onChange={e => setForm({ ...form, salary: e.target.value })}
                      className="bg-slate-800 border-slate-700"
                      placeholder="15,000 AED" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Input value={form.notes}
                    onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Any notes..." />
                </div>
                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                  Add Application
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Applications List */}
        {loading ? (
          <p className="text-slate-400 text-center py-12">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="w-12 h-12 text-slate-700 mx-auto mb-4" />
            <p className="text-slate-400">No applications yet. Add your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((app) => (
              <Card key={app.id} className="bg-slate-900 border-slate-800 hover:border-slate-700 transition-colors">
                <CardContent className="py-4 px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-blue-400">
                        {app.company[0]}
                      </div>
                      <div>
                        <p className="font-semibold">{app.role}</p>
                        <p className="text-slate-400 text-sm">{app.company}
                          {app.location && <span> · {app.location}</span>}
                          {app.salary && <span> · {app.salary}</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 text-sm">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </span>
                      <Select value={app.status} onValueChange={v => handleStatusChange(app.id, v)}>
                        <SelectTrigger className={`w-32 text-xs border ${STATUS_COLORS[app.status]} bg-transparent`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="ghost" size="sm"
                        onClick={() => openEditModal(app)}
                        className="text-slate-500 hover:text-blue-400">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm"
                        onClick={() => handleDelete(app.id)}
                        className="text-slate-500 hover:text-red-400">
                        ✕
                      </Button>
                    </div>
                  </div>
                  {app.notes && <p className="text-slate-500 text-sm mt-2 ml-14">{app.notes}</p>}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Edit Modal */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="bg-slate-900 border-slate-800 text-white">
            <DialogHeader>
              <DialogTitle>Edit Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Company *</Label>
                  <Input required value={form.company}
                    onChange={e => setForm({ ...form, company: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Google" />
                </div>
                <div className="space-y-2">
                  <Label>Role *</Label>
                  <Input required value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Frontend Engineer" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Location</Label>
                  <Input value={form.location}
                    onChange={e => setForm({ ...form, location: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="Dubai, UAE" />
                </div>
                <div className="space-y-2">
                  <Label>Salary</Label>
                  <Input value={form.salary}
                    onChange={e => setForm({ ...form, salary: e.target.value })}
                    className="bg-slate-800 border-slate-700"
                    placeholder="15,000 AED" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    {["Applied", "Interview", "Offer", "Rejected"].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Notes</Label>
                <Input value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  className="bg-slate-800 border-slate-700"
                  placeholder="Any notes..." />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                Save Changes
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}