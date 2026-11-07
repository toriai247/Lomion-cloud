/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  UploadCloud,
  Globe2,
  Copy,
  Check,
  ExternalLink,
  Folder,
  FileVideo,
  Play,
  Film,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Layers,
} from 'lucide-react';

interface FolderItem {
  id: string;
  name: string;
}

interface FileItem {
  name: string;
  size: number;
  link: string;
  linkid: string;
  created_at: number;
  downloads: number;
}

interface GeneratedLinks {
  fileName: string;
  watchUrl: string;
  embedUrl: string;
  embedCode: string;
  downloadUrl: string;
}

type PlatformType = 'streamtape' | 'doodstream' | 'mixdrop';

export default function App() {
  // Platform selection
  const [platform, setPlatform] = useState<PlatformType>('streamtape');

  // Input states
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [remoteUrl, setRemoteUrl] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('');

  // Process status (00% - 100%)
  const [progress, setProgress] = useState<number>(0);
  const [statusText, setStatusText] = useState<string>('Ready to upload');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Real account data (no fake data)
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  // Generated links result
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLinks | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load real folders and files from backend on mount
  const loadRealData = async () => {
    setIsLoadingData(true);
    try {
      const [foldersRes, filesRes] = await Promise.all([
        fetch('/api/folders').then((r) => r.json()),
        fetch('/api/files').then((r) => r.json()),
      ]);

      if (foldersRes && foldersRes.folders) {
        setFolders(foldersRes.folders);
      }
      if (filesRes && filesRes.files) {
        setFiles(filesRes.files);
      }
    } catch (err) {
      console.error('Error fetching real data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    loadRealData();
  }, []);

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setRemoteUrl(''); // Clear remote URL if local file picked
    setProgress(0);
    setStatusText(`File selected: ${file.name}`);
  };

  const handleStartProcess = async () => {
    if (!selectedFile && !remoteUrl.trim()) {
      alert('Please select a video file or enter a remote video URL.');
      return;
    }

    setIsProcessing(true);
    setProgress(5);
    setStatusText('Initiating cloud transfer...');

    try {
      if (selectedFile) {
        // Direct File Upload
        setStatusText('Uploading video to cloud node...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('folder', selectedFolder);
        formData.append('platform', platform);

        // Simulated smooth progression for UX while upload happens
        const interval = setInterval(() => {
          setProgress((prev) => (prev < 90 ? prev + 12 : prev));
        }, 300);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        clearInterval(interval);
        const data = await res.json();

        if (data && data.success) {
          setProgress(100);
          setStatusText('Upload complete! Links generated.');

          let finalWatch = data.watchUrl;
          let finalEmbed = data.embedUrl;
          let finalEmbedCode = data.embedCode;

          // Adapt according to chosen platform
          if (platform === 'doodstream') {
            finalWatch = `https://dood.to/d/${data.fileId}`;
            finalEmbed = `https://dood.to/e/${data.fileId}`;
            finalEmbedCode = `<iframe src="${finalEmbed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
          } else if (platform === 'mixdrop') {
            finalWatch = `https://mixdrop.co/f/${data.fileId}`;
            finalEmbed = `https://mixdrop.co/e/${data.fileId}`;
            finalEmbedCode = `<iframe src="${finalEmbed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
          }

          setGeneratedLinks({
            fileName: data.fileName,
            watchUrl: finalWatch,
            embedUrl: finalEmbed,
            embedCode: finalEmbedCode,
            downloadUrl: data.downloadUrl || finalWatch,
          });

          // Refresh files list
          loadRealData();
        } else {
          setStatusText('Upload failed. Please try again.');
        }
      } else if (remoteUrl.trim()) {
        // Remote URL Upload
        setStatusText('Sending remote download request to server...');
        setProgress(25);

        const res = await fetch('/api/remote-upload', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: remoteUrl.trim(),
            folder: selectedFolder,
            platform,
          }),
        });

        const data = await res.json();
        if (data && data.success) {
          setProgress(100);
          setStatusText('Remote upload task queued & links generated!');

          let finalWatch = data.watchUrl;
          let finalEmbed = data.embedUrl;
          let finalEmbedCode = data.embedCode;

          if (platform === 'doodstream') {
            finalWatch = `https://dood.to/d/${data.taskId}`;
            finalEmbed = `https://dood.to/e/${data.taskId}`;
            finalEmbedCode = `<iframe src="${finalEmbed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
          } else if (platform === 'mixdrop') {
            finalWatch = `https://mixdrop.co/f/${data.taskId}`;
            finalEmbed = `https://mixdrop.co/e/${data.taskId}`;
            finalEmbedCode = `<iframe src="${finalEmbed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
          }

          setGeneratedLinks({
            fileName: data.fileName,
            watchUrl: finalWatch,
            embedUrl: finalEmbed,
            embedCode: finalEmbedCode,
            downloadUrl: data.downloadUrl || finalWatch,
          });

          loadRealData();
        } else {
          setStatusText('Remote upload failed.');
        }
      }
    } catch (err: any) {
      console.error(err);
      setStatusText('Error processing request.');
    } finally {
      setIsProcessing(false);
    }
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSelectExistingFile = (file: FileItem) => {
    let watch = file.link;
    let embed = `https://streamtape.com/e/${file.linkid}`;
    let code = `<iframe src="${embed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;

    if (platform === 'doodstream') {
      watch = `https://dood.to/d/${file.linkid}`;
      embed = `https://dood.to/e/${file.linkid}`;
      code = `<iframe src="${embed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
    } else if (platform === 'mixdrop') {
      watch = `https://mixdrop.co/f/${file.linkid}`;
      embed = `https://mixdrop.co/e/${file.linkid}`;
      code = `<iframe src="${embed}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
    }

    setGeneratedLinks({
      fileName: file.name,
      watchUrl: watch,
      embedUrl: embed,
      embedCode: code,
      downloadUrl: watch,
    });
    setProgress(100);
    setStatusText(`Loaded links for ${file.name}`);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 antialiased font-sans py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Brand Header: Simple & Minimalist */}
        <header className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-sm">
              <Play className="h-5 w-5 fill-current" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Cloud Lomion
              </h1>
              <p className="text-xs text-slate-500">
                by Naxxivo · Fast Video Link & Embed Generator
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              Connected
            </span>
          </div>
        </header>

        {/* 1. Selected Platform: /streamtape, /doodstream, /mixdrop */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
            Selected Platform
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setPlatform('streamtape')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all ${
                platform === 'streamtape'
                  ? 'bg-cyan-600 text-white shadow-sm ring-2 ring-cyan-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>/streamtape</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform('doodstream')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all ${
                platform === 'doodstream'
                  ? 'bg-indigo-600 text-white shadow-sm ring-2 ring-indigo-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>/doodstream</span>
            </button>

            <button
              type="button"
              onClick={() => setPlatform('mixdrop')}
              className={`flex items-center justify-center gap-2 rounded-xl py-3 px-4 text-xs font-bold transition-all ${
                platform === 'mixdrop'
                  ? 'bg-violet-600 text-white shadow-sm ring-2 ring-violet-600/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>/mixdrop</span>
            </button>
          </div>
        </div>

        {/* 2. Upload Icons & Drop Area + Remote Upload URL Box + Select Folders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5">
          {/* Direct File Upload Area */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
              Upload Video File
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileSelect(e.dataTransfer.files[0]);
                }
              }}
              className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition-all ${
                selectedFile
                  ? 'border-cyan-500 bg-cyan-50/40'
                  : 'border-slate-300 bg-slate-50 hover:border-cyan-500 hover:bg-white'
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

              <div className="rounded-full bg-cyan-100 p-3 text-cyan-700 mb-2">
                <UploadCloud className="h-6 w-6" />
              </div>

              {selectedFile ? (
                <div>
                  <p className="text-sm font-bold text-slate-900 flex items-center justify-center gap-1.5">
                    <FileVideo className="h-4 w-4 text-cyan-600" />
                    <span>{selectedFile.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    {formatFileSize(selectedFile.size)} · Click to change video
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Click to select video or drag & drop
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Supports MP4, WebM, MKV, MOV
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Or Remote Link
            </span>
          </div>

          {/* Remote Upload URL Box */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Remote Upload URL Box
            </label>
            <div className="relative">
              <input
                type="url"
                value={remoteUrl}
                onChange={(e) => {
                  setRemoteUrl(e.target.value);
                  if (selectedFile) setSelectedFile(null); // Prioritize remote URL if entered
                }}
                placeholder="https://example.com/video.mp4"
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-xs font-mono text-slate-900 placeholder-slate-400 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
          </div>

          {/* Select Folders (Real data from Streamtape) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Select Folder
            </label>
            <div className="relative">
              <select
                value={selectedFolder}
                onChange={(e) => setSelectedFolder(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-2.5 px-3 text-xs text-slate-800 focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
              >
                <option value="">📁 Root / Main Vault</option>
                {folders.map((f) => (
                  <option key={f.id} value={f.id}>
                    📁 {f.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Process Status: 00% */}
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">
                Process Status: <span className="font-normal text-slate-500">{statusText}</span>
              </span>
              <span className="font-mono text-sm font-bold text-cyan-700 tabular-nums">
                {String(progress).padStart(2, '0')}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full bg-cyan-600 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleStartProcess}
            disabled={isProcessing || (!selectedFile && !remoteUrl.trim())}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 px-4 text-xs font-bold text-white shadow-sm hover:bg-cyan-500 active:bg-cyan-700 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <UploadCloud className="h-4 w-4" />
            )}
            <span>
              {isProcessing
                ? 'Processing Video...'
                : 'Upload Video & Generate Links'}
            </span>
          </button>
        </div>

        {/* 3. Generated Links: [ Box URL ] copy buttons */}
        {generatedLinks && (
          <div className="rounded-2xl border border-emerald-500/30 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  Generated Links & Embed Codes
                </h2>
                <p className="text-xs text-slate-500 truncate max-w-sm sm:max-w-md">
                  {generatedLinks.fileName}
                </p>
              </div>
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Ready
              </span>
            </div>

            {/* Box 1: Watch URL */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Watch Stream URL
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLinks.watchUrl}
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-mono text-slate-900 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedLinks.watchUrl, 'watch')}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                >
                  {copiedKey === 'watch' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
                <a
                  href={generatedLinks.watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-50"
                  title="Open stream"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>

            {/* Box 2: Responsive Embed Code */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Responsive Embed HTML Code
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLinks.embedCode}
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-mono text-slate-900 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedLinks.embedCode, 'embed')}
                  className="flex items-center gap-1 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white hover:bg-cyan-500 transition-colors shrink-0"
                >
                  {copiedKey === 'embed' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy Embed</span>
                </button>
              </div>
            </div>

            {/* Box 3: Direct Download URL */}
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-slate-700">
                Direct Download Link
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={generatedLinks.downloadUrl}
                  className="flex-1 rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-mono text-slate-900 select-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => copyToClipboard(generatedLinks.downloadUrl, 'dl')}
                  className="flex items-center gap-1 rounded-xl bg-slate-100 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors shrink-0"
                >
                  {copiedKey === 'dl' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>Copy</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. Real Files from Account (No fake data) */}
        {files.length > 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Your Uploaded Videos ({files.length})
              </h2>
              <button
                type="button"
                onClick={loadRealData}
                disabled={isLoadingData}
                className="text-xs text-cyan-600 hover:underline flex items-center gap-1 font-medium"
              >
                <RefreshCw className={`h-3 w-3 ${isLoadingData ? 'animate-spin' : ''}`} />
                <span>Refresh</span>
              </button>
            </div>

            <div className="divide-y divide-slate-100">
              {files.map((file) => (
                <div
                  key={file.linkid}
                  className="py-2.5 flex items-center justify-between gap-3 text-xs hover:bg-slate-50/80 px-2 rounded-lg transition-colors"
                >
                  <div className="min-w-0 flex items-center gap-2">
                    <Film className="h-4 w-4 text-slate-400 shrink-0" />
                    <span className="font-medium text-slate-900 truncate">
                      {file.name}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      ({formatFileSize(file.size)})
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleSelectExistingFile(file)}
                      className="rounded-lg bg-cyan-50 px-2.5 py-1 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 transition-colors"
                    >
                      Generate Links
                    </button>
                    <a
                      href={file.link}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1 text-slate-400 hover:text-slate-700"
                      title="Open video"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer info: Naxxivo Cloud Lomion */}
        <footer className="text-center text-xs text-slate-400 pt-2 pb-6">
          <p>Cloud Lomion by Naxxivo · Fast Multi-Host Video Distribution</p>
        </footer>
      </div>
    </div>
  );
}
