import { LandingPage } from "@/components/LandingPage";

export default function Home() {
  return <LandingPage isDemoMode={process.env.DEMO_MODE === "true"} />;
}
