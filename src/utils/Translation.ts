import {
  BED_TYPE,
  BOOKING_STATUS,
  DISCOUNT_TYPE,
  GENDER,
  ROLE_TYPE,
  ROOM_STATUS,
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
    [BOOKING_STATUS.CONFIRMED]: "Đã xác nhận",
    [BOOKING_STATUS.CHECKED_IN]: "Đã nhận phòng",
    [BOOKING_STATUS.CHECKED_OUT]: "Đã trả phòng",
    [BOOKING_STATUS.CANCELED]: "Đã hủy",
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
};

export function translate(key: string, value: string): string {
  if (translation[key]) {
    const uppercasedValue = toUpperCase(value);
    const translatedValue = translation[key][uppercasedValue];
    return capitalizeFirstLetter(translatedValue || "Không rõ");
  }
  return "Không rõ";
}
