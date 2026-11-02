const ytdl = require('@distube/ytdl-core');

function extractVideoId(url) {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

module.exports = async (req, res) => {
    // Handling CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const inputUrl = req.query.url;
    if (!inputUrl) {
        return res.status(400).json({ error: 'Parameter URL wajib disertakan' });
    }

    const videoId = extractVideoId(inputUrl);
    if (!videoId) {
        return res.status(400).json({ error: 'URL YouTube / YouTube Music tidak valid' });
    }

    const targetUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        const info = await ytdl.getInfo(targetUrl);
        const title = info.videoDetails.title.replace(/[^\w\s-]/gi, '') || 'audio';

        res.setHeader('Content-Type', 'audio/mpeg');
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(title)}.mp3"`);

        // Stream audio asli dari YouTube ke client/browser
        ytdl(targetUrl, {
            filter: 'audioonly',
            quality: 'highestaudio',
            highWaterMark: 1 << 25
        }).pipe(res);

    } catch (error) {
        console.error('YTDL Error:', error);
        return res.status(500).json({ error: 'Gagal memproses audio dari YouTube', details: error.message });
    }
};
