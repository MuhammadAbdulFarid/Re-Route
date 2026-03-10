// Prisma Client Instance
// Re-Route - Reverse Logistics SaaS Platform

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "info", "warn", "error"],
});

export default prisma;
