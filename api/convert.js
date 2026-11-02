import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { Ytdl, Quality, chooseFormat } from '@distube/ytdl-core';

// Satu instance dipakai ulang. Cookie opsional (env YT_COOKIE) untuk melewati "Sign in to confirm you're not a bot".
const yt = new Ytdl(process.env.YT_COOKIE ? { cookie: process.env.YT_COOKIE } : {});

const MAX_SECONDS = 15 * 60; // batasi durasi supaya muat di maxDuration function

function extractVideoId(url) {
  if (!url) return null;
  const m = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return m && m[2].length === 11 ? m[2] : null;
}

// Selalu balas JSON saat error, supaya frontend bisa membedakan error vs file MP3.
function fail(res, status, error, code) {
  if (res.headersSent) return res.destroy();
  res.status(status).json({ error, code });
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return fail(res, 405, 'Method tidak diizinkan');

  const videoId = extractVideoId(String(req.query.url || ''));
  if (!videoId) return fail(res, 400, 'URL YouTube / YouTube Music tidak valid');

  let info, format;
  try {
    info = await yt.getInfo(`https://www.youtube.com/watch?v=${videoId}`);
    format = chooseFormat(info.formats, {
      quality: Quality.HighestAudio,
      filter: { hasAudio: true, hasVideo: false },
    });
  } catch (err) {
    console.error('getInfo error:', err);
    if (err.code === 'BOT_CHECK') {
      return fail(res, 403, 'YouTube memblokir server (bot check). Set env YT_COOKIE di Vercel atau pakai server non-datacenter.', 'BOT_CHECK');
    }
    return fail(res, 500, `Gagal mengambil info video: ${err.message}`, err.code);
  }

  const { title, lengthSeconds, isLive } = info.videoDetails;
  if (isLive) return fail(res, 400, 'Live stream tidak didukung');
  if (lengthSeconds > MAX_SECONDS) {
    return fail(res, 413, `Durasi maksimal ${MAX_SECONDS / 60} menit`);
  }

  const safeTitle = (title || 'audio').replace(/[\\/:*?"<>|%]/g, '').trim() || 'audio';

  // Audio dari YouTube berformat webm/m4a, jadi harus di-convert ke MP3 sungguhan via ffmpeg.
  const source = yt.download(info, { format });
  const ff = spawn(
    ffmpegPath,
    ['-hide_banner', '-loglevel', 'error', '-i', 'pipe:0', '-vn', '-c:a', 'libmp3lame', '-b:a', '192k', '-f', 'mp3', 'pipe:1'],
    { stdio: ['pipe', 'pipe', 'pipe'] }
  );

  let ffErr = '';
  ff.stderr.on('data', (d) => (ffErr += d));
  ff.stdin.on('error', () => {}); // EPIPE saat client batal
  source.on('error', (err) => {
    console.error('Stream error:', err);
    ff.kill('SIGKILL');
  });

  res.setHeader('Content-Type', 'audio/mpeg');
  res.setHeader('Content-Disposition', `attachment; filename*=UTF-8''${encodeURIComponent(safeTitle)}.mp3`);
  res.setHeader('X-Title', encodeURIComponent(safeTitle));
  res.setHeader('Cache-Control', 'no-store');

  source.pipe(ff.stdin);
  ff.stdout.pipe(res, { end: false });

  ff.on('close', (code) => {
    if (code === 0) return res.end();
    console.error('ffmpeg gagal:', code, ffErr);
    fail(res, 500, 'Gagal mengonversi audio ke MP3', 'FFMPEG');
  });

  // Client menutup koneksi -> hentikan semuanya
  res.on('close', () => {
    source.destroy();
    ff.kill('SIGKILL');
  });
}
