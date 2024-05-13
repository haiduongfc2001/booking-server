import nodemailer from "nodemailer";
import SMTPTransport from "nodemailer/lib/smtp-transport";
import mailConfig from "../config/mail.config";

const { EMAIL_HOST, EMAIL_PORT, EMAIL_USERNAME, EMAIL_PASSWORD, BASE_URL } =
  mailConfig;

interface MailOptions {
  from: string;
  to: string;
  subject: string;
  text?: string; // Optional for plain text emails
  html?: string; // Optional for HTML emails
}

const sendVerifyMail = async (
  full_name: string,
  email: string,
  customer_id: number
) => {
  try {
    const customerVerificationLink = `${BASE_URL}/account/verify?id=${customer_id}`;

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: EMAIL_PORT,
      secure: false,
      requireTLS: true,
      auth: {
        user: EMAIL_USERNAME,
        pass: EMAIL_PASSWORD,
      },
    } as SMTPTransport.Options);

    const mailOptions: MailOptions = {
      from: EMAIL_USERNAME!,
      to: email,
      subject: "Xác thực email",
      text: "Plaintext version of the message",
      html: `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Email Verification</title>
                <style>
                  body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color: #f5f5ff;
                  }
                  strong {
                    font-size: 16px;
                  }
                  .container {
                    max-width: 600px;
                    margin: 30px auto;
                    padding: 20px;
                    background-color: #f5f5ff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                  }
                  header {
                    display: flex;
                    margin-bottom: 30px;
                  }
                  h1 {
                    font-size: 24px;
                    text-align: center;
                    color: #333;
                  }
                  p {
                    color: #555;
                    line-height: 1.4;
                  }
            
                  content p {
                    font-size: 16px;
                    line-height: 1.4;
                    margin-bottom: 20px;
                  }
                  content div {
                    display: block;
                  }
                  .button {
                    padding: 10px 20px;
                    background-color: #007bff;
                    font-weight: 600;
                    text-decoration: none;
                    border-radius: 8px;
                    font-size: 16px;
                    border: none;
                    margin-top: 20px;
                    cursor: pointer;
                  }
                  .button:hover {
                    background-color: #0056b3;
                  }
            
                  footer {
                    margin-top: 30px;
                  }
            
                  footer p {
                    font-size: 14px;
                    margin-bottom: 5px;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <header style="align-items: center; justify-content: center">
                    <h1>Xác thực email</h1>
                  </header>
                  <content>
                    <p>Xin chào <strong>${full_name}</strong>,</p>
                    <p>
                      Cảm ơn bạn đã đăng ký! Để hoàn tất đăng ký, vui lòng nhấp vào nút bên
                      dưới để xác minh địa chỉ email của bạn.
                    </p>
                    <div style="text-align: center">
                      <a href="${customerVerificationLink}" class="button" style="color: #ffffff">Xác thực email</a>
                    </div>
                  </content>
                  <footer>
                    <p>
                      Nếu bạn chưa đăng ký dịch vụ của chúng tôi, vui lòng bỏ qua email này.
                    </p>
                    <p>Trân trọng,<br /><strong>DHD</strong></p>
                  </footer>
                </div>
              </body>
            </html>
          `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("Email has been sent: " + info.response);
  } catch (error: any) {
    console.log(error.message);
  }
};

export default sendVerifyMail;
