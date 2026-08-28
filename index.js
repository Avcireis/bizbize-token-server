const express = require('express');
const { RtcTokenBuilder, RtcRole } = require('agora-token');
const admin = require('firebase-admin');

const app = express();
app.use(express.json());

// FIREBASE ADMIN YETKISI
const serviceAccount = {
  "project_id": "denizpaylasim",
  "private_key": "-----BEGIN PRIVATE KEY-----\nMIIEvwIBADANBgkqhkiG9w0BAQEFAASCBKkwggSlAgEAAoIBAQDHIJWVP6OoD/rh\npKS1jfw0ejJ46e4eBA3G4dio1nEr0lHp5y58/GA/Yx4QkQacE3/DaOzyCjVjE/RV\n71sgod0ootmEUMnz4BfYZveGBpqBW6F1hLPQQaVMxpmoRDigOruGOqr1Dp0gV+ce\nKZRfj/c0vuMqa+X7ODRSL2aC7zc520e9V2aeEXmIGu8umiqiXMV66XGabZ3GG28e\nPjhtT4Y1U11XlbknY4U/t4qAz6V/WyMckt852Y2pTzlO1v9v9wTRIsDJ9pu2Ix4P\n4r6uHxAANDRpdSW2t4tmwpvAH2zrgDySvbW8vQSGzOijP0aquB1SYZ0OTTzPlXUM\nT9WeqxlnAgMBAAECggEAD5S1H6CDJbtaXh2L5cjeWxzUpjFnuGGI0m8JjOx6nnsu\nfabhNFZrEYqn55PxeHTuIlQrdiTmWIJPNAoujzcbHvrfGkNYCgUW2I/1/j62CDkr\nQQ7JIxp/3KoNi+UKqT7vPWmJxvMFyGoYY3vNaEzTgwUMsV0P+cBEF8ots0EUiSpD\n9SrhctWENKkeFVAmBy6POZCp3jediof7uF7nUW3cHdRMEvQI+WrHYD8HN7JD+IuA\nPLtQq3s1Q0DS47hnKB20/uyuQGHPdS+WURKfplSfQNj14xU5+TLkX53UgKMxEjyJ\nrkMPPWQLyrT5b7p9lgGcSrABZCjPjnsS3ocbn+OsQQKBgQDjmgjRHQgo96gNtklQ\n9tgwYCjlkraCFg29PXfMLJ+nBsmydvmT7CGqu6sYJ0lK9U+a/2Spqf+hLPm3WILd\n+F3A36tNV/62vriUaCFWrNQEVTlDkOyuGkcHdcLgJd8tbBznHjcwk26faibIFJ5m\ncZeDGuxUg00OGJaOuXFQQFzjKwKBgQDf+Qf2qp+HK4pOk/YGbvutD5M/AaaLziFZ\n/2Vj2WO2qSAjIIEw8Mkz0zRpOkypE3TtizsedUyB7doxdfbuuHREgsF5+1m/3+aR\nnCBr84BIf9ZC6ll84bAjKsxoNZ+dFHmA2O57jcjxwSdRchOhfw7qRtG8J3I375Nm\ncYXAhq10tQKBgQCzTfBQPZzmGWUtmEPeIvlh8v+FDLX3ecRNJ5WvJiCIh1Jy5EPu\ngwJq7Pn3R0v4X5XdOAJnn2Oh6Dq6dGJ02GuTvSHJBt/FvC7Ry88n53QIDdPVJOEw\nr8bxW5aw22Uc9aU3dphoDl4B/LCcw5GehzKjuJwiYGZeCoTh37ojTPFgjQKBgQCP\n/xT+os4z4mtmf7xigIIwzt21WYNRSTKqIQh3vLFeI7g0vVYyN+yz9CszKDdXUNoR\nSz20JGgO9PQebqBW9KJT1dk8arxWH0anAUDbBs/ITOBdXzwvjQ5oXcDTkv5OyHYh\nv9b7+rlhrPRxaa1zXDQjrWp01MubaN1UtNHwaOYmLQKBgQCPL/CcN8VsfXj1e8iw\nv7RzlHhhvg/PhSx8ymxCMfgsAB14germl35hmDPnoHHFWTZm2ySbU3Q5hTz/J9xX\n8YT7lxvQHQv1PAytXghrPD50rM0Uxm6zsjPmFwd2hU2DccjXIMIZWRonnBV0Vfy5\n1bXNHVVs/5Qs3spwbcAOK3ZG5w==\n-----END PRIVATE KEY-----\n",
  "client_email": "firebase-adminsdk-fbsvc@denizpaylasim.iam.gserviceaccount.com"
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const APP_ID = '707bf31341584776b13043d4761662a8';
const APP_CERTIFICATE = '156121fda34f430f8e3758359834b9b3';

// AGORA TOKEN ROTASI
app.get('/rtc/:channelName/:uid', (req, res) => {
    const channelName = req.params.channelName;
    const uid = req.params.uid;
    const privilegeExpiredTs = Math.floor(Date.now() / 1000) + 3600 * 24;
    const token = RtcTokenBuilder.buildTokenWithUid(
        APP_ID, APP_CERTIFICATE, channelName, parseInt(uid), RtcRole.PUBLISHER, privilegeExpiredTs, privilegeExpiredTs
    );
    res.header("Access-Control-Allow-Origin", "*");
    return res.json({ rtcToken: token });
});

// BILDIRIM GONDERME ROTASI
app.post('/send-call-notification', async (req, res) => {
    const { receiverId, callerName } = req.body;

    try {
        // Firestore'dan alicinin token'ini bul
        const userDoc = await admin.firestore().collection('users').doc(receiverId).get();
        if (!userDoc.exists) return res.status(404).send('User not found');

        const fcmToken = userDoc.data().fcmToken;
        if (!fcmToken) return res.status(400).send('User has no FCM token');

        const message = {
            data: {
                type: 'CALL',
                callerName: callerName
            },
            token: fcmToken,
            android: {
                priority: 'high'
            }
        };

        await admin.messaging().send(message);
        console.log(`Notification sent to ${receiverId}`);
        res.status(200).send('Notification sent');
    } catch (error) {
        console.error('Error sending notification:', error);
        res.status(500).send(error.toString());
    }
});

module.exports = app;
