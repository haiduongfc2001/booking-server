import {
  BED_TYPE,
  BOOKING_STATUS,
  DISCOUNT_TYPE,
  GENDER,
  PAYMENT_STATUS,
  REFUND_STATUS,
  ROLE_TYPE,
  ROOM_STATUS,
  ROOM_TYPE,
  STAFF_ROLE,
} from "../config/enum.config";
import { capitalizeFirstLetter, toUpperCase } from "./StringConversion";

const translation: { [key: string]: { [key: string]: string } } = {
  roleType: {
    [ROLE_TYPE.CUSTOMER]: "Khách hàng",
    [ROLE_TYPE.RECEPTIONIST]: "Nhân viên lễ tân",
    [ROLE_TYPE.MANAGER]: "Quản lý khách sạn",
    [ROLE_TYPE.ADMIN]: "Quản trị viên",
  },
  roomStatus: {
    [ROOM_STATUS.AVAILABLE]: "Có sẵn",
    [ROOM_STATUS.UNAVAILABLE]: "Không có sẵn",
  },
  bookingStatus: {
    [BOOKING_STATUS.PENDING]: "Chờ xác nhận",
    [BOOKING_STATUS.CONFIRMED]: "Đặt phòng thành công",
    [BOOKING_STATUS.CHECKED_IN]: "Đã nhận phòng",
    [BOOKING_STATUS.CHECKED_OUT]: "Đã trả phòng",
    [BOOKING_STATUS.CANCELLED]: "Đã hủy",
    [BOOKING_STATUS.FAILED]: "Đặt phòng thất bại",
  },
  gender: {
    [GENDER.MALE]: "Nam",
    [GENDER.FEMALE]: "Nữ",
    [GENDER.OTHER]: "Khác",
  },
  discountType: {
    [DISCOUNT_TYPE.PERCENTAGE]: "Phần trăm",
    [DISCOUNT_TYPE.FIXED_AMOUNT]: "Số tiền cố định",
  },
  staffRole: {
    [STAFF_ROLE.MANAGER]: "Quản lý khách sạn",
    [STAFF_ROLE.RECEPTIONIST]: "Nhân viên lễ tân",
  },
  bedType: {
    [BED_TYPE.SINGLE]: "Giường đơn",
    [BED_TYPE.DOUBLE]: "Giường đôi",
    [BED_TYPE.QUEEN]: "Giường Queen",
    [BED_TYPE.KING]: "Giường King",
    [BED_TYPE.TWIN]: "Giường đôi nhỏ",
    [BED_TYPE.FULL]: "Giường Full",
    [BED_TYPE.CALIFORNIA_KING]: "Giường California King",
    [BED_TYPE.SOFA_BED]: "Giường sofa",
    [BED_TYPE.BUNK_BED]: "Giường tầng",
    [BED_TYPE.ROLL_AWAY]: "Giường di động",
    [BED_TYPE.MURPHY_BED]: "Giường gấp tường",
  },
  roomType: {
    [ROOM_TYPE.SINGLE]: "Phòng Đơn",
    [ROOM_TYPE.DOUBLE]: "Phòng Đôi",
    [ROOM_TYPE.TWIN]: "Phòng Hai Giường Đơn",
    [ROOM_TYPE.FAMILY]: "Phòng Gia Đình",
    [ROOM_TYPE.SUITE]: "Phòng Suite",
    [ROOM_TYPE.QUEEN]: "Phòng Queen",
    [ROOM_TYPE.KING]: "Phòng King",
    [ROOM_TYPE.PRESIDENTIAL_SUITE]: "Phòng Tổng Thống",
    [ROOM_TYPE.DELUXE]: "Phòng Deluxe",
    [ROOM_TYPE.STANDARD]: "Phòng Tiêu Chuẩn",
    [ROOM_TYPE.STUDIO]: "Phòng Studio",
    [ROOM_TYPE.DORMITORY]: "Phòng Dormitory",
    [ROOM_TYPE.CONNECTING]: "Phòng Connecting",
  },
  roomTypeDescription: {
    [ROOM_TYPE.SINGLE]:
      "Phòng đơn thích hợp cho một người ở, với giường đơn và các tiện ích cơ bản.",
    [ROOM_TYPE.DOUBLE]:
      "Phòng đôi thích hợp cho hai người ở, với giường đôi và các tiện ích hiện đại.",
    [ROOM_TYPE.TWIN]:
      "Phòng với hai giường đơn, thích hợp cho bạn bè hoặc đồng nghiệp ở chung.",
    [ROOM_TYPE.FAMILY]:
      "Phòng rộng rãi, thích hợp cho gia đình với nhiều giường và không gian rộng.",
    [ROOM_TYPE.SUITE]:
      "Phòng sang trọng với không gian rộng, khu vực tiếp khách riêng biệt và các tiện ích cao cấp.",
    [ROOM_TYPE.QUEEN]:
      "Phòng với giường Queen, thích hợp cho cặp đôi hoặc du khách cá nhân muốn thoải mái hơn.",
    [ROOM_TYPE.KING]:
      "Phòng với giường King rộng rãi, thích hợp cho cặp đôi hoặc du khách muốn không gian lớn hơn.",
    [ROOM_TYPE.PRESIDENTIAL_SUITE]:
      "Phòng cao cấp nhất, với không gian rộng lớn, tiện nghi sang trọng và dịch vụ đẳng cấp.",
    [ROOM_TYPE.DELUXE]:
      "Phòng cao cấp với không gian rộng và các tiện nghi cao cấp.",
    [ROOM_TYPE.STANDARD]: "Phòng tiêu chuẩn với đầy đủ tiện nghi cơ bản.",
    [ROOM_TYPE.STUDIO]:
      "Phòng kiểu studio với không gian mở và khu vực bếp nhỏ.",
    [ROOM_TYPE.DORMITORY]:
      "Phòng ngủ tập thể với giường tầng, thích hợp cho nhóm du lịch hoặc khách tiết kiệm.",
    [ROOM_TYPE.CONNECTING]:
      "Phòng kết nối với nhau, thích hợp cho gia đình hoặc nhóm bạn.",
  },
  paymentStatus: {
    [PAYMENT_STATUS.PENDING]: "Chờ xử lý",
    [PAYMENT_STATUS.COMPLETED]: "Đã thanh toán",
    [PAYMENT_STATUS.FAILED]: "Thất bại",
    [PAYMENT_STATUS.CANCELLED]: "Đã hủy",
    [PAYMENT_STATUS.REFUNDED]: "Đã hoàn tiền",
    [PAYMENT_STATUS.EXPIRED]: "Đã hết hạn",
  },
  refundStatus: {
    [REFUND_STATUS.PENDING]: "Chờ xử lý",
    [REFUND_STATUS.COMPLETED]: "Đã hoàn tiền",
    [REFUND_STATUS.FAILED]: "Thất bại",
  },
};

/**
 * Translates a given key and value to a corresponding localized string.
 * @param key - The translation category (e.g., 'roleType', 'roomStatus').
 * @param value - The value to be translated.
 * @returns The translated string if found, or "Không rõ" if not found.
 */
export function translate(key: string, value: string): string {
  if (translation[key]) {
    const uppercasedValue = toUpperCase(value);
    const translatedValue = translation[key][uppercasedValue];
    return capitalizeFirstLetter(translatedValue || "Không rõ");
  }
  return "Không rõ";
}
