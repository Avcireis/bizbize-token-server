const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');

const app = express();
const PORT = process.env.PORT || 3000;

// AGORA BILGILERI
const APP_ID = '707bf31341584776b13043d4761662a8';
const APP_CERTIFICATE = '156121b6d17b4c8180630b771304b9b3';

app.get('/', (req, res) => {
    res.send('Agora Token Server is running. Use /rtc/:channelName');
});

app.get('/rtc/:channelName', (req, res) => {
    const channelName = req.params.channelName;
    if (!channelName) {
        return res.status(400).json({ error: 'Channel name is required' });
    }

    const uid = 0; // 0 let Agora assign a UID
    const role = RtcRole.PUBLISHER;
    const expirationTimeInSeconds = 3600 * 24; // 24 hours
    const currentTimestamp = Math.floor(Date.now() / 1000);
    const privilegeExpiredTs = currentTimestamp + expirationTimeInSeconds;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        uid,
        role,
        privilegeExpiredTs
    );

    console.log(`Token generated for channel: ${channelName}`);
    return res.json({ rtcToken: token });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
