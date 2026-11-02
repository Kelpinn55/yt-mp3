module.exports = (req, res) => {
    // 1. Tangani CORS secara penuh
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // 2. Tangani preflight request (OPTIONS)
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // 3. Ambil URL dari query (GET) atau body (POST)
    const url = req.query.url || (req.body && req.body.url);

    if (!url) {
        return res.status(400).json({ error: 'URL YouTube atau YT Music wajib diisi.' });
    }

    // 4. Ekstrak Video ID (Support youtu.be, youtube.com, music.youtube.com, &si=...)
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) {
        return res.status(400).json({ error: 'Format URL tidak valid.' });
    }

    // 5. Kembalikan link ke penyedia konversi pihak ketiga yang stabil (Iframe Button)
    // Menggunakan penyedia publik yang mengizinkan embed tanpa blokir Vercel IP
    const embedUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;

    return res.status(200).json({
        success: true,
        videoId: videoId,
        embedUrl: embedUrl
    });
};
