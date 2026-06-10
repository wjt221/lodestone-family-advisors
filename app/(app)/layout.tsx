import { Sidebar } from "@/components/sidebar";
import { MobileNav } from "@/components/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <MobileNav />
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 overflow-x-hidden">
          <div className="mx-auto w-full max-w-[1180px] px-4 py-6 md:px-8 md:py-10 lg:px-12">
            {children}
          </div>
        </main>
      </div>
    </>
  );
}
