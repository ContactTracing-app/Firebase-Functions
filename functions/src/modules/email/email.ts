import * as functions from 'firebase-functions';
import nodemailer from 'nodemailer';
import cors from 'cors';
import Handlebars from 'handlebars/runtime';
import { ContactNature } from '../graph';

import './compiled.js';

cors({ origin: true });

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: `${functions.config().email.auth_user}`,
    pass: `${functions.config().email.auth_pass}`
  }
});

interface testEmail {
  recipient_email: string;
}

const defaultMailOptions = {
  from: `Contact Tracing app <no-reply@contacttracing.app>`
};
export const testEmail = functions
  .region('europe-west1')
  .https.onCall((data: testEmail) => {
    const mailOptions = {
      ...defaultMailOptions,
      to: data.recipient_email,
      subject: "I'M A PICKLE!!!", // email subject
      html: `<p style="font-size: 16px;">Pickle Riiiiiiiiiiiiiiiick!!</p><br /><img src="https://images.prod.meredith.com/product/fc8754735c8a9b4aebb786278e7265a5/1538025388228/l/rick-and-morty-pickle-rick-sticker" />`
    };

    // returning result
    return transporter.sendMail(mailOptions, (err, info) => {
      if (err) console.log(err);
      else console.log(info);
    });
  });

interface NotifyWithEmail {
  recipientEmail: string;
  contactNature: ContactNature;
}

export const notifyWithEmail = (data: NotifyWithEmail) => {
  // TODO check direct/indirect

  const variables = {
    displayName: null
  };

  const commonMailOptions = {
    to: data.recipientEmail
  };
  const mailOptions =
    data.contactNature === ContactNature.Direct
      ? {
          ...defaultMailOptions,
          ...commonMailOptions,
          subject: 'Contact Tracing - Direct Contact',
          html: Handlebars.templates['direct.hbs'](variables)
        }
      : {
          ...defaultMailOptions,
          ...commonMailOptions,
          subject: 'Contact Tracing - Indirect Contact',
          html: Handlebars.templates['indirect.hbs'](variables)
        };

  // returning result
  return transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.log(err);
    else console.log(info);
  });
};
