import { HotelImage } from "../model/HotelImage";
import { ValidationError } from "sequelize";

interface IHotelImageRepo {
    save(newHotelImage: HotelImage): Promise<void>;
    retrieveAll(): Promise<HotelImage[]>;
    getUrlsByHotelId(hotelId: string): Promise<{ id: number, url: string }[]>;
    deleteAll(hotelId: string): Promise<void>;
    deleteImages(imagesToDelete: Array<string>): Promise<void>;
}

export class HotelImageRepo implements IHotelImageRepo {
    async save(newHotelImage: HotelImage): Promise<void> {
        try {
            await HotelImage.create({
                hotel_id: newHotelImage.hotel_id,
                url: newHotelImage.url
            });
        } catch (error: any) {
            if (error instanceof ValidationError) {
                // Xử lý lỗi validation từ Sequelize (ví dụ: kiểm tra ràng buộc)
                throw new Error("Validation error: " + error.message);
            } else {
                // Xử lý lỗi khác (ví dụ: lỗi kết nối với cơ sở dữ liệu)
                throw new Error("Failed to save hotel image: " + error.message);
            }
        }
    }

    async retrieveAll(): Promise<HotelImage[]> {
        try {
            return await HotelImage.findAll();
        } catch (error: any) {
            throw new Error("Failed to retrieve hotel images: " + error.message);
        }
    }

    async getUrlsByHotelId(hotelId: string): Promise<{ id: number, url: string }[]> {
        try {
            const hotelImages = await HotelImage.findAll({
                where: {
                    hotel_id: hotelId
                },
                attributes: ['id', 'url']
            });
            return hotelImages.map(image => ({
                id: image.id,
                url: image.url
            }));
        } catch (error: any) {
            throw new Error("Failed to get URLs by hotelId: " + error.message);
        }
    }

    async deleteAll(hotelId: string): Promise<void> {
        try {
            await HotelImage.destroy({
                where: {
                    hotel_id: hotelId
                }
            });
        } catch (error) {
            console.error("Error deleting images:", error);
        }
    }

    async deleteImages(imagesToDelete: Array<string>): Promise<void> {
        try {
            for (const id of imagesToDelete) {
                await HotelImage.destroy({
                    where: {
                        id: id
                    }
                });
            }
        } catch (error) {
            console.error("Error deleting images:", error);
        }
    }
}
