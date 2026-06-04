import { NextRequest, NextResponse } from "next/server";

const VENDOR_STATUS: Record<string, { latencyMs: number; version: string }> = {
  jumio: { latencyMs: 45, version: "4.2.1" },
  lexisnexis: { latencyMs: 82, version: "3.7" },
  worldcheck: { latencyMs: 67, version: "2024.Q2" },
  factiva: { latencyMs: 91, version: "12.4" },
  unit21: { latencyMs: 38, version: "5.1.0" },
  awss3: { latencyMs: 12, version: "latest" },
  fincen: { latencyMs: 210, version: "BSA-Track 2.3" },
};

export async function POST(req: NextRequest) {
  const { vendor } = await req.json();
  const key = vendor?.toLowerCase().replace(/[^a-z0-9]/g, "") ?? "";
  const info = VENDOR_STATUS[key];

  if (!info) return NextResponse.json({ error: "Unknown vendor" }, { status: 400 });

  await new Promise(r => setTimeout(r, info.latencyMs + Math.floor(Math.random() * 30)));

  return NextResponse.json({
    vendor,
    status: "Connected",
    latencyMs: info.latencyMs + Math.floor(Math.random() * 20),
    version: info.version,
    lastSync: new Date().toISOString(),
    rateLimit: { remaining: 4987, limit: 5000, resetsIn: "32m" },
  });
}
