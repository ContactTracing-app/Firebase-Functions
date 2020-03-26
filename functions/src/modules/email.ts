import * as functions from 'firebase-functions';
import nodemailer from 'nodemailer';

interface testEmail {
  recipient_email: string;
}

let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: `${functions.config().email.auth_user}`,
    pass: `${functions.config().email.auth_pass}`
  }
});

export const testEmail = functions
  .region('europe-west1')
  .https.onCall((data: testEmail) => {
    const mailOptions = {
      from: `Your Account Name <yourgmailaccount@gmail.com>', // Something like: Jane Doe <janedoe@gmail.com>`,
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
