"use client";
import { cn } from "@/lib/utils";
import { createContext, useContext, useState } from "react";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType>({ activeTab: "", setActiveTab: () => {} });

export function Tabs({
  children,
  defaultValue,
  className,
}: {
  children: React.ReactNode;
  defaultValue: string;
  className?: string;
}) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex border-b border-slate-200 overflow-x-auto", className)}>{children}</div>
  );
}

export function TabsTrigger({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;
  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors",
        isActive
          ? "border-blue-600 text-blue-600"
          : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300",
        className
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ children, value, className }: { children: React.ReactNode; value: string; className?: string }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;
  return <div className={cn("mt-4", className)}>{children}</div>;
}
