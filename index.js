const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const app = express();

const APP_ID = '707bf31341584776b13043d4761662a8';
const APP_CERTIFICATE = '156121fda34f430f8e3758359834b9b3';

app.get('/rtc/:channelName/:uid', (req, res) => {
    const channelName = req.params.channelName;
    const uid = req.params.uid || 0;
    const expirationTimeInSeconds = 3600 * 24;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID, APP_CERTIFICATE, channelName, parseInt(uid), RtcRole.PUBLISHER, privilegeExpiredTs, privilegeExpiredTs
    );
    res.header("Access-Control-Allow-Origin", "*");
    return res.json({ rtcToken: token });
});

// Eski rotayı da destekleyelim (Garanti olsun)
app.get('/rtc/:channelName', (req, res) => {
    const channelName = req.params.channelName;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600 * 24;
    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID, APP_CERTIFICATE, channelName, 0, RtcRole.PUBLISHER, privilegeExpiredTs, privilegeExpiredTs
    );
    res.header("Access-Control-Allow-Origin", "*");
    return res.json({ rtcToken: token });
});

module.exports = app;
