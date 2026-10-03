import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { DM_Sans } from "next/font/google";

import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/custom/workspace/AppSidebar";
import { authOptions } from "@/lib/auth";

const dmSans = DM_Sans({ subsets: ["latin"] });

export default async function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Guard: only signed-in users can see /workspace/*
  const session = await getServerSession(authOptions);
  if (!session) redirect("/");

  return (
    <SidebarProvider className={dmSans.className}>
      <AppSidebar />
      <SidebarInset className="bg-[#F6F4FF]">
        <header className="flex h-14 items-center gap-2 px-4">
          <SidebarTrigger className="text-[#5A44C2] hover:bg-[#5A44C2]/10 hover:text-[#5A44C2]" />
        </header>
        <main className="flex-1 px-4 pb-10 md:px-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}