import { Request, Response } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import querystring from "qs";
import dayjs from "dayjs";
import {
  getResponseByStatusCode,
  hash,
  resolveUrlString,
} from "../utils/VNPayCommon";
import {
  BOOKING_STATUS,
  HashAlgorithm,
  PAYMENT_STATUS,
  VnpLocale,
} from "../config/enum.config";
import {
  PAYMENT_ENDPOINT,
  VNPAY_GATEWAY_SANDBOX_HOST,
} from "../config/api-endpoint.constant";
import vnpayConfig from "../config/vnpay.config";
import zaloPayConfig from "../config/zalopay.config";
import axios from "axios";
import qs from "qs";
import { BUFFER_ENCODE, DEFAULT_MINIO } from "../config/constant.config";
import { Booking } from "../model/Booking";
import { PaymentMethod } from "../model/PaymentMethod";
import { Payment } from "../model/Payment";
import { RoomBooking } from "../model/RoomBooking";
import { RoomType } from "../model/RoomType";
import { Hotel } from "../model/Hotel";
import { HotelImage } from "../model/HotelImage";
import { RoomImage } from "../model/RoomImage";
import { Customer } from "../model/Customer";
import { minioConfig } from "../config/minio.config";
import { translate } from "../utils/Translation";
import { Room } from "../model/Room";
import { Bed } from "../model/Bed";

const numberRegex = /^[0-9]+$/;

interface VNPayPaymentRequest {
  amount: number;
  bankCode?: string; // Optional property
  orderDescription: string;
  orderType: string;
  language?: string; // Optional property
}

interface ZaloPayPaymentRequest {
  booking_id: string;
  appUser: string;
  amount: number;
  bankCode?: string; // Optional property
  description?: string;
}

interface resultCallback {
  return_code: number;
  return_message: string;
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
        booking_id,
        appUser = "",
        amount,
        description = `DHD Boooking - Payment for the order ${booking_id}`,
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

      if (response?.data) {
        await Payment.create({
          booking_id,
          payment_method_id: 1,
          amount,
          description,
          transaction_date: new Date(),
          trans_reference: order.app_trans_id,
          provider_metadata: response?.data,
          status: PAYMENT_STATUS.PENDING,
        });
      }

      return res
        .status(201)
        .json({ ...response.data, app_trans_id: order.app_trans_id });
    } catch (error: any) {
      console.error(
        "Error creating ZaloPay payment URL:",
        error.response?.data || error.message
      );
      return res.status(400).json({
        message: "Failed to create ZaloPay payment URL",
        error: error.response?.data || error.message,
      });
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

    const data = `${APP_ID}|${app_trans_id}|${KEY1}`;
    const postData = {
      app_id: APP_ID,
      app_trans_id,
      mac: hash(HashAlgorithm.SHA256, KEY1, data),
    };

    const postConfig = {
      method: "post",
      url: `${ENDPOINT}/query`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      data: qs.stringify(postData),
    };

    try {
      const payment = await Payment.findOne({
        where: { trans_reference: app_trans_id },
        include: [{ model: PaymentMethod }],
      });

      if (!payment) {
        return res.status(400).json({ message: "Payment not found!" });
      }

      const booking = await Booking.findByPk(payment.booking_id, {
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                    include: [
                      { model: RoomImage },
                      { model: Bed },
                      { model: Hotel, include: [{ model: HotelImage }] },
                    ],
                  },
                ],
              },
            ],
          },
          { model: Customer },
        ],
      });

      if (!booking) {
        return res
          .status(404)
          .json({ status: 404, message: "Booking not found!" });
      }

      const updatedRoomBookings = await Promise.all(
        booking.roomBookings.map(async (roomBooking) => {
          const updatedRoom = {
            ...roomBooking.room.toJSON(),
            roomType: {
              ...roomBooking.room.roomType.toJSON(),
              roomImages: await Promise.all(
                roomBooking.room.roomType.roomImages.map(async (image) => {
                  const presignedUrl = await new Promise<string>(
                    (resolve, reject) => {
                      minioConfig
                        .getClient()
                        .presignedGetObject(
                          DEFAULT_MINIO.BUCKET,
                          `${DEFAULT_MINIO.HOTEL_PATH}/${roomBooking.room.roomType.hotel.id}/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${roomBooking.room.roomType.id}/${image.url}`,
                          24 * 60 * 60,
                          (err, presignedUrl) =>
                            err ? reject(err) : resolve(presignedUrl)
                        );
                    }
                  );

                  return { ...image.toJSON(), url: presignedUrl };
                })
              ),
              hotel: {
                ...roomBooking.room.roomType.hotel.toJSON(),
                address: `${roomBooking.room.roomType.hotel.street}, ${roomBooking.room.roomType.hotel.ward}, ${roomBooking.room.roomType.hotel.district}, ${roomBooking.room.roomType.hotel.province}`,
                hotelImages: await Promise.all(
                  roomBooking.room.roomType.hotel.hotelImages.map(
                    async (image) => {
                      const presignedUrl = await new Promise<string>(
                        (resolve, reject) => {
                          minioConfig
                            .getClient()
                            .presignedGetObject(
                              DEFAULT_MINIO.BUCKET,
                              `${DEFAULT_MINIO.HOTEL_PATH}/${roomBooking.room.roomType.hotel.id}/${image.url}`,
                              24 * 60 * 60,
                              (err, presignedUrl) =>
                                err ? reject(err) : resolve(presignedUrl)
                            );
                        }
                      );

                      return { ...image.toJSON(), url: presignedUrl };
                    }
                  )
                ),
              },
            },
          };

          return { ...roomBooking.toJSON(), room: updatedRoom };
        })
      );

      const bookingInfo = {
        ...booking.toJSON(),
        roomBookings: updatedRoomBookings,
        translateStatus: translate("bookingStatus", booking.status),
        totalAdults: booking.roomBookings.reduce(
          (sum, roomBooking) => sum + roomBooking.num_adults,
          0
        ),
        totalChildren: booking.roomBookings.reduce(
          (sum, roomBooking) => sum + roomBooking.num_children,
          0
        ),
        totalPrice: booking.total_room_price + booking.tax_and_fee,
      };

      const response = await axios(postConfig);

      if (response?.data?.return_code === 1) {
        const [updatedPayment, updatedBooking] = await Promise.all([
          payment.update({
            status: PAYMENT_STATUS.COMPLETED,
            provider_metadata: response.data,
          }),
          booking.update({ status: BOOKING_STATUS.CONFIRMED }),
        ]);
        return res.status(200).json({
          status: 200,
          message: response.data.return_message,
          details: response.data,
          data: {
            ...updatedPayment.toJSON(),
            translateStatus: translate("paymentStatus", updatedPayment.status),
            bookingInfo: {
              ...bookingInfo,
              status: updatedBooking.status,
              translateStatus: translate(
                "bookingStatus",
                updatedBooking.status
              ),
            },
          },
        });
      } else if (response?.data?.return_code === 2) {
        const [updatedPayment, updatedBooking] = await Promise.all([
          payment.update({
            status: PAYMENT_STATUS.FAILED,
            provider_metadata: response.data,
          }),
          booking.update({ status: BOOKING_STATUS.FAILED }),
        ]);
        return res.status(400).json({
          status: 400,
          message: response.data.return_message,
          details: response.data,
          data: {
            ...updatedPayment.toJSON(),
            translateStatus: translate("paymentStatus", updatedPayment.status),
            bookingInfo: {
              ...bookingInfo,
              status: updatedBooking.status,
              translateStatus: translate(
                "bookingStatus",
                updatedBooking.status
              ),
            },
          },
        });
      } else if (response?.data?.return_code === 3) {
        const [updatedPayment, updatedBooking] = await Promise.all([
          payment.update({
            status: PAYMENT_STATUS.PENDING,
            provider_metadata: response.data,
          }),
          booking.update({ status: BOOKING_STATUS.PENDING }),
        ]);
        return res.status(202).json({
          status: 202,
          message: response.data.return_message,
          details: response.data,
          data: {
            ...updatedPayment.toJSON(),
            translateStatus: translate("paymentStatus", updatedPayment.status),
            bookingInfo: {
              ...bookingInfo,
              status: updatedBooking.status,
              translateStatus: translate(
                "bookingStatus",
                updatedBooking.status
              ),
            },
          },
        });
      } else {
        return res.status(500).json({
          status: 500,
          message: "Unexpected return code",
          details: response.data,
        });
      }
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

  // Payment Table
  async createPayment(req: Request, res: Response) {
    try {
      const { booking_id, payment_method_id, amount } = req.body;

      const booking = await Booking.findByPk(booking_id);
      if (!booking) {
        return res.status(404).json({
          status: 404,
          message: "Booking not found!",
        });
      }

      const paymentMethod = await PaymentMethod.findByPk(payment_method_id);
      if (!paymentMethod) {
        return res.status(404).json({
          status: 404,
          message: "Payment method not found!",
        });
      }

      const payment = await Payment.create({
        booking_id,
        payment_method_id,
        amount,
        payment_date: new Date(),
      });

      return res.status(201).json({
        status: 201,
        message: "Payment created successfully!",
        data: payment,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getPayments(req: Request, res: Response) {
    try {
      const payments = await Payment.findAll();
      return res.status(200).json({
        status: 200,
        data: payments,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async getPaymentById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({
          status: 404,
          message: "Payment not found!",
        });
      }
      return res.status(200).json({
        status: 200,
        data: payment,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updatePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { booking_id, payment_method_id, amount } = req.body;

      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({
          status: 404,
          message: "Payment not found!",
        });
      }

      if (booking_id) {
        const booking = await Booking.findByPk(booking_id);
        if (!booking) {
          return res.status(404).json({
            status: 404,
            message: "Booking not found!",
          });
        }
        payment.booking_id = booking_id;
      }

      if (payment_method_id) {
        const paymentMethod = await PaymentMethod.findByPk(payment_method_id);
        if (!paymentMethod) {
          return res.status(404).json({
            status: 404,
            message: "Payment method not found!",
          });
        }
        payment.payment_method_id = payment_method_id;
      }

      if (amount !== undefined) {
        payment.amount = amount;
      }

      await payment.save();

      return res.status(200).json({
        status: 200,
        message: "Payment updated successfully!",
        data: payment,
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async deletePayment(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payment = await Payment.findByPk(id);
      if (!payment) {
        return res.status(404).json({
          status: 404,
          message: "Payment not found!",
        });
      }
      await payment.destroy();
      return res.status(200).json({
        status: 200,
        message: "Payment deleted successfully!",
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }

  async updatePaymentStatus(req: Request, res: Response) {
    try {
      const { trans_reference } = req.body;

      const payment = await Payment.findOne({
        where: { trans_reference },
        include: [{ model: PaymentMethod }],
      });

      if (!payment) {
        return res.status(400).json({
          message: "Payment not found!",
        });
      }

      const booking = await Booking.findByPk(payment.booking_id, {
        include: [
          {
            model: RoomBooking,
            include: [
              {
                model: Room,
                include: [
                  {
                    model: RoomType,
                    include: [
                      { model: RoomImage },
                      { model: Hotel, include: [{ model: HotelImage }] },
                    ],
                  },
                ],
              },
            ],
          },
          { model: Customer },
        ],
      });

      if (!booking) {
        return res.status(404).json({
          status: 404,
          message: "Booking not found!",
        });
      }

      const updatedRoomBookings = await Promise.all(
        booking.roomBookings.map(async (roomBooking) => {
          const updatedRoom = {
            ...roomBooking.room.toJSON(),
            roomType: {
              ...roomBooking.room.roomType.toJSON(),
              hotel: {
                ...roomBooking.room.roomType.hotel.toJSON(),
                hotelImages: await Promise.all(
                  roomBooking.room.roomType.hotel.hotelImages.map(
                    async (image) => {
                      const presignedUrl = await new Promise<string>(
                        (resolve, reject) => {
                          minioConfig
                            .getClient()
                            .presignedGetObject(
                              DEFAULT_MINIO.BUCKET,
                              `${DEFAULT_MINIO.HOTEL_PATH}/${roomBooking.room.roomType.hotel.id}/${image.url}`,
                              24 * 60 * 60,
                              (err, presignedUrl) => {
                                if (err) reject(err);
                                else resolve(presignedUrl);
                              }
                            );
                        }
                      );

                      return {
                        ...image.toJSON(),
                        url: presignedUrl,
                      };
                    }
                  )
                ),
              },
            },
          };

          return {
            ...roomBooking.toJSON(),
            room: updatedRoom,
          };
        })
      );

      const bookingInfo = {
        ...booking.toJSON(),
        roomBookings: updatedRoomBookings,
        translateStatus: translate("bookingStatus", booking.status),
        totalAdults: booking.roomBookings.reduce(
          (sum, roomBooking) => sum + roomBooking.num_adults,
          0
        ),
        totalChildren: booking.roomBookings.reduce(
          (sum, roomBooking) => sum + roomBooking.num_children,
          0
        ),
        totalPrice: booking.total_room_price + booking.tax_and_fee,
      };

      return res.status(200).json({
        status: 200,
        message: "Successfully fetched all booking data!",
        data: {
          ...payment.toJSON(),
          bookingInfo,
        },
      });
    } catch (error) {
      return ErrorHandler.handleServerError(res, error);
    }
  }
}

export default new PaymentController();
