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

export const sendNotifications = functions
  .region('europe-west1')
  .https.onCall(async (payload: sendNotifications) => {
    const allContacts = await collectNotificationsFromGraph({
      uid: payload.uid
    });

    allContacts.forEach(async ({ uid, contactNature }) => {
      const account = await retrieveAccountForUid(uid);
      if (!account) {
        return;
      }

      const {
        sms_number,
        email,
        preferences: { contact_via_email, contact_via_sms }
      } = account;

      if (email && contact_via_email) {
        await notifyWithEmail({
          recipientEmail: email,
          contactNature
        });
      }

      if (sms_number && contact_via_sms) {
        await notifyWithSMS({
          phoneNumber: sms_number,
          contactNature
        });
      }
    });
  });
