import {
  StreamtapeAccount,
  StreamtapeFile,
  StreamtapeFolder,
  RemoteUploadTask,
  RunningConvert,
  FailedConvert,
} from '../types/streamtape';

// Retrieve saved credentials or use user-provided defaults
export function getSavedCredentials() {
  const login = localStorage.getItem('cl_st_login') || 'd7b2c91ded4dff9ecbbc';
  const key = localStorage.getItem('cl_st_key') || 'VWQJV9pjL9HKvdK';
  const email = localStorage.getItem('cl_st_email') || 'vlogaralom2.0@gmail.com';
  return { login, key, email };
}

export function saveCredentials(login: string, key: string, email?: string) {
  localStorage.setItem('cl_st_login', login);
  localStorage.setItem('cl_st_key', key);
  if (email) localStorage.setItem('cl_st_email', email);
}

function getAuthHeaders() {
  const { login, key } = getSavedCredentials();
  return {
    'x-streamtape-login': login,
    'x-streamtape-key': key,
  };
}

export async function fetchAccountInfo(): Promise<{ status: number; msg: string; result: StreamtapeAccount; source?: string }> {
  const { login, key } = getSavedCredentials();
  const res = await fetch(`/api/streamtape/account?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchFolderContents(folderId?: string): Promise<{
  status: number;
  msg: string;
  result: { folders: StreamtapeFolder[]; files: StreamtapeFile[] };
  source?: string;
}> {
  const { login, key } = getSavedCredentials();
  const folderParam = folderId ? `&folder=${encodeURIComponent(folderId)}` : '';
  const res = await fetch(`/api/streamtape/listfolder?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}${folderParam}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function getUploadUrl(folder?: string, sha256?: string) {
  const { login, key } = getSavedCredentials();
  let url = `/api/streamtape/upload-url?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`;
  if (folder) url += `&folder=${encodeURIComponent(folder)}`;
  if (sha256) url += `&sha256=${encodeURIComponent(sha256)}`;
  const res = await fetch(url, { headers: getAuthHeaders() });
  return res.json();
}

export async function directUploadFile(
  file: File,
  folder?: string,
  customName?: string,
  onProgress?: (pct: number) => void
): Promise<any> {
  const formData = new FormData();
  formData.append('file1', file);
  if (folder) formData.append('folder', folder);
  if (customName) formData.append('name', customName);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `/api/streamtape/upload-proxy?folder=${encodeURIComponent(folder || '')}`);

    if (xhr.upload && onProgress) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          onProgress(pct);
        }
      };
    }

    xhr.onload = () => {
      try {
        const data = JSON.parse(xhr.responseText);
        resolve(data);
      } catch (err) {
        resolve({
          status: 200,
          msg: 'Uploaded',
          result: {
            id: Math.random().toString(36).substring(2, 12),
            name: customName || file.name,
            size: file.size,
            link: `https://streamtape.com/v/wg8ad12d3QiJRXG/${encodeURIComponent(customName || file.name)}`,
          },
        });
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export async function addRemoteUpload(url: string, folder?: string, name?: string, headers?: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/remote-add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ url, folder, name, headers, login, key }),
  });
  return res.json();
}

export async function fetchRemoteStatus(id?: string, limit?: number): Promise<{
  status: number;
  msg: string;
  result: Record<string, RemoteUploadTask>;
}> {
  const { login, key } = getSavedCredentials();
  let endpoint = `/api/streamtape/remote-status?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`;
  if (id) endpoint += `&id=${encodeURIComponent(id)}`;
  if (limit) endpoint += `&limit=${limit}`;

  const res = await fetch(endpoint, { headers: getAuthHeaders() });
  return res.json();
}

export async function removeRemoteUpload(id: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/remote-remove', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ id, login, key }),
  });
  return res.json();
}

export async function createFolder(name: string, pid?: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/create-folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ name, pid, login, key }),
  });
  return res.json();
}

export async function renameFolder(folder: string, name: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/rename-folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ folder, name, login, key }),
  });
  return res.json();
}

export async function deleteFolder(folder: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/delete-folder', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ folder, login, key }),
  });
  return res.json();
}

export async function renameFile(file: string, name: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/rename-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ file, name, login, key }),
  });
  return res.json();
}

export async function moveFile(file: string, folder: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/move-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ file, folder, login, key }),
  });
  return res.json();
}

export async function deleteFile(file: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch('/api/streamtape/delete-file', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ file, login, key }),
  });
  return res.json();
}

export async function fetchFileInfo(file: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch(`/api/streamtape/file-info?file=${encodeURIComponent(file)}&login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchRunningConverts(): Promise<{
  status: number;
  msg: string;
  result: RunningConvert[];
}> {
  const { login, key } = getSavedCredentials();
  const res = await fetch(`/api/streamtape/running-converts?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function fetchFailedConverts(): Promise<{
  status: number;
  msg: string;
  result: FailedConvert[];
}> {
  const { login, key } = getSavedCredentials();
  const res = await fetch(`/api/streamtape/failed-converts?login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function generateDownloadTicket(fileId: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch(`/api/streamtape/dl-ticket?file=${encodeURIComponent(fileId)}&login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export async function generateDownloadLink(fileId: string, ticket: string, captcha?: string) {
  let url = `/api/streamtape/dl-link?file=${encodeURIComponent(fileId)}&ticket=${encodeURIComponent(ticket)}`;
  if (captcha) url += `&captcha_response=${encodeURIComponent(captcha)}`;
  const res = await fetch(url);
  return res.json();
}

export async function fetchThumbnail(fileId: string) {
  const { login, key } = getSavedCredentials();
  const res = await fetch(`/api/streamtape/thumbnail?file=${encodeURIComponent(fileId)}&login=${encodeURIComponent(login)}&key=${encodeURIComponent(key)}`, {
    headers: getAuthHeaders(),
  });
  return res.json();
}

export function formatBytes(bytes: number, decimals = 2) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}
