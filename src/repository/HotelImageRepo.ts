import { HotelImage } from "../model/HotelImage";
import { ValidationError } from "sequelize";

interface IHotelImageRepo {
    save(newHotelImage: HotelImage): Promise<void>;
    getUrlsByHotelId(hotel_id: string): Promise<{ id: number, url: string }[]>;
    deleteAll(hotel_id: string): Promise<void>;
    deleteImages(imagesToDelete: Array<string>): Promise<void>;
    deleteImage(hotel_image_id: number): Promise<void>;
}

export class HotelImageRepo implements IHotelImageRepo {
    async save(newHotelImage: HotelImage): Promise<void> {
        try {
            await HotelImage.create({
                hotel_id: newHotelImage.hotel_id,
                url: newHotelImage.url,
                caption: newHotelImage.caption,
                is_primary: newHotelImage.is_primary,
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

    async getUrlsByHotelId(hotel_id: string): Promise<{ id: number, url: string }[]> {
        try {
            const hotelImages = await HotelImage.findAll({
                where: {
                    hotel_id: hotel_id
                },
                attributes: ['id', 'url', 'caption', 'is_primary']
            });
            return hotelImages.map(image => ({
                id: image.id,
                url: image.url,
                caption: image.caption,
                is_primary: image.is_primary,
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

    async deleteImage(hotel_image_id: number): Promise<void> {
        try {
            await HotelImage.destroy({
                where: {
                    id: hotel_image_id
                }
            });
        } catch (error) {
            console.error("Error deleting image:", error);
        }
    }
}
