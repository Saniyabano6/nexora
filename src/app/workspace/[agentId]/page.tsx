import { notFound, redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { and, eq } from "drizzle-orm";
import { Wrench, SlidersHorizontal } from "lucide-react";

import { db } from "../../../db";
import { agentConfig } from "@/db/schema";
import { authOptions } from "@/lib/auth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default async function AgentSpace({
  params,
}: {
  params: Promise<{ agentId: string }>;
}) {
  const { agentId } = await params;

  const session = await getServerSession(authOptions);
  if (!session?.user?.email) redirect("/api/auth/signin");

  const id = Number(agentId);
  if (!Number.isInteger(id)) notFound();

  // Only the owner can open an agent
  const [agent] = await db
    .select()
    .from(agentConfig)
    .where(and(eq(agentConfig.id, id), eq(agentConfig.userEmail, session.user.email)))
    .limit(1);

  if (!agent) notFound();

  const created = agent.createdAt.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6">
      {/* Agent header */}
      <section className="flex flex-col items-center gap-5 rounded-3xl bg-white p-8 text-center shadow-[0_24px_60px_-28px_rgba(90,68,194,0.45)] sm:flex-row sm:text-left">
        <div className="relative size-28 shrink-0">
          <div className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#EDE8FF,#DDD3FF)]" />
          <Avatar className="absolute inset-3 size-auto bg-white shadow-lg ring-4 ring-white">
            <AvatarImage src={agent.agentImage ?? undefined} alt={agent.name} />
            <AvatarFallback className="bg-white text-[#4B3BB0]">
              {initials(agent.name)}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="min-w-0 space-y-2">
          <h1 className="truncate text-3xl font-bold tracking-tight text-[#2E2380]">
            {agent.name}
          </h1>
          <p className="text-sm leading-relaxed text-[#6B66A0]">
            {agent.description || "No description added yet."}
          </p>
          <span className="inline-block rounded-full bg-[#FFF0E6] px-3 py-1 text-xs font-medium text-[#9A5B2E]">
            Created {created}
          </span>
        </div>
      </section>

      {/* Next steps */}
      <section className="grid gap-4 sm:grid-cols-2">
        {[
          { icon: Wrench, title: "Tools", text: "Choose what this agent can use." },
          { icon: SlidersHorizontal, title: "Behavior", text: "Set how it thinks and responds." },
        ].map(({ icon: Icon, title, text }) => (
          <div
            key={title}
            className="flex items-start gap-4 rounded-3xl bg-white p-6 shadow-[0_16px_40px_-28px_rgba(90,68,194,0.45)]"
          >
            <span className="grid size-10 place-items-center rounded-2xl bg-[#F0EDFF] text-[#5A44C2]">
              <Icon className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-[#2E2380]">{title}</h2>
              <p className="text-sm text-[#6B66A0]">{text}</p>
              <span className="mt-2 inline-block text-xs font-medium text-[#9A95C4]">
                Coming soon
              </span>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}