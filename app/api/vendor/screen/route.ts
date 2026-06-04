import { NextRequest, NextResponse } from "next/server";

const MOCK_LISTS = ["OFAC SDN", "EU Financial Sanctions", "UN Consolidated List", "FinCEN 314(a)"];
const MOCK_PEP_SOURCES = ["PEP Database (World-Check)", "PEP Database (Dow Jones)"];

function simulateScreening(name: string, id: string) {
  // Deterministically simulate hits based on ID hash for consistent demo results
  const seed = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const hasHit = seed % 7 === 0;
  const hasPep = seed % 5 === 0;

  return {
    requestId: `SCR-${Date.now()}`,
    entityName: name,
    entityId: id,
    timestamp: new Date().toISOString(),
    vendor: "LexisNexis Risk Solutions",
    results: [
      ...MOCK_LISTS.map(list => ({
        list,
        result: hasHit && list === "OFAC SDN" ? "Potential Match" : "Clear",
        matchScore: hasHit && list === "OFAC SDN" ? 78 : null,
        matchedEntry: hasHit && list === "OFAC SDN" ? `${name.split(" ")[0]} Holdings LLC` : null,
      })),
      ...MOCK_PEP_SOURCES.map(source => ({
        list: source,
        result: hasPep ? "PEP Match" : "Clear",
        matchScore: hasPep ? 91 : null,
        matchedEntry: hasPep ? `${name.split(" ")[0]} - Senior Government Official` : null,
      })),
    ],
    overallStatus: hasHit ? "Hit" : hasPep ? "PEP" : "Clear",
    processingTimeMs: 240 + Math.floor(seed % 300),
  };
}

export async function POST(req: NextRequest) {
  const { name, entityId } = await req.json();
  if (!name || !entityId) return NextResponse.json({ error: "name and entityId required" }, { status: 400 });

  // Simulate vendor latency
  await new Promise(r => setTimeout(r, 600));

  return NextResponse.json(simulateScreening(name, entityId));
}
