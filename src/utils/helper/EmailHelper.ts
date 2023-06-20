import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { config } from "../../config/Config";

dotenv.config();

interface IEmailBody {
  from?: string;
  to: string;
  subject: string;
  text: string;
  html: string;
  attachments?: [
    {
      filename: string;
      content: Buffer | string;
    }
  ];
}

export class EmailHelper {
  private transporter: nodemailer.Transporter;
  constructor() {
    // Create a transport object using SMTP for Gmail
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config.config.ELOGBOOK_MAIL_USERNAME, // Your Gmail email address
        pass: config.config.ELOGBOOK_MAIL_PASSWORD, // Your Gmail email password
      },
    });
  }

  sendEmail(emailBody: IEmailBody) {
    // Send the email using the transporter
    this.transporter.sendMail(emailBody, (error, info) => {
      if (error) {
        console.error("Error sending email:", error);
      } else {
        console.log("Email sent:", info.response);
      }
    });
  }
}
