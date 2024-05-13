import dotenv from "dotenv";
dotenv.config();

const mailConfig = {
  EMAIL_HOST: process.env.EMAIL_HOST,
  EMAIL_PORT: process.env.EMAIL_PORT,
  EMAIL_USERNAME: process.env.EMAIL_USERNAME,
  EMAIL_PASSWORD: process.env.EMAIL_PASSWORD,
  BASE_URL: process.env.BASE_URL,
  BASE_ADMIN_URL: process.env.BASE_ADMIN_URL,
};

export default mailConfig;
