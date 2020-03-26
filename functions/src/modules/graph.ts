import * as functions from 'firebase-functions';
import { GraphQLClient } from 'graphql-request';
import { notify } from './notify';

const gql = String.raw;

// ********************************************************* //

const endpoint = functions.config().graph.endpoint;
const client = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${functions.config().graph.token}`
  }
});

// ********************************************************* //

interface registerUserPayload {
  newPerson: {
    uid: String;
  };
}

interface registerUserWithGraph {
  uid: string;
}

export const registerUserWithGraph = (payload: registerUserWithGraph) => {
  const query = gql`
    mutation createPerson($uid: ID!) {
      newPerson: CreatePerson(input: { uid: $uid }) {
        uid
      }
    }
  `;

  return client
    .request<registerUserPayload>(query, payload)
    .then(({ newPerson: uid }) => uid);
};

// ********************************************************* //

interface sendNotifications {
  uid: string;
}

interface sendNotificationsPayload {
  direct: string[];
  indirect: string[];
}

export enum ContactNature {
  Direct = 0,
  Indirect = 1
}

export const sendNotifications = functions
  .region('europe-west1')
  .https.onCall(async (payload: sendNotifications) => {
    const query = gql`
      query RecentContactsForUser($uid: ID!) {
        direct: RecentDirectContactsForPerson(input: { uid: $uid }) {
          uid
        }
        indirect: RecentIndirectContactsForPerson(input: { uid: $uid }) {
          uid
        }
      }
    `;

    const { direct, indirect } = await client.request<sendNotificationsPayload>(
      query,
      payload
    );

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

    return Promise.all(notify(allContact));
  });
