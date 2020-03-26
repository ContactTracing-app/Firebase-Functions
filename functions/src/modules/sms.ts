import * as functions from 'firebase-functions';
import twilio from 'twilio';
import { ContactNature } from './graph';

const accountSid = functions.config().twilio.account_sid as string;
const authToken = functions.config().twilio.auth_token as string;

const client = twilio(accountSid, authToken);

export const testSMS = functions.region('europe-west1').https.onCall(() =>
  client.messages.create({
    body: `สวัสดีponk`,
    from: '+12057977380',
    to: `${functions.config().twilio.test_number}`
  })
);

interface notifyWithSMS {
  phoneNumber: string;
  contactNature: ContactNature;
}
export const notifyWithSMS = async (data: notifyWithSMS) => {
  //  TODO: Direct/Indirect
  client.messages.create({
    body: `สวัสดีponk`,
    from: '+12057977380',
    to: data.phoneNumber
  });
};
