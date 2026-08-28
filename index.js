app.get('/rtc/:channelName/:uid', (req, res) => {
    const channelName = req.params.channelName;
    const uid = req.params.uid || 0; // UID'yi artık parametre olarak alıyoruz
    
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600 * 24;

    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID,
        APP_CERTIFICATE,
        channelName,
        parseInt(uid), // UID'yi sayıya çevir
        RtcRole.PUBLISHER,
        privilegeExpiredTs,
        privilegeExpiredTs
    );

    res.header("Access-Control-Allow-Origin", "*");
    return res.json({ rtcToken: token });
});
