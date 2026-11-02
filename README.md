# YouTube & YouTube Music to MP3 Converter (Fix Vercel 2026)

Full-stack project berbasis Vercel Serverless API + Client-side Fallback API.

## 💡 Mengapa Solusi Ini Berhasil Tanpa Cookie?
1. **Tidak Memakai `ytdl-core` / `ffmpeg` di Vercel Serverless:** Vercel Serverless melarang runtime biner berat dan IP Vercel diblokir oleh YouTube jika mengunduh stream langsung tanpa cookie.
2. **Multi-Source Converter Engine (Direct API):** Menggunakan endpoint pengonversi audio terenkripsi yang secara publik mengekstrak stream audio dari YouTube & YouTube Music tanpa perlunya login cookie.
3. **Mendukung `music.youtube.com`, `youtu.be`, dan Parameter `&si=...`**.

## 🚀 Cara Update Repository GitHub
Buka terminal pada folder `C:\yt-mp3` lalu jalankan:

```bash
git add .
git commit -m "Fix total: ganti engine ke Direct API tanpa cookie & ffmpeg"
git push origin main
```
