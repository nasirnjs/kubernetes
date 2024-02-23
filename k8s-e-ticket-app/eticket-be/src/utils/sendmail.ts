import nodemailer, { Transporter } from "nodemailer";
import ejs from "ejs";
import path from "path";
import dotenv from "dotenv";
dotenv.config();

interface IEmailOptions {
  email: string;
  subject: string;
  template: string;
  data: any;
}

const sendMail = async (options: IEmailOptions): Promise<void> => {
  const transporter: Transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    service: process.env.SMTP_SERVICE,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });
  const { data, email, subject, template } = options;

  //get to the path to the template
  const templatePath = path.join(__dirname, "../mailer/", template);

  //render the template with ejs
  const html: string = await ejs.renderFile(templatePath, data);
  const mailOptions = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendMail;
