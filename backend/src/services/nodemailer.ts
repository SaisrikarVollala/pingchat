import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { Env } from "../config/env";

const htmlTemplate = (otp: string): string => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
    <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden;">
      <div style="padding: 30px; text-align: center;">
        <h2 style="color: #333;">PingChat Verification Code</h2>

        <p style="color: #555; font-size: 16px;">
          Use the following One-Time Password (OTP) to verify your account.
          This OTP is valid for <strong>5 minutes</strong>.
        </p>

        <div style="margin: 30px 0;">
          <span style="
            display: inline-block;
            padding: 15px 30px;
            font-size: 28px;
            font-weight: bold;
            background-color: #f0f0f0;
            border-radius: 8px;
            letter-spacing: 6px;
          ">
            ${otp}
          </span>
        </div>

        <p style="color: #999; font-size: 14px;">
          If you didn’t request this, you can safely ignore this email.
        </p>
      </div>

      <div style="
        background-color: #f4f4f7;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #999;
      ">
      </div>
    </div>
  </div>
`;

const transporter= nodemailer.createTransport({
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

  pool: false,

  connectionTimeout: 10_000,
  greetingTimeout: 10_000,
  socketTimeout: 10_000,
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP verification failed:", error);
  } else {
    console.log("SMTP server ready (Zoho India)");
  }
});

export const sendMailAsync = async (
  email: string,
  otp: string
): Promise<void> => {
  try {
    await transporter.sendMail({
      from: `"PingChat" <${Env.EMAIL_USER}>`,
      to: email,
      subject: "Your PingChat Verification Code", 
      html: htmlTemplate(otp),
    });

    console.log(`OTP sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send OTP to ${email}:`, err);
    throw err;
  }
};

const shutdown = () => {
  transporter.close();
  console.log(" SMTP transporter closed");
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
