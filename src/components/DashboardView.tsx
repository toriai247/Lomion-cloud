import React from 'react';
import {
  UploadCloud,
  Globe2,
  HardDrive,
  Download,
  Film,
  RefreshCw,
  ExternalLink,
  Link2,
  ShieldCheck,
  Server,
  Activity,
  ArrowUpRight,
  FolderTree,
} from 'lucide-react';
import { StreamtapeAccount, StreamtapeFile, RunningConvert } from '../types/streamtape';
import { formatBytes } from '../services/api';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  account: StreamtapeAccount | null;
  files: StreamtapeFile[];
  runningConverts: RunningConvert[];
  setActiveTab: (tab: NavTab) => void;
  onSelectFileForLinks: (file: StreamtapeFile) => void;
  onRefresh: () => void;
  isLoading: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  account,
  files,
  runningConverts,
  setActiveTab,
  onSelectFileForLinks,
  onRefresh,
  isLoading,
}) => {
  const totalStorage = account?.storage_used_bytes || 162186244;
  const totalDownloads = account?.total_downloads || 539;
  const activeFileCount = files.length;
  const convertsCount = runningConverts.length;

  return (
    <div className="space-y-6">
      {/* Welcome Banner & Host Architecture */}
      <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-1">
              <span>Cloud Lomion Engine</span>
              <span aria-hidden="true">·</span>
              <span>Naxxivo Infrastructure</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">Live API Operational</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back, vlogaralom2.0@gmail.com
            </h1>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-400 max-w-2xl">
              High-throughput cloud video distribution suite. Upload local media, fetch remote streams, generate customized embed players, and track Streamtape conversions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('upload')}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span>Direct Upload</span>
            </button>
            <button
              onClick={() => setActiveTab('remote-upload')}
              className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <Globe2 className="h-4 w-4 text-cyan-500" />
              <span>Remote URL</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip with Tabular Figures */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1: Storage Used */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Storage Allocated</span>
            <HardDrive className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div className="font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
            {formatBytes(totalStorage)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Streamtape Vault</span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">Unlimited Quota</span>
          </div>
        </div>

        {/* Stat 2: Active Files */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Hosted Videos</span>
            <Film className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
            {activeFileCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Converted & Streaming</span>
            <button
              onClick={() => setActiveTab('filemanager')}
              className="text-cyan-600 hover:underline dark:text-cyan-400"
            >
              Manage
            </button>
          </div>
        </div>

        {/* Stat 3: Total Downloads */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Total Downloads</span>
            <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
            {totalDownloads.toLocaleString()}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Monetization Tier</span>
            <span className="font-mono text-slate-700 dark:text-slate-300">Tier 1 Global</span>
          </div>
        </div>

        {/* Stat 4: Active Converts */}
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2">
            <span>Transcode Queue</span>
            <RefreshCw className={`h-4 w-4 text-amber-500 ${isLoading ? 'animate-spin' : ''}`} />
          </div>
          <div className="font-mono text-2xl font-bold tracking-tight tabular-nums text-slate-900 dark:text-white">
            {convertsCount}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>In Processing</span>
            <button
              onClick={() => setActiveTab('converts')}
              className="text-amber-600 hover:underline dark:text-amber-400"
            >
              View Queue
            </button>
          </div>
        </div>
      </div>

      {/* Streamtape Active Integration Card */}
      <div className="rounded-xl border border-cyan-500/20 bg-slate-50/50 p-5 dark:border-cyan-500/20 dark:bg-slate-950/40">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400">
              <Server className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Streamtape API & FTP Gateway
                </h3>
                <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                  HTTP 200 Ready
                </span>
              </div>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Connected with login <span className="font-mono text-slate-700 dark:text-slate-300">d7b2c91ded4dff9ecbbc</span> · Base URL <span className="font-mono text-slate-700 dark:text-slate-300">https://api.streamtape.com</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Sync Files</span>
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-950/70 transition-colors"
            >
              <span>Manage Credentials</span>
              <ArrowUpRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Videos & Link Generator Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Recent Video Assets & Quick Links
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Access instant Streamtape embed iframes, watch links, and download tickets.
            </p>
          </div>
          <button
            onClick={() => setActiveTab('filemanager')}
            className="flex items-center gap-1 text-xs font-medium text-cyan-600 hover:underline dark:text-cyan-400"
          >
            <span>Open File Manager</span>
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="py-3 px-6">File Name</th>
                <th className="py-3 px-4 text-right">Size</th>
                <th className="py-3 px-4 text-right">Downloads</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {files.slice(0, 6).map((file) => (
                <tr
                  key={file.linkid}
                  className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <Film className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate max-w-xs md:max-w-md">
                          {file.name}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          ID: {file.linkid}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {formatBytes(file.size)}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-600 dark:text-slate-300">
                    {file.downloads.toLocaleString()}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                      <ShieldCheck className="h-3.5 w-3.5" />
                      <span>Ready</span>
                    </span>
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onSelectFileForLinks(file)}
                        className="flex items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-950/70 transition-colors"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        <span>Get Links</span>
                      </button>
                      <a
                        href={file.link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Open Streamtape Link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}

              {files.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No files found in account yet. Upload your first video to generate stream links!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
