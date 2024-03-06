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
            console.log(hotel);

            await Hotel.create({
                name: hotel.name,
                address: hotel.address,
                location: hotel.location,
                description: hotel.description,
                contact: hotel.contact,
            });
        } catch (error) {
            throw new Error("Failed to save hotel!");
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
            new_hotel.contact = hotel.contact;

            await new_hotel.save();
        } catch (error) {
            throw new Error("Failed to update hotel!");
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
            throw new Error("Failed to delete hotel!");
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
            throw new Error("Failed to retrieve hotel by ID!");
        }
    }

    async retrieveAll(): Promise<Hotel[]> {
        try {
            return await Hotel.findAll();
        } catch (error) {
            throw new Error("Failed to retrieve all hotels!");
        }
    }
}