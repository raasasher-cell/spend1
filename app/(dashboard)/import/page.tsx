"use client";
import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Upload, CheckCircle, AlertTriangle, Download, FileText } from "lucide-react";

type ImportResult = { imported: number; errors: { row: number; error: string }[]; total: number } | null;

const TRANSACTION_TEMPLATE = `customerId,type,amount,currency,counterparty,date,channel,status,flagged
CUST-001,Wire Transfer,15000,USD,SWIFT Bank Corp,2026-06-04,Wire,Completed,false
CUST-002,ACH,2500,USD,Payroll Services Inc,2026-06-04,ACH,Completed,false`;

const ALERT_TEMPLATE = `customerId,type,source,riskScore,priority,description,assignedTo
CUST-001,Structuring,Transaction Monitoring,82,High,"Multiple transactions just below $10,000 threshold detected",
CUST-003,Sanctions Match,Sanctions Screening,95,Critical,Potential OFAC SDN list match detected,`;

function ImportPanel({ endpoint, templateData, templateName, fields }: {
  endpoint: string;
  templateData: string;
  templateName: string;
  fields: string[];
}) {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ImportResult>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(endpoint, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Upload failed"); return; }
      setResult(data);
    } catch {
      setError("Upload failed — check your connection.");
    } finally {
      setLoading(false);
    }
  }

  function downloadTemplate() {
    const blob = new Blob([templateData], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = templateName;
    a.click();
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Upload CSV File</span>
            <Button variant="ghost" size="sm" onClick={downloadTemplate}>
              <Download className="w-3.5 h-3.5 mr-1.5" /> Download Template
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              <p className="font-semibold text-slate-600 mb-1">Required columns:</p>
              <div className="flex flex-wrap gap-1.5">
                {fields.map(f => (
                  <span key={f} className="font-mono bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-[11px]">{f}</span>
                ))}
              </div>
            </div>

            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer
                ${file ? "border-blue-400 bg-blue-50" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"}`}
              onClick={() => inputRef.current?.click()}
              onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) { setFile(f); setResult(null); } }}
              onDragOver={e => e.preventDefault()}
            >
              <input ref={inputRef} type="file" accept=".csv" className="hidden"
                onChange={e => { const f = e.target.files?.[0]; if (f) { setFile(f); setResult(null); } }} />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-blue-700">{file.name}</p>
                    <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                </div>
              ) : (
                <>
                  <Upload className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Drop a CSV file here or <span className="text-blue-600">click to browse</span></p>
                  <p className="text-xs text-slate-400 mt-1">CSV files only, max 10MB</p>
                </>
              )}
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-md">{error}</p>}

            <Button variant="primary" disabled={!file || loading} onClick={handleUpload} className="w-full">
              {loading ? "Importing..." : "Import Records"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardContent className="py-4">
            <div className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${result.errors.length === 0 ? "bg-green-100" : "bg-amber-100"}`}>
                {result.errors.length === 0
                  ? <CheckCircle className="w-5 h-5 text-green-600" />
                  : <AlertTriangle className="w-5 h-5 text-amber-600" />}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  Import complete: {result.imported} of {result.total} records imported
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-2 space-y-1">
                    <p className="text-xs font-semibold text-red-600">{result.errors.length} row(s) with errors:</p>
                    {result.errors.map(e => (
                      <p key={e.row} className="text-xs text-red-500">Row {e.row}: {e.error}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default function ImportPage() {
  return (
    <div className="space-y-4 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Import Data</h1>
        <p className="text-sm text-slate-500 mt-0.5">Bulk import transactions and alerts from CSV files</p>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
        </TabsList>
        <TabsContent value="transactions">
          <ImportPanel
            endpoint="/api/import/transactions"
            templateData={TRANSACTION_TEMPLATE}
            templateName="transactions-template.csv"
            fields={["customerId", "type", "amount", "currency", "counterparty", "date", "channel", "status", "flagged?"]}
          />
        </TabsContent>
        <TabsContent value="alerts">
          <ImportPanel
            endpoint="/api/import/alerts"
            templateData={ALERT_TEMPLATE}
            templateName="alerts-template.csv"
            fields={["customerId", "type", "source", "riskScore", "priority", "description", "assignedTo?"]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
