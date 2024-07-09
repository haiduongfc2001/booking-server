import dotenv from "dotenv";
dotenv.config();

interface ZaloPayConfig {
  APP_ID: string;
  KEY1: string;
  KEY2: string;
  ENDPOINT: string;
  REDIRECT_URL: string;
  CALLBACK_URL: string;
}

const zaloPayConfig: ZaloPayConfig = {
  APP_ID: "2554",
  KEY1: process.env.ZALOPAY_KEY1 || "",
  KEY2: process.env.ZALOPAY_KEY2 || "",
  ENDPOINT: "https://sb-openapi.zalopay.vn/v2",
  // REDIRECT_URL: "http://localhost:5000/api/v1",
  REDIRECT_URL:
    "https://booking-customer.vercel.app//hotel/booking/payment?paymentMethod=ZALOPAY",
  CALLBACK_URL:
    "https://79b0-14-177-235-116.ngrok-free.app/api/v1/payment/zalopay/callback",
};

if (!zaloPayConfig.KEY1 || !zaloPayConfig.KEY2) {
  throw new Error(
    "Missing necessary ZaloPay configuration in environment variables."
  );
}

export default zaloPayConfig;
