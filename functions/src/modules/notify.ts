import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { Account } from './users';

const fs = admin.firestore();

export const sendNotifications = functions
  .region('europe-west1')
  .https.onCall(async (payload: sendNotifications) => {});

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

export const notify = async (uid: string) => {
  const allContact = [
    ...direct.map((id: string) => ({
      id,
      contactNature: ContactNature.Direct
    })),
    ...indirect.map((id: string) => ({
      id,
      contactNature: ContactNature.Indirect
    }))
  ];

  const account = await retrieveAccountForUid(uid);

  if (!account) {
    return;
  }

  const {
    preferences: { contact_via_email, contact_via_sms }
  } = account;

  if (contact_via_email) {
    // Notify: Direct Email
  }

  if (contact_via_sms) {
    // Notify: Direct SMS
  }
};
export const notifyIndirect = (uid: string) => {};
