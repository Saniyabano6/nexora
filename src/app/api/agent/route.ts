import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { desc, eq } from "drizzle-orm";

import { db } from "../../../db";
import { agentConfig } from "@/db/schema";
import { authOptions } from "@/lib/auth";

// GET /api/agent -> all agents of the logged-in user (newest first)
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const agents = await db
      .select()
      .from(agentConfig)
      .where(eq(agentConfig.userEmail, session.user.email))
      .orderBy(desc(agentConfig.createdAt));

    return NextResponse.json(agents);
  } catch (error) {
    console.error("Failed to fetch agents:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
}

// POST /api/agent -> create a new agent for the logged-in user
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, description, agentImage } = await req.json();

  if (typeof name !== "string" || !name.trim()) {
    return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
  }

  try {
    const [agent] = await db
      .insert(agentConfig)
      .values({
        name: name.trim(),
        description: description?.trim() || null,
        agentImage: agentImage || null,
        userEmail: session.user.email,
      })
      .returning();

    return NextResponse.json(
      { message: "Agent configuration saved successfully", agent },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create agent:", error);
    return NextResponse.json({ error: "Failed to create agent" }, { status: 500 });
  }
}