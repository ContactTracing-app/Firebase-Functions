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
  const DIRECT_MSG = `Time to stay strictly self-isolated for at least 14 days! You've been in contact with someone who is showing COVID-19 symptoms  – ContactTracing.app`;
  const INDIRECT_MSG = `Time to self-isolate! One of your friends and family has been in contact with someone who's showing signs of COVID-19 – ContactTracing.app`;

  client.messages.create({
    body:
      data.contactNature === ContactNature.Direct ? DIRECT_MSG : INDIRECT_MSG,
    from: '+12057977380',
    to: `${functions.config().twilio.test_number}`
  });
};
