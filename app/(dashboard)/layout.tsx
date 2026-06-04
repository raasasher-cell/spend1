import { Sidebar } from "@/components/layout/Sidebar";
import { TopBar } from "@/components/layout/TopBar";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { AppProvider } from "@/lib/store";
import { ToastContainer } from "@/components/ui/toast";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const demoMode = process.env.DEMO_MODE === "true";
  return (
    <AppProvider>
      <div className="min-h-screen bg-slate-50">
        <Sidebar />
        <TopBar />
        <main className="ml-56 pt-14 min-h-screen">
          {demoMode && <DemoBanner />}
          <div className="p-6">{children}</div>
        </main>
        <ToastContainer />
      </div>
    </AppProvider>
  );
}
