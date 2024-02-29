import { Hotel } from "../model/Hotel";

interface IHotelRepo {
    save(hotel: Hotel): Promise<void>;
    update(hotel: Hotel): Promise<void>;
    delete(hotelId: number): Promise<void>;
    retrieveById(hotelId: number): Promise<Hotel>;
    retrieveAll(): Promise<Hotel[]>;
}

export class HotelRepo implements IHotelRepo {

    async save(hotel: Hotel): Promise<void> {
        try {
            await Hotel.create({
                name: hotel.name,
                address: hotel.address,
                location: hotel.location,
                description: hotel.description,
            });
        } catch (error) {
            throw new Error("Failed to create hotel!");
        }
    }

    async update(hotel: Hotel): Promise<void> {
        try {
            const new_hotel = await Hotel.findOne({
                where: {
                    id: hotel.id,
                },
            });

            if (!new_hotel) {
                throw new Error("Hotel not found!");
            }

            new_hotel.name = hotel.name;
            new_hotel.address = hotel.address;
            new_hotel.location = hotel.location;
            new_hotel.description = hotel.description;

            await new_hotel.save();
        } catch (error) {
            throw new Error("Failed to create hotel!");
        }
    }

    async delete(hotelId: number): Promise<void> {
        try {
            const new_hotel = await Hotel.findOne({
                where: {
                    id: hotelId,
                },
            });
            if (!new_hotel) {
                throw new Error("Hotel not found!");
            }

            await new_hotel.destroy();
        } catch (error) {
            throw new Error("Failed to create hotel!");
        }
    }

    async retrieveById(hotelId: number): Promise<Hotel> {
        try {
            const new_hotel = await Hotel.findOne({
                where: {
                    id: hotelId,
                },
            });
            if (!new_hotel) {
                throw new Error("Hotel not found!");
            }
            return new_hotel;
        } catch (error) {
            throw new Error("Failed to create hotel!");
        }
    }

    async retrieveAll(): Promise<Hotel[]> {
        try {
            return await Hotel.findAll();
        } catch (error) {
            throw new Error("Failed to create hotel!");
        }
    }

}