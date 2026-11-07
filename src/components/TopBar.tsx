import React from 'react';
import { Menu, Sun, Moon, Plus, Upload, Link2, ShieldCheck, ExternalLink } from 'lucide-react';
import { NavTab } from './Sidebar';

interface TopBarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  isDarkMode: boolean;
  toggleTheme: () => void;
  toggleMobileSidebar: () => void;
  onOpenQuickUpload: () => void;
  onOpenLinkWorkbench: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  isDarkMode,
  toggleTheme,
  toggleMobileSidebar,
  onOpenQuickUpload,
  onOpenLinkWorkbench,
}) => {
  // Breadcrumb mapping
  const titles: Record<NavTab, { section: string; title: string }> = {
    dashboard: { section: 'Workspace', title: 'Dashboard & Metrics' },
    upload: { section: 'Storage', title: 'Direct File Upload' },
    'remote-upload': { section: 'Transfer', title: 'Remote URL Downloader' },
    filemanager: { section: 'Vault', title: 'File & Folder Explorer' },
    'link-generator': { section: 'Engine', title: 'Link & Embed Workbench' },
    converts: { section: 'Processing', title: 'Convert & Transcode Monitor' },
    'player-settings': { section: 'Customization', title: 'Player, Subtitles & Ad Setup' },
    account: { section: 'Credentials', title: 'Account Settings & API Access' },
  };

  const current = titles[activeTab] || titles.dashboard;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90 sm:px-6">
      {/* Zone 1: Mobile toggle & Breadcrumb Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={toggleMobileSidebar}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <span className="hidden sm:inline font-medium text-slate-600 dark:text-slate-300">
            {current.section}
          </span>
          <span className="hidden sm:inline" aria-hidden="true">
            /
          </span>
          <span className="font-semibold text-slate-900 dark:text-white truncate">
            {current.title}
          </span>
        </div>
      </div>

      {/* Zone 2: Navigation Links (1-2 word labels, single line) */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium text-slate-600 dark:text-slate-300">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'dashboard' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : ''
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'upload' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : ''
          }`}
        >
          Upload
        </button>
        <button
          onClick={() => setActiveTab('remote-upload')}
          className={`hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'remote-upload' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : ''
          }`}
        >
          Remote URL
        </button>
        <button
          onClick={() => setActiveTab('filemanager')}
          className={`hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'filemanager' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : ''
          }`}
        >
          Files
        </button>
        <button
          onClick={() => setActiveTab('link-generator')}
          className={`hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 ${
            activeTab === 'link-generator' ? 'text-cyan-600 dark:text-cyan-400 font-semibold' : ''
          }`}
        >
          Embeds
        </button>
      </nav>

      {/* Zone 3: Actions & Theme Toggle */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        <button
          onClick={toggleTheme}
          title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <button
          onClick={onOpenLinkWorkbench}
          className="hidden sm:flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
        >
          <Link2 className="h-3.5 w-3.5 text-cyan-600 dark:text-cyan-400" />
          <span>Quick Link</span>
        </button>

        <button
          onClick={onOpenQuickUpload}
          className="flex items-center gap-1.5 rounded-lg bg-cyan-600 px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-cyan-500 active:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 dark:active:bg-cyan-600 transition-colors whitespace-nowrap shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Upload Video</span>
        </button>
      </div>
    </header>
  );
};
