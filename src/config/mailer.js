import nodemailer from "nodemailer";

const adminEmail = process.env.MAIL_USER;
const adminPassword = process.env.MAIL_PASSWORD;
const mailHost = process.env.MAIL_HOST;
const mailPort = process.env.MAIL_PORT;

const sendMail = (to, subject, html) => {
  const transporter = nodemailer.createTransport({
    host: mailHost,
    port: mailPort,
    secure: false, // use SSL - TLS
    auth: {
      user: adminEmail,
      pass: adminPassword,
    },
  });

  const options = {
    from: adminEmail,
    to,
    subject,
    html,
  };
  return transporter.sendMail(options); // this default return a promise
};

export default sendMail;
