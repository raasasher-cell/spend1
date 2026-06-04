import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { prisma } from "@/lib/prisma";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  const { caseId } = await req.json();
  if (!caseId) return NextResponse.json({ error: "caseId required" }, { status: 400 });

  const caseData = await prisma.case.findUnique({
    where: { id: caseId },
    include: {
      notes: { orderBy: { timestamp: "asc" } },
      alerts: { orderBy: { createdDate: "desc" } },
      sarReviews: { select: { id: true, status: true, amount: true, narrative: true } },
    },
  });

  if (!caseData) return NextResponse.json({ error: "Case not found" }, { status: 404 });

  const alertSummary = caseData.alerts.map(a =>
    `- ${a.id}: ${a.type} (${a.source}) | Risk: ${a.riskScore}/100 | Priority: ${a.priority ?? "N/A"} | Status: ${a.status} | ${a.description}`
  ).join("\n");

  const notesSummary = caseData.notes.map(n =>
    `[${n.timestamp.slice(0, 10)} | ${n.author} | ${n.type}] ${n.content}`
  ).join("\n");

  const prompt = `You are a compliance analyst assistant helping with AML/BSA case review. Provide a concise, professional case summary for a compliance officer.

CASE: ${caseData.id}
Customer: ${caseData.customerName} (ID: ${caseData.customerId})
Status: ${caseData.status} | Priority: ${caseData.priority}
Assigned To: ${caseData.assignedTo}
Created: ${caseData.createdDate} | Updated: ${caseData.updatedDate}
Description: ${caseData.description}
SAR Status: ${caseData.sarStatus ?? "None"}

LINKED ALERTS (${caseData.alerts.length}):
${alertSummary || "No alerts linked."}

CASE NOTES (${caseData.notes.length}):
${notesSummary || "No notes added."}

SAR REVIEWS: ${caseData.sarReviews.length > 0 ? `${caseData.sarReviews.length} review(s), latest status: ${caseData.sarReviews[0]?.status}` : "None"}

Write a 3-4 paragraph compliance case summary covering:
1. Key risk indicators and typologies observed
2. Investigation timeline and actions taken
3. Current case status and recommended next steps
4. SAR recommendation (if applicable)

Be professional, factual, and concise. Do not invent details not present in the data.`;

  const stream = await client.messages.stream({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    messages: [{ role: "user", content: prompt }],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      for await (const chunk of stream) {
        if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
          controller.enqueue(encoder.encode(chunk.delta.text));
        }
      }
      controller.close();
    },
  });

  return new NextResponse(readable, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Transfer-Encoding": "chunked",
      "Cache-Control": "no-cache",
    },
  });
}
