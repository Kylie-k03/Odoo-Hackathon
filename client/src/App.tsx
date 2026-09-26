import React, { useEffect, useState } from 'react';
import { Layers, Activity, CheckCircle2, ShieldCheck, Box, Server, Sparkles } from 'lucide-react';

interface HealthResponse {
  status: string;
  service: string;
  timestamp: string;
  uptime: number;
  environment: string;
}

export const App: React.FC = () => {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/health');
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const data = await res.json();
        setHealth(data);
        setError(null);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Backend currently offline or unreachable';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Navigation Bar Preview */}
      <header className="bg-slate-900 text-white border-b border-slate-800 px-6 py-4 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm">
            <Box className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight flex items-center gap-2">
              StockSense
              <span className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/30 px-2 py-0.5 rounded-full font-medium">
                Scaffold v0.1.0
              </span>
            </h1>
            <p className="text-xs text-slate-400">Odoo Hackathon — Double-Entry Inventory Engine</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden sm:flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono">Module 0: Scaffolding</span>
          </div>
        </div>
      </header>

      {/* Main Scaffold Showcase */}
      <main className="max-w-5xl mx-auto px-6 py-12 flex-1 w-full flex flex-col justify-center">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200 text-xs font-semibold mb-4">
            <Sparkles className="w-4 h-4 text-teal-600" />
            Architecture & Scaffold Verified
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            StockSense Project Baseline
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            Clean-slate monorepo initialized on the single <span className="font-mono text-xs font-semibold bg-slate-200 px-2 py-0.5 rounded">main</span> branch with React, Vite, TypeScript, Tailwind CSS, Express, and PostgreSQL/Prisma readiness.
          </p>
        </div>

        {/* Status & Verification Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Frontend Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-teal-100/80 text-teal-700 flex items-center justify-center mb-4">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg mb-1">Frontend Client</h3>
            <p className="text-sm text-slate-500 mb-4">React 18, Vite, TypeScript, Tailwind CSS with Enterprise SaaS theme.</p>
            <div className="flex items-center text-xs font-medium text-emerald-600 gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Ready & Compiled
            </div>
          </div>

          {/* Backend Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-slate-900 text-teal-400 flex items-center justify-center mb-4">
              <Server className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg mb-1">Backend API</h3>
            <p className="text-sm text-slate-500 mb-4">Node.js Express TypeScript server listening on port 5000.</p>
            <div className="flex items-center text-xs font-medium text-emerald-600 gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Endpoint: /api/health
            </div>
          </div>

          {/* Database/Docker Card */}
          <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-slate-900 text-lg mb-1">Architecture Rules</h3>
            <p className="text-sm text-slate-500 mb-4">Single main branch, immutable ledger model, no direct stock edits.</p>
            <div className="flex items-center text-xs font-medium text-teal-600 gap-1.5">
              <Activity className="w-4 h-4" /> Strict Odoo Invariants
            </div>
          </div>
        </div>

        {/* Backend Health Check Live Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                Live Backend Connection Check
                <span className="text-xs font-mono text-slate-500">GET /api/health</span>
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">Verifies proxy communication between Vite client and Express server.</p>
            </div>
            <div className="flex items-center gap-2">
              {loading ? (
                <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span> Checking...
                </span>
              ) : health?.status === 'ok' ? (
                <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Connected (200 OK)
                </span>
              ) : (
                <span className="text-xs bg-rose-50 text-rose-700 border border-rose-200 px-3 py-1 rounded-full font-medium flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Offline: {error}
                </span>
              )}
            </div>
          </div>

          {health && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Service</span>
                <span className="font-semibold text-slate-800">{health.service}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Status</span>
                <span className="font-semibold text-emerald-600">{health.status}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Environment</span>
                <span className="font-semibold text-slate-800">{health.environment}</span>
              </div>
              <div className="bg-slate-50 p-2.5 rounded border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase">Uptime</span>
                <span className="font-semibold text-slate-800">{health.uptime.toFixed(1)}s</span>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 px-6 text-center text-xs text-slate-500">
        StockSense • Module 0 Scaffolding Complete • Ready for Module 1 (Database & Models)
      </footer>
    </div>
  );
};

export default App;
