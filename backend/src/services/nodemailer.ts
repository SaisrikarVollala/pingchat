import { Env } from "../config/env";
import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";

const htmlTemplate = (otp: string) => {
  return `
      <div style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 30px;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
        
          <!-- Body -->
          <div style="padding: 30px; text-align: center;">
            <h2 style="color: #333333;">Your PingChat OTP Verification</h2>
            <p style="color: #555555; font-size: 16px;">Use the following One-Time Password (OTP) to complete your registration. This OTP is valid for <strong>5 minutes</strong>.</p>
            
            <!-- OTP -->
            <div style="margin: 20px 0;">
              <span style="display: inline-block; padding: 15px 25px; font-size: 24px; font-weight: bold; background-color: #f1f1f1; border-radius: 6px; letter-spacing: 4px;">${otp}</span>
            </div>
            
            <p style="color: #999999; font-size: 14px;">If you did not request this, please ignore this email.</p>
          </div>
          
          <!-- Footer -->
          <div style="background-color: #f4f4f7; padding: 20px; text-align: center; font-size: 12px; color: #999999;">
            © 2025 PingChat. All rights reserved.
          </div>
        </div>
      </div>
      `;
};

const transporter: Transporter = nodemailer.createTransport({
  host: "smtp.zoho.in",
  port: 465,
  secure: true,
  auth: {
    user: Env.EMAIL_USER,
    pass: Env.EMAIL_PASS,
  },
  pool: true, 
  maxConnections: 5, 
  maxMessages: 100, 
  rateDelta: 1000, 
  rateLimit: 5, 
});

transporter.verify((error) => {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server ready to send emails");
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
      subject: `OTP Verification for PingChat: ${otp}`,
      html: htmlTemplate(otp),
    });
    console.log(`OTP sent to ${email}`);
  } catch (err) {
    console.error(`Failed to send OTP to ${email}:`, err);
    throw err;
  }
};

process.on("SIGTERM", () => {
  transporter.close();
  console.log("SMTP transporter closed");
});
