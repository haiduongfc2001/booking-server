import { DEFAULT_MINIO } from "../config/constant.config";
import { minioConfig } from "../config/minio.config";
import { Hotel } from "../model/Hotel";
import { RoomType } from "../model/RoomType";
import { RoomImage } from "../model/RoomImage";

interface IRoomTypeRepo {
  save(roomType: RoomType): Promise<void>;
  update(roomType: RoomType): Promise<void>;
  delete(room_type_id: number): Promise<void>;
  retrieveAll(): Promise<RoomTypeWithImages[]>;
  retrieveAllRoomTypesByHotelId(
    hotel_id: number
  ): Promise<RoomTypeWithImages[]>;
  retrieveById(room_type_id: number): Promise<RoomTypeWithImages>;
}

interface IRoomImage {
  id: number;
  url: string;
  caption: string;
  is_primary: boolean;
}

// Interface for response with presigned URLs
interface RoomTypeWithImages {
  // Existing roomType properties from RoomType model
  [key: string]: any;
  images: IRoomImage[];
}

export class RoomTypeRepo implements IRoomTypeRepo {
  private async generatePresignedUrl(
    roomType: RoomType,
    imageUrl: string
  ): Promise<string> {
    const fetchedRoomType = await RoomType.findOne({
      where: {
        id: roomType.id,
      },
      include: [Hotel],
    });

    if (!fetchedRoomType || !fetchedRoomType.hotel_id) {
      throw new Error("Hotel ID not found for the given room type!");
    }

    const hotel_id = fetchedRoomType.hotel_id;
    const hotelPath = `${DEFAULT_MINIO.HOTEL_PATH}/${hotel_id}`;
    const roomTypePath = `/${DEFAULT_MINIO.ROOM_TYPE_PATH}/${roomType.id}/${imageUrl}`;

    const objectPath = hotelPath + roomTypePath;

    return new Promise<string>((resolve, reject) => {
      minioConfig
        .getClient()
        .presignedGetObject(
          DEFAULT_MINIO.BUCKET,
          objectPath,
          24 * 60 * 60,
          (err, presignedUrl) => {
            if (err) reject(err);
            else resolve(presignedUrl);
          }
        );
    });
  }

  private async fetchRoomType(room_type_id: number): Promise<RoomType> {
    const roomType = await RoomType.findByPk(room_type_id);
    if (!roomType) {
      throw new Error("RoomType not found!");
    }
    return roomType;
  }

  private async fetchRoomTypes(query: any): Promise<RoomTypeWithImages[]> {
    const roomTypes = await RoomType.findAll(query);
    return Promise.all(
      roomTypes.map(async (roomType) => ({
        ...roomType.toJSON(),
        images: await this.fetchRoomImages(roomType),
      }))
    );
  }

  private async fetchRoomImages(roomType: RoomType): Promise<IRoomImage[]> {
    const roomTypeImages = await RoomImage.findAll({
      where: { room_type_id: roomType.id },
    });
    return Promise.all(
      roomTypeImages.map(async (image) => ({
        ...image.toJSON(),
        url: await this.generatePresignedUrl(roomType, image.url),
      }))
    );
  }

  async retrieveAll(): Promise<RoomTypeWithImages[]> {
    try {
      return await this.fetchRoomTypes({ order: [["id", "asc"]] });
    } catch (error) {
      throw new Error("Failed to retrieve all room types!");
    }
  }

  async retrieveAllRoomTypesByHotelId(
    hotel_id: number
  ): Promise<RoomTypeWithImages[]> {
    try {
      const roomTypes = await RoomType.findAll({
        where: { hotel_id },
        include: [RoomImage], // Including RoomImage to fetch associated images
      });

      return Promise.all(
        roomTypes.map(async (roomType) => ({
          ...roomType.toJSON(),
          images: await this.fetchRoomImages(roomType),
        }))
      );
    } catch (error) {
      throw new Error("Failed to retrieve room types by hotel ID!");
    }
  }

  async retrieveById(room_type_id: number): Promise<RoomTypeWithImages> {
    try {
      const roomType = await this.fetchRoomType(room_type_id);
      return {
        ...roomType.toJSON(),
        images: await this.fetchRoomImages(roomType),
      };
    } catch (error) {
      throw new Error("Failed to retrieve room type by ID!");
    }
  }

  async save(newRoomType: RoomType): Promise<void> {
    try {
      await RoomType.create({
        hotel_id: newRoomType.hotel_id,
        name: newRoomType.name,
        description: newRoomType.description,
        base_price: newRoomType.base_price,
        standard_occupant: newRoomType.standard_occupant,
        max_children: newRoomType.max_children,
        max_occupant: newRoomType.max_occupant,
        max_extra_bed: newRoomType.max_extra_bed,
        views: newRoomType.views,
        area: newRoomType.area,
        free_breakfast: newRoomType.free_breakfast,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to save room type: ${error.message}`);
      } else {
        throw new Error("Failed to save room type due to an unknown error");
      }
    }
  }

  async delete(room_type_id: number): Promise<void> {
    try {
      const existingRoomType = await RoomType.findByPk(room_type_id);

      if (!existingRoomType) {
        throw new Error("RoomType not found!");
      }

      // First, delete associated roomType images
      await RoomImage.destroy({
        where: {
          room_type_id,
        },
      });

      // Then, delete the roomType itself
      await existingRoomType.destroy();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to delete room type: ${error.message}`);
      } else {
        throw new Error("Failed to delete room type due to an unknown error");
      }
    }
  }

  async update(updatedRoomType: RoomType): Promise<void> {
    try {
      const existingRoomType = await RoomType.findByPk(updatedRoomType.id);

      if (!existingRoomType) {
        throw new Error("RoomType not found!");
      }

      // Update the roomType with new values
      await existingRoomType.update({
        hotel_id: updatedRoomType.hotel_id,
        name: updatedRoomType.name,
        description: updatedRoomType.description,
        base_price: updatedRoomType.base_price,
        standard_occupant: updatedRoomType.standard_occupant,
        max_children: updatedRoomType.max_children,
        max_occupant: updatedRoomType.max_occupant,
        max_extra_bed: updatedRoomType.max_extra_bed,
        views: updatedRoomType.views,
        area: updatedRoomType.area,
        free_breakfast: updatedRoomType.free_breakfast,
      });
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to update room type: ${error.message}`);
      } else {
        throw new Error("Failed to update room type due to an unknown error");
      }
    }
  }
}
