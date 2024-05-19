import { DEFAULT_MINIO } from "../config/constant.config";
import { minioConfig } from "../config/minio.config";
import { Room } from "../model/Room";
import { RoomImage } from "../model/RoomImage";

interface IRoomRepo {
  save(room: Room): Promise<void>;
  update(room: Room): Promise<void>;
  delete(room_id: number): Promise<void>;
  retrieveAll(): Promise<RoomWithImages[]>;
  retrieveAllRoomsByHotelId(hotel_id: number): Promise<RoomWithImages[]>;
  retrieveById(room_id: number): Promise<RoomWithImages>;
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
  private async generatePresignedUrl(
    room: Room,
    imageUrl: string
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      minioConfig
        .getClient()
        .presignedGetObject(
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

  private async fetchRoom(room_id: number): Promise<Room> {
    const room = await Room.findByPk(room_id);
    if (!room) {
      throw new Error("Room not found!");
    }
    return room;
  }

  private async fetchRooms(query: any): Promise<RoomWithImages[]> {
    const rooms = await Room.findAll(query);
    return Promise.all(
      rooms.map(async (room) => ({
        ...room.toJSON(),
        images: await this.fetchRoomImages(room),
      }))
    );
  }

  private async fetchRoomImages(room: Room): Promise<IRoomImage[]> {
    const roomImages = await RoomImage.findAll({ where: { room_id: room.id } });
    return Promise.all(
      roomImages.map(async (image) => ({
        ...image.toJSON(),
        url: await this.generatePresignedUrl(room, image.url),
      }))
    );
  }

  async retrieveAll(): Promise<RoomWithImages[]> {
    try {
      return await this.fetchRooms({ order: [["id", "asc"]] });
    } catch (error) {
      throw new Error("Failed to retrieve all rooms!");
    }
  }

  async retrieveAllRoomsByHotelId(hotel_id: number): Promise<RoomWithImages[]> {
    try {
      return await this.fetchRooms({
        where: { hotel_id },
        order: [["number", "asc"]],
      });
    } catch (error) {
      throw new Error("Failed to retrieve rooms by hotel ID!");
    }
  }

  async retrieveById(room_id: number): Promise<RoomWithImages> {
    try {
      const room = await this.fetchRoom(room_id);
      return { ...room.toJSON(), images: await this.fetchRoomImages(room) };
    } catch (error) {
      throw new Error("Failed to retrieve room by ID!");
    }
  }

  async save(newRoom: Room): Promise<void> {
    try {
      await Room.create({
        hotel_id: newRoom.hotel_id,
        name: newRoom.name,
        number: newRoom.number,
        room_type_id: newRoom.room_type_id,
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

  async update(updatedRoom: Room): Promise<void> {
    try {
      const existingRoom = await Room.findByPk(updatedRoom.id);

      if (!existingRoom) {
        throw new Error("Room not found!");
      }

      existingRoom.name = updatedRoom.name;
      existingRoom.number = updatedRoom.number;
      existingRoom.room_type_id = updatedRoom.room_type_id;
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
