import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Play,
  Film,
  ExternalLink,
  Clock,
  Layers,
} from 'lucide-react';
import { RunningConvert, FailedConvert } from '../types/streamtape';
import { fetchRunningConverts, fetchFailedConverts } from '../services/api';

export const ConvertMonitorView: React.FC = () => {
  const [runningConverts, setRunningConverts] = useState<RunningConvert[]>([]);
  const [failedConverts, setFailedConverts] = useState<FailedConvert[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'running' | 'failed'>('running');

  const loadConverts = async () => {
    setLoading(true);
    try {
      const [runRes, failRes] = await Promise.all([
        fetchRunningConverts(),
        fetchFailedConverts(),
      ]);
      if (runRes && runRes.result) {
        setRunningConverts(runRes.result);
      }
      if (failRes && failRes.result) {
        setFailedConverts(failRes.result);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConverts();
    const interval = setInterval(loadConverts, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Convert & Transcode Monitor
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Real-time status of Streamtape video conversion pipelines and retry queues.
          </p>
        </div>

        <button
          onClick={loadConverts}
          disabled={loading}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 shrink-0"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Pipeline</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 text-xs">
        <button
          onClick={() => setActiveSubTab('running')}
          className={`border-b-2 py-2 px-3 font-semibold transition-colors ${
            activeSubTab === 'running'
              ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Active Transcodes ({runningConverts.length})
        </button>
        <button
          onClick={() => setActiveSubTab('failed')}
          className={`border-b-2 py-2 px-3 font-semibold transition-colors ${
            activeSubTab === 'failed'
              ? 'border-rose-500 text-rose-600 dark:text-rose-400'
              : 'border-transparent text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
          }`}
        >
          Failed Converts ({failedConverts.length})
        </button>
      </div>

      {activeSubTab === 'running' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-6">File Name</th>
                  <th className="py-3 px-4">Link ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Transcode Progress</th>
                  <th className="py-3 px-4 text-right">Retries</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {runningConverts.map((c) => {
                  const pct = Math.round((c.progress || 0) * 100);
                  return (
                    <tr key={c.linkid} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                      <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                        {c.name}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-500">
                        {c.linkid}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400">
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>{c.status}</span>
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="w-32 space-y-1">
                          <div className="flex justify-between text-[11px] font-mono tabular-nums text-slate-500">
                            <span>{pct}%</span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full bg-cyan-500 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500">
                        {c.retries}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <a
                          href={c.link}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-1 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                        >
                          <ExternalLink className="h-3 w-3" />
                          <span>Open</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}

                {runningConverts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      All video transcode pipelines are idle or fully completed.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeSubTab === 'failed' && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-6">File Name</th>
                  <th className="py-3 px-4">Link ID</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Retries</th>
                  <th className="py-3 px-6 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {failedConverts.map((c) => (
                  <tr key={c.linkid} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40">
                    <td className="py-3.5 px-6 font-semibold text-slate-900 dark:text-white">
                      {c.name}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {c.linkid}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span>Failed / Error</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-500">
                      {c.retries}
                    </td>
                    <td className="py-3.5 px-6 text-right text-slate-500">
                      Codec mismatch or corrupt stream
                    </td>
                  </tr>
                ))}

                {failedConverts.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                      No failed conversions reported by Streamtape API.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
