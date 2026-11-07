import React, { useState } from 'react';
import {
  FolderTree,
  FolderPlus,
  Folder,
  Film,
  Search,
  MoreVertical,
  Link2,
  Trash2,
  Edit2,
  MoveRight,
  ExternalLink,
  Download,
  Check,
  ChevronRight,
  Home,
  AlertCircle,
  FileVideo,
} from 'lucide-react';
import { StreamtapeFile, StreamtapeFolder } from '../types/streamtape';
import {
  createFolder,
  renameFolder,
  deleteFolder,
  renameFile,
  moveFile,
  deleteFile,
  formatBytes,
} from '../services/api';

interface FileManagerViewProps {
  files: StreamtapeFile[];
  folders: StreamtapeFolder[];
  currentFolderId: string;
  setCurrentFolderId: (id: string) => void;
  onRefresh: () => void;
  onSelectFileForLinks: (file: StreamtapeFile) => void;
}

export const FileManagerView: React.FC<FileManagerViewProps> = ({
  files,
  folders,
  currentFolderId,
  setCurrentFolderId,
  onRefresh,
  onSelectFileForLinks,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateFolderModal, setShowCreateFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // Editing file modal/state
  const [renamingFile, setRenamingFile] = useState<StreamtapeFile | null>(null);
  const [newFileName, setNewFileName] = useState('');

  // Moving file state
  const [movingFile, setMovingFile] = useState<StreamtapeFile | null>(null);
  const [targetMoveFolder, setTargetMoveFolder] = useState('');

  // Editing folder state
  const [renamingFolder, setRenamingFolder] = useState<StreamtapeFolder | null>(null);
  const [folderRenameInput, setFolderRenameInput] = useState('');

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  // Filter files by folder and search
  const visibleFiles = files.filter((f) => {
    const matchesFolder = currentFolderId ? f.folderid === currentFolderId : !f.folderid || f.folderid === '0';
    const matchesSearch = f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.linkid.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName.trim(), currentFolderId || undefined);
      setNewFolderName('');
      setShowCreateFolderModal(false);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFolder || !folderRenameInput.trim()) return;
    try {
      await renameFolder(renamingFolder.id, folderRenameInput.trim());
      setRenamingFolder(null);
      setFolderRenameInput('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder and its contents?')) return;
    try {
      await deleteFolder(folderId);
      if (currentFolderId === folderId) {
        setCurrentFolderId('');
      }
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleRenameFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renamingFile || !newFileName.trim()) return;
    try {
      await renameFile(renamingFile.linkid, newFileName.trim());
      setRenamingFile(null);
      setNewFileName('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveFile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!movingFile) return;
    try {
      await moveFile(movingFile.linkid, targetMoveFolder);
      setMovingFile(null);
      setTargetMoveFolder('');
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Delete this video from Streamtape?')) return;
    try {
      await deleteFile(fileId);
      onRefresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            File & Folder Manager
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Organize videos in directories, rename files, copy responsive embeds, and manage Streamtape links.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search files or IDs..."
              className="w-48 sm:w-64 rounded-lg border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
            />
          </div>

          <button
            onClick={() => setShowCreateFolderModal(true)}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
          >
            <FolderPlus className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* Breadcrumb Trail */}
      <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
        <button
          onClick={() => setCurrentFolderId('')}
          className={`flex items-center gap-1 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors ${
            !currentFolderId ? 'font-bold text-slate-900 dark:text-white' : ''
          }`}
        >
          <Home className="h-3.5 w-3.5" />
          <span>Root Vault</span>
        </button>

        {currentFolder && (
          <>
            <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
            <span className="font-bold text-slate-900 dark:text-white">
              {currentFolder.name}
            </span>
          </>
        )}
      </div>

      {/* Folder Grid (if on root or showing subfolders) */}
      {!currentFolderId && folders.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Directories
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {folders.map((folder) => {
              const fileCount = files.filter((f) => f.folderid === folder.id).length;
              return (
                <div
                  key={folder.id}
                  className="group relative flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 hover:border-cyan-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-cyan-400 transition-all"
                >
                  <button
                    onClick={() => setCurrentFolderId(folder.id)}
                    className="flex items-center gap-3 min-w-0 flex-1 text-left"
                  >
                    <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-600 dark:text-cyan-400 group-hover:scale-105 transition-transform">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-slate-900 dark:text-white truncate">
                        {folder.name}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                        {fileCount} {fileCount === 1 ? 'file' : 'files'}
                      </div>
                    </div>
                  </button>

                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setRenamingFolder(folder);
                        setFolderRenameInput(folder.name);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                      title="Rename folder"
                    >
                      <Edit2 className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400"
                      title="Delete folder"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Files Table */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 dark:border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Files ({visibleFiles.length})
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select any file to generate embed players or stream links.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold text-slate-500 dark:border-slate-800 dark:bg-slate-950/50 dark:text-slate-400">
              <tr>
                <th className="py-3 px-6">File Name</th>
                <th className="py-3 px-4 text-right">Size</th>
                <th className="py-3 px-4 text-right">Downloads</th>
                <th className="py-3 px-4">Uploaded</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {visibleFiles.map((file) => (
                <tr
                  key={file.linkid}
                  className="hover:bg-slate-50/70 transition-colors dark:hover:bg-slate-800/40"
                >
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg border border-slate-200 bg-slate-100 p-2 text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        <FileVideo className="h-4 w-4" />
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
                  <td className="py-3.5 px-4 text-[11px] font-mono text-slate-500">
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => onSelectFileForLinks(file)}
                        className="flex items-center gap-1 rounded-lg bg-cyan-50 px-2.5 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:text-cyan-300 dark:hover:bg-cyan-950/70"
                        title="Get Links & Embed Codes"
                      >
                        <Link2 className="h-3.5 w-3.5" />
                        <span>Links</span>
                      </button>

                      <button
                        onClick={() => {
                          setRenamingFile(file);
                          setNewFileName(file.name);
                        }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Rename file"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          setMovingFile(file);
                          setTargetMoveFolder(file.folderid || '');
                        }}
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Move to folder"
                      >
                        <MoveRight className="h-3.5 w-3.5" />
                      </button>

                      <a
                        href={file.link}
                        target="_blank"
                        rel="noreferrer"
                        className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                        title="Open watch link"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <button
                        onClick={() => handleDeleteFile(file.linkid)}
                        className="rounded p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20 dark:hover:text-rose-400"
                        title="Delete file"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {visibleFiles.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    No files found in this directory.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create Folder */}
      {showCreateFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Create New Folder
            </h3>
            <form onSubmit={handleCreateFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Folder Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Movies, Series, Clips"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateFolderModal(false)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Create Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rename File */}
      {renamingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Rename File
            </h3>
            <form onSubmit={handleRenameFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New File Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newFileName}
                  onChange={(e) => setNewFileName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingFile(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Save Name
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Move File */}
      {movingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Move File to Folder
            </h3>
            <form onSubmit={handleMoveFile} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Select Destination Folder
                </label>
                <select
                  value={targetMoveFolder}
                  onChange={(e) => setTargetMoveFolder(e.target.value)}
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
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMovingFile(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Confirm Move
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Rename Folder */}
      {renamingFolder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">
              Rename Folder
            </h3>
            <form onSubmit={handleRenameFolder} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  New Folder Name
                </label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={folderRenameInput}
                  onChange={(e) => setFolderRenameInput(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-200"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenamingFolder(null)}
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-cyan-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-cyan-500"
                >
                  Save Folder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
