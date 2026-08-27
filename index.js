const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const app = express();

const APP_ID = '707bf31341584776b13043d4761662a8';
const APP_CERTIFICATE = '156121b6d17b4c8180630b771304b9b3';

app.get('/rtc/:channelName', (req, res) => {
    const channelName = req.params.channelName;
    if (!channelName) return res.status(400).json({ error: 'Channel name is required' });

    const uid = 0;
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600 * 24; // 24 saat
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    // buildTokenWithUid yerine buildTokenWithAccount genellikle daha garantidir
    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs, // token son kullanma
        privilegeExpiredTs  // yetki son kullanma
    );

    res.header("Access-Control-Allow-Origin", "*");
    return res.json({ rtcToken: token });
});

module.exports = app;
