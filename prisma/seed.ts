import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const COMPANIES = [
  "Google", "Microsoft", "Apple", "Amazon", "Meta", "Tesla", "Netflix", "Spotify",
  "Stripe", "Airbnb", "Uber", "Discord", "Twitch", "GitHub", "GitLab",
  "Notion", "Figma", "Slack", "Zoom", "Datadog", "Cloudflare", "Vercel",
  "Anthropic", "OpenAI", "Hugging Face", "Databricks", "Canva", "Instacart"
];

const ROLES = [
  "Senior Software Engineer", "Full Stack Engineer", "Frontend Engineer",
  "Backend Engineer", "DevOps Engineer", "Product Manager", "Data Scientist",
  "Machine Learning Engineer", "UI/UX Designer", "Solutions Architect",
  "Engineering Manager", "Staff Engineer", "Principal Engineer"
];

const LOCATIONS = [
  "San Francisco, CA", "New York, NY", "Seattle, WA", "Austin, TX",
  "Los Angeles, CA", "Chicago, IL", "Boston, MA", "Denver, CO",
  "Remote", "Hybrid - San Francisco", "London, UK", "Toronto, Canada"
];

const STATUSES = ["Applied", "Interview", "Offer", "Rejected"];

function generateFakeApplications(count: number) {
  const applications = [];
  const baseDate = new Date("2024-01-01");
  
  for (let i = 0; i < count; i++) {
    const daysAgo = Math.floor(Math.random() * 90);
    const appliedAt = new Date(baseDate);
    appliedAt.setDate(appliedAt.getDate() + daysAgo);
    
    // Bias towards more recent applications
    const weightedDaysAgo = daysAgo > 45 ? Math.floor(Math.random() * 45) : daysAgo;
    const realisticDate = new Date(baseDate);
    realisticDate.setDate(realisticDate.getDate() + weightedDaysAgo);
    
    const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    const salary = Math.random() > 0.3 
      ? `$${100 + Math.floor(Math.random() * 250)}k - $${200 + Math.floor(Math.random() * 300)}k`
      : null;
    
    applications.push({
      company: COMPANIES[Math.floor(Math.random() * COMPANIES.length)],
      role: ROLES[Math.floor(Math.random() * ROLES.length)],
      status,
      location: LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)],
      salary,
      notes: ["Great team culture", "Interesting problem space", "Strong growth opportunity", "Competitive benefits"][Math.floor(Math.random() * 4)],
      appliedAt: realisticDate,
    });
  }
  
  return applications;
}

async function main() {
  // Clear existing data
  await prisma.application.deleteMany();
  await prisma.user.deleteMany();

  // Create demo user
  const demoUser = await prisma.user.create({
    data: {
      name: "Alex Johnson",
      email: "demo@example.com",
      password: await bcrypt.hash("demo123456", 10),
    },
  });

  console.log(`Created demo user: ${demoUser.email}`);

  // Generate and create fake applications
  const fakeApplications = generateFakeApplications(28);
  
  let successCount = 0;
  for (const app of fakeApplications) {
    try {
      await prisma.application.create({
        data: {
          ...app,
          userId: demoUser.id,
        },
      });
      successCount++;
    } catch (error) {
      console.error("Error creating application:", error);
    }
  }

  console.log(`Created ${successCount} fake applications`);

  // Log statistics
  const stats = await prisma.application.groupBy({
    by: ["status"],
    where: { userId: demoUser.id },
    _count: true,
  });

  console.log("\nSeeded data statistics:");
  stats.forEach((s) => {
    console.log(`  ${s.status}: ${s._count}`);
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("\n✅ Database seeding complete!");
  })
  .catch(async (e) => {
    console.error("Seeding error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
