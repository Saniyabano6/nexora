"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shuffle, Loader2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const MAX_DESCRIPTION = 300;
const NAME_IDEAS = [
  "Research Assistant",
  "Code Reviewer",
  "Study Buddy",
];

const avatarUrl = (seed: string) =>
  `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(
    seed
  )}`;

const randomSeed = () => Math.random().toString(36).slice(2, 10);

// Shared field styling
const field =
  "rounded-2xl border-transparent bg-[#F6F4FF] text-[#2E2380] placeholder:text-[#9A95C4] shadow-none focus-visible:border-[#8B72EC] focus-visible:bg-white focus-visible:ring-[#8B72EC]/25";

type AgentResponse = {
  message?: string;
  error?: string;
  agent?: {
    id: number;
    name: string;
    description?: string | null;
    agentImage?: string | null;
    userEmail?: string;
  };
};

export default function CreateAgentPage() {
  const router = useRouter();

  const [seed, setSeed] = React.useState("orbit-agent");
  const [spins, setSpins] = React.useState(0);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const shuffle = () => {
    setSeed(randomSeed());
    setSpins((current) => current + 1);
  };

  const canSubmit = name.trim().length > 0 && !submitting;

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!canSubmit) {
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          agentImage: avatarUrl(seed),
        }),
      });

      const raw = await res.text();

      let data: AgentResponse = {};

      try {
        data = raw ? JSON.parse(raw) : {};
      } catch {
        throw new Error(
          `Server returned a non-JSON response (HTTP ${res.status}).`
        );
      }

      if (!res.ok) {
        throw new Error(
          data.error ||
            `Failed to create agent. Server returned HTTP ${res.status}.`
        );
      }

      if (!data.agent?.id) {
        throw new Error(
          "Agent was created, but the server did not return an agent ID."
        );
      }

      // Refresh the Next.js data and then navigate to the newly-created agent.
      router.refresh();
      router.push(`/workspace/${data.agent.id}`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong while creating the agent."
      );

      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Heading */}
      <header className="space-y-2 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[#2E2380]">
          Create new agent
        </h1>

        <p className="mx-auto max-w-md text-sm leading-relaxed text-[#6B66A0]">
          Set up your AI agent by choosing an avatar, name and description.
          You can configure its tools and behavior later.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="mt-8 space-y-8 rounded-3xl bg-white p-6 shadow-[0_24px_60px_-28px_rgba(90,68,194,0.45)] sm:p-8"
      >
        {/* Avatar */}
        <section className="flex flex-col items-center gap-5">
          <div className="relative size-44">
            <div className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#EDE8FF,#DDD3FF)]" />

            {/* Dashed orbit */}
            <div
              aria-hidden
              className="absolute inset-1 rounded-full border border-dashed border-[#8B72EC]/60 transition-transform duration-700 ease-out"
              style={{
                transform: `rotate(${spins * 120}deg)`,
              }}
            >
              <span className="absolute -top-1.5 left-1/2 size-3 -translate-x-1/2 rounded-full bg-[#8B72EC]" />
            </div>

            <Avatar className="absolute inset-6 size-auto bg-white shadow-lg ring-4 ring-white">
              <AvatarImage
                src={avatarUrl(seed)}
                alt="Agent avatar"
              />

              <AvatarFallback className="bg-white text-[#4B3BB0]">
                AI
              </AvatarFallback>
            </Avatar>
          </div>

          <Button
            type="button"
            onClick={shuffle}
            className="h-10 gap-2 rounded-full bg-[#F0EDFF] px-5 font-medium text-[#4B3BB0] shadow-none hover:bg-[#E4DEFF]"
          >
            <Shuffle className="size-4" />
            Shuffle avatar
          </Button>
        </section>

        {/* Fields */}
        <section className="space-y-6">
          {/* Agent name */}
          <div className="space-y-2">
            <Label
              htmlFor="agent-name"
              className="font-semibold text-[#2E2380]"
            >
              Agent name
            </Label>

            <Input
              id="agent-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Research Assistant"
              maxLength={60}
              autoComplete="off"
              className={`h-12 px-4 ${field}`}
              disabled={submitting}
            />

            <div className="flex flex-wrap gap-2 pt-1">
              {NAME_IDEAS.map((idea) => (
                <button
                  key={idea}
                  type="button"
                  onClick={() => setName(idea)}
                  disabled={submitting}
                  className="rounded-full bg-[#FFF0E6] px-3 py-1 text-xs font-medium text-[#9A5B2E] transition-colors hover:bg-[#FFE4D1] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {idea}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label
                htmlFor="agent-description"
                className="font-semibold text-[#2E2380]"
              >
                Agent description
              </Label>

              <span className="text-xs tabular-nums text-[#9A95C4]">
                {description.length}/{MAX_DESCRIPTION}
              </span>
            </div>

            <Textarea
              id="agent-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this agent for? e.g. Finds sources, summarizes papers and answers questions about them."
              maxLength={MAX_DESCRIPTION}
              rows={5}
              disabled={submitting}
              className={`resize-none px-4 py-3 ${field}`}
            />
          </div>
        </section>

        {/* Error */}
        {error && (
          <p
            role="alert"
            className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-600"
          >
            {error}
          </p>
        )}

        {/* Actions */}
        <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            asChild
            type="button"
            variant="outline"
            className="h-12 rounded-full border-2 border-[#6B55D3] bg-white px-8 font-semibold text-[#5A44C2] shadow-none hover:bg-[#F6F4FF] hover:text-[#4B3BB0]"
          >
            <Link href="/workspace">Cancel</Link>
          </Button>

          <Button
            type="submit"
            disabled={!canSubmit}
            className="h-12 min-w-40 gap-2 rounded-full bg-[linear-gradient(90deg,#8B72EC,#5A44C2)] px-8 font-semibold text-white shadow-[0_12px_28px_-10px_rgba(90,68,194,0.75)] hover:brightness-105 disabled:opacity-50"
          >
            {submitting && (
              <Loader2 className="size-4 animate-spin" />
            )}

            {submitting ? "Creating..." : "Create agent"}
          </Button>
        </footer>
      </form>
    </div>
  );
}