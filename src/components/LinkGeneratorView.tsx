import React, { useState } from 'react';
import {
  Link2,
  Copy,
  Check,
  ExternalLink,
  Code,
  Palette,
  FileText,
  Download,
  Share2,
  Tv,
  Sparkles,
} from 'lucide-react';
import { generateDownloadTicket, generateDownloadLink } from '../services/api';

export const LinkGeneratorView: React.FC = () => {
  const [inputLink, setInputLink] = useState('wg8ad12d3QiJRXG');
  const [customTitle, setCustomTitle] = useState('Sample Video Stream');
  const [playerColor, setPlayerColor] = useState('26,194,102');
  const [subLabel, setSubLabel] = useState('EN');
  const [subUrl, setSubUrl] = useState('https://mycdn.com/subtitles.vtt');
  const [thumbUrl, setThumbUrl] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Download ticket generator
  const [ticketStatus, setTicketStatus] = useState<string | null>(null);
  const [directDlUrl, setDirectDlUrl] = useState<string | null>(null);
  const [isGeneratingTicket, setIsGeneratingTicket] = useState(false);

  // Extract ID from full URL or bare ID
  const extractId = (str: string) => {
    const trimmed = str.trim();
    if (!trimmed) return 'wg8ad12d3QiJRXG';
    if (trimmed.includes('/v/')) {
      const match = trimmed.match(/\/v\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : trimmed;
    }
    if (trimmed.includes('/e/')) {
      const match = trimmed.match(/\/e\/([a-zA-Z0-9_-]+)/);
      return match ? match[1] : trimmed;
    }
    return trimmed;
  };

  const fileId = extractId(inputLink);

  // Build URLs
  const watchUrl = `https://streamtape.com/v/${fileId}/${encodeURIComponent(customTitle || 'video.mp4')}`;

  const queryParams: string[] = [];
  if (playerColor.trim()) queryParams.push(`color=${encodeURIComponent(playerColor.trim())}`);
  if (subLabel && subUrl) {
    queryParams.push(`c1_label=${encodeURIComponent(subLabel)}`);
    queryParams.push(`c1_file=${encodeURIComponent(subUrl)}`);
  }
  if (thumbUrl.trim()) {
    queryParams.push(`thumb=${encodeURIComponent(thumbUrl.trim())}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const embedUrl = `https://streamtape.com/e/${fileId}${queryString}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
  const bbCode = `[URL=${watchUrl}][B]Watch ${customTitle}[/B][/URL]`;
  const markdownCode = `[Watch ${customTitle}](${watchUrl})`;

  // Multi-host conversions
  const doodUrl = `https://dood.to/e/${fileId}`;
  const mixdropUrl = `https://mixdrop.co/e/${fileId}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFetchDirectDownload = async () => {
    setIsGeneratingTicket(true);
    setTicketStatus('Generating Streamtape ticket token...');
    try {
      const res = await generateDownloadTicket(fileId);
      if (res.result) {
        setTicketStatus(`Ticket created (wait time: ${res.result.wait_time}s). Generating download link...`);
        const linkRes = await generateDownloadLink(fileId, res.result.ticket);
        if (linkRes.result && linkRes.result.url) {
          setDirectDlUrl(linkRes.result.url);
          setTicketStatus('Download link generated successfully!');
        }
      }
    } catch (err: any) {
      setTicketStatus(`Error: ${err.message}`);
    } finally {
      setIsGeneratingTicket(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Link & Embed Generation Workbench
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Paste any Streamtape File ID or URL to generate production-ready iframe embeds, Player.js parameters, custom themes, and download links.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Parameters */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              1. Video Identification
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Streamtape File ID or Link
              </label>
              <input
                type="text"
                value={inputLink}
                onChange={(e) => setInputLink(e.target.value)}
                placeholder="e.g. wg8ad12d3QiJRXG or full streamtape.com link"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
              <p className="mt-1 text-[11px] font-mono text-cyan-600 dark:text-cyan-400">
                Parsed ID: {fileId}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Video Title (optional)
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Episode or Movie Name"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <h2 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              2. Player Customization
            </h2>

            {/* Color Presets */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Custom Player Accent RGB (?color=)
              </label>
              <div className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={playerColor}
                  onChange={(e) => setPlayerColor(e.target.value)}
                  placeholder="26,194,102"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
                <div
                  className="h-7 w-10 rounded border border-slate-300 dark:border-slate-700 shrink-0"
                  style={{ backgroundColor: `rgb(${playerColor || '26,194,102'})` }}
                />
              </div>

              <div className="flex flex-wrap gap-1.5">
                {[
                  { name: 'Emerald', rgb: '26,194,102' },
                  { name: 'Cyan', rgb: '6,182,212' },
                  { name: 'Violet', rgb: '139,92,246' },
                  { name: 'Rose', rgb: '244,63,94' },
                ].map((c) => (
                  <button
                    key={c.rgb}
                    type="button"
                    onClick={() => setPlayerColor(c.rgb)}
                    className="rounded border border-slate-200 px-2 py-0.5 text-[11px] text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Subtitles */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle Track
                </label>
                <input
                  type="text"
                  value={subLabel}
                  onChange={(e) => setSubLabel(e.target.value)}
                  placeholder="EN"
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Subtitle File URL
                </label>
                <input
                  type="url"
                  value={subUrl}
                  onChange={(e) => setSubUrl(e.target.value)}
                  placeholder="https://.../subs.vtt"
                  className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 font-mono"
                />
              </div>
            </div>

            {/* Dynamic Poster */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Dynamic Poster/Thumb URL (?thumb=)
              </label>
              <input
                type="url"
                value={thumbUrl}
                onChange={(e) => setThumbUrl(e.target.value)}
                placeholder="https://.../custom_poster.jpg"
                className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Generated Code and Outputs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Output 1: Direct Watch Link */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Streamtape Watch Link
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => copyToClipboard(watchUrl, 'gen_watch')}
                  className="flex items-center gap-1 rounded bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200"
                >
                  {copiedKey === 'gen_watch' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  <span>Copy</span>
                </button>
                <a
                  href={watchUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded border border-slate-200 p-1 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
            <input
              type="text"
              readOnly
              value={watchUrl}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 select-all"
            />
          </div>

          {/* Output 2: Responsive HTML Embed Code */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-900 dark:text-white">
                Responsive Embed Code (HTML Iframe)
              </span>
              <button
                onClick={() => copyToClipboard(iframeCode, 'gen_iframe')}
                className="flex items-center gap-1 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
              >
                {copiedKey === 'gen_iframe' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                <span>Copy Iframe</span>
              </button>
            </div>
            <textarea
              rows={3}
              readOnly
              value={iframeCode}
              className="w-full rounded-lg border border-slate-200 bg-slate-50 p-2.5 text-xs font-mono text-slate-800 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 select-all"
            />
          </div>

          {/* Output 3: Direct Download Ticket Simulator */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  Direct Download Link Generator
                </span>
                <p className="text-[11px] text-slate-500">
                  Calls /file/dlticket and /file/dl for high-speed download link.
                </p>
              </div>
              <button
                onClick={handleFetchDirectDownload}
                disabled={isGeneratingTicket}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 disabled:opacity-50"
              >
                <Download className="h-3.5 w-3.5 text-cyan-500" />
                <span>{isGeneratingTicket ? 'Requesting...' : 'Fetch Direct Link'}</span>
              </button>
            </div>

            {ticketStatus && (
              <p className="text-xs text-slate-600 dark:text-slate-300 font-mono">
                {ticketStatus}
              </p>
            )}

            {directDlUrl && (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-2.5">
                <input
                  type="text"
                  readOnly
                  value={directDlUrl}
                  className="flex-1 rounded border border-emerald-500/40 bg-white px-2 py-1 text-xs font-mono text-emerald-800 dark:bg-slate-950 dark:text-emerald-300 select-all"
                />
                <button
                  onClick={() => copyToClipboard(directDlUrl, 'direct_dl_gen')}
                  className="rounded bg-emerald-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-emerald-500"
                >
                  {copiedKey === 'direct_dl_gen' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </button>
              </div>
            )}
          </div>

          {/* Output 4: Multi-Host Links (Doodstream & Mixdrop) */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Multi-Host Equivalent Embeds
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Doodstream</span>
                  <button
                    onClick={() => copyToClipboard(doodUrl, 'dood_gen')}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {copiedKey === 'dood_gen' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-500 truncate">
                  {doodUrl}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-2.5 dark:border-slate-800">
                <div className="flex items-center justify-between text-[11px] mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Mixdrop</span>
                  <button
                    onClick={() => copyToClipboard(mixdropUrl, 'mix_gen')}
                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                  >
                    {copiedKey === 'mix_gen' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
                <div className="font-mono text-[11px] text-slate-500 truncate">
                  {mixdropUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
