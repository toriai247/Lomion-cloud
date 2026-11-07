import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  Globe2,
  FolderTree,
  Link2,
  RefreshCw,
  SlidersHorizontal,
  KeyRound,
  ShieldCheck,
  Server,
  ExternalLink,
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'upload'
  | 'remote-upload'
  | 'filemanager'
  | 'link-generator'
  | 'converts'
  | 'player-settings'
  | 'account';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  activeHost: string;
  setActiveHost: (host: string) => void;
  accountEmail: string;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  activeHost,
  setActiveHost,
  accountEmail,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'upload', label: 'Direct Upload', icon: UploadCloud },
    { id: 'remote-upload', label: 'Remote Fetch', icon: Globe2 },
    { id: 'filemanager', label: 'File Manager', icon: FolderTree },
    { id: 'link-generator', label: 'Link & Embed Engine', icon: Link2 },
    { id: 'converts', label: 'Convert Monitor', icon: RefreshCw },
    { id: 'player-settings', label: 'Player & Ad Settings', icon: SlidersHorizontal },
    { id: 'account', label: 'Account & API Keys', icon: KeyRound },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm lg:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200 bg-white transition-transform duration-200 ease-out dark:border-slate-800 dark:bg-slate-900 lg:static lg:translate-x-0 ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Zone */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg border border-cyan-500/30 bg-slate-950 shadow-inner">
              <img
                src="/src/assets/images/cloud_lomion_symbol_1794018666671.jpg"
                alt="Cloud Lomion Symbol"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  Cloud Lomion
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
                <span>by Naxxivo</span>
                <span aria-hidden="true">·</span>
                <span>v2.4 Pro</span>
              </div>
            </div>
          </div>
        </div>

        {/* Host Selector Switcher */}
        <div className="border-b border-slate-200 p-3 dark:border-slate-800">
          <div className="mb-1.5 flex items-center justify-between px-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>Primary Video Host</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-mono text-[10px]">Active</span>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1 dark:bg-slate-950/60">
            <button
              onClick={() => setActiveHost('streamtape')}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-xs font-semibold transition-colors ${
                activeHost === 'streamtape'
                  ? 'bg-white text-cyan-600 shadow-sm dark:bg-slate-800 dark:text-cyan-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Streamtape
            </button>
            <button
              onClick={() => setActiveHost('doodstream')}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-colors ${
                activeHost === 'doodstream'
                  ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-800 dark:text-indigo-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Doodstream
            </button>
            <button
              onClick={() => setActiveHost('mixdrop')}
              className={`flex items-center justify-center gap-1 rounded py-1.5 text-xs font-medium transition-colors ${
                activeHost === 'mixdrop'
                  ? 'bg-white text-violet-600 shadow-sm dark:bg-slate-800 dark:text-violet-300'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              Mixdrop
            </button>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500/10 text-cyan-700 dark:bg-cyan-400/10 dark:text-cyan-300'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200'
                }`}
              >
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'
                  }`}
                />
                <span className="truncate">{item.label}</span>
                {item.id === 'upload' && (
                  <span className="ml-auto text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                    Fast
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Streamtape API Status Box */}
        <div className="border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/70">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Streamtape Engine
              </span>
              <span className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400">
                Connected
              </span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-[11px] text-slate-500 dark:text-slate-400">
              <div className="flex items-center justify-between">
                <span>API Server:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">api.streamtape.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span>FTP Server:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">ftp.streamtape.com</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Login ID:</span>
                <span className="font-mono text-slate-700 dark:text-slate-300">d7b2c9...ff9ecbbc</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer User Info */}
        <div className="flex items-center gap-3 border-t border-slate-200 p-3 dark:border-slate-800">
          <div className="h-8 w-8 shrink-0 overflow-hidden rounded-full border border-slate-200 bg-slate-200 dark:border-slate-700 dark:bg-slate-800">
            <img
              src="/src/assets/images/avatar_admin_user_1794018666683.jpg"
              alt="User Avatar"
              className="h-full w-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
              {accountEmail || 'vlogaralom2.0@gmail.com'}
            </p>
            <p className="truncate text-[11px] text-emerald-600 dark:text-emerald-400">
              Active / Streamtape Pro
            </p>
          </div>
          <button
            onClick={() => setActiveTab('account')}
            title="Account Settings"
            className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
          >
            <KeyRound className="h-4 w-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
