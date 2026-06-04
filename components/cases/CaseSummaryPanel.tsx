"use client";
import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Copy, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CaseSummaryPanel({ caseId }: { caseId: string }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    setLoading(true);
    setError("");
    setSummary("");
    try {
      const res = await fetch("/api/ai/case-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseId }),
      });
      if (!res.ok) { setError("Failed to generate summary"); setLoading(false); return; }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      if (!reader) { setLoading(false); return; }

      let text = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        text += decoder.decode(value, { stream: true });
        setSummary(text);
      }
    } catch {
      setError("Failed to generate summary — check your API key.");
    } finally {
      setLoading(false);
    }
  }

  async function copy() {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-white overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-purple-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-purple-600" />
          <span className="text-sm font-semibold text-purple-900">AI Case Summary</span>
          <span className="text-[10px] font-semibold px-1.5 py-0.5 bg-purple-100 text-purple-600 rounded">Beta</span>
        </div>
        <div className="flex gap-2">
          {summary && (
            <Button variant="ghost" size="sm" onClick={copy} className="text-xs text-purple-600 hover:bg-purple-100">
              {copied ? <><CheckCheck className="w-3.5 h-3.5 mr-1" /> Copied</> : <><Copy className="w-3.5 h-3.5 mr-1" /> Copy</>}
            </Button>
          )}
          {summary && !loading && (
            <Button variant="ghost" size="sm" onClick={generate} className="text-xs text-purple-600 hover:bg-purple-100">
              <RefreshCw className="w-3.5 h-3.5 mr-1" /> Regenerate
            </Button>
          )}
        </div>
      </div>

      <div className="p-4">
        {!summary && !loading && !error && (
          <div className="text-center py-6">
            <Sparkles className="w-8 h-8 text-purple-300 mx-auto mb-3" />
            <p className="text-sm text-slate-600 mb-1">Generate an AI-powered compliance summary</p>
            <p className="text-xs text-slate-400 mb-4">Analyzes alerts, notes, and case history to produce a structured summary for compliance review</p>
            <Button variant="primary" onClick={generate} className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate Summary
            </Button>
          </div>
        )}

        {loading && !summary && (
          <div className="flex items-center gap-2 py-4 text-purple-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Analyzing case data...</span>
          </div>
        )}

        {error && (
          <div className="text-xs text-red-600 bg-red-50 px-3 py-2 rounded-md">{error}</div>
        )}

        {summary && (
          <div className="prose prose-sm max-w-none">
            {summary.split("\n\n").map((para, i) => (
              <p key={i} className="text-sm text-slate-700 leading-relaxed mb-3 last:mb-0">{para}</p>
            ))}
            {loading && (
              <span className="inline-block w-1.5 h-4 bg-purple-400 animate-pulse ml-0.5 align-middle" />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
