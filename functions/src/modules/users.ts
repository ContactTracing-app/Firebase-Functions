import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { registerUserWithGraph } from './graph';

const fs = admin.firestore();
const db = admin.database();

export interface Account {
  email?: string;
  smsNumber?: string;
  preferences: {
    contact_via_email: boolean;
    contact_via_sms: boolean;
  };
}

export interface Profile {
  displayName?: string;
  photoURL?: string;
}

export const setupNewUser = functions
  .region('europe-west1')
  .auth.user()
  .onCreate(async user => {
    const { uid, displayName, photoURL, email } = user;

    const account: Account = {
      email,
      preferences: {
        contact_via_email: true,
        contact_via_sms: false
      }
    };

    fs.collection('accounts')
      .doc(uid)
      .set(account);

    const profile: Profile = {
      displayName,
      photoURL
    };

    db.ref(`profiles/${uid}`).set(profile);

    const resp = await registerUserWithGraph({ uid });

    return resp;
  });
