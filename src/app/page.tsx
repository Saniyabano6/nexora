import Image from "next/image";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions } from "@/lib/auth";
import { SignInButtons } from "@/components/custom/auth/SignInbuttons";

export default async function Home() {
  // Already signed in? Skip this screen.
  const session = await getServerSession(authOptions);
  if (session) redirect("/workspace");

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[linear-gradient(180deg,#9B80F0_0%,#5A44C2_100%)]">
      {/* Soft concentric circles */}
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-white/[0.08]" />
      <div aria-hidden className="pointer-events-none absolute -left-32 top-1/3 size-96 rounded-full bg-white/[0.06]" />

      {/* Brand */}
      <div className="relative flex flex-1 flex-col items-center justify-center gap-4 px-6 pt-16 text-center">
        <Image
          src="/logo.jpeg"
          alt="Orbit logo"
          width={88}
          height={88}
          priority
          className="size-22 rounded-full object-cover ring-4 ring-white/40"
        />
        <h1 className="text-5xl font-bold tracking-tight text-white">Orbit</h1>
        <p className="max-w-xs text-base text-white/80">
          Create, customize and manage your own AI agents.
        </p>
      </div>

      {/* Sign-in sheet */}
      <section className="relative mx-auto w-full max-w-md rounded-t-[2.5rem] bg-white px-8 pb-10 pt-9 shadow-[0_-20px_60px_-20px_rgba(20,10,80,0.5)] sm:mb-10 sm:rounded-[2.5rem]">
        <h2 className="text-center text-2xl font-bold tracking-tight text-[#2E2380]">
          Welcome to Orbit
        </h2>
        <p className="mb-7 mt-2 text-center text-sm text-[#6B66A0]">
          Sign in to start building your agents.
        </p>
        <SignInButtons />
      </section>
    </main>
  );
}