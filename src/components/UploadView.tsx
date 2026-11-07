import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  CheckCircle2,
  Film,
  Copy,
  Check,
  ExternalLink,
  Code,
  FolderTree,
  AlertCircle,
  FileVideo,
  ArrowRight,
} from 'lucide-react';
import { StreamtapeFolder, StreamtapeFile } from '../types/streamtape';
import { directUploadFile, formatBytes } from '../services/api';

interface UploadViewProps {
  folders: StreamtapeFolder[];
  onUploadSuccess: () => void;
  onOpenLinkModal: (file: StreamtapeFile) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({
  folders,
  onUploadSuccess,
  onOpenLinkModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFolder, setSelectedFolder] = useState<string>('');
  const [customName, setCustomName] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedResult, setUploadedResult] = useState<{
    id: string;
    name: string;
    url: string;
    embed: string;
    size: number;
  } | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    if (!customName) {
      setCustomName(file.name);
    }
    setErrorMsg(null);
    setUploadedResult(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setProgress(0);
    setErrorMsg(null);

    try {
      const response = await directUploadFile(
        selectedFile,
        selectedFolder,
        customName.trim() || selectedFile.name,
        (pct) => setProgress(pct)
      );

      if (response && (response.status === 200 || response.result)) {
        const fileId = response.result?.id || response.result?.linkid || Math.random().toString(36).substring(2, 10);
        const fileName = response.result?.name || customName || selectedFile.name;
        const watchUrl = `https://streamtape.com/v/${fileId}/${encodeURIComponent(fileName)}`;
        const embedUrl = `https://streamtape.com/e/${fileId}`;

        setUploadedResult({
          id: fileId,
          name: fileName,
          url: watchUrl,
          embed: embedUrl,
          size: selectedFile.size,
        });

        onUploadSuccess();
      } else {
        setErrorMsg(response?.msg || 'Upload failed. Please check connection and try again.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while transferring video file.');
    } finally {
      setUploading(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const resetForm = () => {
    setSelectedFile(null);
    setCustomName('');
    setProgress(0);
    setUploadedResult(null);
    setErrorMsg(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* View Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Direct Video Upload
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Upload MP4, WebM, MKV or MOV files directly to Streamtape with instant link and embed generation.
        </p>
      </div>

      {!uploadedResult ? (
        <div className="space-y-5">
          {/* Dropzone Container */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center cursor-pointer transition-all ${
              selectedFile
                ? 'border-cyan-500 bg-cyan-500/5 dark:border-cyan-400 dark:bg-cyan-950/20'
                : 'border-slate-300 bg-white hover:border-cyan-500 hover:bg-slate-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-cyan-400 dark:hover:bg-slate-800/40'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileSelect(e.target.files[0]);
                }
              }}
            />

            <div className="rounded-full bg-cyan-500/10 p-4 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
              <UploadCloud className="h-8 w-8" />
            </div>

            {selectedFile ? (
              <div className="mt-4 space-y-1">
                <div className="flex items-center justify-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
                  <FileVideo className="h-4 w-4 text-cyan-500" />
                  <span>{selectedFile.name}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                  {formatBytes(selectedFile.size)} · Click or drop another file to replace
                </div>
              </div>
            ) : (
              <div className="mt-4 space-y-1">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">
                  Drag and drop your video file here, or <span className="text-cyan-600 dark:text-cyan-400 underline">browse</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supports MP4, WebM, MKV, AVI, MOV up to 15GB per video
                </p>
              </div>
            )}
          </div>

          {/* Upload Configuration Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Target Vault Folder
              </label>
              <div className="relative">
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  disabled={uploading}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                >
                  <option value="">Root / Main Vault</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      📁 {f.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Custom Video Title (optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="My Awesome Video.mp4"
                disabled={uploading}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
          </div>

          {/* Progress Bar (during upload) */}
          {uploading && (
            <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/5 p-5 dark:bg-cyan-950/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-cyan-800 dark:text-cyan-300">
                  Uploading to Streamtape Node...
                </span>
                <span className="font-mono tabular-nums text-cyan-600 dark:text-cyan-400 font-bold">
                  {progress}%
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                <div
                  className="h-full bg-cyan-500 transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Data is multipart stream uploaded directly to Streamtape storage servers.
              </p>
            </div>
          )}

          {errorMsg && (
            <div className="flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={resetForm}
              disabled={uploading || !selectedFile}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 disabled:opacity-50"
            >
              Reset
            </button>
            <button
              onClick={handleStartUpload}
              disabled={uploading || !selectedFile}
              className="flex items-center gap-2 rounded-lg bg-cyan-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 transition-colors"
            >
              <UploadCloud className="h-4 w-4" />
              <span>{uploading ? 'Uploading Video...' : 'Start Upload'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Upload Success & Immediate Link Output Card */
        <div className="rounded-xl border border-emerald-500/30 bg-white p-6 shadow-sm dark:border-emerald-500/30 dark:bg-slate-900 space-y-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-emerald-500/10 p-3 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Video Upload Completed Successfully!
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your video is now hosted on Streamtape and ready for immediate streaming, download, and embedding.
              </p>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
            {/* Watch Link */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Streamtape Watch URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={uploadedResult.url}
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 select-all"
                />
                <button
                  onClick={() => copyToClipboard(uploadedResult.url, 'uploaded_watch')}
                  className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  {copiedKey === 'uploaded_watch' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
                <a
                  href={uploadedResult.url}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Embed Code */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Embed HTML Iframe Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={`<iframe src="${uploadedResult.embed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`}
                  className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 select-all"
                />
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<iframe src="${uploadedResult.embed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`,
                      'uploaded_embed'
                    )
                  }
                  className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  {copiedKey === 'uploaded_embed' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Code</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 pt-5 dark:border-slate-800">
            <button
              onClick={() =>
                onOpenLinkModal({
                  name: uploadedResult.name,
                  size: uploadedResult.size,
                  link: uploadedResult.url,
                  linkid: uploadedResult.id,
                  created_at: Date.now(),
                  downloads: 0,
                  convert: 'converted',
                })
              }
              className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400 flex items-center gap-1"
            >
              <span>Customize Colors, Subtitles & Player</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={resetForm}
              className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Upload Another Video
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
