import { ShieldAlert } from "lucide-react";

export function DemoBanner() {
  return (
    <div className="sticky top-14 z-20 flex items-center justify-center gap-2 bg-amber-500 text-white text-sm font-semibold py-2 px-4 select-none">
      <ShieldAlert className="w-4 h-4 shrink-0" />
      Demo Environment — Mock Data Only — Not for Production Use
    </div>
  );
}
