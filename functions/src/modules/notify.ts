import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Account } from './users';
import { collectNotificationsFromGraph } from './graph';
import { notifyWithEmail } from './email';
import { notifyWithSMS } from './sms';

const fs = admin.firestore();

interface sendNotifications {
  uid: string;
}

export const retrieveAccountForUid = async (uid: string) => {
  const doc = await fs
    .collection('accounts')
    .doc(uid)
    .get();
  if (!doc.exists) {
    return null;
  }

  const account = doc.data() as Account;
  return account;
};

export const sendNotifications = functions.https.onCall(
  async (payload: sendNotifications) => {
    const allContacts = await collectNotificationsFromGraph({
      uid: payload.uid
    });

    allContacts.forEach(async ({ uid, contactNature }) => {
      try {
        const account = await retrieveAccountForUid(uid);
        if (!account) {
          return;
        }

        const {
          email,
          smsNumber,
          preferences: { contact_via_sms, contact_via_email }
        } = account;

        if (smsNumber && contact_via_sms) {
          await notifyWithSMS({
            phoneNumber: smsNumber,
            contactNature
          });
        }

        if (email && contact_via_email) {
          await notifyWithEmail({
            recipientEmail: email,
            contactNature
          });
        }
      } catch (e) {
        console.error(e);
      }
    });
  }
);
