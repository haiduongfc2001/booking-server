export const DEFAULT_MINIO = {
	END_POINT: "http://localhost:9000/europetrip/",
	BUCKET: "europetrip",
	HOTEL_PATH: "hotels",
	ROOM_PATH: "rooms",
};

export const ROLE = {
	CUSTOMER: "customer",
	MANAGER: "manager",
	RECEPTIONIST: "receptionist",
	ADMIN: "admin",
}

export enum ROLE_TYPE {
	CUSTOMER = "customer",
	RECEPTIONIST = "receptionist",
	MANAGER = "manager",
	ADMIN = "admin",
}
