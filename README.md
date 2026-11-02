# YouTube & YouTube Music to MP3 Converter

Project full-stack berbasis Node.js dan HTML/CSS/JS frontend yang siap dideploy ke **GitHub** dan **Vercel**.

## 🚀 Fitur Utama
- **Link Extractor Presisi:** Mampu menangani link YouTube biasa (`youtube.com`, `youtu.be`) serta YouTube Music (`music.youtube.com`) dengan URL parameter seperti `&si=...`.
- **Real MP3 Audio Streaming:** Menggunakan `@distube/ytdl-core` di backend untuk mengunduh sinyal audio asli dari YouTube.
- **Vercel Serverless Compatible:** Dilengkapi file konfigurasi `vercel.json` dan struktur `/api` agar langsung aktif saat push ke GitHub dan terkoneksi ke Vercel.
- **UI Dark Mode Premium:** Tampilan visual responsif bertema YouTube Music.

## 📦 Cara Deploy ke GitHub & Vercel

1. **Extract ZIP Ini**
2. **Push ke GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - YT Converter Project"
   git branch -M main
   git remote add origin https://github.com/USERNAME/REPOSITORY-NAME.git
   git push -u origin main
   ```
3. **Deploy ke Vercel:**
   - Buka dashboard [Vercel](https://vercel.com).
   - Klik **"Add New Project"** -> **"Import Git Repository"**.
   - Pilih repository GitHub Anda, lalu klik **"Deploy"**.
   - Vercel akan otomatis membaca file `vercel.json` dan mengaktifkan frontend serta endpoint API `/api/convert`.
