import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import querystring from "qs";
import dayjs from "dayjs";
import {
  getResponseByStatusCode,
  hash,
  resolveUrlString,
} from "../utils/VNPayCommon";
import { HashAlgorithm, VnpLocale } from "../config/enum.config";
import {
  PAYMENT_ENDPOINT,
  VNPAY_GATEWAY_SANDBOX_HOST,
} from "../config/api-endpoint.constant";
import vnpayConfig from "../config/vnpay.config";
import zaloPayConfig from "../config/zalopay.config";
import axios from "axios";
import qs from "qs";
import { BUFFER_ENCODE } from "../config/constant.config";

const numberRegex = /^[0-9]+$/;

interface VNPayPaymentRequest {
  amount: number;
  bankCode?: string; // Optional property
  orderDescription: string;
  orderType: string;
  language?: string; // Optional property
}

interface ZaloPayPaymentRequest {
  appUser: string;
  amount: number;
  bankCode?: string; // Optional property
  description?: string;
}

interface resultCallback {
  return_code: number;
  return_message: string;
}

interface ZaloPayRefundRequest {
  amount: number;
  description: string;
}

class PaymentController {
  // VNPay
  async createVNPayPaymentUrl(req: Request, res: Response) {
    try {
      const ipAddr =
        (req.headers["x-forwarded-for"] as string) ||
        (req.socket.remoteAddress as string);

      const {
        VNP_VERSION,
        VNP_DEFAULT_COMMAND,
        CURR_CODE_VND,
        VNP_TMM_CODE,
        VNP_HASH_SECRET,
        VNP_PAYMENT_URL,
        VNP_RETURN_URL,
      } = vnpayConfig;

      const date = new Date();
      const createDate = dayjs(date).format("YYYYMMDDHHmmss");
      const orderId = dayjs(date).format("HHmmss");

      const {
        amount,
        bankCode,
        orderDescription,
        orderType,
        language = "vn",
      } = req.body as VNPayPaymentRequest;

      const vnp_Params: Record<string, string | number> = {
        vnp_Version: VNP_VERSION,
        vnp_Command: VNP_DEFAULT_COMMAND,
        vnp_TmnCode: VNP_TMM_CODE,
        vnp_Locale: language,
        vnp_CurrCode: CURR_CODE_VND,
        vnp_TxnRef: orderId,
        vnp_OrderInfo: orderDescription,
        vnp_OrderType: orderType,
        vnp_Amount: amount * 100,
        vnp_ReturnUrl: VNP_RETURN_URL,
        vnp_IpAddr: ipAddr,
        vnp_CreateDate: createDate,
      };

      if (bankCode) {
        vnp_Params["vnp_BankCode"] = bankCode;
      }

      const redirectUrl = new URL(
        resolveUrlString(VNPAY_GATEWAY_SANDBOX_HOST, PAYMENT_ENDPOINT)
      );

      Object.entries(vnp_Params)
        .sort(([key1], [key2]) => key1.localeCompare(key2))
        .forEach(([key, value]) => {
          if (value !== "" && value !== undefined && value !== null) {
            redirectUrl.searchParams.append(key, value.toString());
          }
        });

      const signed = hash(
        HashAlgorithm.SHA512,
        VNP_HASH_SECRET,
        Buffer.from(redirectUrl.search.slice(1), BUFFER_ENCODE)
      );

      vnp_Params["vnp_SecureHash"] = signed;

      const paymentUrl = `${VNP_PAYMENT_URL}?${querystring.stringify(
        vnp_Params,
        { encode: true }
      )}`;
      res.status(200).json({ paymentUrl });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async vnpayIPN(req: Request, res: Response) {
    try {
      const { VNP_HASH_SECRET } = vnpayConfig;
      const { vnp_SecureHash, vnp_SecureHashType, ...vnp_Params } =
        req.query as Record<string, string | number>;

      // Validate and parse vnp_Amount
      if (typeof vnp_Params?.vnp_Amount !== "number") {
        const res = numberRegex.test(vnp_Params?.vnp_Amount ?? "");
        if (!res) {
          throw new Error("Invalid amount");
        }
        vnp_Params.vnp_Amount = Number(vnp_Params.vnp_Amount);
      }

      const outputResults = {
        isVerified: true,
        isSuccess: vnp_Params.vnp_ResponseCode === "00",
        message: getResponseByStatusCode(
          vnp_Params.vnp_ResponseCode?.toString() ?? "",
          VnpLocale.VN
        ),
      };

      const searchParams = new URLSearchParams();
      Object.entries(vnp_Params)
        .sort(([key1], [key2]) =>
          key1.toString().localeCompare(key2.toString())
        )
        .forEach(([key, value]) => {
          // Skip empty value
          if (value === "" || value === undefined || value === null) {
            return;
          }

          searchParams.append(key, value.toString());
        });

      const queryString = searchParams.toString();

      const signed = hash(
        HashAlgorithm.SHA512,
        VNP_HASH_SECRET,
        Buffer.from(queryString, BUFFER_ENCODE)
      );

      if (vnp_SecureHash !== signed) {
        Object.assign(outputResults, {
          isVerified: false,
          message: "Wrong checksum",
        });
      }

      const result = {
        ...vnp_Params,
        ...outputResults,
        vnp_Amount: vnp_Params.vnp_Amount / 100,
      };

      // Send the result as JSON response
      return res.status(200).json(result);
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async returnUrl(req: Request, res: Response) {
    try {
      const { VNP_HASH_SECRET } = vnpayConfig;
      const { vnp_SecureHash, vnp_SecureHashType, ...vnp_Params } =
        req.query as Record<string, string | number>;

      // Validate and parse vnp_Amount
      if (typeof vnp_Params?.vnp_Amount !== "number") {
        const res = numberRegex.test(vnp_Params?.vnp_Amount ?? "");
        if (!res) {
          throw new Error("Invalid amount");
        }
        vnp_Params.vnp_Amount = Number(vnp_Params.vnp_Amount);
      }

      const outputResults = {
        isVerified: true,
        isSuccess: vnp_Params.vnp_ResponseCode === "00",
        message: getResponseByStatusCode(
          vnp_Params.vnp_ResponseCode?.toString() ?? "",
          VnpLocale.VN
        ),
      };

      const searchParams = new URLSearchParams();
      Object.entries(vnp_Params)
        .sort(([key1], [key2]) =>
          key1.toString().localeCompare(key2.toString())
        )
        .forEach(([key, value]) => {
          // Skip empty value
          if (value === "" || value === undefined || value === null) {
            return;
          }

          searchParams.append(key, value.toString());
        });

      const queryString = searchParams.toString();

      const signed = hash(
        HashAlgorithm.SHA512,
        VNP_HASH_SECRET,
        Buffer.from(queryString, BUFFER_ENCODE)
      );

      if (vnp_SecureHash !== signed) {
        Object.assign(outputResults, {
          isVerified: false,
          message: "Wrong checksum",
        });
      }

      const result = {
        ...vnp_Params,
        ...outputResults,
        vnp_Amount: vnp_Params.vnp_Amount / 100,
      };

      // Send the result as JSON response
      return res.status(200).json(result);
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getBankListVNPay(req: Request, res: Response) {
    try {
      const { tmn_code } = req.body; // Assuming the terminal code is sent in the body of the request

      const response = await axios.post(
        "https://sandbox.vnpayment.vn/qrpayauth/api/merchant/get_bank_list",
        new URLSearchParams({ tmn_code }), // Use URLSearchParams to format the body
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      return res.status(200).json(response.data);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to fetch bank list", error: error.message });
    }
  }

  // ZaloPay
  async createZaloPayPaymentUrl(req: Request, res: Response) {
    try {
      const items = [{}];
      const transID = Math.floor(Math.random() * 1000000);

      const {
        appUser = "",
        amount,
        description = `DHD Boooking - Payment for the order #${transID}`,
        bankCode = "",
      } = req.body as ZaloPayPaymentRequest;

      const { APP_ID, KEY1, ENDPOINT, REDIRECT_URL, CALLBACK_URL } =
        zaloPayConfig;

      const embed_data = {
        redirecturl: REDIRECT_URL,
      };
      const order = {
        app_id: APP_ID,
        app_trans_id: `${dayjs().format("YYMMDD")}_${transID}`,
        app_user: appUser,
        app_time: Date.now(),
        item: JSON.stringify(items),
        embed_data: JSON.stringify(embed_data),
        amount,
        description,
        bank_code: bankCode,
        mac: "",
        callback_url: CALLBACK_URL,
      };

      const data =
        APP_ID +
        "|" +
        order.app_trans_id +
        "|" +
        order.app_user +
        "|" +
        order.amount +
        "|" +
        order.app_time +
        "|" +
        order.embed_data +
        "|" +
        order.item;

      order.mac = hash(HashAlgorithm.SHA256, KEY1, data);

      const response = await axios.post(`${ENDPOINT}/create`, null, {
        params: order,
      });

      return res
        .status(201)
        .json({ ...response.data, app_trans_id: order.app_trans_id });
    } catch (error) {
      return res.status(400).json(error);
    }
  }

  async zaloPayCallback(req: Request, res: Response) {
    let result: resultCallback = {
      return_code: 0,
      return_message: "",
    };

    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;

      let mac = hash(HashAlgorithm.SHA256, zaloPayConfig.KEY2, dataStr);

      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      } else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng
        const dataJson = JSON.parse(dataStr);
        console.log(
          "update order's status = success where app_trans_id =",
          dataJson["app_trans_id"]
        );

        result.return_code = 1;
        result.return_message = "success";
      }
    } catch (err: any) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = err.message;
    }

    // thông báo kết quả cho ZaloPay server
    return res.json(result);
  }

  async zaloPayOrderStatus(req: Request, res: Response) {
    const app_trans_id = req.params.app_trans_id;
    const { APP_ID, KEY1, ENDPOINT } = zaloPayConfig;

    let postData = {
      app_id: APP_ID,
      app_trans_id: app_trans_id,
      mac: "",
    };

    let data = postData.app_id + "|" + postData.app_trans_id + "|" + KEY1; // appid|app_trans_id|key1
    postData.mac = hash(HashAlgorithm.SHA256, KEY1, data);

    let postConfig = {
      method: "post",
      url: `${ENDPOINT}/query`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData),
    };

    try {
      const response = await axios(postConfig);
      return res.status(200).json(response.data);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }

  async getBankListZaloPay(req: Request, res: Response) {
    try {
      const { APP_ID, KEY1 } = zaloPayConfig;
      const reqtime = Date.now().toString(); // Ensure reqtime is a string

      const mac = hash(
        HashAlgorithm.SHA512,
        KEY1,
        `${APP_ID}|${reqtime}`
      ).toString(); // Ensure the hash is a string

      const response = await axios.post(
        "https://sbgateway.zalopay.vn/api/getlistmerchantbanks",
        new URLSearchParams({
          appid: APP_ID,
          reqtime, // milliseconds
          mac,
        }).toString(), // Use URLSearchParams to format the body and convert to string
        {
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
        }
      );

      return res.status(200).json(response.data);
    } catch (error: any) {
      return res
        .status(500)
        .json({ message: "Failed to fetch bank list", error: error.message });
    }
  }

  async zaloPayRefund(req: Request, res: Response) {
    try {
      const { APP_ID, KEY1, ENDPOINT } = zaloPayConfig;
      const timestamp = Date.now();
      const uid = `${timestamp}${Math.floor(111 + Math.random() * 999)}`; // unique id

      const { amount, description } = req.body as ZaloPayRefundRequest;
      const { zp_trans_id } = req.params;

      let params = {
        app_id: APP_ID,
        m_refund_id: `${dayjs().format("YYMMDD")}_${APP_ID}_${uid}`,
        timestamp, // milliseconds
        zp_trans_id,
        amount,
        description,
        mac: "",
      };

      // app_id|zp_trans_id|amount|description|timestamp
      let data =
        params.app_id +
        "|" +
        params.zp_trans_id +
        "|" +
        params.amount +
        "|" +
        params.description +
        "|" +
        params.timestamp;
      params.mac = hash(HashAlgorithm.SHA256, KEY1, data);

      const response = await axios.post(`${ENDPOINT}/refund`, params, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      // Check if response data is empty
      if (!response.data) {
        throw new Error("Empty response from ZaloPay API");
      }

      // If response is not empty, return it
      return res
        .status(200)
        .json({ ...response.data, m_refund_id: params.m_refund_id });
    } catch (error: any) {
      console.error("Error in ZaloPay refund:", error);
      return res
        .status(500)
        .json({ message: "Failed to process refund", error: error.message });
    }
  }

  async zaloPayRefundStatus(req: Request, res: Response) {
    try {
      const { APP_ID, KEY1, ENDPOINT } = zaloPayConfig;
      const { m_refund_id } = req.params;
      const params = {
        app_id: APP_ID,
        timestamp: Date.now(), // miliseconds
        m_refund_id,
        mac: "",
      };

      const data =
        params.app_id + "|" + params.m_refund_id + "|" + params.timestamp; // app_id|m_refund_id|timestamp
      params.mac = hash(HashAlgorithm.SHA256, KEY1, data);

      let postConfig = {
        method: "post",
        url: `${ENDPOINT}/query_refund`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        data: params,
      };

      const response = await axios(postConfig);
      return res.status(200).json(response.data);
    } catch (error: any) {
      console.error("Error in ZaloPay refund:", error);
      return res
        .status(500)
        .json({ message: "Failed to process refund", error: error.message });
    }
  }
}

export default new PaymentController();
