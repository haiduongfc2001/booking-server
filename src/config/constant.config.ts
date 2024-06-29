export const DEFAULT_MINIO = {
  END_POINT: "http://localhost:9000/europetrip/",
  BUCKET: "europetrip",
  HOTEL_PATH: "hotels",
  ROOM_TYPE_PATH: "room_types",
  CUSTOMER_PATH: "customers",
  STAFF_PATH: "staffs",
};

export const ROLE = {
  CUSTOMER: "CUSTOMER",
  MANAGER: "MANAGER",
  RECEPTIONIST: "RECEPTIONIST",
  ADMIN: "ADMIN",
};

export const BED_TYPE = {
  SINGLE: "SINGLE",
  DOUBLE: "DOUBLE",
  QUEEN: "QUEEN",
  KING: "KING",
  TWIN: "TWIN",
  FULL: "FULL",
  CALIFORNIA_KING: "CALIFORNIA_KING",
  SOFA_BED: "SOFA_BED",
  BUNK_BED: "BUNK_BED",
  ROLL_AWAY: "ROLL_AWAY",
  MURPHY_BED: "MURPHY_BED",
};

export const TABLE_NAME = {
  CUSTOMER: "customer",
  STAFF: "staff",
  ADMIN: "admin",
  HOTEL: "hotel",
  HOTEL_IMAGE: "hotel_image",
  ROOM: "room",
  ROOM_IMAGE: "room_image",
  PROMOTION: "promotion",
  PROVINCE: "province",
  DISTRICT: "district",
  WARD: "ward",
  BOOKING: "booking",
  ROOM_BOOKING: "room_booking",
  BED: "bed",
  ROOM_TYPE: "room_type",
  POLICY: "policy",
  PAYMENT: "payment",
  PAYMENT_METHOD: "payment_method",
  REFUND: "refund",
  REVIEW: "review",
  ROOM_TYPE_AMENITY: "room_type_amenity",
  HOTEL_AMENITY: "hotel_amenity",
  BOOKING_GUEST: "booking_guest",
  ROOM_BOOKING_GUEST: "room_booking_guest",
  REPLY_REVIEW: "reply_review",
  FAVORITE_HOTEL: "favorite_hotel",
};

export const PAGINATION = {
  INITIAL_PAGE: 1,
  PAGE_SIZE: 10,
};

export const BUFFER_ENCODE: BufferEncoding = "utf-8";

export const UNLIMITED_PRICE: number = 5000000;
