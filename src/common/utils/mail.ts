import nodemailer from "nodemailer";
import ejs from "ejs";
import { join } from "path";
import { Readable } from "stream";
import { AttachmentLike } from "nodemailer/lib/mailer";

interface DataInterface {
  LOGO?: string;
  link?: string; // Event link
  qrCodeUrl?: string; // QR code image URL
  content?: string;
  otp?: string;
}

export default async function sendMail(
  recipient: string,
  subject: string,
  data: DataInterface
) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    const location = join(
      process.cwd(),
      "views",
      "email",
      "eventInviteTemplate.ejs"
    );

    // Pass the otp variable along with other data
    const template = await ejs.renderFile(location, {
      // LOGO: "/src/public/mailIcon.png",
      link: data.link,
      qrCodeUrl: data.qrCodeUrl,
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: recipient,
      subject,
      html: template as string | Buffer | Readable | AttachmentLike | undefined,
    };

    transporter.sendMail(mailOptions, function (error: any, info: any) {
      if (error) {
        console.log("ERROR SENDING", error);
        return {
          success: false,
        };
      } else {
        console.log("SENT", info.response);
        return {
          success: true,
        };
      }
    });
  } catch (error) {
    console.log("mail error", error);
  }
}
