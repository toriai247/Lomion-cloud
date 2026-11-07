import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Palette,
  Code,
  Tv,
  FileText,
  DollarSign,
  Copy,
  Check,
  Sparkles,
  Info,
} from 'lucide-react';

export const PlayerSettingsView: React.FC = () => {
  const [defaultColor, setDefaultColor] = useState('26,194,102');
  const [enableSubtitles, setEnableSubtitles] = useState(true);
  const [defaultSubLang, setDefaultSubLang] = useState('EN');
  const [popunderAdCode, setPopunderAdCode] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const playerJsSample = `// Player.js Open Standard Embed Controller
const iframe = document.querySelector('iframe');
const player = new playerjs.Player(iframe);

player.on('ready', () => {
  console.log('Streamtape Player is Ready');
  // player.play();
  // player.setVolume(80);
});

player.on('timeupdate', (data) => {
  console.log('Current playback position:', data.seconds);
});`;

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-slate-200 pb-4 dark:border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Player, Subtitles & Ad Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Customize Streamtape web player appearance, configure Player.js API controllers, and set up monetization ad codes.
        </p>
      </div>

      {/* Section 1: Custom Player Color */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400">
            <Palette className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Default Player Accent Color
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Passed to Streamtape embed iframe query parameters as <code className="font-mono text-cyan-600 dark:text-cyan-400">?color=R,G,B</code>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              RGB Color String
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={defaultColor}
                onChange={(e) => setDefaultColor(e.target.value)}
                placeholder="26,194,102"
                className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
              />
              <div
                className="h-8 w-12 rounded border border-slate-300 dark:border-slate-700"
                style={{ backgroundColor: `rgb(${defaultColor || '26,194,102'})` }}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Quick Theme Palettes
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { name: 'Streamtape Green', val: '26,194,102' },
                { name: 'Naxxivo Cyan', val: '6,182,212' },
                { name: 'Royal Indigo', val: '99,102,241' },
                { name: 'Ruby Red', val: '239,68,68' },
              ].map((theme) => (
                <button
                  key={theme.val}
                  type="button"
                  onClick={() => setDefaultColor(theme.val)}
                  className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                    defaultColor === theme.val
                      ? 'border-cyan-500 bg-cyan-50 font-bold text-cyan-700 dark:bg-cyan-950/40 dark:text-cyan-300'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300'
                  }`}
                >
                  {theme.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Player.js JavaScript Integration */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-600 dark:text-indigo-400">
              <Code className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Player.js Open Standard Support
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You can control any Streamtape iframe embed via standard Player.js events (play, pause, volume, timeupdate).
              </p>
            </div>
          </div>
          <button
            onClick={() => copyToClipboard(playerJsSample, 'playerjs')}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
          >
            {copiedKey === 'playerjs' ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
            <span>Copy Snippet</span>
          </button>
        </div>

        <pre className="rounded-lg border border-slate-200 bg-slate-950 p-4 font-mono text-xs text-slate-200 overflow-x-auto dark:border-slate-800">
          {playerJsSample}
        </pre>
      </div>

      {/* Section 3: Ad Settings & Monetization */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="flex items-start gap-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-600 dark:text-emerald-400">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Ad Settings & Publisher Integration
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure popunder tags, banner codes, and direct download sponsor links alongside your video streams.
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Custom Publisher / Popunder Ad Script Tag
            </label>
            <textarea
              rows={3}
              value={popunderAdCode}
              onChange={(e) => setPopunderAdCode(e.target.value)}
              placeholder="<!-- Paste your Adsterra, PropellerAds, or Monetag popunder / banner code here -->"
              className="w-full rounded-lg border border-slate-300 bg-white p-3 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3.5 text-xs text-slate-600 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400 space-y-1">
            <div className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-cyan-500" />
              <span>Streamtape Monetization Note</span>
            </div>
            <p>
              Streamtape provides revenue per 10,000 views on legitimate video streams. When embedding via iframe, Streamtape serves standard non-intrusive stream monetizations according to your tier.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
