import { Op } from "sequelize";
import { DEFAULT_MINIO } from "../config/constant.config";
import { minioConfig } from "../config/minio.config";
import { Hotel } from "../model/Hotel";
import { HotelAmenity } from "../model/HotelAmenity";
import { HotelImage } from "../model/HotelImage";

interface IHotelRepo {
  save(hotel: Hotel): Promise<void>;
  update(hotel: Hotel): Promise<void>;
  delete(hotel_id: number): Promise<void>;
  retrieveAll(): Promise<HotelWithImages[]>;
  retrieveById(hotel_id: number): Promise<HotelWithImages>;
}

interface IHotelImage {
  id: number;
  url: string;
  caption: string;
  is_primary: boolean;
}

// Interface for response with presigned URLs
interface HotelWithImages {
  // Existing hotel properties from Hotel model
  [key: string]: any;
  images: IHotelImage[];
}

export class HotelRepo implements IHotelRepo {
  private async generatePresignedUrl(
    hotel: Hotel,
    imageUrl: string
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      minioConfig
        .getClient()
        .presignedGetObject(
          DEFAULT_MINIO.BUCKET,
          `${DEFAULT_MINIO.HOTEL_PATH}/${hotel.id}/${imageUrl}`,
          24 * 60 * 60,
          (err, presignedUrl) => {
            if (err) reject(err);
            else resolve(presignedUrl);
          }
        );
    });
  }

  private async fetchHotel(hotel_id: number): Promise<Hotel> {
    const hotel = await Hotel.findByPk(hotel_id);
    if (!hotel) {
      throw new Error("Không tìm thấy khách sạn!");
    }
    return hotel;
  }

  private async fetchHotels(query: any): Promise<HotelWithImages[]> {
    const hotels = await Hotel.findAll(query);
    return Promise.all(
      hotels.map(async (hotel) => ({
        ...hotel.toJSON(),
        images: await this.fetchHotelImages(hotel),
      }))
    );
  }

  private async fetchHotelImages(hotel: Hotel): Promise<IHotelImage[]> {
    const hotelImages = await HotelImage.findAll({
      where: { hotel_id: hotel.id },
    });
    return Promise.all(
      hotelImages.map(async (image) => ({
        ...image.toJSON(),
        url: await this.generatePresignedUrl(hotel, image.url),
      }))
    );
  }

  async save(newHotel: Hotel): Promise<void> {
    try {
      await Hotel.create({
        name: newHotel.name,
        street: newHotel.street,
        ward: newHotel.ward,
        district: newHotel.district,
        province: newHotel.province,
        // latitude: newHotel.latitude,
        // longitude: newHotel.longitude,
        description: newHotel.description,
        contact: newHotel.contact,
      });
    } catch (error) {
      throw new Error("Failed to save hotel!");
    }
  }

  async update(updatedHotel: Hotel): Promise<void> {
    try {
      const existingHotel = await this.fetchHotel(updatedHotel.id);
      await existingHotel.update(updatedHotel);
    } catch (error) {
      throw new Error("Failed to update hotel!");
    }
  }

  async delete(hotel_id: number): Promise<void> {
    try {
      const existingHotel = await this.fetchHotel(hotel_id);
      await existingHotel.destroy();
    } catch (error) {
      throw new Error("Failed to delete hotel!");
    }
  }

  async retrieveAll(): Promise<HotelWithImages[]> {
    try {
      return await this.fetchHotels({ order: [["id", "asc"]] });
    } catch (error) {
      throw new Error("Failed to retrieve all hotels!");
    }
  }

  async retrieveById(hotel_id: number): Promise<HotelWithImages> {
    try {
      const hotel = await this.fetchHotel(hotel_id);
      return {
        ...hotel.toJSON(),
        images: await this.fetchHotelImages(hotel),
        hotelAmenities: await HotelAmenity.findAll({
          where: { hotel_id },
        }),
      };
    } catch (error) {
      throw new Error("Failed to retrieve hotel by ID!");
    }
  }

  async countHotelsByMonth(year: number, month: number): Promise<number> {
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 1);

    const count = await Hotel.count({
      where: {
        created_at: {
          [Op.gte]: startDate,
          [Op.lt]: endDate,
        },
      },
      distinct: true,
    });

    return count;
  }
}
