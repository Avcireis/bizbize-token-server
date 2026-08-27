const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-access-token');

const app = express();

const APP_ID = '707bf31341584776b13043d4761662a8';
const APP_CERTIFICATE = '156121b6d17b4c8180630b771304b9b3';

app.get('/rtc/:channelName', (req, res) => {
    const channelName = req.params.channelName;
    if (!channelName) return res.status(400).json({ error: 'Channel name is required' });

    // RTC Token oluştur (En güncel ve stabil metod)
    const expirationTimeInSeconds = 3600 * 24; // 24 saat
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // ÖNEMLİ: buildTokenWithUid yerine buildTokenWithAccount deneyelim (daha geniş kapsama sahiptir)
    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        0, // 0 = Tüm UID'ler için geçerli wildcard token
        RtcRole.PUBLISHER,
        privilegeExpiredTs
    );

    res.header("Access-Control-Allow-Origin", "*");
    return res.json({ rtcToken: token });
});

module.exports = app;
