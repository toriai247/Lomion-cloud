export interface StreamtapeAccount {
  apiid: string;
  email: string;
  signup_at?: string;
  login?: string;
  account_status?: string;
  api_server?: string;
  ftp_server?: string;
  storage_used_bytes?: number;
  total_downloads?: number;
  active_files?: number;
}

export interface StreamtapeFile {
  name: string;
  size: number;
  link: string;
  created_at: number;
  downloads: number;
  linkid: string;
  convert: string;
  folderid?: string;
}

export interface StreamtapeFolder {
  id: string;
  name: string;
  pid?: string;
}

export interface RemoteUploadTask {
  id: string;
  remoteurl: string;
  status: 'new' | 'downloading' | 'completed' | 'error';
  bytes_loaded: number | null;
  bytes_total: number | null;
  folderid: string;
  added: string;
  last_update: string;
  extid: boolean | string;
  url: boolean | string;
  name?: string;
}

export interface RunningConvert {
  name: string;
  folderid: string;
  status: string;
  progress: number;
  retries: number;
  link: string;
  linkid: string;
}

export interface FailedConvert {
  name: string;
  folderid: string;
  status: string;
  progress: number;
  retries: number;
  link: string;
  linkid: string;
}

export interface SubtitleTrack {
  id: string;
  label: string;
  file: string;
  isDefault?: boolean;
}

export type HostType = 'streamtape' | 'doodstream' | 'mixdrop' | 'other';
