const axios = require('axios');

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
    if (!inputUrl) {
        return res.status(400).json({ error: 'Parameter URL wajib disertakan.' });
    }

    const videoId = extractVideoId(inputUrl);
    if (!videoId) {
        return res.status(400).json({ error: 'URL YouTube / YouTube Music tidak valid.' });
    }

    try {
        // Menggunakan Rapid Cobalt Engine untuk konversi audio tanpa Cookie / IP block
        const response = await axios.post('https://co.wuk.sh/api/json', {
            url: `https://www.youtube.com/watch?v=${videoId}`,
            isAudioOnly: true,
            aFormat: "mp3"
        }, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });

        if (response.data && response.data.url) {
            return res.status(200).json({
                success: true,
                videoId: videoId,
                downloadUrl: response.data.url,
                title: response.data.filename || `YouTube-Audio-${videoId}`
            });
        } else {
            throw new Error('Gagal mendapatkan link unduhan MP3.');
        }
    } catch (err) {
        // Fallback jika API utama busy: gunakan Public Direct Converter Stream
        const fallbackUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;
        return res.status(200).json({
            success: true,
            videoId: videoId,
            downloadUrl: fallbackUrl,
            isFallback: true
        });
    }
};
