import dotenv from 'dotenv';

dotenv.config();

const mailConfig = {
  HOST: process.env.EMAIL_HOST,
  PORT: process.env.EMAIL_PORT,
  USERNAME: process.env.EMAIL_USERNAME,
  PASSWORD: process.env.EMAIL_PASSWORD,
  BASE_URL: process.env.BASE_URL,
  BASE_ADMIN_URL: process.env.BASE_ADMIN_URL,
};

export default mailConfig;