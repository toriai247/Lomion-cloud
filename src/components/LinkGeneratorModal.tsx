import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Play,
  Code,
  Download,
  Palette,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { StreamtapeFile, SubtitleTrack } from '../types/streamtape';
import { generateDownloadTicket, generateDownloadLink } from '../services/api';

interface LinkGeneratorModalProps {
  file: StreamtapeFile | null;
  onClose: () => void;
}

export const LinkGeneratorModal: React.FC<LinkGeneratorModalProps> = ({ file, onClose }) => {
  if (!file) return null;

  const [activeTab, setActiveTab] = useState<'embed' | 'player_color' | 'subtitles' | 'download' | 'multihost'>('embed');
  const [playerColor, setPlayerColor] = useState('26,194,102'); // default green requested in docs
  const [subLabel, setSubLabel] = useState('English');
  const [subFileUrl, setSubFileUrl] = useState('https://example.com/subtitles_en.vtt');
  const [customThumb, setCustomThumb] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Download ticket state
  const [dlLoading, setDlLoading] = useState(false);
  const [ticketData, setTicketData] = useState<{ ticket: string; wait_time: number } | null>(null);
  const [finalDlUrl, setFinalDlUrl] = useState<string | null>(null);

  const fileId = file.linkid || 'wg8ad12d3QiJRXG';
  const watchUrl = `https://streamtape.com/v/${fileId}/${encodeURIComponent(file.name)}`;

  // Construct query parameters for embed
  const queryParams: string[] = [];
  if (playerColor.trim()) queryParams.push(`color=${encodeURIComponent(playerColor.trim())}`);
  if (subLabel && subFileUrl) {
    queryParams.push(`c1_label=${encodeURIComponent(subLabel)}`);
    queryParams.push(`c1_file=${encodeURIComponent(subFileUrl)}`);
  }
  if (customThumb.trim()) {
    queryParams.push(`thumb=${encodeURIComponent(customThumb.trim())}`);
  }

  const queryString = queryParams.length > 0 ? `?${queryParams.join('&')}` : '';
  const embedUrl = `https://streamtape.com/e/${fileId}${queryString}`;
  const iframeCode = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
  const bbCode = `[URL=${watchUrl}][B]Watch ${file.name}[/B][/URL]`;

  // Multi-host equivalents for multi-streamers
  const doodstreamEmbed = `https://dood.to/e/${fileId}`;
  const mixdropEmbed = `https://mixdrop.co/e/${fileId}`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRequestDownload = async () => {
    setDlLoading(true);
    try {
      const ticketRes = await generateDownloadTicket(fileId);
      if (ticketRes.result) {
        setTicketData(ticketRes.result);
        // Request direct download link
        const linkRes = await generateDownloadLink(fileId, ticketRes.result.ticket);
        if (linkRes.result && linkRes.result.url) {
          setFinalDlUrl(linkRes.result.url);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDlLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>Link & Embed Generator</span>
              <span className="text-xs font-mono font-normal text-slate-400">
                ID: {fileId}
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-md">
              {file.name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-6 text-xs font-medium dark:border-slate-800 dark:bg-slate-950/40">
          <button
            onClick={() => setActiveTab('embed')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'embed'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Watch & Embed
          </button>
          <button
            onClick={() => setActiveTab('player_color')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'player_color'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Player Color
          </button>
          <button
            onClick={() => setActiveTab('subtitles')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'subtitles'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Subtitles & Thumb
          </button>
          <button
            onClick={() => setActiveTab('download')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'download'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Download Ticket
          </button>
          <button
            onClick={() => setActiveTab('multihost')}
            className={`border-b-2 py-3 px-3 transition-colors ${
              activeTab === 'multihost'
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-semibold'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
          >
            Multi-Host
          </button>
        </div>

        {/* Tab Contents */}
        <div className="max-h-[70vh] overflow-y-auto p-6 space-y-5">
          {activeTab === 'embed' && (
            <div className="space-y-4">
              {/* Direct Watch Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Streamtape Direct Watch Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={watchUrl}
                    className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 select-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <button
                    onClick={() => copyToClipboard(watchUrl, 'watch')}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedKey === 'watch' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy</span>
                  </button>
                  <a
                    href={watchUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </div>
              </div>

              {/* Responsive Embed Iframe */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Responsive Embed Code (HTML iframe)
                </label>
                <div className="flex items-start gap-2">
                  <textarea
                    rows={3}
                    readOnly
                    value={iframeCode}
                    className="flex-1 rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs font-mono text-slate-900 select-all dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <button
                    onClick={() => copyToClipboard(iframeCode, 'iframe')}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-500 transition-colors shrink-0"
                  >
                    {copiedKey === 'iframe' ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy Iframe</span>
                  </button>
                </div>
              </div>

              {/* Forum BBCode */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Forum BBCode Link
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={bbCode}
                    className="flex-1 rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                  />
                  <button
                    onClick={() => copyToClipboard(bbCode, 'bbcode')}
                    className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
                  >
                    {copiedKey === 'bbcode' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                    <span>Copy</span>
                  </button>
                </div>
              </div>

              {/* Player Preview Box */}
              <div className="rounded-lg border border-slate-200 bg-slate-950 p-4 text-white dark:border-slate-800">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-slate-200">Active Embed Configuration</span>
                  <span className="font-mono text-[11px] text-cyan-400">Player.js Supported</span>
                </div>
                <div className="text-xs font-mono text-cyan-300 break-all bg-black/40 p-2.5 rounded border border-white/10">
                  {embedUrl}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'player_color' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Streamtape supports custom player accent colors via RGB parameters (e.g.{' '}
                <code className="text-cyan-600 dark:text-cyan-400 font-mono">?color=26,194,102</code>).
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Color Presets:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Emerald Green', rgb: '26,194,102', hex: '#1AC266' },
                    { label: 'Electric Cyan', rgb: '6,182,212', hex: '#06B6D4' },
                    { label: 'Neon Indigo', rgb: '99,102,241', hex: '#6366F1' },
                    { label: 'Sunset Crimson', rgb: '239,68,68', hex: '#EF4444' },
                  ].map((preset) => (
                    <button
                      key={preset.rgb}
                      onClick={() => setPlayerColor(preset.rgb)}
                      className={`flex items-center gap-2 rounded-lg border p-2 text-xs transition-colors ${
                        playerColor === preset.rgb
                          ? 'border-cyan-500 bg-cyan-50/50 dark:border-cyan-400 dark:bg-cyan-950/20 font-semibold'
                          : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span
                        className="h-4 w-4 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: preset.hex }}
                      />
                      <span>{preset.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Custom RGB Value (R,G,B format):
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={playerColor}
                    onChange={(e) => setPlayerColor(e.target.value)}
                    placeholder="26,194,102"
                    className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 flex-1"
                  />
                  <div
                    className="h-8 w-12 rounded border border-slate-300 dark:border-slate-700"
                    style={{ backgroundColor: `rgb(${playerColor || '26,194,102'})` }}
                  />
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/50">
                <span className="font-semibold text-slate-800 dark:text-slate-200">Generated URL with Color:</span>
                <p className="mt-1 font-mono text-[11px] text-cyan-600 dark:text-cyan-400 break-all">
                  https://streamtape.com/e/{fileId}?color={playerColor}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'subtitles' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Inject dynamic subtitles (.srt or .vtt) or dynamic poster thumbnails directly into the Streamtape player embed.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subtitle Language Label
                  </label>
                  <input
                    type="text"
                    value={subLabel}
                    onChange={(e) => setSubLabel(e.target.value)}
                    placeholder="EN or English"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Subtitle URL (.srt / .vtt)
                  </label>
                  <input
                    type="url"
                    value={subFileUrl}
                    onChange={(e) => setSubFileUrl(e.target.value)}
                    placeholder="https://mysite.com/subs.vtt"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Custom Poster / Splash Thumbnail URL (optional)
                </label>
                <input
                  type="url"
                  value={customThumb}
                  onChange={(e) => setCustomThumb(e.target.value)}
                  placeholder="https://mysite.com/custom_poster.jpg"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 font-mono"
                />
              </div>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/50">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Alternative Iframe Name Syntax for Subtitles:
                </span>
                <p className="mt-1 font-mono text-[11px] text-slate-600 dark:text-slate-300 break-all">
                  {`<iframe name="subs:${subFileUrl}" src="https://streamtape.com/e/${fileId}" allowfullscreen></iframe>`}
                </p>
              </div>
            </div>
          )}

          {activeTab === 'download' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Generate Streamtape direct download ticket and direct content link via Streamtape API.
              </p>

              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950/40">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                      Step 1: Download Ticket
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      Prepares ticket with wait time and token hash.
                    </p>
                  </div>
                  <button
                    onClick={handleRequestDownload}
                    disabled={dlLoading}
                    className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500 disabled:opacity-50"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{dlLoading ? 'Requesting...' : 'Request Ticket'}</span>
                  </button>
                </div>

                {ticketData && (
                  <div className="mt-3 space-y-2 border-t border-slate-200 pt-3 dark:border-slate-800">
                    <div className="text-[11px] font-mono text-slate-600 dark:text-slate-300 break-all">
                      Ticket: {ticketData.ticket}
                    </div>
                    <div className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                      Wait time: {ticketData.wait_time}s · Ticket valid for 4 hours
                    </div>
                  </div>
                )}
              </div>

              {finalDlUrl && (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      Direct High-Speed Download URL:
                    </span>
                    <button
                      onClick={() => copyToClipboard(finalDlUrl, 'direct_dl')}
                      className="text-xs text-emerald-700 dark:text-emerald-300 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'direct_dl' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>Copy URL</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={finalDlUrl}
                    className="w-full rounded border border-emerald-500/40 bg-white/70 px-2.5 py-1.5 text-xs font-mono text-emerald-900 select-all dark:bg-slate-950 dark:text-emerald-300"
                  />
                </div>
              )}
            </div>
          )}

          {activeTab === 'multihost' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Cloud Lomion enables cross-host syncing and universal embed code generators for Doodstream, Mixdrop, and Streamtape.
              </p>

              <div className="space-y-3">
                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Doodstream Embed
                    </span>
                    <button
                      onClick={() => copyToClipboard(doodstreamEmbed, 'dood')}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      {copiedKey === 'dood' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={doodstreamEmbed}
                    className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  />
                </div>

                <div className="rounded-lg border border-slate-200 p-3 dark:border-slate-800">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      Mixdrop Embed
                    </span>
                    <button
                      onClick={() => copyToClipboard(mixdropEmbed, 'mix')}
                      className="text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      {copiedKey === 'mix' ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
                    </button>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value={mixdropEmbed}
                    className="w-full rounded border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-mono text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-200 bg-slate-50 px-6 py-3 dark:border-slate-800 dark:bg-slate-950/40">
          <button
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
