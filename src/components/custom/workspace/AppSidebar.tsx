"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Plus, Store, Ellipsis, Sparkles } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { AgentConfig } from "@/db/schema"; // type-only: keeps drizzle out of the client bundle

/*
  Design tokens
  grad      #8B72EC -> #5A44C2   sidebar + primary gradient
  deep      #4B3BB0              text on white pills
  ink       #2E2380              headings on white
*/

// Gradient skin applied to shadcn's inner sidebar surface.
const skin =
  "[&_[data-sidebar=sidebar]]:isolate [&_[data-sidebar=sidebar]]:relative [&_[data-sidebar=sidebar]]:overflow-hidden [&_[data-sidebar=sidebar]]:[background-image:linear-gradient(180deg,#8B72EC_0%,#5A44C2_100%)]";

// Agent / nav row styles
const row =
  "h-11 gap-3 rounded-2xl px-3 text-white/85 transition-colors hover:bg-white/10 hover:text-white active:bg-white/20 active:text-white data-[active=true]:bg-white data-[active=true]:font-medium data-[active=true]:text-[#4B3BB0] data-[active=true]:shadow-sm";

const initials = (name?: string | null) =>
  (name ?? "")
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase() || "U";

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  const [agents, setAgents] = React.useState<AgentConfig[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Load the user's agents. Runs on login and again on every route change,
  // so a freshly created agent shows up as soon as you land on its page.
  React.useEffect(() => {
    if (status === "loading") return;
    if (status === "unauthenticated") {
      setAgents([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/agent", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: AgentConfig[] = await res.json();
        if (!cancelled) setAgents(data);
      } catch (error) {
        console.error("Failed to load agents:", error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [status, pathname]);

  const user = session?.user;

  return (
    <Sidebar
      {...props}
      className={skin}
      style={
        {
          "--sidebar": "#6C54D4",
          "--sidebar-foreground": "#FFFFFF",
          "--sidebar-border": "rgba(255,255,255,0.15)",
          "--sidebar-accent": "rgba(255,255,255,0.12)",
          "--sidebar-accent-foreground": "#FFFFFF",
        } as React.CSSProperties
      }
    >
      {/* Soft concentric circles in the background */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-16 -z-10 size-56 rounded-full bg-white/[0.07]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 -left-20 -z-10 size-72 rounded-full bg-white/[0.07]"
      />

      {/* Logo + CTA */}
      <SidebarHeader className="gap-6 px-4 pt-6">
        <Link href="/workspace" className="flex items-center gap-3">
          <Image
            src="/logo.jpeg"
            alt="Orbit logo"
            width={36}
            height={36}
            priority
            className="size-9 rounded-full object-cover ring-2 ring-white/40"
          />
          <span className="text-xl font-bold tracking-tight text-white">
            Orbit
          </span>
        </Link>

        <Button
          asChild
          className="h-12 w-full justify-start gap-3 rounded-full bg-white px-3 text-[15px] font-semibold text-[#4B3BB0] shadow-[0_10px_24px_-8px_rgba(20,10,80,0.55)] hover:bg-white/90"
        >
          <Link href="/workspace/create-agents">
            <span className="grid size-6 place-items-center rounded-full bg-[linear-gradient(135deg,#8B72EC,#5A44C2)] text-white">
              <Plus className="size-4" />
            </span>
            Create new agent
          </Link>
        </Button>
      </SidebarHeader>

      {/* Agents */}
      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center justify-between px-3 text-xs font-medium text-white/70">
            <span>Your agents</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-[11px] tabular-nums text-white">
              {loading ? "…" : agents.length}
            </span>
          </SidebarGroupLabel>

          <SidebarGroupContent>
            {loading ? (
              <div className="space-y-1 px-1">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-11 animate-pulse rounded-2xl bg-white/10"
                  />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="mx-1 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-white/30 px-4 py-6 text-center">
                <Sparkles className="size-5 text-white/80" />
                <p className="text-sm font-medium text-white">No agents yet</p>
                <p className="text-xs text-white/70">
                  Create your first agent and it will show up here.
                </p>
              </div>
            ) : (
              <SidebarMenu className="gap-1">
                {agents.map((agent) => {
                  const href = `/workspace/${agent.id}`;
                  const active =
                    pathname === href || pathname.startsWith(`${href}/`);

                  return (
                    <SidebarMenuItem key={agent.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={active}
                        className={row}
                      >
                        <Link href={href}>
                          <Avatar className="size-7 bg-white/20 ring-2 ring-white/30">
                            <AvatarImage
                              src={agent.agentImage ?? undefined}
                              alt={agent.name}
                            />
                            <AvatarFallback className="bg-white/20 text-[10px] text-white">
                              {initials(agent.name)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="truncate text-sm">{agent.name}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="gap-2 border-t border-white/15 px-3 py-4">
        <SidebarMenu className="gap-2">
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              isActive={pathname.startsWith("/workspace/marketplace")}
              className={row}
            >
              <Link href="/workspace/marketplace">
                <Store className="size-[18px]" />
                <span className="text-sm">Marketplace</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-14 gap-3 rounded-2xl bg-white px-3 text-[#2E2380] shadow-[0_10px_24px_-10px_rgba(20,10,80,0.5)] hover:bg-white/95 hover:text-[#2E2380] active:bg-white active:text-[#2E2380]"
            >
              <Avatar className="size-9 ring-2 ring-[#8B72EC]/50">
                <AvatarImage src={user?.image ?? undefined} alt={user?.name ?? "User"} />
                <AvatarFallback className="bg-[#EFEAFF] text-[#4B3BB0]">
                  {initials(user?.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left leading-tight">
                <span className="truncate text-sm font-semibold">
                  {user?.name ?? "Your account"}
                </span>
                <span className="truncate text-xs text-[#7A74A8]">
                  {user?.email ?? ""}
                </span>
              </div>
              <Ellipsis className="size-4 text-[#7A74A8]" />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}