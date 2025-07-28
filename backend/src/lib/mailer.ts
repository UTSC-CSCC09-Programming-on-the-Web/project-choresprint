import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY || "");

export interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// send mail with sendgrid
export async function sendMail(options: MailOptions) {
  await sgMail.send({
    from: process.env.MAIL_FROM || "ChoreSprint <no-reply@choresprint.app>",
    ...options,
  });
}