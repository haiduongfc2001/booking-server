import { Hotel } from "../model/Hotel";
import { HotelImage } from "../model/HotelImage";

interface IHotelRepo {
    save(hotel: Hotel): Promise<void>;
    update(hotel: Hotel): Promise<void>;
    delete(hotelId: number): Promise<void>;
    retrieveById(hotelId: number): Promise<any[]>;
    retrieveAll(): Promise<any[]>;
}

export class HotelRepo implements IHotelRepo {
    async save(newHotel: Hotel): Promise<void> {
        try {
            console.log(newHotel);

            await Hotel.create({
                name: newHotel.name,
                address: newHotel.address,
                location: newHotel.location,
                description: newHotel.description,
                contact: newHotel.contact,
            });
        } catch (error) {
            throw new Error("Failed to save hotel!");
        }
    }

    async update(updatedHotel: Hotel): Promise<void> {
        try {
            const existingHotel = await Hotel.findOne({
                where: {
                    id: updatedHotel.id,
                },
            });

            if (!existingHotel) {
                throw new Error("Hotel not found!");
            }

            existingHotel.name = updatedHotel.name;
            existingHotel.address = updatedHotel.address;
            existingHotel.location = updatedHotel.location;
            existingHotel.description = updatedHotel.description;
            existingHotel.contact = updatedHotel.contact;

            await existingHotel.save();
        } catch (error) {
            throw new Error("Failed to update hotel!");
        }
    }

    async delete(hotelId: number): Promise<void> {
        try {
            const existingHotel = await Hotel.findOne({
                where: {
                    id: hotelId,
                },
            });
            if (!existingHotel) {
                throw new Error("Hotel not found!");
            }

            await existingHotel.destroy();
        } catch (error) {
            throw new Error("Failed to delete hotel!");
        }
    }

    async retrieveById(hotelId: number): Promise<any[]> {
        try {
            const hotel = await Hotel.findOne({
                where: {
                    id: hotelId,
                },
            });
            if (!hotel) {
                throw new Error("Hotel not found!");
            }

            const hotelImages = await HotelImage.findAll({
                where: {
                    hotel_id: hotelId,
                }
            });

            const hotelWithImages = {
                ...hotel.toJSON(),
                images: hotelImages.map(image => ({
                    id: image.id,
                    url: image.url
                }))
            }

            return hotelWithImages;
        } catch (error) {
            throw new Error("Failed to retrieve hotel by ID!");
        }
    }

    async retrieveAll(): Promise<any[]> {
        try {
            const hotels = await Hotel.findAll({
                order: [['id', 'asc']]
            });

            const hotelsWithImages = await Promise.all(
                hotels.map(async (hotel) => {
                    const hotelImages = await HotelImage.findAll({
                        where: {
                            hotel_id: hotel.id,
                        },
                    });
                    return {
                        ...hotel.toJSON(),
                        images: hotelImages.map((image) => ({
                            id: image.id,
                            url: image.url
                        })),
                    };
                })
            );

            return hotelsWithImages;
        } catch (error) {
            throw new Error("Failed to retrieve all hotels!");
        }
    }
}
