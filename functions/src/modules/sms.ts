import * as functions from 'firebase-functions';
import twilio from 'twilio';

const accountSid = functions.config().twilio.account_sid as string;
const authToken = functions.config().twilio.auth_token as string;

const client = twilio(accountSid, authToken);

export const testSMS = functions.https.onCall(() =>
  client.messages.create({
    body: `สวัสดีponk`,
    from: '+12057977380',
    to: `${functions.config().twilio.test_number}`
  })
);
