import React, { useState, useEffect } from 'react';
import {
  Globe2,
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  FolderTree,
  ChevronDown,
  Layers,
} from 'lucide-react';
import { StreamtapeFolder, RemoteUploadTask } from '../types/streamtape';
import {
  addRemoteUpload,
  fetchRemoteStatus,
  removeRemoteUpload,
  formatBytes,
} from '../services/api';

interface RemoteUploadViewProps {
  folders: StreamtapeFolder[];
  onTaskCompleted: () => void;
}

export const RemoteUploadView: React.FC<RemoteUploadViewProps> = ({
  folders,
  onTaskCompleted,
}) => {
  const [remoteUrl, setRemoteUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [targetFolder, setTargetFolder] = useState('');
  const [customHeaders, setCustomHeaders] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchUrls, setBatchUrls] = useState('');

  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<RemoteUploadTask[]>([]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadTasks = async () => {
    try {
      const res = await fetchRemoteStatus();
      if (res && res.result) {
        const taskArray = Object.values(res.result);
        setTasks(taskArray);
      }
    } catch (err) {
      console.error('Failed to load remote tasks:', err);
    }
  };

  useEffect(() => {
    loadTasks();
    const interval = setInterval(loadTasks, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleStartRemote = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg(null);

    try {
      if (batchMode) {
        const urls = batchUrls
          .split('\n')
          .map((u) => u.trim())
          .filter((u) => u.length > 0);

        if (urls.length === 0) {
          setStatusMsg({ type: 'error', text: 'Please enter at least one valid remote video URL.' });
          setLoading(false);
          return;
        }

        let addedCount = 0;
        for (const url of urls) {
          await addRemoteUpload(url, targetFolder, undefined, customHeaders || undefined);
          addedCount++;
        }

        setStatusMsg({ type: 'success', text: `Queued ${addedCount} remote downloads to Streamtape.` });
        setBatchUrls('');
      } else {
        if (!remoteUrl.trim()) {
          setStatusMsg({ type: 'error', text: 'Please provide a remote URL to download.' });
          setLoading(false);
          return;
        }

        const res = await addRemoteUpload(
          remoteUrl.trim(),
          targetFolder || undefined,
          customName.trim() || undefined,
          customHeaders.trim() || undefined
        );

        if (res.status === 200 || res.result) {
          setStatusMsg({
            type: 'success',
            text: `Remote task started (ID: ${res.result?.id || 'queued'}). Streamtape is fetching the media file.`,
          });
          setRemoteUrl('');
          setCustomName('');
          setCustomHeaders('');
        } else {
          setStatusMsg({ type: 'error', text: res.msg || 'Remote upload request failed.' });
        }
      }

      await loadTasks();
      onTaskCompleted();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Error scheduling remote download.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveTask = async (id: string) => {
    try {
      await removeRemoteUpload(id);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemoveAll = async () => {
    try {
      await removeRemoteUpload('all');
      setTasks([]);
    } catch (err) {
      console.error(err);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Remote Video URL Downloader
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Transfer videos from external HTTP/HTTPS servers, Cloud buckets, or video hosts straight to Streamtape server-to-server.
        </p>
      </div>

      {/* Input Form Card */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setBatchMode(false)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                !batchMode
                  ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Single URL
            </button>
            <button
              type="button"
              onClick={() => setBatchMode(true)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                batchMode
                  ? 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Batch Multi-URL
            </button>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Streamtape /remotedl/add API
          </span>
        </div>

        <form onSubmit={handleStartRemote} className="space-y-4">
          {!batchMode ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Remote Direct Video URL <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="url"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    placeholder="https://example.com/source_video.mp4"
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Target Folder
                  </label>
                  <select
                    value={targetFolder}
                    onChange={(e) => setTargetFolder(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  >
                    <option value="">Root / Vault</option>
                    {folders.map((f) => (
                      <option key={f.id} value={f.id}>
                        📁 {f.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Custom File Name (optional)
                  </label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="MyMovie2026.mp4"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Batch Video URLs (one URL per line)
                </label>
                <textarea
                  rows={4}
                  value={batchUrls}
                  onChange={(e) => setBatchUrls(e.target.value)}
                  placeholder="https://example.com/video1.mp4&#10;https://example.com/video2.mp4&#10;https://example.com/video3.mp4"
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Target Destination Folder
                </label>
                <select
                  value={targetFolder}
                  onChange={(e) => setTargetFolder(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                >
                  <option value="">Root / Vault</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Optional Headers */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Custom HTTP Headers (optional, e.g. Cookies or HTTP Basic-Auth)
            </label>
            <input
              type="text"
              value={customHeaders}
              onChange={(e) => setCustomHeaders(e.target.value)}
              placeholder="Cookie: session=xyz (separated by newline)"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
            />
          </div>

          {statusMsg && (
            <div
              className={`flex items-center gap-2 rounded-lg p-3 text-xs ${
                statusMsg.type === 'success'
                  ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300'
                  : 'border border-rose-500/30 bg-rose-500/10 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <div className="flex items-center justify-end">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              <Globe2 className="h-4 w-4" />
              <span>{loading ? 'Queuing Task...' : 'Start Remote Upload'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Task Queue Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Remote Download Queue
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live tasks tracked via Streamtape /remotedl/status.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={loadTasks}
              className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Refresh</span>
            </button>
            {tasks.length > 0 && (
              <button
                onClick={handleRemoveAll}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:border-slate-700 dark:text-rose-400 dark:hover:bg-rose-950/20"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Clear All</span>
              </button>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="py-3 px-6">Task ID / Video</th>
                <th className="py-3 px-4">Remote Source</th>
                <th className="py-3 px-4">Progress / Size</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tasks.map((task) => {
                const percent =
                  task.bytes_total && task.bytes_loaded
                    ? Math.round((task.bytes_loaded / task.bytes_total) * 100)
                    : task.status === 'completed'
                    ? 100
                    : 0;

                return (
                  <tr
                    key={task.id}
                    className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                  >
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white truncate max-w-xs">
                        {task.name || task.id}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400">
                        Added: {task.added}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300 truncate max-w-xs">
                      {task.remoteurl}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="w-36 space-y-1">
                        <div className="flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-500 dark:text-slate-400">
                          <span>{percent}%</span>
                          <span>{task.bytes_total ? formatBytes(task.bytes_total) : 'Pending'}</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-200 ${
                              task.status === 'completed' ? 'bg-emerald-500' : 'bg-cyan-500'
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {task.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Finished</span>
                        </span>
                      ) : task.status === 'downloading' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] text-cyan-600 dark:text-cyan-400 font-medium">
                          <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          <span>Fetching</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                          <Clock className="h-3.5 w-3.5" />
                          <span>Queued</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {task.url && typeof task.url === 'string' && (
                          <a
                            href={task.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1 rounded bg-slate-100 p-1.5 text-xs text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300"
                            title="Open Video Link"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </a>
                        )}
                        <button
                          onClick={() => handleRemoveTask(task.id)}
                          className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
                          title="Remove from queue"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {tasks.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No active remote tasks right now. Paste a video URL above to initiate a remote upload.
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
