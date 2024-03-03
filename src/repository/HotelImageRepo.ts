import { HotelImage } from "../model/HotelImage";
import { ValidationError } from "sequelize";

interface IHotelImageRepo {
    save(hotelImage: HotelImage): Promise<void>;
    retrieveAll(): Promise<HotelImage[]>;
    getUrlsByHotelId(hotel_id: string): Promise<{ id: number, url: string }[]>;
    deleteAll(hotel_id: string): Promise<void>;
    deleteImages(deleteImages: Array<string>): Promise<void>;
}

export class HotelImageRepo implements IHotelImageRepo {
    async save(hotelImage: HotelImage): Promise<void> {
        try {
            await HotelImage.create({
                hotel_id: hotelImage.hotel_id,
                url: hotelImage.url
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

    async getUrlsByHotelId(hotel_id: string): Promise<{ id: number, url: string }[]> {
        try {
            const hotelImages = await HotelImage.findAll({
                where: {
                    hotel_id: hotel_id
                },
                attributes: ['id', 'url']
            });
            return hotelImages.map(image => ({
                id: image.id,
                url: image.url
            }));
        } catch (error: any) {
            throw new Error("Failed to get URLs by hotel_id: " + error.message);
        }
    }

    async deleteAll(hotel_id: string): Promise<void> {
        try {
            await HotelImage.destroy({
                where: {
                    hotel_id: hotel_id
                }
            });
            console.log("All images deleted successfully.");
        } catch (error) {
            console.error("Error deleting images:", error);
        }
    }

    async deleteImages(deleteImages: Array<string>): Promise<void> {
        try {
            for (const id of deleteImages) {
                await HotelImage.destroy({
                    where: {
                        id: id
                    }
                });
            }
            console.log("Images deleted successfully.");
        } catch (error) {

        }
    }
}
