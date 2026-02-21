import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const applications = await prisma.application.findMany({
    where: { userId: user.id },
    orderBy: { appliedAt: "desc" },
  });

  return NextResponse.json(applications);
}

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const body = await req.json();
  const application = await prisma.application.create({
    data: {
      company: body.company,
      role: body.role,
      status: body.status || "Applied",
      location: body.location,
      salary: body.salary,
      notes: body.notes,
      userId: user.id,
    },
  });

  return NextResponse.json(application);
}