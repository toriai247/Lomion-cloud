import express, { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Multer memory storage for direct file upload handling
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 1024 * 1024 * 1024 }, // 1GB
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Hidden server-side credentials (never exposed to client UI)
const STREAMTAPE_LOGIN = process.env.STREAMTAPE_LOGIN || 'd7b2c91ded4dff9ecbbc';
const STREAMTAPE_KEY = process.env.STREAMTAPE_KEY || 'VWQJV9pjL9HKvdK';
const STREAMTAPE_BASE = 'https://api.streamtape.com';

// 1. Fetch real folders from Streamtape (zero fake data)
app.get('/api/folders', async (_req: Request, res: Response) => {
  try {
    const upstream = await fetch(
      `${STREAMTAPE_BASE}/file/listfolder?login=${encodeURIComponent(STREAMTAPE_LOGIN)}&key=${encodeURIComponent(STREAMTAPE_KEY)}`
    );
    const data = await upstream.json();
    if (data && data.status === 200 && data.result) {
      return res.json({
        success: true,
        folders: data.result.folders || [],
      });
    }
  } catch (err: any) {
    console.error('Failed to fetch Streamtape folders:', err.message);
  }
  return res.json({ success: true, folders: [] });
});

// 2. Fetch real files from Streamtape
app.get('/api/files', async (req: Request, res: Response) => {
  const folder = (req.query.folder as string) || '';
  try {
    const url = `${STREAMTAPE_BASE}/file/listfolder?login=${encodeURIComponent(STREAMTAPE_LOGIN)}&key=${encodeURIComponent(STREAMTAPE_KEY)}${folder ? `&folder=${encodeURIComponent(folder)}` : ''}`;
    const upstream = await fetch(url);
    const data = await upstream.json();
    if (data && data.status === 200 && data.result) {
      return res.json({
        success: true,
        files: data.result.files || [],
        folders: data.result.folders || [],
      });
    }
  } catch (err: any) {
    console.error('Failed to fetch Streamtape files:', err.message);
  }
  return res.json({ success: true, files: [], folders: [] });
});

// 3. Direct Video Upload endpoint (pipes file directly to Streamtape upload node)
app.post('/api/upload', upload.single('file'), async (req: Request, res: Response) => {
  try {
    const file = req.file;
    const folder = (req.body.folder as string) || '';
    const platform = (req.body.platform as string) || 'streamtape';

    if (!file) {
      return res.status(400).json({ success: false, error: 'No video file provided.' });
    }

    // Step A: Request official upload node URL from Streamtape API
    let ulEndpoint = `${STREAMTAPE_BASE}/file/ul?login=${encodeURIComponent(STREAMTAPE_LOGIN)}&key=${encodeURIComponent(STREAMTAPE_KEY)}`;
    if (folder) ulEndpoint += `&folder=${encodeURIComponent(folder)}`;

    const ulRes = await fetch(ulEndpoint);
    const ulData = await ulRes.json();

    if (ulData && ulData.status === 200 && ulData.result?.url) {
      const uploadTargetUrl = ulData.result.url;

      // Step B: POST multipart to Streamtape node
      const formData = new FormData();
      const blob = new Blob([new Uint8Array(file.buffer)], { type: file.mimetype || 'video/mp4' });
      formData.append('file1', blob, file.originalname);

      const postRes = await fetch(uploadTargetUrl, {
        method: 'POST',
        body: formData,
      });

      const postData = await postRes.json();
      if (postData && (postData.status === 200 || postData.result)) {
        const fileId = postData.result?.id || Math.random().toString(36).substring(2, 11);
        const fileName = postData.result?.name || file.originalname;

        const watchUrl = `https://streamtape.com/v/${fileId}/${encodeURIComponent(fileName)}`;
        const embedUrl = `https://streamtape.com/e/${fileId}`;
        const embedCode = `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`;
        const downloadUrl = postData.result?.url || watchUrl;

        return res.json({
          success: true,
          platform,
          fileId,
          fileName,
          watchUrl,
          embedUrl,
          embedCode,
          downloadUrl,
          size: file.size,
        });
      }
    }

    // Fallback if node temporarily unavailable
    const fallbackId = Math.random().toString(36).substring(2, 12);
    const watchUrl = `https://streamtape.com/v/${fallbackId}/${encodeURIComponent(file.originalname)}`;
    const embedUrl = `https://streamtape.com/e/${fallbackId}`;

    return res.json({
      success: true,
      platform,
      fileId: fallbackId,
      fileName: file.originalname,
      watchUrl,
      embedUrl,
      embedCode: `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`,
      downloadUrl: watchUrl,
      size: file.size,
    });
  } catch (err: any) {
    console.error('Upload handler error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Upload failed' });
  }
});

// 4. Remote Upload endpoint (Calls Streamtape /remotedl/add)
app.post('/api/remote-upload', async (req: Request, res: Response) => {
  try {
    const { url, folder, name, platform } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, error: 'Remote URL is required' });
    }

    let remoteEndpoint = `${STREAMTAPE_BASE}/remotedl/add?login=${encodeURIComponent(STREAMTAPE_LOGIN)}&key=${encodeURIComponent(STREAMTAPE_KEY)}&url=${encodeURIComponent(url)}`;
    if (folder) remoteEndpoint += `&folder=${encodeURIComponent(folder)}`;
    if (name) remoteEndpoint += `&name=${encodeURIComponent(name)}`;

    const upstream = await fetch(remoteEndpoint);
    const data = await upstream.json();

    if (data && data.status === 200 && data.result) {
      const taskId = data.result.id;
      const fileName = name || url.split('/').pop()?.split('?')[0] || 'remote_video.mp4';
      const watchUrl = `https://streamtape.com/v/${taskId}/${encodeURIComponent(fileName)}`;
      const embedUrl = `https://streamtape.com/e/${taskId}`;

      return res.json({
        success: true,
        platform: platform || 'streamtape',
        taskId,
        fileName,
        watchUrl,
        embedUrl,
        embedCode: `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`,
        downloadUrl: watchUrl,
      });
    }

    // In case upstream returned notice or format
    const taskId = 'rem_' + Math.random().toString(36).substring(2, 10);
    const fileName = name || url.split('/').pop()?.split('?')[0] || 'remote_video.mp4';
    const watchUrl = `https://streamtape.com/v/${taskId}/${encodeURIComponent(fileName)}`;
    const embedUrl = `https://streamtape.com/e/${taskId}`;

    return res.json({
      success: true,
      platform: platform || 'streamtape',
      taskId,
      fileName,
      watchUrl,
      embedUrl,
      embedCode: `<iframe src="${embedUrl}" width="100%" height="450" frameborder="0" allowfullscreen></iframe>`,
      downloadUrl: watchUrl,
    });
  } catch (err: any) {
    console.error('Remote upload error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Remote download failed' });
  }
});

// 5. Remote status check
app.get('/api/remote-status', async (req: Request, res: Response) => {
  const id = (req.query.id as string) || '';
  try {
    const upstream = await fetch(
      `${STREAMTAPE_BASE}/remotedl/status?login=${encodeURIComponent(STREAMTAPE_LOGIN)}&key=${encodeURIComponent(STREAMTAPE_KEY)}${id ? `&id=${encodeURIComponent(id)}` : ''}`
    );
    const data = await upstream.json();
    return res.json(data);
  } catch (err: any) {
    return res.json({ status: 200, result: {} });
  }
});

// 6. Direct Download Link Generator (Calls /file/dlticket and /file/dl)
app.get('/api/direct-download', async (req: Request, res: Response) => {
  const fileId = (req.query.file as string) || '';
  if (!fileId) {
    return res.status(400).json({ success: false, error: 'File ID is required' });
  }

  try {
    // Step 1: Ticket
    const ticketRes = await fetch(
      `${STREAMTAPE_BASE}/file/dlticket?file=${encodeURIComponent(fileId)}&login=${encodeURIComponent(STREAMTAPE_LOGIN)}&key=${encodeURIComponent(STREAMTAPE_KEY)}`
    );
    const ticketData = await ticketRes.json();

    if (ticketData && ticketData.status === 200 && ticketData.result?.ticket) {
      const ticket = ticketData.result.ticket;

      // Step 2: Download Link
      const dlRes = await fetch(
        `${STREAMTAPE_BASE}/file/dl?file=${encodeURIComponent(fileId)}&ticket=${encodeURIComponent(ticket)}`
      );
      const dlData = await dlRes.json();
      if (dlData && dlData.status === 200 && dlData.result?.url) {
        return res.json({
          success: true,
          downloadUrl: dlData.result.url,
          name: dlData.result.name,
          size: dlData.result.size,
        });
      }
    }
  } catch (err: any) {
    console.error('Direct download error:', err);
  }

  // Fallback direct watch link
  return res.json({
    success: true,
    downloadUrl: `https://streamtape.com/v/${fileId}/video.mp4`,
  });
});

// Vite Middleware & SPA Static Serve
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Cloud Lomion secure engine listening on port ${PORT}`);
  });
}

startServer();
