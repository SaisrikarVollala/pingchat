import * as nodemailer from "nodemailer";
import type { Transport } from "nodemailer";
import { Env } from "../config/env";

const htmlTemplate = (otp: string): string => `
  <div style="font-family:Arial,sans-serif;padding:24px">
    <h2>PingChat Verification Code</h2>
    <p>Your OTP is valid for <b>5 minutes</b>.</p>
    <h1>${otp}</h1>
    <p>If you did not request this, ignore this email.</p>
  </div>
`;



const transporter = nodemailer.createTransport( {
  host: "smtp.zoho.in",
  port: 587,
  secure: false, 
  auth: {
    user: Env.EMAIL_USER,
    pass: Env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: true,
  },
  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

transporter.verify((err) => {
  if (err) {
    console.error("SMTP verification failed:", err);
  } else {
    console.log("SMTP server ready");
  }
});

export const sendMailAsync = async (
  email: string,
  otp: string
): Promise<void> => {
  await transporter.sendMail({
    from: `"PingChat" <${Env.EMAIL_USER}>`,
    to: email,
    subject: "PingChat Verification Code",
    html: htmlTemplate(otp),
  });
};

const shutdown = () => {
  transporter.close();
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
