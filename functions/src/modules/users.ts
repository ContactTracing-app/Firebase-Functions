import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { registerUserWithGraph } from './graph';

const fs = admin.firestore();
const db = admin.database();

export const setupNewUser = functions.auth.user().onCreate(async user => {
  const { uid, displayName, photoURL, email } = user;

  const profile = {
    email,
    preferences: {
      contact_via_email: true,
      contact_via_phone: true
    }
  };

  fs.collection('accounts')
    .doc(uid)
    .set(profile);

  db.ref(`profiles/${uid}`).set({
    displayName,
    photoURL
  });

  const resp = await registerUserWithGraph({ uid });

  return resp;
});
