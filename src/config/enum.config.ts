export enum ROLE_TYPE {
  CUSTOMER = "CUSTOMER",
  RECEPTIONIST = "RECEPTIONIST",
  MANAGER = "MANAGER",
  ADMIN = "ADMIN",
}

export enum ROOM_STATUS {
  AVAILABLE = "AVAILABLE",
  UNAVAILABLE = "UNAVAILABLE",
}

export enum BOOKING_STATUS {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CANCELLED = "CANCELLED",
  FAILED = "FAILED",
}

export enum GENDER {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
}

export enum DISCOUNT_TYPE {
  PERCENTAGE = "PERCENTAGE",
  FIXED_AMOUNT = "FIXED_AMOUNT",
}

export enum STAFF_ROLE {
  MANAGER = "MANAGER",
  RECEPTIONIST = "RECEPTIONIST",
}

export enum BED_TYPE {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  QUEEN = "QUEEN",
  KING = "KING",
  TWIN = "TWIN",
  FULL = "FULL",
  CALIFORNIA_KING = "CALIFORNIA_KING",
  SOFA_BED = "SOFA_BED",
  BUNK_BED = "BUNK_BED",
  ROLL_AWAY = "ROLL_AWAY",
  MURPHY_BED = "MURPHY_BED",
}

export enum ROOM_TYPE {
  SINGLE = "SINGLE",
  DOUBLE = "DOUBLE",
  TWIN = "TWIN",
  FAMILY = "FAMILY",
  SUITE = "SUITE",
  QUEEN = "QUEEN",
  KING = "KING",
  PRESIDENTIAL_SUITE = "PRESIDENTIAL_SUITE",
  DELUXE = "DELUXE",
  STANDARD = "STANDARD",
  STUDIO = "STUDIO",
  DORMITORY = "DORMITORY",
  CONNECTING = "CONNECTING",
}

/**
 * @see https://sandbox.vnpayment.vn/apis/docs/loai-hang-hoa/
 */
export enum ProductCode {
  Food_Consumption = "100000",
  Phone_Tablet = "110000",
  ElectricAppliance = "120000",
  Computers_OfficeEquipment = "130000",
  Electronics_Sound = "140000",
  Books_Newspapers_Magazines = "150000",
  Sports_Picnics = "160000",
  Hotel_Tourism = "170000",
  Cuisine = "180000",
  Entertainment_Training = "190000",
  Fashion = "200000",
  Health_Beauty = "210000",
  Mother_Baby = "220000",
  KitchenUtensils = "230000",
  Vehicle = "240000",
  Pay = "250000",
  AirlineTickets = "250007",
  CardCode = "260000",
  Pharmacy_MedicalServices = "270000",
  Other = "other",
}

// VNPay
export enum UrlService {
  sandbox = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
}

export enum HashAlgorithm {
  SHA256 = "SHA256",
  SHA512 = "SHA512",
  MD5 = "MD5",
}

export enum VnpCurrCode {
  VND = "VND",
}

export enum VnpLocale {
  VN = "vn",
  EN = "en",
}

export enum VnpCardType {
  ATM = "ATM",
  QRCODE = "QRCODE",
}

export enum VnpTransactionType {
  PAYMENT = "01",
  FULL_REFUND = "02",
  PARTIAL_REFUND = "03",
}

export enum RefundTransactionType {
  FULL_REFUND = "02",
  PARTIAL_REFUND = "03",
}

export enum PAYMENT_METHOD {
  ZALOPAY = "ZALOPAY",
  MOMO = "MOMO",
}

export enum PAYMENT_STATUS {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  REFUNDED = "REFUNDED",
  EXPIRED = "EXPIRED",
}

export enum BOOKING_GUEST_PAYMENT_STATUS {
  PAID = "PAID",
  UNPAID = "UNPAID",
}

export enum BOOKING_GUEST_STATUS {
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  CHECKED_OUT = "CHECKED_OUT",
  CANCELLED = "CANCELLED",
}

export enum REFUND_STATUS {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  APPROVED = "APPROVED",
  DECLINED = "DECLINED",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
  PENDING_APPROVAL = "PENDING_APPROVAL",
  UNDER_REVIEW = "UNDER_REVIEW",
  REVERSED = "REVERSED",
  PARTIALLY_REFUNDED = "PARTIALLY_REFUNDED",
}
