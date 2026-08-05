import { Resend } from "resend";
import {
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  RESEND_FROM_NAME,
} from "../../config/env.js";
import { getCredentialEmailTemplate } from "../../templates/email.template.js";

const resend = new Resend(RESEND_API_KEY);

export const sendCredentialByEmail = async ({ toEmail, toName, password }) => {
  try {
    const htmlContent = getCredentialEmailTemplate({
      name: toName,
      email: toEmail,
      password: password,
    });

    const response = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [toEmail],
      subject: "PB JAYA-RAYA",
      html: htmlContent,
    });

    return {
      success: true,
      messageId: response?.data.id,
    };
  } catch (error) {
    console.error("Error sending email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
