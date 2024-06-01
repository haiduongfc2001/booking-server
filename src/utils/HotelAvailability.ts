import { DEFAULT_MINIO } from "../config/constant.config";
import { minioConfig } from "../config/minio.config";
import { calculateRoomDiscount } from "./CalculateRoomDiscount";

interface Room {
  id: number;
  roomBookings: {
    booking: {
      check_in: string;
      check_out: string;
    };
  }[];
  toJSON: () => any;
}

interface RoomType {
  id: number;
  base_price: number;
  rooms: Room[];
  toJSON: () => any;
}

interface HotelImage {
  id: number;
  url: string;
  toJSON: () => any;
}

interface Hotel {
  id: number;
  roomTypes: RoomType[];
  hotelImages: HotelImage[];
  street: string;
  ward: string;
  district: string;
  province: string;
  toJSON: () => any;
}

interface Filters {
  price_range?: [number, number];
}

async function getAvailableHotel(
  hotel: Hotel,
  filters: Filters | undefined,
  formattedCheckInDate: Date,
  formattedCheckOutDate: Date,
  num_rooms: number
): Promise<any | null> {
  const availableRoomTypes = await Promise.all(
    hotel.roomTypes.map(async (roomType) => {
      const room_discount = await calculateRoomDiscount(roomType);
      const effective_price = roomType.base_price - room_discount;

      if (filters?.price_range?.length === 2) {
        const [minPrice, maxPrice] = filters.price_range;
        if (effective_price < minPrice || effective_price > maxPrice) {
          return null;
        }
      }

      const availableRooms = roomType.rooms.filter(
        (room) =>
          !room.roomBookings.some((roomBooking) => {
            const checkIn = new Date(roomBooking.booking.check_in);
            const checkOut = new Date(roomBooking.booking.check_out);
            return (
              checkIn <= formattedCheckOutDate &&
              checkOut >= formattedCheckInDate
            );
          })
      );

      if (availableRooms.length >= num_rooms) {
        return {
          ...roomType.toJSON(),
          room_discount,
          numRooms: availableRooms.length,
          rooms: availableRooms
            .map((room) => room.toJSON())
            .sort((a, b) => a.id - b.id),
          effective_price,
        };
      }

      return null;
    })
  );

  const filteredRoomTypes = availableRoomTypes.filter(
    (roomType) => roomType !== null
  );

  if (filteredRoomTypes.length > 0) {
    const hotelImages = await Promise.all(
      hotel.hotelImages.map(async (image) => {
        const presignedUrl = await new Promise<string>((resolve, reject) => {
          minioConfig
            .getClient()
            .presignedGetObject(
              DEFAULT_MINIO.BUCKET,
              `${DEFAULT_MINIO.HOTEL_PATH}/${hotel.id}/${image.url}`,
              24 * 60 * 60,
              (err, presignedUrl) => {
                if (err) reject(err);
                else resolve(presignedUrl);
              }
            );
        });

        return {
          ...image.toJSON(),
          url: presignedUrl,
        };
      })
    );

    const { street, ward, district, province } = hotel;
    return {
      ...hotel.toJSON(),
      address: `${street}, ${ward}, ${district}, ${province}`,
      images: hotelImages,
      roomTypes: filteredRoomTypes,
    };
  }

  return null;
}

export default getAvailableHotel;
