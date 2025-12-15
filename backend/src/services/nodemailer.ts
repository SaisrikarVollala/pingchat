import { Resend } from "resend";
import { Env } from "../config/env";

const resend = new Resend(Env.RESEND_API_KEY);

const htmlTemplate = (otp: string): string => `
  <div style="font-family:Arial,sans-serif;padding:24px">
    <h2>PingChat Verification Code</h2>
    <p>Your OTP is valid for <b>5 minutes</b>.</p>
    <h1>${otp}</h1>
    <p>If you did not request this, ignore this email.</p>
  </div>
`;

export const sendMailAsync = async (
  email: string,
  otp: string
): Promise<void> => {
  try {
    await resend.emails.send({
      from: "PingChat <onboarding@resend.dev>",
      to: email,
      subject: "PingChat Verification Code",
      html: htmlTemplate(otp),
    });

    console.log("OTP email sent to", email);
  } catch (error) {
    console.error("Email send failed:", error);
  }
};
