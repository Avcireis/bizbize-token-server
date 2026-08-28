const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const app = express();

const APP_ID = '707bf31341584776b13043d4761662a8';
const APP_CERTIFICATE = '156121b6d17b4c8180630b771304b9b3';

// URL yapısını güncelledik: /rtc/:channelName/:uid
app.get('/rtc/:channelName/:uid', (req, res) => {
    const channelName = req.params.channelName;
    const uid = req.params.uid || 0;
    
    if (!channelName) return res.status(400).json({ error: 'Channel is required' });

    const expirationTimeInSeconds = 3600 * 24; 
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        parseInt(uid), // Telefonun gönderdiği numarayı kullan
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
        privilegeExpiredTs
    );

    res.header("Access-Control-Allow-Origin", "*");
    return res.json({ rtcToken: token });
});

module.exports = app;
