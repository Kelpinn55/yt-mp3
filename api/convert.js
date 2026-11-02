const ytdl = require('@distube/ytdl-core');

function extractVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const inputUrl = req.query.url;
    const videoId = extractVideoId(inputUrl);

    if (!videoId) {
        return res.status(400).send('URL tidak valid');
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        // Menggunakan OUserAgent & UserOptions untuk menghindari blokir IP Vercel
        const info = await ytdl.getInfo(targetUrl, {
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });

        const title = info.videoDetails.title.replace(/[^\w\s-]/gi, '') || 'audio';

        // Header MP3 yang valid
        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.mp3"`);

        const stream = ytdl(targetUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25,
            requestOptions: {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
                }
            }
        });

        stream.pipe(res);

        stream.on('error', (err) => {
            console.error('Stream Error:', err);
            if (!res.headersSent) {
                res.status(500).send('Gagal mengambil stream audio');
            }
        });

    } catch (error) {
        console.error('YTDL Fetch Error:', error);
        if (!res.headersSent) {
            res.status(500).send(`Server Error: ${error.message}`);
        }
    }
};