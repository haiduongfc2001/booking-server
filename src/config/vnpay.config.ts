import dotenv from "dotenv";
dotenv.config();

interface VNPayConfig {
  VNP_VERSION: string;
  VNP_DEFAULT_COMMAND: string;
  CURR_CODE_VND: string;
  VNP_TMM_CODE: string;
  VNP_HASH_SECRET: string;
  VNP_PAYMENT_URL: string;
  VNP_RETURN_URL: string;
}

const vnpayConfig: VNPayConfig = {
  VNP_VERSION: "2.1.0",
  VNP_DEFAULT_COMMAND: "pay",
  CURR_CODE_VND: "VND",
  VNP_TMM_CODE: process.env.VNP_TMM_CODE || "",
  VNP_HASH_SECRET: process.env.VNP_HASH_SECRET || "",
  VNP_PAYMENT_URL: "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  VNP_RETURN_URL: "https://booking-customer.vercel.app/",
};

// Check for required environment variables and throw an error if any are missing
if (!vnpayConfig.VNP_TMM_CODE || !vnpayConfig.VNP_HASH_SECRET) {
  throw new Error("Missing necessary VNPay configuration in environment variables.");
}

export default vnpayConfig;
