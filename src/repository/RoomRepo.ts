import { DEFAULT_MINIO } from "../config/constant";
import { minioClient } from "../config/minio";
import { Room } from "../model/Room";
import { RoomImage } from "../model/RoomImage";

interface IRoomRepo {
  save(room: Room): Promise<void>;
  update(room: Room): Promise<void>;
  delete(room_id: number): Promise<void>;
  retrieveAll(): Promise<any[]>;
  retrieveAllRoomsByHotelId(hotel_id: number): Promise<any[]>;
  retrieveById(room_id: number): Promise<Room>;
  retrieveRoomByHotelId(hotel_id: number): Promise<Room[]>;
}

interface IRoomImage {
  id: number;
  url: string;
  caption: string;
  is_primary: boolean;
}

// Interface for response with presigned URLs
interface RoomWithImages {
  // Existing room properties from Room model
  [key: string]: any;
  images: IRoomImage[];
}

export class RoomRepo implements IRoomRepo {
  private async generatePresignedUrl(room: Room, imageUrl: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      minioClient.presignedGetObject(
        DEFAULT_MINIO.BUCKET,
        `${DEFAULT_MINIO.HOTEL_PATH}/${room.hotel_id}/${DEFAULT_MINIO.ROOM_PATH}/${room.id}/${imageUrl}`,
        24 * 60 * 60,
        (err, presignedUrl) => {
          if (err) reject(err);
          else resolve(presignedUrl);
        }
      );
    });
  }

  async retrieveAll(): Promise<RoomWithImages[]> {
    try {
      const rooms = await Room.findAll({
        order: [["id", "asc"]],
      });

      // Fetch room images in parallel using Promise.all
      const roomImagePromises = rooms.map(async (room) => {
        const roomImages = await RoomImage.findAll({
          where: { room_id: room.id },
        });

        const imagesWithUrl = await Promise.all(
          roomImages.map((image) =>
            this.generatePresignedUrl(room, image.url).then((presignedUrl) => ({
              ...image.toJSON(),
              url: presignedUrl,
            }))
          )
        );

        return {
          ...room.toJSON(),
          images: imagesWithUrl,
        };
      });

      // Wait for all image presigned URLs to be generated
      const roomWithImages = await Promise.all(roomImagePromises);

      return roomWithImages;
    } catch (error) {
      throw new Error("Failed to retrieve all rooms!");
    }
  }

  async retrieveAllRoomsByHotelId(hotel_id: number): Promise<any[]> {
    try {
      const rooms = await Room.findAll({
        where: {
          hotel_id: hotel_id,
        },
        order: [["number", "asc"]],
      });

      const roomWithImages = await Promise.all(
        rooms.map(async (room) => {
          const roomImages = await RoomImage.findAll({
            where: {
              room_id: room.id,
            },
          });

          return {
            ...room.toJSON(),
            images: roomImages.map((image) => ({
              id: image.id,
              url: image.url,
              caption: image.caption,
              is_primary: image.is_primary,
            })),
          };
        })
      );

      return roomWithImages;
    } catch (error) {
      throw new Error("Failed to retrieve all rooms!");
    }
  }

  async save(newRoom: Room): Promise<void> {
    try {
      await Room.create({
        hotel_id: newRoom.hotel_id,
        number: newRoom.number,
        type: newRoom.type,
        price: newRoom.price,
        adult_occupancy: newRoom.adult_occupancy,
        child_occupancy: newRoom.child_occupancy,
        description: newRoom.description,
        status: newRoom.status,
      });
    } catch (error) {
      throw new Error("Failed to save room!");
    }
  }

  async delete(room_id: number): Promise<void> {
    try {
      const existingRoom = await Room.findByPk(room_id);

      if (!existingRoom) {
        throw new Error("Room not found!");
      }

      await RoomImage.destroy({
        where: {
          room_id: room_id,
        },
      });

      await existingRoom.destroy();
    } catch (error) { }
  }

  async retrieveById(room_id: number): Promise<Room> {
    try {
      const existingRoom = await Room.findByPk(room_id);
      if (!existingRoom) {
        throw new Error("Room not found!");
      }

      const roomImages = await RoomImage.findAll({
        where: {
          room_id: room_id,
        },
      });

      const roomWithImages = {
        ...existingRoom.toJSON(),
        images: roomImages.map((image) => ({
          id: image.id,
          url: image.url,
          caption: image.caption,
          is_primary: image.is_primary,
        })),
      };

      return roomWithImages;
    } catch (error) {
      throw new Error("Failed to retrieve room by ID!");
    }
  }

  async retrieveRoomByHotelId(hotel_id: number): Promise<Room[]> {
    try {
      const rooms = await Room.findAll({
        where: {
          hotel_id: hotel_id,
        },
        order: [["id", "asc"]],
      });

      return rooms;
    } catch (error) {
      throw new Error("Failed to retrieve room by ID!");
    }
  }

  async update(updatedRoom: Room): Promise<void> {
    try {
      const existingRoom = await Room.findByPk(updatedRoom.id);

      if (!existingRoom) {
        throw new Error("Room not found!");
      }

      existingRoom.number = updatedRoom.number;
      existingRoom.type = updatedRoom.type;
      existingRoom.price = updatedRoom.price;
      existingRoom.adult_occupancy = updatedRoom.adult_occupancy;
      existingRoom.child_occupancy = updatedRoom.child_occupancy;
      existingRoom.description = updatedRoom.description;
      existingRoom.status = updatedRoom.status;

      await existingRoom.save();
    } catch (error) {
      throw new Error("Failed to update room!");
    }
  }
}
